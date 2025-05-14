/**
 * DateSearchBar component provides a date picker interface for selecting single dates or date ranges
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onDateSelect - Callback for single date selection
 * @param {Function} props.onRangeSelect - Callback for date range selection
 * @param {boolean} [props.disableSingleDate=false] - Whether to disable single date mode
 * @returns {JSX.Element} A date picker component with support for single date and range selection
 */
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../css/DateSearch.css';

function DateSearchBar({ onDateSelect, onRangeSelect, disableSingleDate = false }) {
    //state for ranged mode,start in range mode if single date is disabled
    const [isRangeMode, setIsRangeMode] = useState(disableSingleDate);
    const [selectedDate, setSelectedDate] = useState(null); //state for selected date
    const [dateRange, setDateRange] = useState([null, null]); //state for date range
    const [startDate, endDate] = dateRange; //destructure the date range
    const [inputValue, setInputValue] = useState(''); //state for input value
    const [error, setError] = useState(''); //state for error

    //function to handle the mode toggle between single date and date range
    const handleModeToggle = () => {
        if (disableSingleDate) return;
        setIsRangeMode(!isRangeMode);
        setSelectedDate(null);
        setDateRange([null, null]);
        setInputValue('');
        setError('');
    };

    //function to handle single date change
    const handleSingleDateChange = (date) => {
        setSelectedDate(date);
        setInputValue(date ? date.toLocaleDateString('en-US') : '');
        setError('');
        onDateSelect(date);
    };

    //function to handle date range change
    const handleRangeChange = (dates) => {
        const [start, end] = dates;
        setDateRange([start, end]);
        setError('');
        
        //if both start and end dates are selected
        if (start && end) {
            //update input value based on selected range
            setInputValue(`${start.toLocaleDateString('en-US')} - ${end.toLocaleDateString('en-US')}`);
            onRangeSelect(start, end);
        } else {
            //while only start is selected, update input value
            setInputValue(start ? start.toLocaleDateString('en-US') : '');
        }
    };

    //function to handle input change
    const handleInputChange = (e) => {
        //update input value based on user input
        const value = e.target.value;
        setInputValue(value);
        
        //if there is no input, reset the selected date and date range
        if (!value) {
            setSelectedDate(null);
            setDateRange([null, null]);
            setError('');
            return;
        }

        //if the input is a date range
        if (isRangeMode) {
            //handle range input (e.g., "12/01/2023 - 12/31/2023")
            const dates = value.split('-').map(d => d.trim());
            if (dates.length !== 2) {
                setError('Please enter a valid date range (MM/DD/YYYY - MM/DD/YYYY)');
                return;
            }

            //parse the start and end dates
            const start = new Date(dates[0]);
            const end = new Date(dates[1]);

            //check if the parsed dates are valid
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                setError('Please enter valid dates (MM/DD/YYYY - MM/DD/YYYY)');
                return;
            }

            //set the min and max date range
            const minDate = new Date(2020, 0, 1);
            const maxDate = new Date(2024, 11, 31);
            
            //check if the date is with the valid range and the date range itself is valid
            if (start < minDate || end > maxDate || start > end) {
                setError('Dates must be between Jan 1, 2020 and Dec 31, 2024,' 
                    + 'and start date must be before end date');
                return;
            }

            //update the date range state
            setDateRange([start, end]);
            setError('');
            onRangeSelect(start, end);
        } else {
            //handle single date input
            const parsedDate = new Date(value);
            if (isNaN(parsedDate.getTime())) {
                setError('Please enter a valid date (MM/DD/YYYY)');
                return;
            }

            //check if date is within valid range
            const minDate = new Date(2020, 0, 1);
            const maxDate = new Date(2024, 11, 31);
            
            //check if the date is within the valid range
            if (parsedDate < minDate || parsedDate > maxDate) {
                setError('Date must be between Jan 1, 2020 and Dec 31, 2024');
                return;
            }

            //update the selected date state
            setSelectedDate(parsedDate);
            setError('');
            onDateSelect(parsedDate);
        }
    };

    return (
        <div className="date-search-container">
            {!disableSingleDate && (
                <div className="mode-toggle">
                    <button 
                        className={`toggle-btn ${!isRangeMode ? 'active' : ''}`}
                        onClick={() => !isRangeMode || handleModeToggle()}
                    >
                        Single Date
                    </button>
                    <button 
                        className={`toggle-btn ${isRangeMode ? 'active' : ''}`}
                        onClick={() => isRangeMode || handleModeToggle()}
                    >
                        Date Range
                    </button>
                </div>
            )}

            <div className="date-input-container">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={isRangeMode ? "Enter date range (MM/DD/YYYY - MM/DD/YYYY)" : "Enter date (MM/DD/YYYY)"}
                    className="date-input"
                />
                {error && <div className="date-error">{error}</div>}
            </div>

            <div className="calendar-display">
                {isRangeMode ? (
                    <DatePicker
                        selected={startDate}
                        onChange={handleRangeChange}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        inline
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        dateFormat="MM/dd/yyyy"
                        minDate={new Date(2020, 0, 1)}
                        maxDate={new Date(2024, 11, 31)}
                    />
                ) : (
                    <DatePicker
                        selected={selectedDate}
                        onChange={handleSingleDateChange}
                        inline
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        dateFormat="MM/dd/yyyy"
                        minDate={new Date(2020, 0, 1)}
                        maxDate={new Date(2024, 11, 31)}
                    />
                )}
            </div>
        </div>
    );
}

export default DateSearchBar;