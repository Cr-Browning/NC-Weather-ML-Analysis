/**
 * Calendar page component displaying a date picker and weather data
 * @component
 * @returns {JSX.Element} A calendar page with date search and weather data display
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Calendar.css';
import DateSearchBar from './DateSearch_Comp';
import WeatherMap from './Map_Comp';

function Calendar() {   
    
    const navigate = useNavigate(); //initializing the navigate function from react-router-dom
    const [selectedDate, setSelectedDate] = useState(null); //state for managing the selected date
    const [dateRange, setDateRange] = useState([null, null]); //state for managing the date range
    const [weatherData, setWeatherData] = useState(null); //state for managing the weather data
    const [loading, setLoading] = useState(false); //loading state
    const [isRangeMode, setIsRangeMode] = useState(false); //state for managing the range mode

    //function for handling single date selection for the DateSearchBar component
    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsRangeMode(false);
        fetchWeatherData(date);
    };

    //function for handling range selection for the DateSearchBar component
    const handleRangeSelect = (start, end) => {
        setDateRange([start, end]);
        setIsRangeMode(true);
        fetchWeatherData(start, end);
    };

    //function for handling city click event to navigate to the historical data page
    const handleCityClick = (city) => {
        const params = new URLSearchParams();
        if (isRangeMode && dateRange[0] && dateRange[1]) {
            params.append('start', dateRange[0].toISOString().split('T')[0]);
            params.append('end', dateRange[1].toISOString().split('T')[0]);
        } else if (selectedDate) {
            params.append('date', selectedDate.toISOString().split('T')[0]);
        }
        navigate(`/historical-data/${encodeURIComponent(city)}?${params.toString()}`);
    };

    //function for fetching weather data from the API
    const fetchWeatherData = async (startDate, endDate) => {
        // Check if startDate is valid
        if (!startDate) return;
        
        //loading state is set to true while fetching data
        setLoading(true);

        try {
            //fetching data from the API
            const response = await fetch(`http://localhost:8000/api/raw-data/`);
            const data = await response.json();
            
            //checking if the data is valid and contains raw_data
            if (data && data.raw_data) {

                // Group data by city and date
                const cityDateGroupedData = data.raw_data.reduce((acc, item) => {
                    let cityName;
                    let tmax = item.tmax;
                    let tmin = item.tmin;

                    //get the city name based on the item name
                    if (item.name.includes('ASHEVILLE')) cityName = 'Asheville';
                    else if (item.name.includes('RALEIGH')) cityName = 'Raleigh';
                    else if (item.name.includes('CHARLOTTE')) cityName = 'Charlotte';
                    else if (item.name.includes('WILMINGTON')) cityName = 'Wilmington';
                    else return acc;

                    //if there is no values for a city, initialize the object
                    if (!acc[cityName]) {
                        acc[cityName] = {};
                    }

                    //if a date for the city doesnt exist, initialize the object
                    if (!acc[cityName][item.date]) {
                        acc[cityName][item.date] = {
                            date: item.date,
                            tmax: tmax || 0,
                            tmin: tmin || 0,
                            prcp: item.prcp || 0,
                            count: 1
                        };
                    } else {
                        const current = acc[cityName][item.date];
                        // Use regular averaging for all cities
                        current.tmax = ((current.tmax * current.count) + (tmax || 0)) / (current.count + 1);
                        current.tmin = ((current.tmin * current.count) + (tmin || 0)) / (current.count + 1);
                        current.prcp = ((current.prcp * current.count) + (item.prcp || 0)) / (current.count + 1);
                        current.count += 1;
                    }
                    
                    return acc;
                }, {});

                //put the start date in the correct format
                const formattedStartDate = startDate.toISOString().split('T')[0];

                //converts the cityDateGroupedData object into an arrray of key value pairs
                const cityAverages = Object.entries(cityDateGroupedData).map(([city, dates]) => {
                    let relevantData;
                    
                    if (endDate) {
                        // Date range mode
                        const start = startDate.getTime();
                        const end = endDate.getTime();
                        relevantData = Object.values(dates).filter(item => {
                            const itemDate = new Date(item.date).getTime();
                            return itemDate >= start && itemDate <= end;
                        });
                    } else {
                        // Single date mode
                        relevantData = Object.values(dates).filter(item => item.date === formattedStartDate);
                    }

                    if (relevantData.length === 0) return null;

                    //gets the sum of the values for each city
                    const cityAverage = relevantData.reduce((acc, item) => {
                        acc.tmax += item.tmax;
                        acc.tmin += item.tmin;
                        acc.prcp += item.prcp;
                        return acc;
                    }, { tmax: 0, tmin: 0, prcp: 0 });

                    //returns the average values for each city
                    return {
                        location: city,
                        tmax: (cityAverage.tmax / relevantData.length).toFixed(2),
                        tmin: (cityAverage.tmin / relevantData.length).toFixed(2),
                        prcp: (cityAverage.prcp / relevantData.length).toFixed(2)
                    };

                //filter out null values (cities with no data)
                }).filter(city => city !== null);

                // Maintain consistent city order
                const cityOrder = ['Asheville', 'Raleigh', 'Charlotte', 'Wilmington'];
                const sortedAverages = cityOrder
                    .map(city => cityAverages.find(avg => avg.location === city))
                    .filter(avg => avg !== undefined);

                setWeatherData(sortedAverages);
            } else {
                setWeatherData(null);
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            setWeatherData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="calendar-page">
            <div className="page-header">
                <h1>Historical Weather Data</h1>
            </div>
            
            <div className="calendar-section">
                <div className="calendar-left-panel">
                    <div className="date-range-info">
                        <h2>Available Data Range</h2>
                        <div className="range-details">
                            <p>Start Date: January 1, 2020</p>
                            <p>End Date: December 31, 2024</p>
                        </div>
                    </div>
                    
                    <div className="calendar-container">
                        <DateSearchBar 
                            onDateSelect={handleDateSelect} 
                            onRangeSelect={handleRangeSelect}
                        />
                    </div>
                </div>

                <div className="calendar-right-panel">
                    <div className="map-container">
                        <WeatherMap 
                            selectedDate={selectedDate}
                            dateRange={dateRange}
                            isRangeMode={isRangeMode}
                        />
                    </div>
                </div>
            </div>

            <div className="weather-section">
                <h2>Weather Data</h2>
                {loading ? (
                    <p className="loading-text">Loading weather data...</p>
                ) : weatherData ? (
                    <div className="weather-cards">
                        {weatherData.map((location, index) => (
                            <div key={index} className="weather-card">
                                <h3 
                                    className={isRangeMode ? "city-name-link" : ""}
                                    onClick={isRangeMode ? () => handleCityClick(location.location) : undefined}
                                >
                                    {location.location}
                                </h3>
                                <div className="weather-details">
                                    <div className="weather-stat">
                                        <span className="label">Max Temperature:</span>
                                        <span className="value">{location.tmax}°F</span>
                                    </div>
                                    <div className="weather-stat">
                                        <span className="label">Min Temperature:</span>
                                        <span className="value">{location.tmin}°F</span>
                                    </div>
                                    <div className="weather-stat">
                                        <span className="label">Precipitation:</span>
                                        <span className="value">{location.prcp} inches</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">Select a date to view weather information</p>
                )}
            </div>
        </div>
    );
}

export default Calendar;