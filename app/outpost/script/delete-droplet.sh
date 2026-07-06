#!/usr/bin/env bash

# This script deletes a specified DigitalOcean droplet.
#
# It assumes that the following environment variables are set:
#   - DROPLET_ID: The ID of the droplet to delete.

set -euo pipefail

doctl compute droplet delete "$DROPLET_ID" --force
