/**
 * Home page component serving as the visuals page
 * @component
 * @returns {JSX.Element} The visuals page of the application
 */
import React from 'react';
import Visuals_Comp from '../components/Visuals_Comp';
import '../css/Visuals.css';

function Visuals() {
    return (
        <div className="Visuals">
            <Visuals_Comp />
        </div>
    );
}

export default Visuals;