GAME_NAME="kingdom-and-adventure"
TEMP_DIR=".temp"
DROPLET_ID=$(cat $TEMP_DIR/minecraft-droplet-id | xargs)
DROPLET_PUBLIC_IPV4=$(cat $TEMP_DIR/minecraft-droplet-public-ipv4 | xargs)

# Change to the directory containing this script.
cd "$(dirname "$0")" || exit 1

# Stop the Minecraft server on the droplet.
echo "Stopping the Minecraft server on the droplet..."
ssh -t -i ~/.ssh/id_ed25519_digital_ocean \
    james@"$DROPLET_PUBLIC_IPV4" \
    'systemctl --user stop minecraft-server'
echo "Stopped the Minecraft server on the droplet."

# Copy the game directory from the Minecraft droplet to a temporary directory on
# Snowy.
TEMP_GAME_DIRECTORY="/tmp/$GAME_NAME.$(date +%Y%m%d-%H%M)"
mkdir -p "$TEMP_GAME_DIRECTORY"
echo "Copying the game directory from the Minecraft droplet to a temporary \
directory on Snowy..."
if ! scp -r -i ~/.ssh/id_ed25519_digital_ocean \
    -o StrictHostKeyChecking=accept-new \
    james@"$DROPLET_PUBLIC_IPV4":~/minecraft \
    "$TEMP_GAME_DIRECTORY"; then
    echo "Error: failed to copy the game directory from the Minecraft droplet \
to a temporary directory on Snowy." >&2
    exit 1
fi
echo "Copied the game directory from the Minecraft droplet to a temporary \
directory on Snowy: $TEMP_GAME_DIRECTORY"

# Delete the Minecraft droplet.
echo "Deleting Minecraft droplet (ID: $DROPLET_ID)"
doctl compute droplet delete "$DROPLET_ID" --force
echo "Deleted Minecraft droplet (ID: $DROPLET_ID)"

# Swap the game directory with the temporary game directory on Snowy.
GAME_DIRECTORY=$(realpath "$PWD/../$GAME_NAME/")
echo "Swapping the game directory with the temporary game directory on Snowy..."
mv -f "$TEMP_GAME_DIRECTORY" "$GAME_DIRECTORY"
echo "Swapped the game directory with the temporary game directory on Snowy: \
$GAME_DIRECTORY"
