"""
@athors: Cade Browning, Luke Howell
@date: May 2025
@description:
    Django application configuration for the Weather Prediction application.

    This module defines the configuration for the weather prediction application,
    which handles weather data processing and machine learning predictions.
    It extends Django's AppConfig to customize the application's behavior.

    Attributes:
        default_auto_field (str): Specifies the default primary key field type for models.
        name (str): The full Python path to the application.
        verbose_name (str): A human-readable name for the application.
"""



from django.apps import AppConfig

class WeatherConfig(AppConfig):
    """
    Configuration class for the Weather Prediction application.
    
    This class configures various aspects of the weather prediction app,
    including its name, primary key field type, and display name in the admin interface.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.apps.weather'
    verbose_name = 'Weather Prediction' 
