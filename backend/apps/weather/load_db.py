"""
@athors: Cade Browning, Luke Howell
@date: May 2025
@description:
    Database loader for ML predictions in the Weather Prediction application.

    This module handles the process of fetching ML prediction data from the API
    and storing it in a PostgreSQL database. It includes functions for:
    - Fetching data from the ML training API endpoint
    - Creating the ML predictions table if it doesn't exist
    - Inserting or updating ML prediction records in the database

    The module uses environment variables for database configuration and includes
    error handling for database operations and data processing.

    Environment Variables Required:
        DB_NAME: Name of the PostgreSQL database
        DB_USER: Database user name
        DB_PASSWORD: Database user password
        DB_HOST: Database host address
        DB_PORT: Database port number
"""

import requests
import psycopg2
from psycopg2 import sql
import os
import dotenv

dotenv.load_dotenv()

API_URL = "http://localhost:8000/api/ml_data/train/"

# Database connection parameters
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")  
DB_PORT = os.getenv("DB_PORT")       

def fetch_data(api_url):
    """
    Fetches JSON data from the specified API URL and returns it.
    
    Args:
        api_url (str): The URL of the API endpoint to fetch data from.
        
    Returns:
        dict: JSON response from the API containing ML prediction data.
        
    Raises:
        requests.exceptions.RequestException: If the API request fails.
    """
    response = requests.get(api_url)
    response.raise_for_status()  # Raise an exception for non-2xx status codes
    return response.json()

def create_table(cursor):
    """
    Creates the ml_predictions table if it doesn't exist.
    
    Args:
        cursor: PostgreSQL database cursor object.
    """
    create_table_query = """
        CREATE TABLE IF NOT EXISTS ml_predictions (
            name VARCHAR(255),
            latitude FLOAT,
            longitude FLOAT,
            year INTEGER,
            month INTEGER,
            day INTEGER,
            date DATE,
            predicted_precip FLOAT,
            predicted_temp_max FLOAT,
            predicted_temp_min FLOAT,
            actual_precip FLOAT,
            actual_temp_max FLOAT,
            actual_temp_min FLOAT,
            PRIMARY KEY (name, date)
        )
    """
    cursor.execute(create_table_query)

def insert_ml_predictions(data):
    """
    Inserts or updates ML prediction records in the database.
    
    Args:
        data (dict): Dictionary containing ML prediction data
            
    The function:
        Establishes a database connection
        Creates the table if it doesn't exist
        Inserts or updates records for each station
        Handles errors for individual records without failing the entire operation
        Commits successful transactions and rolls back on errors
    """
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cursor = conn.cursor()

    try:
        # Create table if it doesn't exist
        create_table(cursor)
        
        # Prepare the insert query
        insert_query = """
            INSERT INTO ml_predictions (
                name, latitude, longitude, year, month, day, date,
                predicted_precip, predicted_temp_max, predicted_temp_min,
                actual_precip, actual_temp_max, actual_temp_min
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (name, date) DO UPDATE SET
                predicted_precip = EXCLUDED.predicted_precip,
                predicted_temp_max = EXCLUDED.predicted_temp_max,
                predicted_temp_min = EXCLUDED.predicted_temp_min,
                actual_precip = EXCLUDED.actual_precip,
                actual_temp_max = EXCLUDED.actual_temp_max,
                actual_temp_min = EXCLUDED.actual_temp_min
        """

        stations = data.get("stations", {})
        for station_name, records in stations.items():
            for record in records:
                try:
                    cursor.execute(
                        insert_query, (
                            record["name"],
                            record["latitude"],
                            record["longitude"],
                            record["year"],
                            record["month"],
                            record["day"],
                            record["date"],
                            record["predicted_precip"],
                            record["predicted_temp_max"],
                            record["predicted_temp_min"],
                            record["actual_precip"],
                            record["actual_temp_max"],
                            record["actual_temp_min"]
                        )
                    )
                except Exception as e:
                    print(f"Error inserting record for {record['name']} on {record['date']}: {e}")
                    continue

        conn.commit()
        print("Data inserted/updated successfully into ml_predictions!")
    
    except Exception as e:
        conn.rollback()
        print(f"Error in database operation: {e}")
    finally:
        cursor.close()
        conn.close()

def main():
    """
    Main function that orchestrates the data loading process.
    
    The function:
        Fetches ML prediction data from the API
        Inserts/updates the data in the database
        Handles any errors that occur during the process
    """
    try:
        # Fetch data
        json_data = fetch_data(API_URL)
        # Insert data
        insert_ml_predictions(json_data)
    except Exception as e:
        print(f"Error in main process: {e}")

if __name__ == "__main__":
    main()