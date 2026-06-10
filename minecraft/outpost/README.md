# Outpost

The configuration of Snowy is not sufficient to host a modded Minecraft server, which typically requires at least 8 GB of memory. However, I don't want to rent another cloud server on a long-term basis. Instead, I came up with a different approach: create a DigitalOcean droplet whenever I need to host the Minecraft server and copy the game files to it. When I no longer need the server, I can copy the files back to Snowy and delete the droplet. The idea is straightforward, but implementing it will require a fair amount of work.

First, I need to install a Minecraft server on Snowy. Using `minecraft/kingdom-and-adventure` as an example, I need to install the server in `minecraft/kingdom-and-adventure`, add the required mods, and verify that it can start successfully. Once that is done, `minecraft/kingdom-and-adventure` will be the directory that needs to be copied to the temporary droplet (hereafter referred to as the Minecraft droplet).

Next, I want to create the Minecraft droplet from Snowy using the DigitalOcean Command Line Interface (`doctl`), so I need to install it on Snowy first. The official website provides a [tutorial][install-doctl] for installing and configuring `doctl`, but I simply used Homebrew for the installation. After that, I need to authenticate it using the `doctl auth` command, as described in the [authentication guide][doctl-auth].

I can then use `doctl` to create a droplet called `minecraft-server` with a Debian 13 image using the following command:

```bash
doctl compute droplet create minecraft-server \
    --image debian-13-x64 \
    --project "$PROJECT_ID" \
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

# Display a list of VPC
doctl vpcs list --format ID,Name,Region

# Display a list of available regions
doctl compute region list

# Display a list of available sizes (configurations)
doctl compute size list

# Display a list of SSH keys
doctl compute ssh-key list --format=ID,Name
```

Here, a **VPC (Virtual Private Cloud)** is a logically isolated private network within a public cloud provider's infrastructure. Resources within the same VPC can communicate privately, which helps keep database traffic off the public internet. Therefore, I chose the VPC in the "nyc3" region, which is the same region where Snowy is located.

The user data file (`minecraft-droplet-init.yaml`) uses `cloud-init`, which runs on first boot to configure the droplet. The `minecraft-drop-init.yaml` is already well-commented. In summary, it does the following things:

- Create a user named `james` in the `sudo` group.

[install-doctl]: https://docs.digitalocean.com/reference/doctl/how-to/install/#install-github-download-linux-macos
[doctl-auth]: https://docs.digitalocean.com/reference/doctl/reference/auth/
