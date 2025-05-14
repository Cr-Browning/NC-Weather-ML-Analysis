#Cleaning the data from the csv file and loading into PostgreSQL
import pandas as pd
import os
from sqlalchemy import create_engine, text

def clean_data():
    """
    Cleans the CSV data and loads it into PostgreSQL maintaining the original format
    """
    print("Starting data loading process...")
    
    try:
        # Read the CSV file
        csv_path = os.path.join(os.path.dirname(__file__), 'climate_data2020_2024.csv')
        df = pd.read_csv(csv_path, low_memory=False)
        print(f"Read {len(df)} rows from CSV")
        
        # Keep only the columns we need
        columns_to_keep = ['NAME', 'DATE', 'LATITUDE', 'LONGITUDE', 'TMAX', 'TMIN', 'PRCP']
        df = df[columns_to_keep]
        
        # Rename columns to match the original format
        df = df.rename(columns={
            'NAME': 'name',
            'DATE': 'date',
            'LATITUDE': 'latitude',
            'LONGITUDE': 'longitude',
            'TMAX': 'tmax',
            'TMIN': 'tmin',
            'PRCP': 'prcp'
        })
        
        # Create PostgreSQL connection
        engine = create_engine(
            "postgresql://postgres:CapStone!@localhost:5432/ncweather"
        )
        
        # Load data into PostgreSQL with an auto-incrementing ID
        print("\nLoading data into PostgreSQL...")
        df.to_sql('climate_data2020_2024', engine, if_exists='replace', index=True, index_label='id')
        
        # Create primary key
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE climate_data2020_2024 ADD PRIMARY KEY (id)"))
            conn.commit()
        
        print("\nSuccessfully loaded data into PostgreSQL")
        print(f"Total records: {len(df)}")
        
        # Verify the data
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM climate_data2020_2024"))
            count = result.scalar()
            print(f"Total records in database: {count}")
            
            # Count records per station
            result = conn.execute(text("""
                SELECT name, date, latitude, longitude, tmax, tmin, prcp
                FROM climate_data2020_2024 
                GROUP BY name, date, latitude, longitude, tmax, tmin, prcp
                ORDER BY name, date
            """))

        
    except FileNotFoundError:
        print(f"Error: Could not find CSV file at {csv_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    clean_data()
