from django.core.management.base import BaseCommand
from django.db import connection
from django.utils import timezone
from backend.apps.weather.models import WeatherData, Location
from datetime import datetime

class Command(BaseCommand):
    help = 'Import weather data from PostgreSQL database'

    def handle(self, *args, **options):
        # Get data from the climate_data2020_2024 table
        with connection.cursor() as cursor:
            # First, get unique locations
            cursor.execute("""
                SELECT DISTINCT "LATITUDE", "LONGITUDE"
                FROM climate_data2020_2024
            """)
            locations = cursor.fetchall()
            
            # Create or get locations
            location_map = {}
            for lat, lon in locations:
                location, created = Location.objects.get_or_create(
                    latitude=lat,
                    longitude=lon,
                    defaults={'name': f'Weather Station ({lat}, {lon})'}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created location: {location.name}'))
                location_map[(lat, lon)] = location

            # Get weather data
            cursor.execute("""
                SELECT "DATE", "TMAX", "TMIN", "PRCP", "LATITUDE", "LONGITUDE"
                FROM climate_data2020_2024
                ORDER BY "DATE"
            """)
            
            rows = cursor.fetchall()
            for row in rows:
                date_str, tmax, tmin, prcp, lat, lon = row
                try:
                    # Convert date string to datetime
                    date = datetime.strptime(date_str, '%Y-%m-%d').date()
                    
                    # Get the location for this data point
                    location = location_map[(lat, lon)]
                    
                    # Create or update WeatherData entry
                    WeatherData.objects.update_or_create(
                        date=date,
                        location=location,
                        defaults={
                            'tmax': tmax,
                            'tmin': tmin,
                            'prcp': prcp,
                            'conditions': 'Unknown'  # We don't have conditions in the source data
                        }
                    )
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error processing row {row}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS('Successfully imported weather data')) 