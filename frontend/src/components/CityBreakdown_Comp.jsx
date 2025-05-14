/**
 * CityBreakdown component that fetches and displays weather data for a specific city
 * 
 * @component
 * @returns {JSX.Element} A component displaying weather data for the specified city
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../css/Calendar.css';

function CityBreakdown() {
    const { city } = useParams();   //the city name from the URL
    const navigate = useNavigate(); //function to navigate between routes
    const location = useLocation(); //location object to access the URL parameters
    const [weatherData, setWeatherData] = useState(null); //state to hold the weather data
    const [loading, setLoading] = useState(true); //state to indicate loading status
    const [error, setError] = useState(null); //state for error
    const [dateInfo, setDateInfo] = useState({ start: null, end: null }); //state to set the date information
    const [isRangeMode, setIsRangeMode] = useState(false); //state to indicate if the date range is selected

    //function to get the properly capitalized city name
    const getCityName = (rawCity) => {
        const cityMap = {
            'asheville': 'ASHEVILLE',
            'raleigh': 'RALEIGH',
            'charlotte': 'CHARLOTTE',
            'wilmington': 'WILMINGTON'
        };
        return cityMap[rawCity.toLowerCase()] || rawCity;
    };

    //fetch the weather data when the component mounts or when the city or location changes
    useEffect(() => {
        //the parameters from the URL
        const params = new URLSearchParams(location.search);
    
        //get the start date and end date from the URL parameters
        const startDate = params.get('start');
        const endDate = params.get('end');

        //if both dates, it is a range
        const isRange = !!(startDate && endDate);
        setIsRangeMode(isRange);
        
        //if it's a range, set the start and end dates
        if (isRange) {
            setDateInfo({ start: startDate, end: endDate });
        }

        //fetch the weather data from the API
        const fetchCityData = async () => {

            //set loading to true and reset error
            setLoading(true);
            setError(null);

            try {
                //fetch the raw data from the API
                const response = await fetch(`http://localhost:8000/api/raw-data/`);
                const data = await response.json();
                
                //if the data is valid
                if (data && data.raw_data) {
            
                    //filter data for the specific city
                    const cityData = data.raw_data
                        .filter(item => item.name.includes(getCityName(city)))
                        .map(item => ({
                            date: item.date,
                            tmax: parseFloat(item.tmax),
                            tmin: parseFloat(item.tmin),
                            prcp: parseFloat(item.prcp)
                        }))
                        .sort((a, b) => new Date(a.date) - new Date(b.date));

                    //filter by date range
                    const filteredCityData = cityData.filter(item => {
                        const itemDate = new Date(item.date);
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        return itemDate >= start && itemDate <= end;
                    });

                    //if no data is found for the selected city and date range
                    if (filteredCityData.length === 0) {
                        setError(`No weather data available for ${city} during the selected date range`);
                        setWeatherData(null);
                        return;
                    }

                    //if it's a single date
                    if (!isRange) {
                        //use the first (and should be only) reading
                        const singleDayData = filteredCityData[0];
                        setWeatherData({
                            tmax: singleDayData.tmax.toFixed(1),
                            tmin: singleDayData.tmin.toFixed(1),
                            prcp: singleDayData.prcp.toFixed(2)
                        });
                    } else {
                        //if it's a range, set the weather data to the filtered data
                        setWeatherData(filteredCityData);
                    }
                } else {
                    throw new Error('Invalid data format received from server');
                }
            } catch (err) {
                console.error('Error in fetchCityData:', err);
                setError(err.message || 'Failed to fetch weather data');
                setWeatherData(null);
            } finally {
                setLoading(false);
            }
        };

        //if both start and end dates are provided, or if it's a single date
        if ((startDate && endDate) || singleDate) {
            //fetch the data
            fetchCityData();
        } else {
            setError('Invalid date parameters');
            setLoading(false);
        }
    }, [city, location.search]);

    const formatDate = (dateString) => {
        //because javaScript SUCKS
        const [year, month, day] = dateString.split('-');
        //months start at 0 in JavaScript Date, so subtract 1 from month
        const date = new Date(year, month - 1, day);
        
        //format the date to a readable string
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    //format the date or date range for display
    const formatDateRange = () => {
        if (dateInfo.start === dateInfo.end) {
            return `for ${formatDate(dateInfo.start)}`;
        }
        return `from ${formatDate(dateInfo.start)} to ${formatDate(dateInfo.end)}`;
    };

    //render the weather data for a single day
    const renderSingleDayData = () => (
        <div className="weather-card">
            <div className="weather-details">
                <div className="weather-stat">
                    <span className="label">Max Temperature:</span>
                    <span className="value">{weatherData.tmax}°F</span>
                </div>
                <div className="weather-stat">
                    <span className="label">Min Temperature:</span>
                    <span className="value">{weatherData.tmin}°F</span>
                </div>
                <div className="weather-stat">
                    <span className="label">Precipitation:</span>
                    <span className="value">{weatherData.prcp} inches</span>
                </div>
            </div>
        </div>
    );

    //render the weather data for a date range
    const renderDateRangeData = () => (
        <div className="daily-breakdown">
            {weatherData.map((day, index) => (
                <div key={index} className="weather-card">
                    <h3>{formatDate(day.date)}</h3>
                    <div className="weather-details">
                        <div className="weather-stat">
                            <span className="label">Max Temperature:</span>
                            <span className="value">{day.tmax.toFixed(2)}°F</span>
                        </div>
                        <div className="weather-stat">
                            <span className="label">Min Temperature:</span>
                            <span className="value">{day.tmin.toFixed(2)}°F</span>
                        </div>
                        <div className="weather-stat">
                            <span className="label">Precipitation:</span>
                            <span className="value">{day.prcp.toFixed(2)} inches</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
    
    //display the city breakdown page
    //with weather data
    return (
        <div className="calendar-page">
            <div className="calendar-section">
                <div className="calendar-header">
                    <button 
                        onClick={() => navigate('/historical-data')}
                        className="back-button"
                    >
                        ← Back to Calendar
                    </button>
                    <h1>{getCityName(city)} Weather Data</h1>
                    {dateInfo.start && (
                        <p className="subtitle">{formatDateRange()}</p>
                    )}
                </div>

                <div className="weather-section">
                    {loading ? (
                        <p className="loading-text">Loading weather data...</p>
                    ) : error ? (
                        <p className="error-text">{error}</p>
                    ) : weatherData ? (
                        isRangeMode ? renderDateRangeData() : renderSingleDayData()
                    ) : (
                        <p className="no-data">No weather data available for {city}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CityBreakdown; 