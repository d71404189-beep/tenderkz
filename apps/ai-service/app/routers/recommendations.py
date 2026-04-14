from app.models.schemas import RecommendationsResponse, RecommendationItem
from app.services.recommendations import RecommendationsService
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()


def get_rec_service() -> RecommendationsService:
    return RecommendationsService()


@router.get("/recommendations/{tender_id}", response_model=RecommendationsResponse)
async def get_recommendations(
    tender_id: str,
    rec_service: RecommendationsService = Depends(get_rec_service),
):
    try:
        result = await rec_service.analyze(tender_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
