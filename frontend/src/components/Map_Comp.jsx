/** 
 * WeatherMap Component to display weather stations and their data on a map
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Date} props.selectedDate - Selected date for weather data
 * @param {[Date, Date]} props.dateRange - Selected date range for weather data
 * @param {boolean} props.isRangeMode - Flag to indicate if range mode is active
 * @returns {JSX.Element} A map with weather stations and their data
 */

import React, {useState, useEffect} from 'react';
import Map, {Marker, Popup} from '@vis.gl/react-mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../css/Map.css';

function WeatherMap({ selectedDate, dateRange, isRangeMode }) {
    //set the initial view state of the map
    const[viewPort, setViewState] = useState({
        latitude: 35.29769,
        longitude: -83.194675,
        zoom: 10,
    });

    const [selectedStation, setSelectedStation] = useState(null); //state to set the selected station
    const [stations, setStations] = useState([]); //state to set the stations
    const [stationWeather, setStationWeather] = useState(null); //state to set the weather data for the selected station
    const [weatherData, setWeatherData] = useState(null); //state to set the weather data
    const [stationsWithData, setStationsWithData] = useState(new Set()); //state to set all stations in date range with data

    // Fetch stations and all weather data
    useEffect(() => {
        // Fetch all data from a single endpoint
        fetch('http://localhost:8000/api/raw-data/')
            .then(response => response.json())
            .then(data => {
                console.log('Raw data received:', data); // Debug log
                if (data && data.raw_data) {
                    // Set the weather data
                    setWeatherData(data.raw_data);
                    
                    // Extract unique stations from the raw data
                    const uniqueStations = {};
                    data.raw_data.forEach(item => {
                        if (!uniqueStations[item.name]) {
                            uniqueStations[item.name] = {
                                id: item.name,
                                latitude: item.latitude,
                                longitude: item.longitude,
                                name: item.name
                            };
                        }
                    });
                    const stationsList = Object.values(uniqueStations);
                    console.log('Extracted stations:', stationsList); // Debug log
                    setStations(stationsList);
                }
            })
            .catch(error => {
                console.error('Error loading data:', error);
            });
    }, []); 

    // Function to check if a station has data for the selected date/range
    const checkStationDataAvailability = (stationName) => {
        //if no data, return false
        if (!weatherData) return false;
        
        //if range mode is active, check if the station has data in the range
        if (isRangeMode && dateRange && dateRange[0] && dateRange[1]) {
            const startDate = new Date(dateRange[0]);
            const endDate = new Date(dateRange[1]);
            return weatherData.some(item => 
                item.name === stationName &&
                new Date(item.date) >= startDate &&
                new Date(item.date) <= endDate
            );
        //if single date is selected, check if the station has data for that date
        } else if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            return weatherData.some(item => 
                item.name === stationName && 
                item.date === formattedDate
            );
        }
        return false;
    };

    // Filter stations to only show those with data
    const filteredStations = stations.filter(station => checkStationDataAvailability(station.name));

    // Update stations with data when date/range changes
    useEffect(() => {
        //if there is data
        if (weatherData) {
            //create a set for stations with data
            const stationsWithDataSet = new Set();
            
            //check each station for data availability
            stations.forEach(station => {
                if (checkStationDataAvailability(station.name)) {
                    //add the station to the set
                    stationsWithDataSet.add(station.name);
                }
            });

            //set the stations with data
            setStationsWithData(stationsWithDataSet);
        }
        //values for which the effect will run
    }, [weatherData, selectedDate, dateRange, isRangeMode, stations]);

    // Update station weather when station or date selection changes
    useEffect(() => {
        //if there is a selected station and weather data
        if (selectedStation && weatherData) {
            let stationData;
            
            //if range mode is active and there is a date range
            if (isRangeMode && dateRange && dateRange[0] && dateRange[1]) {
                const startDate = new Date(dateRange[0]);
                const endDate = new Date(dateRange[1]);
                
                // Filter data for date range
                stationData = weatherData
                    .filter(item => 
                        item.name === selectedStation.name &&
                        new Date(item.date) >= startDate &&
                        new Date(item.date) <= endDate
                    )
                    .map(item => ({
                        date: item.date,
                        tmax: parseFloat(item.tmax),
                        tmin: parseFloat(item.tmin),
                        prcp: parseFloat(item.prcp)
                    }))
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            //if single date is selected
            } else if (selectedDate) {
                //format the date
                const formattedDate = selectedDate.toISOString().split('T')[0];
                
                //filter data for single date
                stationData = weatherData
                    .filter(item => 
                        item.name === selectedStation.name && 
                        item.date === formattedDate
                    )
                    .map(item => ({
                        date: item.date,
                        tmax: parseFloat(item.tmax),
                        tmin: parseFloat(item.tmin),
                        prcp: parseFloat(item.prcp)
                    }));
            }

            //set the station's weather data
            setStationWeather(stationData);
        }
        //values for which the effect will run
    }, [selectedStation, selectedDate, dateRange, isRangeMode, weatherData]);
    
    //function to display weather information
    const renderWeatherInfo = () => {

        //if no data is available, return a message
        if (!stationWeather || stationWeather.length === 0) {
            return <p className="no-data-message">No climate data available for this station and date</p>;
        }

        //if range mode is active
        if (isRangeMode) {
            return (
                <div className="weather-info">
                    <p>Weather data for selected period:</p>
                    <div className="weather-list" style={{maxHeight: '200px', overflowY: 'auto'}}>
                        {stationWeather.map((day, index) => (
                            <div key={index} className="daily-weather">
                                <p className="date-info">{new Date(day.date).toLocaleDateString()}</p>
                                <p>Max Temperature: {day.tmax.toFixed(1)}°F</p>
                                <p>Min Temperature: {day.tmin.toFixed(1)}°F</p>
                                <p>Precipitation: {day.prcp.toFixed(2)} inches</p>
                                <hr />
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else {
            //for single date, show all readings for that station
            return (
                <div className="weather-info">
                    {stationWeather.map((reading, index) => (
                        <div key={index} className="reading">
                            <p>Max Temperature: {reading.tmax.toFixed(1)}°F</p>
                            <p>Min Temperature: {reading.tmin.toFixed(1)}°F</p>
                            <p>Precipitation: {reading.prcp.toFixed(2)} inches</p>
                            {index < stationWeather.length - 1 && <hr />}
                        </div>
                    ))}
                </div>
            );
        }
    };

    return (
        <div>
            <Map
                {...viewPort}
                onMove={evt => setViewState(evt.viewState)}
                mapboxAccessToken = "pk.eyJ1IjoibGhvd2VsbDEiLCJhIjoiY203MWduZHozMGQyZzJrcWE4b2J5MDgwOCJ9.4ue8E7XOLcyZs2RDdFWAIQ"
                /* 
                width = "100%"
                height = "100%"
                 */
                style={{width: '100%', height: 600}}
                mapStyle="mapbox://styles/mapbox/streets-v11"
            >
                {filteredStations.map(station => (
                    <Marker 
                        key={station.id}
                        latitude={station.latitude}
                        longitude={station.longitude}
                    > 
                        <button 
                            className={`marker-btn ${!stationsWithData.has(station.name) ? 'no-data' : ''}`}
                            onClick={clickEvent => {
                                clickEvent.stopPropagation();
                                setSelectedStation(station);
                            }}
                        >
                            <img 
                                src="/weather-station.svg" 
                                alt="Weather Station Icon" 
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    filter: !stationsWithData.has(station.name) ? 'grayscale(100%)' : 'none'
                                }}
                            />
                        </button>
                    </Marker>
                ))}

                {selectedStation ? (
                    <Popup
                        className="popup-text" 
                        latitude={selectedStation.latitude}
                        longitude={selectedStation.longitude}
                        onClose={() => {
                            setSelectedStation(null);
                            setStationWeather(null);
                        }}
                    >
                        <div className="station-popup">
                            <h3>{selectedStation.name}</h3>
                            <p className="coordinates">
                                Lat: {selectedStation.latitude.toFixed(4)}, Long: {selectedStation.longitude.toFixed(4)}
                            </p>
                            <p className="date-info">
                                {isRangeMode 
                                    ? `Weather from ${dateRange[0]?.toLocaleDateString()} to ${dateRange[1]?.toLocaleDateString()}`
                                    : `Weather for ${selectedDate?.toLocaleDateString()}`
                                }
                            </p>
                            {renderWeatherInfo()}
                        </div>
                    </Popup>
                ) : null}
            </Map>
        </div>
    );
}

export default WeatherMap;