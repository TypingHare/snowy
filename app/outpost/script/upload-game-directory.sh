#!/usr/bin/env bash

# This script uploads the game directory to the Droplet using scp.
#
# It assumes that the following environment variables are set:
#   - SSH_PRIVATE_KEY_FILE: The path to the SSH private key file for
#     authentication.
#   - GAME_DIR: The path to the game directory to be uploaded.
#   - MINECRAFT_SERVER_USERNAME: The username for the Minecraft server on the
#     Droplet.
#   - DROPLET_PUBLIC_IPV4: The public IPv4 address of the Droplet.

set -euo pipefail

if ! scp -r -i "$SSH_PRIVATE_KEY_FILE" \
    "$GAME_DIR" \
    "$MINECRAFT_SERVER_USERNAME"@"$DROPLET_PUBLIC_IPV4":~/minecraft; then
    echo "Error: failed to upload the game directory to the droplet." >&2
    exit 1
fi
