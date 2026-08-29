#!/usr/bin/env bash

# This script starts a new tmux session on a DigitalOcean Droplet to run a
# Minecraft server.
#
# It assumes that the following environment variables are set:
#   - SSH_PRIVATE_KEY_FILE: The path to the SSH private key file.
#   - MINECRAFT_SERVER_USERNAME: The username for the Minecraft server on the
#     Droplet.
#   - DROPLET_PUBLIC_IPV4: The public IPv4 address of the Droplet.
#   - TMUX_SESSION: The name of the tmux session.
#   - GAME_NAME: The name of the Minecraft game.

set -euo pipefail

ssh -i "$SSH_PRIVATE_KEY_FILE" \
    "$MINECRAFT_SERVER_USERNAME"@"$DROPLET_PUBLIC_IPV4" \
    "tmux new-session -d -s $TMUX_SESSION \
    -c ~/minecraft/$GAME_NAME 'bash run.sh'"
