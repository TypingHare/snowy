#!/usr/bin/env bash

# This script stops a Minecraft server running in a tmux session on a remote
# DigitalOcean Droplet.
#
# It assumes that the following environment variables are set:
#   - SSH_PRIVATE_KEY_FILE: The path to the SSH private key for accessing the
#     Droplet.
#   - MINECRAFT_SERVER_USERNAME: The username for the Minecraft server on the
#     Droplet.
#   - DROPLET_PUBLIC_IPV4: The public IPv4 address of the Droplet.
#   - TMUX_SESSION: The name of the tmux session running the Minecraft server.

set -euo pipefail

ssh -i "$SSH_PRIVATE_KEY_FILE" \
    "$MINECRAFT_SERVER_USERNAME"@"$DROPLET_PUBLIC_IPV4" \
    "tmux send-keys -t $TMUX_SESSION 'stop' Enter 2>/dev/null || true; \
       while tmux has-session -t $TMUX_SESSION 2>/dev/null; do sleep 5; done"
