import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import roc_auc_score, classification_report
from xgboost import XGBClassifier
from catboost import CatBoostClassifier
from joblib import dump
from loguru import logger
import os


def train_win_probability_model(data_path: str, output_path: str):
    logger.info(f"Loading data from {data_path}")
    df = pd.read_csv(data_path)

    feature_cols = [
        "exp_weight",
        "price_competitiveness",
        "competitor_count_factor",
        "qualification_match",
        "region_match",
        "category_match",
    ]
    target_col = "is_winner"

    X = df[feature_cols].values
    y = df[target_col].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    xgb = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="logloss",
    )

    cat = CatBoostClassifier(
        iterations=200,
        depth=6,
        learning_rate=0.1,
        random_seed=42,
        verbose=False,
    )

    logger.info("Training XGBoost...")
    xgb.fit(X_train, y_train)
    xgb_pred = xgb.predict_proba(X_test)[:, 1]
    xgb_auc = roc_auc_score(y_test, xgb_pred)
    logger.info(f"XGBoost AUC: {xgb_auc:.4f}")

    logger.info("Training CatBoost...")
    cat.fit(X_train, y_train)
    cat_pred = cat.predict_proba(X_test)[:, 1]
    cat_auc = roc_auc_score(y_test, cat_pred)
    logger.info(f"CatBoost AUC: {cat_auc:.4f}")

    best_model = xgb if xgb_auc >= cat_auc else cat
    best_name = "XGBoost" if xgb_auc >= cat_auc else "CatBoost"
    best_auc = max(xgb_auc, cat_auc)

    cv_scores = cross_val_score(best_model, X, y, cv=5, scoring="roc_auc")
    logger.info(f"{best_name} CV AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    dump(best_model, output_path)
    logger.info(f"Saved {best_name} model to {output_path}")

    return {
        "model": best_name,
        "auc": best_auc,
        "cv_mean": cv_scores.mean(),
        "cv_std": cv_scores.std(),
    }


def generate_synthetic_data(output_path: str, n_samples: int = 10000):
    np.random.seed(42)

    exp_weight = np.random.beta(2, 3, n_samples)
    price_competitiveness = np.random.beta(3, 2, n_samples)
    competitor_count_factor = np.random.beta(2, 5, n_samples)
    qualification_match = np.random.beta(4, 2, n_samples)
    region_match = np.random.binomial(1, 0.6, n_samples).astype(float)
    category_match = np.random.binomial(1, 0.4, n_samples).astype(float)

    logit = (
        1.2 * exp_weight
        + 1.5 * price_competitiveness
        - 0.8 * competitor_count_factor
        + 0.9 * qualification_match
        + 0.5 * region_match
        + 0.7 * category_match
        - 1.5
    )
    prob = 1 / (1 + np.exp(-logit))
    is_winner = np.random.binomial(1, prob)

    df = pd.DataFrame({
        "exp_weight": exp_weight,
        "price_competitiveness": price_competitiveness,
        "competitor_count_factor": competitor_count_factor,
        "qualification_match": qualification_match,
        "region_match": region_match,
        "category_match": category_match,
        "is_winner": is_winner,
    })

    df.to_csv(output_path, index=False)
    logger.info(f"Generated {n_samples} synthetic samples to {output_path}")
    return df


if __name__ == "__main__":
    raw_path = "data/raw/training_data.csv"
    model_path = "data/processed/win_probability_model.joblib"

    if not os.path.exists(raw_path):
        logger.info("No training data found, generating synthetic data")
        generate_synthetic_data(raw_path)

    results = train_win_probability_model(raw_path, model_path)
    logger.info(f"Training complete: {results}")
