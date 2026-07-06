#!/usr/bin/env bash

# This script creates a new DigitalOcean droplet.
#
# It assumes that the following environment variables are set:
#   - DROPLET_NAME: The name of the droplet to create.
#   - DROPLET_PROJECT_ID: The ID of the DigitalOcean project to create the
#     droplet in.
#   - DROPLET_VPC_UUID: The UUID of the VPC to create the droplet in.
#   - DROPLET_REGION: The region to create the droplet in.
#   - DROPLET_SIZE: The size of the droplet to create.
#   - DROPLET_SSH_KEY_ID: The ID of the SSH key to use for the droplet.
#   - USER_DATA_FILE: The path to the user data file to use for the droplet.
#
# It also assumes that the DigitalOcean CLI (doctl) is installed and configured
# with an API token.
#
# This script will print the droplet ID and public IPv4 address of the newly
# created droplet.

set -euo pipefail

DROPLET_ID=$(doctl compute droplet create "$DROPLET_NAME" \
    --image debian-13-x64 \
    --project-id "$DROPLET_PROJECT_ID" \
    --vpc-uuid "$DROPLET_VPC_UUID" \
    --region "$DROPLET_REGION" \
    --size "$DROPLET_SIZE" \
    --ssh-keys "$DROPLET_SSH_KEY_ID" \
    --user-data-file "$USER_DATA_FILE" \
    --wait \
    --format ID \
    --no-header)

DROPLET_PUBLIC_IPV4=$(doctl compute droplet get "$DROPLET_ID" \
    --format=PublicIPv4 \
    --no-header)

echo "$DROPLET_ID"
echo "$DROPLET_PUBLIC_IPV4"
