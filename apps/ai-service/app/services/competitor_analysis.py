from loguru import logger
from app.models.schemas import (
    CompetitorAnalysisResponse,
    CategoryHeatmapResponse,
    CategoryHeatmapItem,
)
from app.services.data_fetcher import DataFetcher


class CompetitorAnalysisService:
    def __init__(self):
        self.data_fetcher = DataFetcher()

    async def analyze_competitor(self, bin: str) -> CompetitorAnalysisResponse:
        competitor = await self.data_fetcher.get_competitor_history(bin)

        if not competitor:
            return CompetitorAnalysisResponse(
                bin=bin,
                name="Неизвестно",
                win_rate=0,
                avg_discount=0,
                total_participated=0,
                total_won=0,
                categories=[],
                patterns=["Нет данных для анализа"],
            )

        total = len(competitor)
        wins = [c for c in competitor if c.get("is_winner")]
        win_rate = len(wins) / total if total > 0 else 0
        avg_discount = sum(c.get("discount", 0) for c in competitor) / total if total > 0 else 0

        categories = list(set(c.get("category_kpgz", "") for c in competitor if c.get("category_kpgz")))

        patterns = self._detect_patterns(competitor)

        return CompetitorAnalysisResponse(
            bin=bin,
            name=competitor[0].get("supplier_name", "Неизвестно"),
            win_rate=round(win_rate, 3),
            avg_discount=round(avg_discount, 1),
            total_participated=total,
            total_won=len(wins),
            categories=categories,
            patterns=patterns,
        )

    async def get_category_heatmap(self) -> CategoryHeatmapResponse:
        tenders = await self.data_fetcher.get_tender_results("")

        category_stats: dict[str, dict] = {}
        for t in tenders:
            cat = t.get("category_kpgz", "unknown")
            participants = t.get("competitor_count", 0)

            if cat not in category_stats:
                category_stats[cat] = {
                    "total_tenders": 0,
                    "total_participants": 0,
                    "wins": 0,
                }

            category_stats[cat]["total_tenders"] += 1
            category_stats[cat]["total_participants"] += participants
            if t.get("status") == "AWARDED":
                category_stats[cat]["wins"] += 1

        items = []
        for cat, stats in category_stats.items():
            avg_participants = stats["total_participants"] / max(stats["total_tenders"], 1)
            avg_win_rate = stats["wins"] / max(stats["total_tenders"], 1)

            if avg_participants <= 3:
                level = "low"
            elif avg_participants <= 7:
                level = "medium"
            else:
                level = "high"

            items.append(CategoryHeatmapItem(
                category=cat,
                competition_level=level,
                avg_participants=round(avg_participants, 1),
                avg_win_rate=round(avg_win_rate, 3),
            ))

        items.sort(key=lambda x: x.avg_participants)

        return CategoryHeatmapResponse(categories=items)

    def _detect_patterns(self, competitor_data: list[dict]) -> list[str]:
        patterns = []

        total = len(competitor_data)
        wins = [c for c in competitor_data if c.get("is_winner")]
        win_rate = len(wins) / total if total > 0 else 0

        if win_rate > 0.6:
            patterns.append("Высокий процент побед — сильный конкурент, системно участвует и побеждает")

        discounts = [c.get("discount", 0) for c in competitor_data]
        avg_discount = sum(discounts) / len(discounts) if discounts else 0

        if avg_discount > 15:
            patterns.append(f"Средняя скидка {avg_discount:.1f}% — агрессивный демпинг")

        categories = {}
        for c in competitor_data:
            cat = c.get("category_kpgz", "")
            if cat:
                categories[cat] = categories.get(cat, 0) + 1

        if categories:
            top_cat = max(categories, key=categories.get)
            patterns.append(f"Специализация: {top_cat} ({categories[top_cat]} участвий)")

        same_customer = {}
        for c in wins:
            cust = c.get("customer_bin", "")
            if cust:
                same_customer[cust] = same_customer.get(cust, 0) + 1

        for cust, count in same_customer.items():
            if count >= 3:
                patterns.append(f"Частые победы у заказчика БИН {cust} ({count} раз) — возможная аффилированность")

        return patterns if patterns else ["Недостаточно данных для выявления паттернов"]
