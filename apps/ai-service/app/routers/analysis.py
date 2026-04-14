from app.models.schemas import CompetitorAnalysisResponse, CategoryHeatmapResponse
from app.services.competitor_analysis import CompetitorAnalysisService
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()


def get_ca_service() -> CompetitorAnalysisService:
    return CompetitorAnalysisService()


@router.get("/competitor/{bin}", response_model=CompetitorAnalysisResponse)
async def get_competitor_analysis(
    bin: str,
    ca_service: CompetitorAnalysisService = Depends(get_ca_service),
):
    try:
        result = await ca_service.analyze_competitor(bin)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/heatmap", response_model=CategoryHeatmapResponse)
async def get_heatmap(
    ca_service: CompetitorAnalysisService = Depends(get_ca_service),
):
    try:
        result = await ca_service.get_category_heatmap()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
