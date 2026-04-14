import httpx
from loguru import logger
from app.core.config import settings


class DataFetcher:
    def __init__(self):
        self.api_url = settings.API_URL
        self.client = httpx.AsyncClient(timeout=30.0)

    async def get_tender(self, tender_id: str) -> dict:
        try:
            resp = await self.client.get(f"{self.api_url}/api/tenders/{tender_id}")
            resp.raise_for_status()
            data = resp.json()
            return {
                "id": data.get("id"),
                "title": data.get("title", ""),
                "amount": float(data.get("amount", 0)),
                "category_kpgz": data.get("categoryKpgz", ""),
                "region": data.get("region", ""),
                "competitor_count": data.get("competitorCount", 0),
                "requirements": data.get("requirements", ""),
                "type": data.get("type", ""),
                "median_price": float(data.get("amount", 0)),
                "required_licenses": [],
            }
        except Exception as e:
            logger.warning(f"Failed to fetch tender {tender_id}: {e}")
            return self._default_tender(tender_id)

    async def get_supplier_profile(self, user_id_or_tender_id: str) -> dict:
        try:
            resp = await self.client.get(
                f"{self.api_url}/api/profile",
                headers={"Authorization": "Bearer internal"},
            )
            resp.raise_for_status()
            data = resp.json()
            return {
                "bin": data.get("bin", ""),
                "name": data.get("name", ""),
                "region": data.get("region", ""),
                "categories": data.get("categories", []),
                "licenses": data.get("licenses", []),
                "certificates": data.get("certificates", []),
                "experience": data.get("experience", []),
            }
        except Exception as e:
            logger.warning(f"Failed to fetch supplier profile: {e}")
            return self._default_supplier()

    async def get_competitor_history(self, bin: str) -> list[dict]:
        try:
            resp = await self.client.get(f"{self.api_url}/api/competitors/{bin}")
            resp.raise_for_status()
            return resp.json().get("history", [])
        except Exception as e:
            logger.warning(f"Failed to fetch competitor {bin}: {e}")
            return []

    async def get_tender_results(self, category_kpgz: str) -> list[dict]:
        try:
            resp = await self.client.get(
                f"{self.api_url}/api/tenders",
                params={"categoryKpgz": category_kpgz, "status": "AWARDED"},
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.warning(f"Failed to fetch tender results for {category_kpgz}: {e}")
            return []

    def _default_tender(self, tender_id: str) -> dict:
        return {
            "id": tender_id,
            "title": "",
            "amount": 0,
            "category_kpgz": "",
            "region": "",
            "competitor_count": 5,
            "requirements": "",
            "type": "",
            "median_price": 0,
            "required_licenses": [],
        }

    def _default_supplier(self) -> dict:
        return {
            "bin": "",
            "name": "",
            "region": "",
            "categories": [],
            "licenses": [],
            "certificates": [],
            "experience": [],
        }
