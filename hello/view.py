"""
Module providing function for Client Libraries for Google Map Serivce
"""

import googlemaps
import geopandas as gpd
import pandas as pd
from django.shortcuts import render
from django.conf import settings


def index(request):
    """
    Redirect to Reverse Geocoding Form Fields
    """

    return render(request, 'hello/index.html')


def reverse_geo_shp(lat, lng, language='en'):
    """
    Reverse Geocode from the ODC SHPFile
    """

    boundaries = gpd.read_file('hello/shp/com_dis_pro.shp')

    geocode = {
        'lat': lat,
        'lng': lng,
    }

    df = pd.DataFrame(data=geocode, index=[0])
    geometry = gpd.points_from_xy(df['lng'], df['lat'])
    location = gpd.GeoDataFrame(geometry=geometry)

    address = location.sjoin(boundaries, how='inner', predicate='intersects')

    if not address.empty:
        output = {
            'commune': address.iloc[0]['COM_NAME'],
            'district': address.iloc[0]['District_H'],
            'province': address.iloc[0]['Province_H'],
        }
    else:
        output = False

    return output


def reverse_geo_google_map_api(lat, lng, language):
    """
    Reverse Geocode from the Google Map API
    """

    gmaps = googlemaps.Client(key=settings.GOOGLE_API_KEY)
    locations = gmaps.reverse_geocode((lat, lng), language=language)
    address_components = locations[0]['address_components']
    commune = [x['long_name']
               for x in address_components for y in x['types'] if y == 'locality']
    district = [x['long_name']
                for x in address_components for y in x['types'] if y == 'administrative_area_level_2']
    province = [x['long_name']
                for x in address_components for y in x['types'] if y == 'administrative_area_level_1']

    output = {
        'commune': commune[0],
        'district': district[0],
        'province': province[0],
    }

    return output


def search(request):
    """
    Convert GeoPoint to GeoCode
    """

    provinces = [
        'Oddar Meanchey',
        'Battambang',
        'Tbaung Kmum',
        'Koh Kong',
        'Preah Vihear',
        'Pailin',
        'Ratanakiri',
        'Prey Veng',
        'Mondul Kiri',
        'Kampong Cham',
        'Takeo',
    ]

    language = request.GET.get('language')
    lat = request.GET.get('lat')
    lng = request.GET.get('lng')

    reverse_geo = reverse_geo_shp(lat, lng, language)

    if reverse_geo:
        if reverse_geo['province'] not in provinces:
            output = reverse_geo_google_map_api(lat, lng, language)
    else:
        output = reverse_geo

    return render(request, 'hello/result.html', {'result': output})
