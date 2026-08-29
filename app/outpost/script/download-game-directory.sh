#!/usr/bin/env bash

# This script downloads the game directory from the Droplet using scp.
#
# It assumes that the following environment variables are set:
#   - SSH_PRIVATE_KEY_FILE: The path to the SSH private key file for
#     authentication.
#   - MINECRAFT_SERVER_USERNAME: The username for the Minecraft server on the
#     Droplet.
#   - DROPLET_PUBLIC_IPV4: The public IPv4 address of the Droplet.
#   - GAME_NAME: The name of the game directory to download.
#   - SNAPSHOT_DIR: The local directory where the game directory will be
#     downloaded.

set -euo pipefail

if ! scp -r -i "$SSH_PRIVATE_KEY_FILE" \
    "$MINECRAFT_SERVER_USERNAME"@"$DROPLET_PUBLIC_IPV4":"minecraft/$GAME_NAME" \
    "$SNAPSHOT_DIR"; then
    echo "Error: failed to download the game directory from the droplet." >&2
    exit 1
fi
