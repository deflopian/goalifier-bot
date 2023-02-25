#!/bin/sh
until nc -z -v -w30 ${MONGO_HOST} ${MONGO_PORT}
do
  echo "Waiting for db connection..."
  sleep 5
done

npm run start
