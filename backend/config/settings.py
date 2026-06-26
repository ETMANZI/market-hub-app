import os
import sys
import re
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent



IS_RUNSERVER = 'runserver' in sys.argv

if IS_RUNSERVER:
    os.environ['DEBUG'] = 'True'
    DEBUG = True
    ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']
    CSRF_TRUSTED_ORIGINS = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
    ]
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    
   
else:
    # Production settings
    DEBUG = os.environ.get("DEBUG", "False").lower() == "true"
    ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")
    ALLOWED_HOSTS = [h.strip() for h in ALLOWED_HOSTS if h.strip()]
    
    if not ALLOWED_HOSTS:
        ALLOWED_HOSTS = ['.herokuapp.com', 'isokoryawe.herokuapp.com', 'isokorya.rw', 'www.isokorya.rw']
    
    CSRF_TRUSTED_ORIGINS = os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",")
    CSRF_TRUSTED_ORIGINS = [h.strip() for h in CSRF_TRUSTED_ORIGINS if h.strip()]
    
    if not CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS = [
            'https://*.herokuapp.com',
            'https://isokoryawe.herokuapp.com',
            'https://isokoryawe.rw',
            'https://www.isokoryawe.rw',
            'http://isokoryawe.rw',
            'http://www.isokorya.rw',
        ]
    
    SECRET_KEY = os.environ.get("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable must be set in production!")



INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "django_filters",
    "drf_spectacular",
    "apps.listings.apps.ListingsConfig",
    "apps.common.apps.CommonConfig",
    "apps.accounts.apps.AccountsConfig",
    "apps.payments.apps.PaymentsConfig",
    "apps.moderation.apps.ModerationConfig",
    "apps.subscriptions.apps.SubscriptionsConfig",
    "apps.notifications.apps.NotificationsConfig",
    "apps.chatbot.apps.ChatbotConfig",
    'cloudinary',
    'cloudinary_storage',
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

GEOIP_PATH = BASE_DIR / "geoip"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]



def parse_database_url(db_url):
    """Parse database URL manually without dj-database-url"""
    if not db_url:
        return None
    
    # PostgreSQL: postgresql://user:password@host:port/dbname
    if db_url.startswith('postgresql://'):
        match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', db_url)
        if match:
            user, password, host, port, dbname = match.groups()
            return {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': dbname,
                'USER': user,
                'PASSWORD': password,
                'HOST': host,
                'PORT': port,
            }
    
    # SQLite: sqlite:///path/to/db.sqlite3
    if db_url.startswith('sqlite:///'):
        path = db_url.replace('sqlite:///', '')
        return {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': path,
        }
    
    return None

# Configure database
db_url = os.environ.get("DATABASE_URL")
db_config = parse_database_url(db_url) if db_url else None

if db_config:
    DATABASES = {'default': db_config}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_USER_MODEL = "accounts.User"



REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}



LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Kigali"
USE_I18N = True
USE_TZ = True



STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_DIRS = []
if (BASE_DIR / "static").exists():
    STATICFILES_DIRS = [BASE_DIR / "static"]

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
os.makedirs(MEDIA_ROOT, exist_ok=True)


USE_CLOUDINARY = (
    os.environ.get('CLOUDINARY_CLOUD_NAME') and
    os.environ.get('CLOUDINARY_API_KEY') and
    os.environ.get('CLOUDINARY_API_SECRET')
)

if USE_CLOUDINARY and not IS_RUNSERVER:
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api
    
    cloudinary.config(
        cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
        api_key=os.environ.get('CLOUDINARY_API_KEY'),
        api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
        secure=True
    )
    
    # Use STORAGES (Django 4.2+)
    STORAGES = {
        "default": {
            "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }
else:
    # Use local file storage for development
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }



DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"



CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
]

if not IS_RUNSERVER:
    CORS_ALLOWED_ORIGINS.extend([
        "https://*.railway.app",
        "https://isokoryawe.rw",
        "https://www.isokoryawe.rw",
    ])

FRONTEND_URL = os.environ.get("FRONTEND_URL", "")
if FRONTEND_URL and FRONTEND_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]



if IS_RUNSERVER:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    EMAIL_BACKEND = os.environ.get("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
    EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT = int(os.environ.get("EMAIL_PORT", 587))
    EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True").lower() == "true"
    EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
    DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@markethub.com")



AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]



if not IS_RUNSERVER and not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    X_FRAME_OPTIONS = "DENY"
else:
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SECURE_HSTS_SECONDS = 0



DATA_UPLOAD_MAX_MEMORY_SIZE = 110 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 110 * 1024 * 1024
DATA_UPLOAD_MAX_NUMBER_FIELDS = 2000



if IS_RUNSERVER:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
            },
        },
        'root': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'loggers': {
            'django': {
                'handlers': ['console'],
                'level': 'INFO',
                'propagate': True,
            },
        },
    }