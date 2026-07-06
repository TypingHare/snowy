#!/usr/bin/env bash

# This script waits for a droplet to be ready.
#
# It first waits for the SSH service to be available, and then waits for
# cloud-init to finish.
#
# It assumes that the following environment variables are set:
#   - SSH_PRIVATE_KEY_FILE: The path to the SSH private key file.
#   - MINECRAFT_SERVER_USERNAME: The username to connect as. The SSH key is
#     installed onto this user by cloud-init (root has no key), so we must wait
#     on this user rather than root.
#   - DROPLET_PUBLIC_IPV4: The public IPv4 address of the droplet.

set -euo pipefail

# Wait for SSH to accept the key, but give up after a bounded number of attempts
# so an unreachable droplet fails loudly instead of hanging forever.
max_attempts=60
attempt=0
until ssh -i "$SSH_PRIVATE_KEY_FILE" \
    -o StrictHostKeyChecking=accept-new \
    -o ConnectTimeout=5 \
    -o BatchMode=yes \
    "$MINECRAFT_SERVER_USERNAME"@"$DROPLET_PUBLIC_IPV4" \
    true 2>/dev/null; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge "$max_attempts" ]; then
        echo "Error: timed out waiting for SSH on the droplet." >&2
        exit 1
    fi
    sleep 3
done

ssh -i "$SSH_PRIVATE_KEY_FILE" "$MINECRAFT_SERVER_USERNAME"@"$DROPLET_PUBLIC_IPV4" \
    'cloud-init status --wait' >/dev/null 2>&1
