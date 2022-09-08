from django.urls import path

from . import views

APP_NAME = 'hello'

urlpatterns = [
    path('', views.index, name='index'),
    path('search/', views.search, name='search'),
]
