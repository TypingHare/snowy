# Outpost

The configuration of Snowy is not sufficient to host a modded Minecraft server, which typically requires at least 8 GB of memory. However, I don't want to rent another cloud server on a long-term basis. Instead, I came up with a different approach: create a DigitalOcean droplet whenever I need to host the Minecraft server and copy the game files to it. When I no longer need the server, I can copy the files back to Snowy and delete the droplet. The idea is straightforward, but implementing it will require a fair amount of work.

First, I need to install a Minecraft server on Snowy. Using `minecraft/kingdom-and-adventure` as an example, I need to install the server in `minecraft/kingdom-and-adventure`, add the required mods, and verify that it can start successfully. Once that is done, `minecraft/kingdom-and-adventure` will be the directory that needs to be copied to the temporary droplet (hereafter referred to as the Minecraft droplet).

Next, I want to create the Minecraft droplet from Snowy using the DigitalOcean Command Line Interface (`doctl`), so I need to install it on Snowy first. The official website provides a [tutorial][install-doctl] for installing and configuring `doctl`, but I simply used Homebrew for the installation. After that, I need to authenticate it using the `doctl auth` command, as described in the [authentication guide][doctl-auth].

I can then use `doctl` to create a droplet called `minecraft-server` with a Debian 13 image using the following command:

```bash
doctl compute droplet create minecraft-server \
    --image debian-13-x64 \
    --project-id "$PROJECT_ID" \
    --vpc-uuid "$VPC_UUID" \
    --region "$REGION" \
    --size "$SIZE" \
    --ssh-keys "$SSH_KEY_ID" \
    --user-data-file minecraft-droplet-init.yaml \
    --wait
```

Here, I have 5 variables to determine. The commands below display a list of available values for these variables:

```bash
# Display a list of IDs of projects
doctl projects list --format=ID,Name,Description

# Display a list of VPCs
doctl vpcs list --format ID,Name,Region

# Display a list of available regions
doctl compute region list

# Display a list of available sizes (configurations)
doctl compute size list

# Display a list of SSH keys
doctl compute ssh-key list --format=ID,Name
```

Here, a **VPC (Virtual Private Cloud)** is a logically isolated private network within a public cloud provider's infrastructure. Resources within the same VPC can communicate privately, which helps keep internal traffic off the public internet. Therefore, I chose the VPC in the "nyc3" region, which is the same region where Snowy is located.

The user data file (`minecraft-droplet-init.yaml`) uses `cloud-init`, which runs on first boot to configure the droplet. The `minecraft-droplet-init.yaml` is already well-commented. In summary, it does the following things:

- Create a user named `james` in the `sudo` group.
- Set an authorized key for `james`, so that I can connect to the server using `ssh james@<ip-addr>`. Note that the corresponding key is on Snowy.
- Install `ufw` and `default-jdk` using `apt`.
- Create a swap file to enable virtual memory.
- Pre-create the two directories `/home/james/minecraft` and `/home/james/.config/systemd/user`. Snowy later uploads files into them via `scp`, which does not create missing parent directories, so they must exist beforehand.
- Run `loginctl enable-linger james` so that systemd user services can keep running even when `james` is not logged in.

Finally, I just need to create two bash files, `start-minecraft.sh` and `stop-minecraft.sh`, to start and stop the Minecraft server, respectively.

## `start-minecraft.sh`

The `start-minecraft.sh` script takes a single argument, which is the name of the Minecraft game. It should be a directory in the parent directory of the script.

The script first creates a Minecraft droplet using `doctl` as mentioned above. Then, it waits for the droplet to be active and retrieves its ID. After that, I retrieve the public IPv4 address of the created droplet. Then, I save the game name, droplet ID, and IPv4 address to different files in the `.temp` directory, which will be used by `stop-minecraft.sh` later.

I then want to copy the game files to the Minecraft droplet. But before that, I need to wait until the following two conditions are met:

1. SSH becomes available.
2. `cloud-init` finishes running.

The command below checks if the SSH channel is available by trying to execute a simple command (`true`) on the remote server every three seconds until it succeeds. The `-o ConnectTimeout=5` option caps the time spent on each attempt to 5 seconds. The `-o BatchMode=yes` option disables all interactive prompts.

```bash
until ssh -i "$SSH_KEY_FILE" \
    -o StrictHostKeyChecking=accept-new \
    -o ConnectTimeout=5 \
    -o BatchMode=yes \
    root@"$DROPLET_PUBLIC_IPV4" \
    true 2>/dev/null; do
    sleep 3
done
```

The command below waits until `cloud-init` on the Minecraft droplet finishes running.

```bash
ssh -i "$SSH_KEY_FILE" root@"$DROPLET_PUBLIC_IPV4" \
    'cloud-init status --wait >/dev/null'
```

Next, I just copy the entire game directory to the Minecraft droplet using `scp`. The `-r` option is used to copy directories recursively.

```bash
scp -r -i "$SSH_KEY_FILE" \
    "$GAME_DIRECTORY" \
    james@"$DROPLET_PUBLIC_IPV4":~/minecraft;
```

Finally, I want to start the Minecraft server using systemd user services. I have already created a service file named `minecraft-server.service`, which is located in the same directory as `start-minecraft.sh`. I need to copy it directly to `~/.config/systemd/user/` on the Minecraft droplet, which is where systemd user services are stored. After that, I can use `systemctl --user` to reload the systemd daemon and start the Minecraft server.

```bash
# Move the service file to the Minecraft droplet.
scp -i "$SSH_KEY_FILE" \
    minecraft-server.service \
    james@"$DROPLET_PUBLIC_IPV4":~/.config/systemd/user

# Start the Minecraft server using systemd user services.
ssh -t -i "$SSH_KEY_FILE" \
    james@"$DROPLET_PUBLIC_IPV4" \
    'systemctl --user daemon-reload && systemctl --user start minecraft-server'
```

## `stop-minecraft.sh`

Stopping the Minecraft server is much simpler. First, I just use `ssh` to stop the Minecraft server using systemd user services.

```bash
ssh -t -i "$SSH_KEY_FILE" \
    james@"$DROPLET_PUBLIC_IPV4" \
    'systemctl --user stop minecraft-server'
```

Next, I copy the game directory back to Snowy using `scp`. Instead of overwriting the existing game directory, I copy it to a snapshot directory in `/tmp`. Then, I delete the Minecraft droplet using `doctl` (the script is in `delete-minecraft-droplet.sh`).

Subsequently, I rename the original game directory to a backup directory, and move the snapshot directory to the original game directory.

Finally, I clean up the temporary files in the `.temp` directory.

[install-doctl]: https://docs.digitalocean.com/reference/doctl/how-to/install/#install-github-download-linux-macos
[doctl-auth]: https://docs.digitalocean.com/reference/doctl/reference/auth/
