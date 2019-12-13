from django.urls import path
from core.views import *

urlpatterns = [
 path("data/", data),
 path("", home)
]