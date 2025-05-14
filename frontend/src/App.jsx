/**
 * Root application component that handles routing and layout.
 * This component serves as the main container for the application and is responsible for:
 * - Managing the global date state used across components
 * - Setting up the main routing configuration
 * - Providing the basic layout structure with navigation and content areas
 * 
 * Routes:
 * - /calendar : Calendar view for historical weather data and view map
 * - /visuals : Visualizations view for weather data
 * 
 * State:
 * - selectedDate: Current selected date in YYYY-MM-DD format
 * 
 * @component
 * @returns {JSX.Element} The main application structure with routing and navigation
 */
import './css/App.css'
import {Routes, Route, Navigate} from 'react-router-dom';
import { useState } from 'react';
import NavBar from './components/NavBar_Comp';
import Calendar from './components/RawData_Comp';
import DataBreakDown from './pages/DataBreakDown_Page';
import CityBreakdown from './components/CityBreakdown_Comp';
import Visuals from './pages/Visuals_Page';

function App() {
  // State for tracking the currently selected date across components
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  /**
   * Handles date selection events from child components
   * Converts the date to YYYY-MM-DD format for consistency
   * @param {Date} date - The newly selected date
   */
  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
  };

  return (
    <>  
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/historical-data" replace />} />
            <Route 
              path="/historical-data" 
              element={<Calendar onDateSelect={handleDateSelect} />} 
            />
            <Route 
              path="/visuals" 
              element={<Visuals />} 
            />
            <Route 
              path="/historical-data/:city" 
              element={<CityBreakdown />} 
            />
            <Route 
              path="/data-breakdown" 
              element={<DataBreakDown />} 
            />
          </Routes>
        </main>
    </>
  )
}

export default App
