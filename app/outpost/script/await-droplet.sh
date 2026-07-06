#!/usr/bin/env bash

# This script waits for a droplet to be ready.
#
# It first waits for the SSH service to be available, and then waits for
# cloud-init to finish.
#
# It assumes that the following environment variables are set:
#   - SSH_PRIVATE_KEY_FILE: The path to the SSH private key file.
#   - DROPLET_PUBLIC_IPV4: The public IPv4 address of the droplet.

set -euo pipefail

until ssh -i "$SSH_PRIVATE_KEY_FILE" \
    -o StrictHostKeyChecking=accept-new \
    -o ConnectTimeout=5 \
    -o BatchMode=yes \
    root@"$DROPLET_PUBLIC_IPV4" \
    true 2>/dev/null; do
    sleep 3
done

ssh -i "$SSH_PRIVATE_KEY_FILE" root@"$DROPLET_PUBLIC_IPV4" \
    'cloud-init status --wait' >/dev/null 2>&1
