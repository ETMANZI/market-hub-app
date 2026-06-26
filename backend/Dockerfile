FROM node:20-slim AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

RUN mkdir -p /app/templates
RUN mkdir -p /app/static/frontend/assets

COPY --from=frontend-builder /frontend/dist/index.html /app/templates/index.html
COPY --from=frontend-builder /frontend/dist/assets /app/static/frontend/assets

RUN python manage.py collectstatic --noinput

CMD ["sh", "-c", "gunicorn config.wsgi:application --bind 0.0.0.0:${PORT}"]