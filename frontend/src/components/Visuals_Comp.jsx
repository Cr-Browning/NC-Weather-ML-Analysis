/**
 * Visuals_Comp component fetches weather data from the backend and displays it in various plots. 
 * It allows users to select a date range and choose which cities to display data for.
 * It also includes a parameter selection component for additional data filtering (not fully implemented).
 * @component
 * 
 * @returns {JSX.Element} The rendered component.
 */

import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';
import ParameterSelection from './ParamSelect_Comp';
import '../css/Visuals.css';
import 'react-calendar/dist/Calendar.css';
import DateSearchBar from './DateSearch_Comp';
import '../css/DateSearch.css';
import '../css/global.css';

function Visuals_Comp() {

    //state variables
    const [chosenParams, setChosenParams] = useState(null); //the selected parameters
    const [loading, setLoading] = useState(true); //loading state
    const [error, setError] = useState(null); //error state
    const [showActual, setShowActual] = useState(true); //to show/hide actual data
    const [showPredicted, setShowPredicted] = useState(true); //to show/hide predicted data
    const [showMaxTempComparisonPlot, setShowMaxTempComparisonPlot] = useState(true); //to show/hide max temperature comparison plot
    const [showMinTempComparisonPlot, setShowMinTempComparisonPlot] = useState(true); //to show/hide min temperature comparison plot
    const [showPrecipitationPlot, setShowPrecipitationPlot] = useState(true); //to show/hide precipitation plot
    const [selectedCities, setSelectedCities] = useState([]); //the selected cities
    const [dateRange, setDateRange] = useState([null, null]); //the selected date range
    const [cityData, setCityData] = useState({}); //the weather data for the selected cities

    //gets the weather data from the backend initially
    useEffect(() => {
        const fetchData = async () => {
            try {
                //fetch the data from the API
                const dataResponse = await fetch('http://localhost:8000/api/ml_data/pred/');
                
                //check if the response is ok
                if (!dataResponse.ok) {
                    throw new Error(`HTTP error! status: ${dataResponse.status}`);
                }
                
                //parse the response as JSON
                const dataJson = await dataResponse.json();
                
                //if the response is an error
                if (dataJson.status === 'error') {
                    throw new Error(dataJson.message || 'Error from server');
                }
                
                //if the response is empty
                if (!dataJson.stations || Object.keys(dataJson.stations).length === 0) {
                    throw new Error('No weather station data available');
                }

                // Process the data directly from the API response
                const processedData = {};

                //iterate through the stations from the API response
                Object.entries(dataJson.stations).forEach(([stationName, stationData]) => {
                    //check if the station data is an array
                    if (!Array.isArray(stationData)) {
                        return;
                    }

                    // Match station name to city
                    let city = null;
                    if (stationName.includes('ASHEVILLE')) {
                        city = 'ASHEVILLE';
                    } else if (stationName.includes('CHARLOTTE')) {
                        city = 'CHARLOTTE';
                    } else if (stationName.includes('RALEIGH')) {
                        city = 'RALEIGH';
                    } else if (stationName.includes('WILMINGTON')) {
                        city = 'WILMINGTON';
                    }

                    //if a city is found
                    if (city) {

                        //if the city is not already in the processed data, add it
                        if (!processedData[city]) {
                            processedData[city] = [];
                        }

                        //add the station data to the processed data for the city
                        processedData[city].push(...stationData);
                    }
                });

                //store the processed data for the cities
                setCityData(processedData);

                //set the selected cities to the keys of the processed data
                setSelectedCities(Object.keys(processedData));
                setLoading(false);
            } catch (error) {
                setError(`Error: ${error.message}. Please make sure the backend server is running and has data.`);    
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    //function to filter the data by date range
    const filterDataByDate = (dates) => {
        //if the date range is not set or is invalid
        if (!dateRange || !Array.isArray(dateRange) || !dateRange[0] || !dateRange[1]) {
            //return all indices
            return dates.map((_, index) => index);
        }
        
        //if the date range is set, get the start and end dates
        const [startDate, endDate] = dateRange;

        //for each date in the dates array, check if it is within the date range
        return dates.map((date, index) => {
            
            //convert to Unix timestamp for comparison
            const dateTime = date.getTime();

            //if the date is within the range, return the index
            return dateTime >= startDate.getTime() && dateTime <= endDate.getTime() ? index : null;

        //keeps only the indices that are not null
        }).filter(index => index !== null);
    };

    //function to validate and convert a value
    const validateAndConvertValue = (value) => {
        //if the value is null or NaN
        if (!value || isNaN(parseFloat(value))){
            return null;
        }

        //else return the value as a float
        return parseFloat(value);
    };

    //if the data is still loading or there is an error, show a loading message or an error message
    if (loading) return <div className="loading">Loading weather data...</div>;
    if (error) return <div className="error">{error}</div>;

    //helper function to prepare the plots
    const preparePlot = ({
        title,
        yAxisLabel,
        dataA,
        dataB,
        dataALabel,
        dataBLabel,
        fill = false,
        markerStyle = {},
        lineStyle = {},
        mode = 'markers',
    }) => {
        //if there is no data or no selected cities
        if (!cityData || selectedCities.length === 0) {
            return null;
        }
        
        //map through the selected cities and create the traces for the plot
        const traces = selectedCities.map((city) => {
            
            //get the data for the city
            const cityStationData = cityData[city];

            //convert the date strings to Date objects
            const dates = cityStationData.map((item) => new Date(item.date));

            //get the indices of the dates that are within the date range
            const filteredIndices = filterDataByDate(dates);

            //get the filtered dates using the filtered indices
            const filteredDates = filteredIndices.map((i) => dates[i]);
            
            //for this city, get the values for dataA and dataB (i.e actual and predicted values)
            const aValues = filteredIndices.map((i) =>
                validateAndConvertValue(cityStationData[i][dataA])
            );
            const bValues = filteredIndices.map((i) =>
                validateAndConvertValue(cityStationData[i][dataB])
            );
            
            //return the traces for the plot
            return [
                {
                    name: `${city} - ${dataALabel}`,
                    x: filteredDates,
                    y: aValues,
                    type: 'scatter',
                    mode,
                    marker: mode.includes('markers') ? { color: getColorForCity(city), ...markerStyle.A } : undefined,
                    line: mode.includes('lines') ? { color: getColorForCity(city), ...lineStyle.A } : undefined,
                    fill: fill ? 'tozeroy' : undefined,
                    hovertemplate: '%{y:.1f}',
                },
                {
                    name: `${city} - ${dataBLabel}`,
                    x: filteredDates,
                    y: bValues,
                    type: 'scatter',
                    mode,
                    marker: mode.includes('markers') ? { color: getColorForCity(city, true), ...markerStyle.B } : undefined,
                    line: mode.includes('lines') ? { color: getColorForCity(city, true), ...lineStyle.B } : undefined,
                    fill: fill ? 'tozeroy' : undefined,
                    hovertemplate: '%{y:.1f}',
                },
            ];
        }).flat();
        
        //return the plot data and layout
        return {
            data: traces,
            layout: {
                title,
                xaxis: { title: 'Date', type: 'date' },
                yaxis: { title: yAxisLabel },
                height: '80%',
                width: '100%',
                showlegend: true,
                hovermode: 'x unified',
                paper_bgcolor: '#bdbdbd',
                plot_bgcolor: '#bdbdbd',
                font: { color: '#000000' },
                autosize: true,
                margin: { l: 30, r: 10, t: 50, b: 50 },
            },
        };
    };

    //function to prepare the actual data plot for temperature max and min
    const prepActualPlot = () =>
        preparePlot({
            title: 'Actual Weather Data By City',
            yAxisLabel: 'Temperature (F)',
            dataA: 'actual_temp_max',
            dataB: 'actual_temp_min',
            dataALabel: 'Max',
            dataBLabel: 'Min',
            markerStyle: { 
                A: {size:8},
                B: {size:8},
            },
        });
    
    //function to prepare the predicted data plot for temperature max and min
    const prepPredPlot = () =>
        preparePlot({
            title: 'Predicted Weather Data By City',
            yAxisLabel: 'Temperature (F)',
            dataA: 'predicted_temp_max',
            dataB: 'predicted_temp_min',
            dataALabel: 'Max',
            dataBLabel: 'Min',
            markerStyle: { 
                A: {size:8},
                B: {size:8},
            },
        });
    
    //function to get the color for the city
    //used for coloring the lines in the plot
    const getColorForCity = (city, isMinTemp = false) => {
        const colors = {
            'ASHEVILLE': isMinTemp ? '#ff9999' : '#ff0000',
            'CHARLOTTE': isMinTemp ? '#9999ff' : '#0000ff',
            'RALEIGH': isMinTemp ? '#99ff99' : '#00ff00',
            'WILMINGTON': isMinTemp ? '#ffff99' : '#ffff00'
        };
        return colors[city] || '#888888';
    };
    
    //function to prepare the actual vs predicted max temperature comparison plot
    const prepMaxTempComparisonPlot = () => 
        preparePlot({
            title: 'Max Temperature Comparison',
            yAxisLabel: 'Max Temperature (F)',
            dataA: 'actual_temp_max',
            dataB: 'predicted_temp_max',
            dataALabel: 'Actual Max Temp',
            dataBLabel: 'Predicted Max Temp',
            mode: 'markers',
            lineStyle: {
                A: {dash: 'solid'},
                B: {dash: 'dot'},
            },
        });

    //function to prepare the actual vs predicted min temperature comparison plot
    const prepMinTempComparisonPlot = () =>
        preparePlot({
            title: 'Min Temperature Comparison',
            yAxisLabel: 'Min Temperature (F)',
            dataA: 'actual_temp_min',
            dataB: 'predicted_temp_min',
            dataALabel: 'Actual Min Temp',
            dataBLabel: 'Predicted Min Temp',
            mode: 'markers',
            lineStyle: {
                A: {dash: 'solid'},
                B: {dash: 'dot'},
            },
        });
    
    //function to prepare the actual vs predicted precipitation comparison plot
    const prepPrecipitationPlot = () =>
        preparePlot({
            title: 'Precipitation Comparison',
            yAxisLabel: 'Precipitation (inches)',
            dataA: 'actual_precip',
            dataB: 'predicted_precip',
            dataALabel: 'Actual Precipitation',
            dataBLabel: 'Predicted Precipitation',
            mode: 'markers',
            markerStyle: {
                A: {size: 8},
                B: {size: 8},
            },
        });

    //functions to prepare the plots
    const actualPlot = prepActualPlot();
    const predPlot = prepPredPlot();
    const maxTempComparisonPlot = prepMaxTempComparisonPlot();
    const minTempComparisonPlot = prepMinTempComparisonPlot();
    const precipitationPlot = prepPrecipitationPlot();

    //wrapper function to handle errors in rendering the plots and 
    //fit the plots to the container size
    const PlotWithErrorBoundary = ({ data, layout }) => {
        try {
            return (
                <Plot
                    data={data}
                    layout={{ ...layout, width: undefined, autosize: true }}
                    config={{ responsive: true }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '91%' }}
                />
            );
        } catch (error) {
            return <div>Error rendering plot: {error.message}</div>;
        }
    };

    return (
        <div className="visuals-wrapper">
            <div className="visuals-section">
                <div className="visuals-header">
                    <h1>Weather Data Visualization</h1>
                    <p className="subtitle">Select a date range to view weather information</p>
                </div>
                <div className="date-range-info">
                    <h2>Available Data Range</h2>
                    <div className="range-details">
                        <p>Start Date: January 1, 2020</p>
                        <p>End Date: December 31, 2024</p>
                    </div>
                </div>
                
                <div className="calendar-container">
                    <DateSearchBar
                        onRangeSelect={(start, end) => setDateRange([start, end])}
                        disableSingleDate={true}
                    />
                </div>

                <div className="controls-container">
                    <div className='toggle-buttons'>
                        <button 
                            className={`toggle-button ${showActual ? 'active' : ''}`}
                            onClick={() => setShowActual(!showActual)}
                        >
                            {showActual ? 'Hide' : 'Show'} Actual Data
                        </button>
                        <button 
                            className={`toggle-button ${showPredicted ? 'active' : ''}`}
                            onClick={() => setShowPredicted(!showPredicted)}
                        >
                            {showPredicted ? 'Hide' : 'Show'} Predicted Data
                        </button>
                        <button 
                            className={`toggle-button ${showMaxTempComparisonPlot ? 'active' : ''}`}
                            onClick={() => setShowMaxTempComparisonPlot(!showMaxTempComparisonPlot)}
                        >
                            {showMaxTempComparisonPlot ? 'Hide' : 'Show'} Max Temperature Comparison
                        </button>
                        <button 
                            className={`toggle-button ${showMinTempComparisonPlot ? 'active' : ''}`}
                            onClick={() => setShowMinTempComparisonPlot(!showMinTempComparisonPlot)}
                        >
                            {showMinTempComparisonPlot ? 'Hide' : 'Show'} Min Temperature Comparison
                        </button>
                        <button 
                            className={`toggle-button ${showPrecipitationPlot ? 'active' : ''}`}
                            onClick={() => setShowPrecipitationPlot(!showPrecipitationPlot)}
                        >
                            {showPrecipitationPlot ? 'Hide' : 'Show'} Precipitation
                        </button>
                    </div>
                    <div className='station-selector'>
                        <div className="city-checkboxes">
                            {Object.keys(cityData).map(city => (
                                <label key={city} className="city-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedCities.includes(city)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCities([...selectedCities, city]);
                                            } else {
                                                setSelectedCities(selectedCities.filter(c => c !== city));
                                            }
                                        }}
                                    />
                                    <span style={{ color: getColorForCity(city) }}>{city}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="param-selection">
                        <ParameterSelection onSubmit={setChosenParams} />
                    </div>
                </div>
            </div>

            <div className="plots-grid">
                {showActual && actualPlot && (
                    <div className='plot-container'>
                        <h3>Actual Weather Data</h3>
                        <PlotWithErrorBoundary data={actualPlot.data} layout={actualPlot.layout} />
                    </div>
                )}
                
                {showPredicted && predPlot && (
                    <div className='plot-container'>
                        <h3>Predicted Weather Data</h3>
                        <PlotWithErrorBoundary data={predPlot.data} layout={predPlot.layout} />
                    </div>
                )}

                {showMaxTempComparisonPlot && maxTempComparisonPlot && (
                    <div className='plot-container'>
                        <h3>Max Temperature Comparison</h3>
                        <PlotWithErrorBoundary data={maxTempComparisonPlot.data} layout={maxTempComparisonPlot.layout} />
                    </div>
                )}

                {showMinTempComparisonPlot && minTempComparisonPlot && (
                    <div className='plot-container'>
                        <h3>Min Temperature Comparison</h3>
                        <PlotWithErrorBoundary data={minTempComparisonPlot.data} layout={minTempComparisonPlot.layout} />
                    </div>
                )}

                {showPrecipitationPlot && precipitationPlot && (
                    <div className='plot-container'>
                        <h3>Precipitation Comparison</h3>
                        <PlotWithErrorBoundary data={precipitationPlot.data} layout={precipitationPlot.layout} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Visuals_Comp;

