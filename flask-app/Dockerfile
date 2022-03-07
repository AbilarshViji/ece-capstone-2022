FROM python:3.7-slim-buster

WORKDIR /app

RUN apt-get update && apt-get install -y \
    fluidsynth \
    gcc \
    build-essential \
    libasound2-dev \
    libjack-dev \
    --no-install-recommends \
    && apt-get clean

COPY flask-app/requirements.txt requirements.txt

RUN mkdir uploads \
    && mkdir generation \
    && \
    pip install \
    --compile \
    --no-cache-dir \
    -r requirements.txt

COPY flask-app .

CMD [ "python3", "app.py"]