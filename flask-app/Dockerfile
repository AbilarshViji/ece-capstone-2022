# FROM tensorflow/tensorflow:latest-gpu
FROM python:3.7

WORKDIR /app
COPY flask-app .
RUN pip3 install -r requirements.txt

RUN apt-get update && apt-get install -y fluidsynth

EXPOSE 5000

CMD [ "python3", "app.py"]