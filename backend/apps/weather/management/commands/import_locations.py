from django.core.management.base import BaseCommand
from django.db import connection
from backend.apps.weather.models import Location
import pandas as pd
import os

class Command(BaseCommand):
    help = 'Import weather station locations from the CSV file'

    def handle(self, *args, **kwargs):
        try:
            # Get the path to the CSV file
            script_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))))
            csv_path = os.path.join(script_dir, 'data', 'climate_data2020_2024.csv')
            
            # Read the CSV file
            df = pd.read_csv(csv_path)
            
            # Get unique locations
            locations = df[['NAME', 'LATITUDE', 'LONGITUDE']].drop_duplicates()
            
            # Create or update locations
            for _, row in locations.iterrows():
                if pd.notna(row['NAME']) and pd.notna(row['LATITUDE']) and pd.notna(row['LONGITUDE']):
                    Location.objects.update_or_create(
                        name=row['NAME'],
                        defaults={
                            'latitude': float(row['LATITUDE']),
                            'longitude': float(row['LONGITUDE'])
                        }
                    )
            
            self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(locations)} locations'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing locations: {str(e)}'))
            self.stdout.write(self.style.ERROR(f'Error details: {str(e.__class__.__name__)}'))
            self.stdout.write(self.style.ERROR(f'Attempted path: {csv_path}')) 