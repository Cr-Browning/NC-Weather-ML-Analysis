"""
@authors: Cade Browning, Luke Howell
@date: May 2025
@description:
    URL configuration for the Weather Prediction application.

    This module defines the URL patterns for the weather application's API endpoints.
    It maps URLs to their corresponding view functions and provides named URLs
    for reverse URL lookups.
"""

from django.urls import path
from . import views

urlpatterns = [    
    # Data provided by NOAA endpoints
    path('api/raw-data/', views.get_raw_data, name='raw_data'),
    # Cleans the data and trains the ML model
    path('api/ml_data/train/', views.train_ml_model, name='train_ml_model'),
    # Predictions sent to web application
    path('api/ml_data/pred/', views.get_pred_data, name='pred_data'),
] 