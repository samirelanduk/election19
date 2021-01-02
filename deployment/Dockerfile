FROM python:3.9.1-buster

RUN mkdir -p /home/app

WORKDIR /home/app

COPY ./ ./

RUN rm core/secrets.py

RUN sed -i s/'DEBUG = True'/'DEBUG = False'/g core/settings.py

RUN pip install --upgrade pip

RUN pip install gunicorn
RUN pip install libsass
RUN pip install django-sass-processor
RUN pip install rjsmin
RUN pip install rcssmin

RUN pip install -r requirements.txt

ARG SECRETKEY=12345

RUN python manage.py collectstatic --noinput

EXPOSE 80

CMD ["gunicorn", "--bind", ":80", "--workers", "3", "core.wsgi:application"]