#!/bin/bash

# Check if an argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 {dev|prod}"
  exit 1
fi

# Set the compose file based on the argument
if [ "$1" == "dev" ]; then
  COMPOSE_FILE="docker-compose.dev.yml"
elif [ "$1" == "prod" ]; then
  COMPOSE_FILE="docker-compose.prod.yml"
else
  echo "Invalid argument. Use 'dev' or 'prod'."
  exit 1
fi

# Run the docker compose command
echo "Starting containers using $COMPOSE_FILE..."
docker compose -f $COMPOSE_FILE up --build -d
