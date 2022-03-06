FROM python:3.7-slim-buster

WORKDIR /app

RUN apt-get update && apt-get install -y fluidsynth \
                                            gcc \
                                            build-essential \
                                            libasound2-dev \
                                            libjack-dev

COPY flask-app/requirements.txt .

RUN mkdir uploads && mkdir generation && pip install --no-cache-dir -r requirements.txt

COPY flask-app .

EXPOSE 5000

CMD [ "python3", "app.py"]