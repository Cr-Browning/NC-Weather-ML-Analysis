# NOAA Data Analysis Platform
## Authors

- Cade Browning
- Luke Howell

A full-stack web application for analyzing and visualizing NOAA (National Oceanic and Atmospheric Administration) data. This platform combines modern web technologies with data science capabilities to provide an interactive and insightful experience for users.

## Features

- Interactive data visualization using Plotly.js
- Geographic data display with Mapbox GL
- Advanced data analysis capabilities using TensorFlow and scikit-learn
- Responsive and modern React-based user interface
- RESTful API backend with Django
- Date-based data filtering and analysis

## Tech Stack

### Frontend
- React 18
- Vite
- Mapbox GL for mapping
- Plotly.js for data visualization
- React Router for navigation
- React Calendar for date selection

### Backend
- Django 4.2+
- Django REST Framework
- PostgreSQL database
- TensorFlow for machine learning
- scikit-learn for data analysis
- pandas and numpy for data manipulation
- matplotlib and seaborn for data visualization

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL
- Mapbox API key

### Backend Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
    DB_HOST=
    DB_NAME=
    DB_USER=
    DB_PASSWORD=
    DB_PORT= 
    SECRET_KEY= This is a secret key for the Django Project.
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with:
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_token
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- Backend API runs on `http://localhost:8000`
- Frontend development server runs on `http://localhost:5173`
- Use `npm run build` to create production build
- Use `python manage.py test` to run backend tests
