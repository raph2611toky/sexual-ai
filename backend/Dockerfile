FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    build-essential python3-dev default-libmysqlclient-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN ls

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings
ENV PORT=8569

RUN python manage.py collectstatic --noinput

RUN python manage.py makemigrations
RUN python manage.py migrate

EXPOSE 8569

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8569", "--workers", "3"]
