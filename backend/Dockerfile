FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    build-essential python3-dev default-libmysqlclient-dev \
    pkg-config

WORKDIR /app

COPY backend .

RUN pip install --no-cache-dir -r requirements.txt


EXPOSE 8569

CMD []
