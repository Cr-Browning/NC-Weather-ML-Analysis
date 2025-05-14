"""
@authors: Cade Browning, Luke Howell
@date: May 2025
@description:
    URL configuration for the NCWeather project.

    This module defines the URL patterns for the entire Django project, including:
    - Admin interface URLs
    - Weather application API endpoints
    - Frontend static file serving in development
    - Frontend template serving

    The URL patterns are organized to handle both the backend API and frontend
    application, with special handling for development mode to serve the frontend
    application.
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

# Main URL patterns for the application
urlpatterns = [
    # Django admin interface
    path('admin/', admin.site.urls),
    # Include all URLs from the weather application
    path('', include('backend.apps.weather.urls')),
]

# Development-specific URL patterns
# These patterns are only active when DEBUG is True
if settings.DEBUG:
    # Serve static files (CSS, JavaScript, images) in development
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # Serve the frontend application's index.html
    urlpatterns += [
        path('', TemplateView.as_view(template_name='index.html')),
    ] 