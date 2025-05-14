"""
@authors: Cade Browning, Luke Howell
@date: May 2025
@description:
Views for the Weather Prediction application.

This module contains the view functions that handle API requests for weather data
and machine learning operations. It includes endpoints for retrieving raw weather data,
preparing data for ML processing, training ML models, and retrieving predictions.
"""

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import WeatherData, ML_Predictions
from django.db.models import Q
from data.linear_regression import train, split_date_data, add_lag, add_season
import numpy as np

@require_http_methods(["GET"])
def get_raw_data(request):
    """
    Retrieve all raw weather data from the database.
    
    This view fetches weather data from the database, excluding records with
    null values for temperature or precipitation. The data is ordered by date
    and returned as a JSON response.

    Returns:
        JsonResponse: Contains a list of weather data records with the following fields:
            - date: Date of the measurement
            - name: Station name
            - latitude: Station latitude
            - longitude: Station longitude
            - tmax: Maximum temperature
            - tmin: Minimum temperature
            - prcp: Precipitation amount
    """
    raw_data = WeatherData.objects.exclude(
        Q(tmax__isnull=True) | Q(tmin__isnull=True) | Q(prcp__isnull=True)
    ).order_by('date')
    
    raw_data = [
        {
            "date": data.date,
            "name": data.name,
            "latitude": data.latitude,
            "longitude": data.longitude,
            "tmax": data.tmax,
            "tmin": data.tmin,
            "prcp": data.prcp
        }
        for data in raw_data
    ]
    
    return JsonResponse({"raw_data": raw_data})

@require_http_methods(["GET"])
def train_ml_model(request):
    """
    Train the machine learning model and return performance metrics.
    
    This view handles the ML model training process, including:
    - Data retrieval and preprocessing
    - Feature engineering (seasonal and lag features)
    - Model training
    - Prediction generation
    - Results organization by station

    Returns:
        JsonResponse: Contains:
            - stations: Dictionary of predictions grouped by station
            - total_samples: Number of samples used for training
            - raw_data_count: Number of raw data points
        On error:
            - status: "error"
            - message: Error description
    """
    try:
        # Get and process data - sort by name and date
        ML_data = WeatherData.objects.exclude(
            Q(tmax__isnull=True) | Q(tmin__isnull=True) | Q(prcp__isnull=True)
        ).order_by('name', 'date').values('name', 'date', 'latitude', 'longitude', 'tmax', 'tmin', 'prcp')

        data = {
            "ML_data": [
                {
                    "name": data['name'],
                    "latitude": data['latitude'],
                    "longitude": data['longitude'],
                    "date": data['date'], 
                    "precip": data['prcp'],
                    "temp_max": data['tmax'],
                    "temp_min": data['tmin']
                }
                for data in ML_data
            ]
        }
        
        # Process data for ML
        updated_data = split_date_data(data)
        updated_data = np.array(updated_data)

        #add season feature
        updated_data = add_season(updated_data)
        
        # Add lag features
        updated_data = add_lag(updated_data, 6)  # Lag precipitation
        updated_data = add_lag(updated_data, 7)  # Lag max temperature
        updated_data = add_lag(updated_data, 8)  # Lag min temperature
        
        # Train model and get metrics
        metrics = train(updated_data)
        
        # Group predictions by station
        stations = {}
        for pred in metrics["predictions"]:
            station_name = pred["name"]
            if station_name not in stations:
                stations[station_name] = []
            stations[station_name].append(pred)
        
        # Create final response with grouped predictions
        return JsonResponse({
            "stations": stations,
            "total_samples": len(updated_data),
            "raw_data_count": len(data["ML_data"])
        })
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": str(e)
        }, status=500)
    
@require_http_methods(["GET"])
def get_pred_data(request):
    """
    Retrieve all predicted weather data from the database.
    
    This view fetches ML predictions and actual weather data from the database,
    organizing the results by weather station.

    Returns:
        JsonResponse: Contains:
            - stations: Dictionary of predictions grouped by station
            - total_samples: Total number of predictions
            - raw_data_count: Number of data points
    """
    pred_data = ML_Predictions.objects.values(
        'name', 'latitude', 'longitude', 'year', 'month', 'day', 'date',
        'predicted_precip', 'predicted_temp_max', 'predicted_temp_min',
        'actual_precip', 'actual_temp_max', 'actual_temp_min'
    )
    stations = {}
    for pred in pred_data:
        station_name = pred["name"]
        if station_name not in stations:
            stations[station_name] = []
        stations[station_name].append(pred)
    
    return JsonResponse({
        "stations":stations,
        "total_samples": len(pred_data),
        "raw_data_count": len(pred_data)
    })
