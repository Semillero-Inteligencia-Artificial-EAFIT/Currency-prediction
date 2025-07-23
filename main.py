#!/usr/bin/env python
# -*- coding: utf-8 -*-"
#Currency-prediction - by MLeafit

"""
File for Serve the files
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.responses import HTMLResponse
import random
from datetime import datetime, timedelta

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Mock data generators
def generate_historical_data(currency_pair: str):
    data = []
    base_price = random.uniform(0.5, 2.0)
    for i in range(30):
        date = datetime.now() - timedelta(days=30-i)
        price = base_price + random.uniform(-0.1, 0.1)
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "price": round(price, 4),
            "volume": random.randint(1000000, 5000000)
        })
        base_price = price
    return data

def generate_prediction(currency_pair: str, algorithm: str):
    current_price = random.uniform(0.5, 2.0)
    predictions = []
    for i in range(7):
        date = datetime.now() + timedelta(days=i+1)
        change = random.uniform(-0.05, 0.05)
        predicted_price = current_price + change
        predictions.append({
            "date": date.strftime("%Y-%m-%d"),
            "predicted_price": round(predicted_price, 4),
            "confidence": random.uniform(0.6, 0.95)
        })
        current_price = predicted_price
    return predictions

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/currencies")
async def get_currencies():
    return {
        "currencies": [
            {"pair": "EUR/USD", "name": "Euro to US Dollar", "active": True},
            {"pair": "GBP/USD", "name": "British Pound to US Dollar", "active": True},
            {"pair": "USD/JPY", "name": "US Dollar to Japanese Yen", "active": True},
            {"pair": "AUD/USD", "name": "Australian Dollar to US Dollar", "active": False},
            {"pair": "USD/CAD", "name": "US Dollar to Canadian Dollar", "active": True},
            {"pair": "EUR/GBP", "name": "Euro to British Pound", "active": False}
        ]
    }

@app.get("/api/algorithms")
async def get_algorithms():
    return {
        "algorithms": [
            {"id": "lstm", "name": "LSTM Neural Network", "description": "Long Short-Term Memory network for time series"},
            {"id": "arima", "name": "ARIMA", "description": "AutoRegressive Integrated Moving Average"},
            {"id": "random_forest", "name": "Random Forest", "description": "Ensemble learning method"},
            {"id": "svm", "name": "Support Vector Machine", "description": "Support Vector Regression for prediction"},
            {"id": "linear_regression", "name": "Linear Regression", "description": "Simple linear regression model"}
        ]
    }

@app.get("/api/historical/{currency_pair}")
async def get_historical_data(currency_pair: str):
    return {
        "currency_pair": currency_pair,
        "data": generate_historical_data(currency_pair)
    }

@app.get("/api/predict/{currency_pair}")
async def predict_currency(currency_pair: str, algorithm: str = "lstm"):
    return {
        "currency_pair": currency_pair,
        "algorithm": algorithm,
        "predictions": generate_prediction(currency_pair, algorithm)
    }