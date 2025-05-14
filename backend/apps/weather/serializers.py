"""
@authors: Cade Browning, Luke Howell
@date: May 2025
@description:
    Serializers for the Weather Prediction application.

    This module defines serializers that handle the conversion of weather data
    models to and from JSON format for API responses. The serializers ensure
    proper data formatting and field selection for API endpoints.
"""

from rest_framework import serializers
from .models import WeatherData

class WeatherDataSerializer(serializers.ModelSerializer):
    """
    Serializer for the WeatherData model.
    
    This serializer handles the conversion of WeatherData model instances
    to and from JSON format. It specifies which fields should be included
    in the serialized output for API responses.

    Fields:
        date: Date of the weather measurement
        latitude: Station's latitude coordinate
        longitude: Station's longitude coordinate
        tmax: Maximum temperature for the day
        tmin: Minimum temperature for the day
        prcp: Precipitation amount for the day
    """

    class Meta:
        model = WeatherData
        fields = ['date', 'latitude', 'longitude', 'tmax', 'tmin', 'prcp'] 