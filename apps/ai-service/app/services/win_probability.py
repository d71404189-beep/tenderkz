import numpy as np
import joblib
import os
from loguru import logger
from app.models.schemas import (
    WinProbabilityResponse,
    ProbabilityFactor,
    ScenarioResult,
)
from app.services.data_fetcher import DataFetcher


class WinProbabilityModel:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            logger.info(f"Loaded model from {self.model_path}")
        else:
            logger.warning(f"Model not found at {self.model_path}, using heuristic fallback")
            self.model = None

    def predict(self, features: np.ndarray) -> float:
        if self.model is not None:
            prob = self.model.predict_proba(features.reshape(1, -1))[0][1]
            return float(np.clip(prob, 0, 1))
        return self._heuristic_predict(features)

    def _heuristic_predict(self, features: np.ndarray) -> float:
        exp_weight = float(features[0]) if len(features) > 0 else 0.5
        price_competitiveness = float(features[1]) if len(features) > 1 else 0.5
        competitor_count_factor = float(features[2]) if len(features) > 2 else 0.5
        qualification_match = float(features[3]) if len(features) > 3 else 0.5

        score = (
            exp_weight * 0.3
            + price_competitiveness * 0.3
            + (1 - competitor_count_factor) * 0.2
            + qualification_match * 0.2
        )
        return float(np.clip(score, 0, 1))

    @staticmethod
    def extract_features(tender_data: dict, supplier_data: dict) -> np.ndarray:
        experience_count = len(supplier_data.get("experience", []))
        exp_weight = min(experience_count / 10, 1.0)

        median_price = tender_data.get("median_price", 0)
        supplier_price = tender_data.get("amount", 0)
        price_competitiveness = 1.0
        if median_price > 0 and supplier_price > 0:
            price_competitiveness = max(0, 1 - abs(supplier_price - median_price) / median_price)

        competitor_count = tender_data.get("competitor_count", 5)
        competitor_count_factor = min(competitor_count / 20, 1.0)

        required_licenses = set(tender_data.get("required_licenses", []))
        supplier_licenses = set(
            lic.get("type") for lic in supplier_data.get("licenses", [])
        )
        qualification_match = 1.0
        if required_licenses:
            qualification_match = len(required_licenses & supplier_licenses) / len(required_licenses)

        region_match = 1.0 if supplier_data.get("region") == tender_data.get("region") else 0.5

        categories = supplier_data.get("categories", [])
        tender_category = tender_data.get("category_kpgz", "")
        category_match = 1.0 if tender_category in categories else 0.3

        return np.array([
            exp_weight,
            price_competitiveness,
            competitor_count_factor,
            qualification_match,
            region_match,
            category_match,
        ])


class WinProbabilityService:
    def __init__(self):
        model_path = os.environ.get("MODEL_PATH", "data/processed/win_probability_model.joblib")
        self.model = WinProbabilityModel(model_path)
        self.data_fetcher = DataFetcher()

    async def calculate(self, tender_id: str) -> WinProbabilityResponse:
        tender_data = await self.data_fetcher.get_tender(tender_id)
        supplier_data = await self.data_fetcher.get_supplier_profile(tender_id)

        features = WinProbabilityModel.extract_features(tender_data, supplier_data)
        probability = self.model.predict(features)

        factors = self._build_factors(tender_data, supplier_data, features)
        recommendation = self._build_recommendation(probability, factors)
        scenarios = self._build_scenarios(tender_data, supplier_data, features)

        return WinProbabilityResponse(
            probability=round(probability * 100, 1),
            factors=factors,
            recommendation=recommendation,
            scenario_analysis=scenarios,
        )

    async def calculate_with_scenario(
        self, tender_id: str, price_adjustment: float
    ) -> WinProbabilityResponse:
        result = await self.calculate(tender_id)

        adjusted_prob = result.probability
        if price_adjustment < 0:
            discount_bonus = abs(price_adjustment) * 2
            adjusted_prob = min(adjusted_prob + discount_bonus, 99)
        elif price_adjustment > 0:
            discount_penalty = price_adjustment * 3
            adjusted_prob = max(adjusted_prob - discount_penalty, 1)

        result.scenario_analysis.insert(0, ScenarioResult(
            label=f"Цена изменена на {price_adjustment:+.0f}%",
            adjusted_probability=round(adjusted_prob, 1),
            description=f"При {'снижении' if price_adjustment < 0 else 'повышении'} цены на {abs(price_adjustment)}% вероятность составит {adjusted_prob:.1f}%",
        ))

        return result

    def _build_factors(
        self, tender_data: dict, supplier_data: dict, features: np.ndarray
    ) -> list[ProbabilityFactor]:
        factors = []

        experience_count = len(supplier_data.get("experience", []))
        factors.append(ProbabilityFactor(
            name="Опыт по категории",
            value=f"{experience_count} выполненных контрактов",
            impact="positive" if experience_count >= 3 else "negative",
            weight=0.3,
        ))

        competitor_count = tender_data.get("competitor_count", 0)
        factors.append(ProbabilityFactor(
            name="Количество конкурентов",
            value=f"{competitor_count} участников",
            impact="positive" if competitor_count <= 3 else "negative" if competitor_count > 7 else "neutral",
            weight=0.2,
        ))

        required_licenses = tender_data.get("required_licenses", [])
        supplier_licenses = [l.get("type") for l in supplier_data.get("licenses", [])]
        has_licenses = all(l in supplier_licenses for l in required_licenses) if required_licenses else True
        factors.append(ProbabilityFactor(
            name="Лицензии и сертификаты",
            value="Все имеются" if has_licenses else "Не хватает лицензий",
            impact="positive" if has_licenses else "negative",
            weight=0.2,
        ))

        same_region = supplier_data.get("region") == tender_data.get("region")
        factors.append(ProbabilityFactor(
            name="Региональное соответствие",
            value="Тот же регион" if same_region else "Другой регион",
            impact="positive" if same_region else "neutral",
            weight=0.15,
        ))

        categories = supplier_data.get("categories", [])
        tender_category = tender_data.get("category_kpgz", "")
        category_match = tender_category in categories
        factors.append(ProbabilityFactor(
            name="Соответствие категории КПГЗ",
            value="Основная категория" if category_match else "Смежная категория",
            impact="positive" if category_match else "neutral",
            weight=0.15,
        ))

        return factors

    def _build_recommendation(
        self, probability: float, factors: list[ProbabilityFactor]
    ) -> str:
        if probability >= 70:
            return "Высокая вероятность победы. Рекомендуем подать заявку с вашей стандартной ценовой стратегией."
        elif probability >= 45:
            weak = [f for f in factors if f.impact == "negative"]
            if weak:
                tips = ", ".join(f.name.lower() for f in weak[:2])
                return f"Средняя вероятность. Улучшите: {tips}. Рассмотрите снижение цены на 5-10%."
            return "Средняя вероятность. Снижение цены на 5-10% может значительно повысить шансы."
        else:
            return "Низкая вероятность. Рекомендуем сфокусироваться на других тендерах или существенно улучшить заявку."

    def _build_scenarios(
        self, tender_data: dict, supplier_data: dict, features: np.ndarray
    ) -> list[ScenarioResult]:
        scenarios = []

        for discount in [-5, -10, -15]:
            features_copy = features.copy()
            if len(features_copy) > 1:
                features_copy[1] = min(1.0, features_copy[1] + abs(discount) / 30)
            prob = self.model.predict(features_copy) * 100
            scenarios.append(ScenarioResult(
                label=f"Снижение цены на {abs(discount)}%",
                adjusted_probability=round(prob, 1),
                description=f"При скидке {abs(discount)}% вероятность победы составит ~{prob:.0f}%",
            ))

        return scenarios
