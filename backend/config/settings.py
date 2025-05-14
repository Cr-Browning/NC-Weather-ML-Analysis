"""
@authors: Cade Browning, Luke Howell
@date: May 2025
@description:
    Django settings for the NCWeather project.

    This module contains all the configuration settings for the Django project,
    including database settings, security configurations, installed applications,
    middleware, and static file handling. It also includes environment-specific
    settings for development and production.
"""

import os
import dotenv
from pathlib import Path

# Load environment variables from .env file
dotenv.load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret
SECRET_KEY = os.getenv("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production
DEBUG = True

# List of host/domain names that this Django site can serve
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Cross-Origin Resource Sharing (CORS) settings
# These settings allow the frontend to make requests to the backend
CORS_ALLOW_ALL_ORIGINS = True  # Only for development
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite development server
    "http://127.0.0.1:5173",
]

# Application definition
# List of all Django applications that are enabled in this Django instance
INSTALLED_APPS = [
    'django.contrib.admin',          # Admin interface
    'django.contrib.auth',           # Authentication system
    'django.contrib.contenttypes',   # Content type system
    'django.contrib.sessions',       # Session framework
    'django.contrib.messages',       # Message framework
    'django.contrib.staticfiles',    # Static file handling
    'rest_framework',                # Django REST framework
    'corsheaders',                   # CORS handling
    'backend.apps.weather',          # Weather prediction application
]

# Middleware configuration
# List of middleware classes to be applied to requests/responses
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# URL configuration
ROOT_URLCONF = 'backend.config.urls'

# Template configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI application configuration
WSGI_APPLICATION = 'backend.config.wsgi.application'

# Database configuration
# Uses PostgreSQL with credentials from environment variables
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv("DB_NAME"),
        'USER': os.getenv("DB_USER"),
        'PASSWORD': os.getenv("DB_PASSWORD"),
        'HOST': os.getenv("DB_HOST"),
        'PORT': os.getenv("DB_PORT"),
    }
}

# Password validation
# AUTH_PASSWORD_VALIDATORS is a list of validators that are used to check
# the strength of user's passwords
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# These settings are used for all translation-related activities
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# Configuration for serving static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Frontend build directory
# Points to the Vite-built frontend files
FRONTEND_DIR = BASE_DIR / 'frontend'
STATICFILES_DIRS = [
    FRONTEND_DIR / 'dist',
]

# Default primary key field type
# Specifies the type of auto-created primary key fields
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField' 