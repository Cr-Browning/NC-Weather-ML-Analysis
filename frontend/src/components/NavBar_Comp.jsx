/**
 * Navigation bar component providing main application routing
 * @component
 * @returns {JSX.Element} A navigation bar with links to different pages
 */
import { Link } from 'react-router-dom';
import '../css/NavBar.css';

function NavBar() {
    return (
        <nav className = "navbar">
            <div className ="navbar-links">  
                <Link to="/historical-data" className = "nav-link">Raw Weather Data</Link>
                <Link to="/visuals" className = "nav-link">Weather Visualizations</Link>
            </div>
        </nav>
    )
}

export default NavBar;
