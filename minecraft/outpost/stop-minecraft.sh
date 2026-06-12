#!/usr/bin/env bash
set -euo pipefail

# Change to the directory containing this script so all relative paths resolve.
cd "$(dirname "$0")"

# --- Configuration --------------------------------------------------------- #

TEMP_DIR=".temp"
GAME_NAME=$(<"$TEMP_DIR/game-name")
GAME_DIRECTORY=$(realpath "../$GAME_NAME")

SSH_KEY_FILE="$HOME/.ssh/id_ed25519_digital_ocean"

# Recover the droplet ID and IP that start-minecraft-droplet.sh persisted.
DROPLET_PUBLIC_IPV4=$(<"$TEMP_DIR/minecraft-droplet-public-ipv4")

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
SNAPSHOT_DIRECTORY="/tmp/$GAME_NAME.$TIMESTAMP"
BACKUP_DIRECTORY="$GAME_DIRECTORY.bak.$TIMESTAMP"

# --- Stop the Minecraft server --------------------------------------------- #

# `-t` allocates a pseudo-terminal so `systemctl --user` works (same reason
# as in start-minecraft-droplet.sh).
echo "Stopping the Minecraft server on the droplet..."
ssh -t -i "$SSH_KEY_FILE" \
    james@"$DROPLET_PUBLIC_IPV4" \
    'systemctl --user stop minecraft-server'
echo "Stopped the Minecraft server on the droplet."

# --- Download the game directory ------------------------------------------- #

# Pull the remote game directory directly into $SNAPSHOT_DIRECTORY. Do NOT
# pre-create $SNAPSHOT_DIRECTORY — scp would then nest the remote dir inside
# it, breaking the install step below.
echo "Downloading the game directory from the droplet to \
\"$SNAPSHOT_DIRECTORY\"..."
if ! scp -r -i "$SSH_KEY_FILE" \
    james@"$DROPLET_PUBLIC_IPV4":"minecraft/$GAME_NAME" \
    "$SNAPSHOT_DIRECTORY"; then
    echo "Error: failed to download the game directory from the droplet." >&2
    exit 1
fi
echo "Downloaded the game directory from the droplet."

# --- Delete the droplet ---------------------------------------------------- #

bash delete-minecraft-droplet.sh

# --- Install the snapshot locally ------------------------------------------ #

# Move the current local game directory aside as a timestamped backup, then
# move the freshly-downloaded snapshot into its place. Both `mv`s are
# same-filesystem renames, so they are atomic and fast.
echo "Backing up the local game directory to \"$BACKUP_DIRECTORY\"..."
mv "$GAME_DIRECTORY" "$BACKUP_DIRECTORY"
echo "Installing the snapshot at \"$GAME_DIRECTORY\"..."
mv "$SNAPSHOT_DIRECTORY" "$GAME_DIRECTORY"
echo "Installed the snapshot at \"$GAME_DIRECTORY\"."

# Clean up the persisted droplet metadata.
rm -f "$TEMP_DIR/minecraft-droplet-id" "$TEMP_DIR/minecraft-droplet-public-ipv4"

echo "Minecraft server \"$GAME_NAME\" has been stopped; previous local copy \
preserved at \"$BACKUP_DIRECTORY\"."
