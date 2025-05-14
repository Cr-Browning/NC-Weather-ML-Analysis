/**
 * Home page component serving as the visuals page
 * @component
 * @returns {JSX.Element} The visuals page of the application
 */
import React from 'react';
import CityBreakdown_Comp from '../components/CityBreakdown_Comp';
import RawData_Comp from '../components/RawData_Comp';
import DateSearch_Comp from '../components/DateSearch_Comp';
import Map_Comp from '../components/Map_Comp';
import '../css/Calendar.css';
import '../css/DateSearch.css';
import '../css/Map.css';

function DataBreakDown() {
    return (
        <div className="DataBreakDown">
            <h2>Weather Data Breakdown</h2>
            <CityBreakdown_Comp />
            <RawData_Comp />
            <DateSearch_Comp />
            <Map_Comp />
        </div>
    );
}

export default DataBreakDown;