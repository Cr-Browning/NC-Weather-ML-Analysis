import React, {useState} from 'react';

/**
 * Component for selecting parameters for machine learning model training
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Callback function to handle form submission
 * @returns {JSX.Element} A form with checkboxes for selecting parameters
 */
function ParameterSelection({onSubmit}) {
    
    //state for managing the chosen parameters
    const [chosenParams, setChosenParams] = useState({
        date: false,
        location: false,
        season: false,
        tmax: false,
        tmin: false,
        precip: false,
        snow: false,
    });

    //handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(chosenParams);
    }

    //rendering the form with checkboxes for each parameter
    return (
        <div className="param-selection-container">
            <h2>Select Parameters</h2>
            <div className="param-checkboxes">
                <label className="param-checkbox">
                    <input type="checkbox" checked={chosenParams.date} onChange={() => 
                        setChosenParams({...chosenParams, date: !chosenParams.date})} />
                    <span>Date</span>
                </label>
                <label className="param-checkbox">
                    <input type="checkbox" checked={chosenParams.location} onChange={() => 
                        setChosenParams({...chosenParams, location: !chosenParams.location})} />
                    <span>Location</span>
                </label>
                <label className="param-checkbox">
                    <input type="checkbox" checked={chosenParams.season} onChange={() => 
                        setChosenParams({...chosenParams, season: !chosenParams.season})} />
                    <span>Season</span>
                </label>
                <label className="param-checkbox">
                    <input type="checkbox" checked={chosenParams.tmax} onChange={() => 
                        setChosenParams({...chosenParams, tmax: !chosenParams.tmax})} />
                    <span>TMAX</span>
                </label>
                <label className="param-checkbox">
                    <input type="checkbox" checked={chosenParams.tmin} onChange={() => 
                        setChosenParams({...chosenParams, tmin: !chosenParams.tmin})} />
                    <span>TMIN</span>
                </label>
                <label className="param-checkbox">
                    <input type="checkbox" checked={chosenParams.precip} onChange={() => 
                        setChosenParams({...chosenParams, precip: !chosenParams.precip})} />
                    <span>Precipitation</span>
                </label>
                <label className="param-checkbox">
                    <input type="checkbox" checked={chosenParams.snow} onChange={() => 
                        setChosenParams({...chosenParams, snow: !chosenParams.snow})} />
                    <span>Snow</span>
                </label>
            </div>
            <button type="submit" className="param-submit-button" onClick={handleSubmit}>Submit</button>
        </div>
    )
}

export default ParameterSelection;
