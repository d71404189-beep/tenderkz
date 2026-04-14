from loguru import logger
from app.models.schemas import RecommendationsResponse, RecommendationItem
from app.services.data_fetcher import DataFetcher


class RecommendationsService:
    def __init__(self):
        self.data_fetcher = DataFetcher()

    async def analyze(self, tender_id: str) -> RecommendationsResponse:
        tender_data = await self.data_fetcher.get_tender(tender_id)
        supplier_data = await self.data_fetcher.get_supplier_profile(tender_id)

        recommendations = []
        readiness_score = 0.0

        recommendations.extend(self._check_qualification(tender_data, supplier_data))
        recommendations.extend(self._check_experience(tender_data, supplier_data))
        recommendations.extend(self._check_pricing(tender_data, supplier_data))
        recommendations.extend(self._check_documentation(tender_data, supplier_data))
        recommendations.extend(self._check_strategic(tender_data, supplier_data))

        readiness_score = self._calculate_readiness(tender_data, supplier_data, recommendations)

        return RecommendationsResponse(
            recommendations=recommendations,
            readiness_score=readiness_score,
        )

    def _check_qualification(self, tender: dict, supplier: dict) -> list[RecommendationItem]:
        items = []

        required_licenses = set(tender.get("required_licenses", []))
        supplier_licenses = set(l.get("type") for l in supplier.get("licenses", []))
        missing = required_licenses - supplier_licenses

        if missing:
            items.append(RecommendationItem(
                category="qualification",
                text=f"Отсутствуют лицензии: {', '.join(missing)}. Получите их перед подачей заявки или откажитесь от участия.",
                priority="high",
            ))
        else:
            readiness_bonus = 20

        supplier_certs = set(c.get("type") for c in supplier.get("certificates", []))
        if "ISO 9001" not in supplier_certs and any("ISO" in r for r in tender.get("requirements", "").split() if r):
            items.append(RecommendationItem(
                category="qualification",
                text="Наличие сертификата ISO 9001 повысит конкурентоспособность заявки. Рассмотрите сертификацию.",
                priority="medium",
            ))

        return items

    def _check_experience(self, tender: dict, supplier: dict) -> list[RecommendationItem]:
        items = []
        experience = supplier.get("experience", [])
        tender_category = tender.get("category_kpgz", "")

        category_experience = [e for e in experience if e.get("categoryKpgz") == tender_category]

        if not category_experience:
            items.append(RecommendationItem(
                category="experience",
                text="У вас нет опыта выполнения работ по данному КПГЗ. Укажите смежный опыт в заявке.",
                priority="high",
            ))
        elif len(category_experience) < 3:
            items.append(RecommendationItem(
                category="experience",
                text=f"Опыт по данной категории: {len(category_experience)} контрактов. Рекомендуется указать минимум 3 аналогичных работы.",
                priority="medium",
            ))
        else:
            items.append(RecommendationItem(
                category="experience",
                text=f"У вас {len(category_experience)} контрактов по данной категории — это сильная сторона заявки.",
                priority="low",
            ))

        return items

    def _check_pricing(self, tender: dict, supplier: dict) -> list[RecommendationItem]:
        items = []

        amount = tender.get("amount", 0)
        if amount > 0:
            items.append(RecommendationItem(
                category="pricing",
                text=f"Сумма закупки: {amount:,.0f} ₸. Снижение на 5-10% от суммы повышает вероятность победы в ценовых закупках.",
                priority="medium",
            ))

        return items

    def _check_documentation(self, tender: dict, supplier: dict) -> list[RecommendationItem]:
        items = []

        if not supplier.get("bin"):
            items.append(RecommendationItem(
                category="documentation",
                text="Заполните БИН в профиле — он обязателен для подачи заявки.",
                priority="high",
            ))

        if not supplier.get("directorName"):
            items.append(RecommendationItem(
                category="documentation",
                text="Укажите руководителя в профиле — необходимо для доверенности и подписи.",
                priority="high",
            ))

        return items

    def _check_strategic(self, tender: dict, supplier: dict) -> list[RecommendationItem]:
        items = []

        competitor_count = tender.get("competitor_count", 0)
        if competitor_count <= 3:
            items.append(RecommendationItem(
                category="strategy",
                text="Низкая конкуренция в этом тендере. Это хорошая возможность — подайте заявку!",
                priority="low",
            ))
        elif competitor_count > 10:
            items.append(RecommendationItem(
                category="strategy",
                text="Высокая конкуренция. Если закупка по качеству — сфокусируйтесь на квалификации; если по цене — будьте агрессивны в ценообразовании.",
                priority="medium",
            ))

        same_region = supplier.get("region") == tender.get("region")
        if not same_region:
            items.append(RecommendationItem(
                category="strategy",
                text="Вы находитесь в другом регионе. Учитывайте логистические расходы при расчёте цены.",
                priority="medium",
            ))

        return items

    def _calculate_readiness(
        self, tender: dict, supplier: dict, recommendations: list[RecommendationItem]
    ) -> float:
        score = 100.0

        for rec in recommendations:
            if rec.priority == "high":
                score -= 25
            elif rec.priority == "medium":
                score -= 10
            elif rec.priority == "low":
                score -= 2

        return max(0, min(100, score))
