import os

DEBUG = True

if DEBUG:
    from .secrets import SECRET_KEY
else:
    SECRET_KEY = os.environ["SECRETKEY"]

ALLOWED_HOSTS = ["*"]

ROOT_URLCONF = "core.urls"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INSTALLED_APPS = [
 "django.contrib.contenttypes",
 "django.contrib.staticfiles",
 "sass_processor",
 "core"
]

DATE_FORMAT = "D j M, Y"
USE_TZ = True
TIME_ZONE = "UTC"

MIDDLEWARE = [
 "django.middleware.common.CommonMiddleware",
]

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")
SASS_PROCESSOR_ROOT = os.path.abspath(os.path.join(BASE_DIR, "core", "static"))

TEMPLATES = [{
 "BACKEND": "django.template.backends.django.DjangoTemplates",
 "APP_DIRS": True,
 "OPTIONS": {
  "context_processors": [
   "django.template.context_processors.request",
  ],
 },
}]
