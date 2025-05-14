"""
@authors: Cade Browning, Luke Howell
@date: May 2025
@description:
    WSGI configuration for the NCWeather project.

    This module contains the WSGI application configuration for the Django project.
    WSGI (Web Server Gateway Interface) is a specification that describes how a web
    server communicates with web applications in Python. This file is used by the
    production web server to serve the Django application.

    The WSGI application is created using Django's get_wsgi_application() function,
    which sets up the application with the project's settings module.
"""

import os

from django.core.wsgi import get_wsgi_application

# Set the default Django settings module for the WSGI application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.config.settings')

# Create the WSGI application instance
application = get_wsgi_application() 