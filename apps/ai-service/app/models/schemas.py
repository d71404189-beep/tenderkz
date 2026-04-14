from pydantic import BaseModel
from typing import Optional


class ProbabilityFactor(BaseModel):
    name: str
    value: str
    impact: str  # positive, negative, neutral
    weight: float


class ScenarioResult(BaseModel):
    label: str
    adjusted_probability: float
    description: str


class WinProbabilityResponse(BaseModel):
    probability: float
    factors: list[ProbabilityFactor]
    recommendation: str
    scenario_analysis: list[ScenarioResult]


class RecommendationItem(BaseModel):
    category: str
    text: str
    priority: str  # high, medium, low


class RecommendationsResponse(BaseModel):
    recommendations: list[RecommendationItem]
    readiness_score: float


class CompetitorAnalysisResponse(BaseModel):
    bin: str
    name: str
    win_rate: float
    avg_discount: float
    total_participated: int
    total_won: int
    categories: list[str]
    patterns: list[str]


class CategoryHeatmapItem(BaseModel):
    category: str
    competition_level: str  # low, medium, high
    avg_participants: float
    avg_win_rate: float


class CategoryHeatmapResponse(BaseModel):
    categories: list[CategoryHeatmapItem]
