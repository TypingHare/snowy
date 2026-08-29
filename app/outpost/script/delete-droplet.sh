#!/usr/bin/env bash

# This script deletes a specified DigitalOcean Droplet forcibly.
#
# It assumes that the following environment variables are set:
#   - DROPLET_ID: The ID of the Droplet to delete.
#
# It also assumes that the DigitalOcean CLI (doctl) is installed and configured
# with an API token.

set -euo pipefail

doctl compute droplet delete "$DROPLET_ID" --force
