"""
@athors: Cade Browning, Luke Howell
@date: May 2025
@description:
    Django models for the Weather Prediction application.

    This module defines the database models used for storing weather data and
    machine learning predictions. The models are designed to work with existing
    database tables and are set to be unmanaged by Django.

    Models:
        WeatherData: Stores historical weather data from climate stations
        ML_Predictions: Stores machine learning predictions and actual weather data
"""

from django.db import models

class WeatherData(models.Model):
    """
    Model representing historical weather data from climate stations.
    
    This model maps to an existing database table 'climate_data2020_2024' and
    is used to store and retrieve historical weather measurements including
    temperature and precipitation data.

    Fields:
        id (AutoField): Primary key, automatically generated
        date (DateField): Date of the weather measurement
        name (CharField): Name of the weather station
        latitude (FloatField): Station's latitude coordinate
        longitude (FloatField): Station's longitude coordinate
        tmax (FloatField): Maximum temperature for the day (nullable)
        tmin (FloatField): Minimum temperature for the day (nullable)
        prcp (FloatField): Precipitation amount for the day (nullable)
    """

    id = models.AutoField(primary_key=True)
    date = models.DateField()
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    tmax = models.FloatField(null=True)
    tmin = models.FloatField(null=True)
    prcp = models.FloatField(null=True)

    class Meta:
        db_table = 'climate_data2020_2024'
        managed = False  # Django does not manage this table

    def __str__(self):
        return f"{self.name} - {self.date}" 
    
class ML_Predictions(models.Model):
    """
    Model representing machine learning predictions and actual weather data.
    
    This model maps to an existing database table 'ml_predictions' and stores
    both predicted and actual weather measurements for comparison and analysis.

    Fields:
        name (CharField): Name of the weather station
        latitude (FloatField): Station's latitude coordinate
        longitude (FloatField): Station's longitude coordinate
        year (IntegerField): Year component of the date
        month (IntegerField): Month component of the date
        day (IntegerField): Day component of the date
        date (DateField): Full date of the prediction
        predicted_precip (FloatField): Predicted precipitation amount
        predicted_temp_max (FloatField): Predicted maximum temperature
        predicted_temp_min (FloatField): Predicted minimum temperature
        actual_precip (FloatField): Actual precipitation amount
        actual_temp_max (FloatField): Actual maximum temperature
        actual_temp_min (FloatField): Actual minimum temperature
    """

    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    year = models.IntegerField()
    month = models.IntegerField()
    day = models.IntegerField()
    date = models.DateField()   
    predicted_precip = models.FloatField()
    predicted_temp_max = models.FloatField()
    predicted_temp_min = models.FloatField()
    actual_precip = models.FloatField()
    actual_temp_max = models.FloatField()
    actual_temp_min = models.FloatField()

    class Meta:
        db_table = 'ml_predictions'
        managed = False
    
    def __str__(self):
        return f"{self.name} - {self.date}" 

