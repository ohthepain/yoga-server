#!/bin/bash

# This script stops, removes containers, removes images, and prunes dangling images
# related to the 'yoga-server' Docker image.

# Continue executing commands even if one fails
set +e

# Stop all running containers based on the 'yoga-server' image
echo "Stopping all running containers based on the 'yoga-server' image..."
docker stop $(docker ps -q --filter 'ancestor=yoga-server')

# Remove all containers based on the 'yoga-server' image
echo "Removing all containers based on the 'yoga-server' image..."
docker rm $(docker ps -a -q --filter 'ancestor=yoga-server')

# Force remove all images named 'yoga-server'
echo "Removing all images named 'yoga-server'..."
docker rmi -f $(docker images 'yoga-server' -q)

# Prune all dangling images
echo "Pruning all dangling images..."
docker image prune -f

echo "Operations completed."
