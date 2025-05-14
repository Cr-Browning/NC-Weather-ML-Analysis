import numpy as np
import requests
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import tensorflow as tf
from tensorflow import keras
from sqlalchemy import create_engine, text
import os   
import dotenv

dotenv.load_dotenv()

def get_data():
    '''
    Gets the data from the database for the model to be trained on.

    Parameters:
        None
    Returns:
        data (dict): Dictionary containing ML prediction data
    '''
    url = "http://localhost:8000/api/ml_data/"
    response = requests.get(url)
    data = response.json()
    return data

def split_date_data(data):
    '''
    Takes the original data and splits the date into year, month, and day. This 
    is done because the model will not recognize the type of date when it has 
    dashes in between. Creates a new dataset with the date split.

    Parameters:
        data (numpy array): the orignal data from the database
    Returns:
        new_data (list): the same data but with the date split for model reading
    '''
    new_data = []
    for entry in data['ML_data']:
        year, month, day = entry.get("date").split("-")[0], entry.get("date").split("-")[1],entry.get("date").split("-")[2]
        entry = [entry.get("name"), float(entry.get("latitude")), float(entry.get("longitude")), int(year), int(month),
                 int(day), float(entry.get("precip")), float(entry.get("temp_max")), float(entry.get("temp_min"))]
        new_data.append(entry)
    return new_data

def add_lag(data, column_to_lag):
    '''
    Adds lag value columns for the target variables, essentially copying previous values to 
    the next column. This is necessary since we need to use the previous values in the training 
    for the model.

    Parameters:
        data (numpy array): the data to lag
        column_to_lag (int): the column number to get the values to use
    Return:
        lagged_data: the data with the lagged values
    '''
    lag = np.roll(data[:, column_to_lag], shift=1)
    lagged_data = np.column_stack((data, lag))
    return lagged_data


def add_season(data):
    '''
    Adds a season variable to the dataset based on the month.

    Parameters:
        data (numpy array): The dataset with a month column.

    Returns:
        numpy array: The dataset with an additional season column.
    '''
    #create a new column for the season
    #0 = winter, 1 = spring, 2 = summer, 3 = fall
    seasons = []
    for row in data:
        #make sure month is an integer
        month = int(row[4])
        
        if month == 12 or month == 1 or month == 2:
            seasons.append(0)  #winter
        elif month == 3 or month == 4 or month == 5:
            seasons.append(1)  #spring
        elif month == 6 or month == 7 or month == 8:
            seasons.append(2)  #summer
        elif month == 9 or month == 10 or month == 11:
            seasons.append(3)  #fall
    
    #make sure seasons is one column
    seasons = np.array(seasons).reshape(-1, 1)
    
    #add the seasons to the data
    return np.hstack((data, seasons))

def preprocess_data():
    
    #preprocessing for numeric features
    numeric_features = [1, 2, 3, 4, 5, 6, 10, 11, 12] #indices for numeric features
    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])

    #preprocessing for categorical features
    categorical_features = [9]  #index for season
    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder())
    ])

    #combine preprocessors in a column transformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )

    return preprocessor

def train(data):
    '''
    Trains a simple linear regression model

    Parameters:
        data (numpy array): the data for the model to be trained on
    Return:
        None
    '''
    names = data[:, 0] #get station names
    curr_weather = data[:, 6:9].astype(float)  #current weather data

    #preprocess the data
    preprocessor = preprocess_data()

    #apply preprocessing
    X = preprocessor.fit_transform(data)

    #scale the current weather data
    output_scaler = StandardScaler()
    curr_weather_scaled = output_scaler.fit_transform(curr_weather)
    
    #define the dependent variable
    y = curr_weather_scaled

    #split training and testing sets
    indices = np.arange(len(data))
    X_train_idx, X_test_idx, y_train, y_test = train_test_split(
        indices, y, test_size=0.2, random_state=111
    )

    # Use the indices to split the data
    X_train = X[X_train_idx]
    X_test = X[X_test_idx]
    names_train = names[X_train_idx]
    names_test = names[X_test_idx]

    #build the linear regression model
    model = keras.Sequential([
        keras.Input(shape=(X_train.shape[1],)),
        keras.layers.Dense(3, activation='linear')
    ])

    #compile the model
    model.compile(optimizer='adam', loss='mse')

    #fit the model
    history = model.fit(X_train, y_train, epochs=100, verbose=0)

    #evaluate the model
    loss = model.evaluate(X_test, y_test, verbose=0)

    #predictions
    y_pred_scaled = model.predict(X_test)
    y_pred = output_scaler.inverse_transform(y_pred_scaled)

    #ensure non-negative precipitation
    y_pred[:, 0] = np.maximum(y_pred[:, 0], 0)
    
    y_test_original = output_scaler.inverse_transform(y_test)
    
    #predictions array with all necessary information
    predictions = []
    for i, (pred, actual) in enumerate(zip(y_pred, y_test_original)):
        predictions.append({
            "name": str(names_test[i]),
            "latitude": float(data[X_test_idx[i]][1]),
            "longitude": float(data[X_test_idx[i]][2]),
            "year": int(data[X_test_idx[i]][3]),
            "month": int(data[X_test_idx[i]][4]),
            "day": int(data[X_test_idx[i]][5]),
            "date": f"{int(data[X_test_idx[i]][3])}-{int(data[X_test_idx[i]][4]):02d}-{int(data[X_test_idx[i]][5]):02d}",
            "predicted_precip": float(pred[0]),
            "predicted_temp_max": float(pred[1]),
            "predicted_temp_min": float(pred[2]),
            "actual_precip": float(actual[0]),
            "actual_temp_max": float(actual[1]),
            "actual_temp_min": float(actual[2])
        })
    
    #sort predictions by station name and date
    predictions.sort(key=lambda x: (x["name"], x["date"]))

    #return metrics and all predictions
    return {
        "test_loss": float(loss),
        "training_loss": float(history.history['loss'][-1]),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "predictions": predictions
    }

def predict_weather(model, output_scaler, name, latitude, longitude, year, month, day):
    '''
    Makes weather predictions for a specific location and date.

    Parameters:
        model: Trained Keras model for making predictions
        output_scaler: Fitted StandardScaler for output variables
        name (str): Station name
        latitude (float): Station latitude
        longitude (float): Station longitude
        year (int): Year
        month (int): Month
        day (int): Day

    Returns:
        dict: Weather predictions containing:
            - name: Station name
            - latitude: Station latitude
            - longitude: Station longitude
            - year, month, day: Date components
            - precipitation: Predicted precipitation
            - temp_max: Predicted maximum temperature
            - temp_min: Predicted minimum temperature
    '''
    input_data = np.array([[name, latitude, longitude, year, month, day]])
    y_pred_scaled = model.predict(input_data)
    y_pred = output_scaler.inverse_transform(y_pred_scaled)
    y_pred[:, 0] = np.maximum(y_pred[:, 0], 0)
    return {
        "name": name,
        "latitude": latitude,
        "longitude": longitude,
        "year": year,
        "month": month,
        "day": day,
        "precipitation": float(y_pred[0][0]),
        "temp_max": float(y_pred[0][1]),
        "temp_min": float(y_pred[0][2])
    }

def load_into_db(data):
    '''
    Loads prediction results into the PostgreSQL database.

    Parameters:
        data: DataFrame containing prediction results with columns:
            name: Station name
            latitude: Station latitude
            longitude: Station longitude
            year, month, day: Date components
            predicted_precipitation: Predicted precipitation
            predicted_temp_max: Predicted maximum temperature
            predicted_temp_min: Predicted minimum temperature
            actual_precipitation: Actual precipitation
            actual_temp_max: Actual maximum temperature
            actual_temp_min: Actual minimum temperature

    The function:
        Connects to the PostgreSQL database using environment variables
        Replaces existing predictions in the ml_predictions table
        Verifies the data was loaded correctly
        Prints summary statistics
    '''
    try:
        columns = ["name", "latitude", "longitude", "year", "month", "day", 
                   "date", "predicted_precipitation", "predicted_temp_max", 
                   "predicted_temp_min",
                   "actual_precipitation", "actual_temp_max", "actual_temp_min"]
        df = df[columns]

        engine = create_engine(
            f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
        )

        df.to_sql("ml_predictions", engine, if_exists="replace", index=False)

        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM ml_predictions"))
            count = result.scalar()
            print(f"Total records in db: {count}")

            result = conn.execute(text("""
                SELECT name, latitude, longitude, year, month, day, 
                   date", predicted_precipitation, predicted_temp_max, 
                   predicted_temp_min,
                   actual_precipitation, actual_temp_max, actual_temp_min
                FROM ml_predictions
                GROUP BY name, latitude, longitude, year, month, day, 
                   date, predicted_precipitation, predicted_temp_max, 
                   predicted_temp_min,
                   actual_precipitation, actual_temp_max, actual_temp_min
                ORDER BY name, date
            """))
        
        print("\nSuccessfully loaded data into PostgreSQL")
        print(f"Total records: {len(df)}")

        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM ml_predictions"))
            count = result.scalar()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    data = get_data()
    updated_data = split_date_data(data)
    updated_data = np.array(updated_data)
    updated_data = add_season(updated_data)
    updated_data = add_lag(updated_data, 5)
    updated_data = add_lag(updated_data, 6)
    updated_data = add_lag(updated_data, 7)
    model, output_scaler = train(updated_data)
