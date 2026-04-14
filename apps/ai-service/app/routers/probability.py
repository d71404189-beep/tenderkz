from app.models.schemas import (
    WinProbabilityResponse,
    ProbabilityFactor,
    ScenarioResult,
)
from app.services.win_probability import WinProbabilityService
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()


def get_wp_service() -> WinProbabilityService:
    return WinProbabilityService()


@router.get("/probability/{tender_id}", response_model=WinProbabilityResponse)
async def get_win_probability(
    tender_id: str,
    wp_service: WinProbabilityService = Depends(get_wp_service),
):
    try:
        result = await wp_service.calculate(tender_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scenario/{tender_id}", response_model=WinProbabilityResponse)
async def get_scenario_analysis(
    tender_id: str,
    price_adjustment: float = 0.0,
    wp_service: WinProbabilityService = Depends(get_wp_service),
):
    try:
        result = await wp_service.calculate_with_scenario(tender_id, price_adjustment)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
