# Delete the Minecraft droplet created by start-minecraft.sh. Normally invoked
# by stop-minecraft.sh after the game directory has been downloaded.

# Recover the droplet ID that start-minecraft.sh persisted; `xargs` trims the
# trailing newline.
TEMP_DIR=".temp"
DROPLET_ID=$(cat $TEMP_DIR/minecraft-droplet-id | xargs)

# Delete the Minecraft droplet.
echo "Deleting Minecraft droplet (ID: $DROPLET_ID)"
doctl compute droplet delete "$DROPLET_ID" --force
echo "Deleted Minecraft droplet (ID: $DROPLET_ID)"
