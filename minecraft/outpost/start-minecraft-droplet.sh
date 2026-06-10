GAME_NAME="kingdom-and-adventure"
TEMP_DIR=".temp"
PROJECT_ID="d1aedfff-273b-40af-aa1a-c49c3d748246"
VPC_UUID="978c557f-c1b8-412b-99f9-74a8cf17cee0"
REGION="nyc3"
SIZE="s-4vcpu-8gb-intel"
SSH_KEY_ID="56975812"

# Change to the directory containing this script.
cd "$(dirname "$0")" || exit 1

echo "Creating Minecraft droplet..."
DROPLET_ID=$(doctl compute droplet create minecraft-server \
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

# Get the public IPv4 address of the Minecraft droplet.
DROPLET_PUBLIC_IPV4=$(doctl compute droplet get "$DROPLET_ID" \
    --format=PublicIPv4 \
    --no-header)

echo "Created Minecraft droplet (ID: $DROPLET_ID; public IPv4 address: \
$DROPLET_PUBLIC_IPV4)"

# Save the Minecraft droplet ID to a temporary file.
mkdir -p "$TEMP_DIR"
echo "$DROPLET_ID" >"$TEMP_DIR/minecraft-droplet-id"

# Save the Minecraft droplet public IPv4 address to a temporary file.
echo "$DROPLET_PUBLIC_IPV4" >"$TEMP_DIR/minecraft-droplet-public-ipv4"

# Wait for cloud-init to finish on the Minecraft droplet.
echo "Waiting for cloud-init to finish on the droplet..."
ssh -i ~/.ssh/id_ed25519_digital_ocean \
    -o StrictHostKeyChecking=accept-new \
    root@"$DROPLET_PUBLIC_IPV4" \
    'cloud-init status --wait'
echo "cloud-init has finished on the droplet."

# Upload the game directory to the Minecraft droplet.
# Here, the `-o StrictHostKeyChecking=accept-new` option is used to
# automatically accept the droplet's SSH host key on the first connection, which
# is necessary because the droplet is newly created and its SSH host key is not
# yet known.
GAME_DIRECTORY=$(realpath "$PWD/../$GAME_NAME")
echo "Uploading the game directory \"$GAME_DIRECTORY\" to the Minecraft \
droplet..."
if ! scp -r -i ~/.ssh/id_ed25519_digital_ocean \
    -o StrictHostKeyChecking=accept-new \
    "$GAME_DIRECTORY" \
    james@"$DROPLET_PUBLIC_IPV4":~/minecraft; then
    echo "Error: failed to upload the game directory to the Minecraft \
droplet." >&2
    exit 1
fi
echo "Uploaded the game directory to the Minecraft droplet."

# Upload the "minecraft-server.service" systemd unit file to the Minecraft
# droplet.
echo "Uploading the \"minecraft-server.service\" systemd unit file to the \
Minecraft droplet..."
if ! scp -i ~/.ssh/id_ed25519_digital_ocean \
    minecraft-server.service \
    james@"$DROPLET_PUBLIC_IPV4":~/.config/systemd/user; then
    echo "Error: failed to upload the \"minecraft-server.service\" systemd \
unit file to the Minecraft droplet." >&2
    exit 1
fi
echo "Uploaded the \"minecraft-server.service\" systemd unit file to the \
Minecraft droplet."

# Start the Minecraft server on the droplet.
# Here, the `-t` flag is used to allocate a pseudo-terminal, which triggers
# logind to set up XDG_RUNTIME_DIR.
echo "Starting the Minecraft server on the droplet..."
ssh -t -i ~/.ssh/id_ed25519_digital_ocean \
    james@"$DROPLET_PUBLIC_IPV4" \
    'systemctl --user start minecraft-server'
echo "Started the Minecraft server on the droplet."
