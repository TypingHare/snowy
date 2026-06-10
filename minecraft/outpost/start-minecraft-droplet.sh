#!/usr/bin/env bash
set -euo pipefail

# Change to the directory containing this script so all relative paths resolve.
cd "$(dirname "$0")"

# --- Game Directory Verification ------------------------------------------- #

GAME_NAME="${1:-}"
if [ -z "$GAME_NAME" ]; then
    echo "Usage: $(basename "$0") <game-name>" >&2
    echo "Example: $(basename "$0") kingdom-and-adventure" >&2
    exit 1
fi

GAME_DIRECTORY=$(realpath "../$GAME_NAME")
if [ ! -d "$GAME_DIRECTORY" ]; then
    echo "Error: game directory \"$GAME_DIRECTORY\" does not exist." >&2
    exit 1
fi

echo "Game directory: $GAME_DIRECTORY"

# --- Configuration --------------------------------------------------------- #

DROPLET_NAME="minecraft-server"
PROJECT_ID="d1aedfff-273b-40af-aa1a-c49c3d748246"
VPC_UUID="978c557f-c1b8-412b-99f9-74a8cf17cee0"
REGION="nyc3"
SIZE="s-4vcpu-8gb-intel"
SSH_KEY_ID="56975812"

SSH_KEY_FILE="$HOME/.ssh/id_ed25519_digital_ocean"
TEMP_DIR=".temp"

# --- Create the droplet ---------------------------------------------------- #

# Create the Minecraft droplet via `doctl`. `--wait` blocks until the droplet
# reaches the "active" state at the hypervisor level, but note that sshd is
# not yet listening at this point — we poll for it separately below.
echo "Creating the Minecraft droplet..."
DROPLET_ID=$(doctl compute droplet create "$DROPLET_NAME" \
    --image debian-13-x64 \
    --project-id "$PROJECT_ID" \
    --vpc-uuid "$VPC_UUID" \
    --region "$REGION" \
    --size "$SIZE" \
    --ssh-keys "$SSH_KEY_ID" \
    --user-data-file minecraft-droplet-init.yaml \
    --wait \
    --format ID \
    --no-header)

DROPLET_PUBLIC_IPV4=$(doctl compute droplet get "$DROPLET_ID" \
    --format=PublicIPv4 \
    --no-header)

echo "Created the Minecraft droplet (ID: $DROPLET_ID; public IPv4: \
$DROPLET_PUBLIC_IPV4)."

# Persist the game name, droplet ID, and IP so `stop-minecraft-droplet.sh` can
# find them.
mkdir -p "$TEMP_DIR"
echo "$GAME_NAME" >"$TEMP_DIR/game-name"
echo "$DROPLET_ID" >"$TEMP_DIR/minecraft-droplet-id"
echo "$DROPLET_PUBLIC_IPV4" >"$TEMP_DIR/minecraft-droplet-public-ipv4"

# --- Wait for the droplet to be ready -------------------------------------- #

# `-o StrictHostKeyChecking=accept-new` automatically accepts the droplet's
# SSH host key on the first connection (the droplet is brand new, so the key
# is unknown). After this loop the key is in known_hosts and subsequent ssh
# and scp invocations can rely on it.
echo "Waiting for SSH to become available on the droplet..."
until ssh -i "$SSH_KEY_FILE" \
    -o StrictHostKeyChecking=accept-new \
    -o ConnectTimeout=5 \
    -o BatchMode=yes \
    root@"$DROPLET_PUBLIC_IPV4" \
    true 2>/dev/null; do
    sleep 3
done
echo "SSH is available on the droplet."

# Wait for cloud-init to finish so the james user, swap, and packages are ready.
echo "Waiting for cloud-init to finish on the droplet..."
ssh -i "$SSH_KEY_FILE" root@"$DROPLET_PUBLIC_IPV4" 'cloud-init status --wait'
echo "cloud-init has finished on the droplet."

# --- Upload the game and unit file ----------------------------------------- #

# Upload the game directory. Target `~/minecraft/` was pre-created in
# cloud-init's runcmd, so scp places the game dir inside it as
# `~/minecraft/$GAME_NAME/`, matching the unit file's WorkingDirectory.
echo "Uploading the game directory \"$GAME_DIRECTORY\" to the droplet..."
if ! scp -r -i "$SSH_KEY_FILE" \
    "$GAME_DIRECTORY" \
    james@"$DROPLET_PUBLIC_IPV4":~/minecraft; then
    echo "Error: failed to upload the game directory to the droplet." >&2
    exit 1
fi
echo "Uploaded the game directory to the droplet."

# Upload the user-mode systemd unit file. Target `~/.config/systemd/user/`
# was pre-created in cloud-init's runcmd.
echo "Uploading minecraft-server.service to the droplet..."
if ! scp -i "$SSH_KEY_FILE" \
    minecraft-server.service \
    james@"$DROPLET_PUBLIC_IPV4":~/.config/systemd/user; then
    echo "Error: failed to upload minecraft-server.service to the droplet." >&2
    exit 1
fi
echo "Uploaded minecraft-server.service to the droplet."

# --- Start the Minecraft server -------------------------------------------- #

# `-t` allocates a pseudo-terminal, which triggers logind to set up
# XDG_RUNTIME_DIR so `systemctl --user` can talk to the user manager.
# `loginctl enable-linger james` (set in cloud-init) keeps the user manager
# alive after this SSH session ends, so the server keeps running.
echo "Starting the Minecraft server on the droplet..."
ssh -t -i "$SSH_KEY_FILE" \
    james@"$DROPLET_PUBLIC_IPV4" \
    'systemctl --user daemon-reload && systemctl --user start minecraft-server'
echo "Started the Minecraft server on the droplet."

echo "Minecraft server \"$GAME_NAME\" is now running at $DROPLET_PUBLIC_IPV4."
