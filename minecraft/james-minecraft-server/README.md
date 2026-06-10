# James Minecraft Server (1.21.1)

## Introduction

This document provides instructions on how to install and run a Minecraft 1.21.1 modpack using Neoforge. It also includes information about the server IP address, the list of mods included in the modpack, and additional game settings and commands available with the installed mods.

## Installation

### Install Java Runtime Environment (JRE)

Download JDK 21 from [ADOPTIUM](https://adoptium.net/temurin/releases?version=21&os=any&arch=any) and install it on your system. Then, open Command Prompt and run:

```bash
java -version
```

This command should display the installed Java version. If it does, Java is successfully installed.

### Install Neoforge

Download Neoforge from [the official website](https://neoforged.net/#using-neoforge-for-mod-development). Select the "Minecraft Version" as `1.21.1` (Not `1.21.11`) and leave the "Neoforge version" as it is. Click on the "Click Here to Download Installer" button to download the Neoforge installer. Double click to run the installer and follow the on-screen instructions to complete the installation. **Note: make sure to select "install client".**

### Download the Modpack

Download the modpack ZIP file from my [HareHome](https://www.james-chan.me/files/minecraft_1.21.1_modpack.zip) (personal website). Unzip the downloaded file, and move all the contents (.jar files) to the `mods` folder located in your Neoforge Minecraft directory. The default path is usually:

- On Windows: `C:\Users\<YourUsername>\AppData\Roaming\.minecraft\mods`
- On macOS: `/Users/<YourUsername>/Library/Application Support/minecraft/mods`

If you don't see a `mods` folder, you can create one.

## Starting the Game And Connect to Server

Open the Minecraft official launcher. Select "NeoForge" as the profile on the left-hand side of the "PLAY" button. Click "PLAY" to start the game with the modpack. In the Minecraft main menu, click "Multiplayer", and then "Add Server" and set:

- **Server Name**: JamesLightsail
- **Server Address**: 3.145.9.229

Then click `Done` to save the server entry. You can join the server when it is on.

## Server Settings

```ini
difficulty=normal
max-player=8
server-port=25565
view-distance=12
simulation-distance=8
```

## Mod List

Here is a list of mods included in this modpack:

- **Iris** - A mod for adding shaders support.
- **FTB Essentials** - A collection of useful utilities and features for Minecraft.
- **Sodium** - A performance optimization mod for Minecraft.
- **Roughly Enough Items (REI)** - An item and recipe viewing mod.
- **Health Indicator TXF** - Displays health information of entities.
- **Inventory Essentials** - Allows you to sort your inventory and chests.
- **Jade** - Displays information about blocks and entities when you look at them.

Other mods are dependent libraries required for the above mods to function properly.

## Shaders

With **Iris** and **Sodium** installed, you can enhance your game's graphics and performance. To enable shaders, go to "Options" > "Video Settings" > "Shaders" and select a shader pack of your choice.

You can download shader packs from [modrinth](https://modrinth.com/discover/shaders), and place the downloaded shader pack ZIP files into the `shaderpacks` folder located in your Neoforge Minecraft directory, which is in the same location as the `mods` folder.

## Extra Game Utility Features

With **Roughly Enough Items (REI)** installed, you can view item recipes and usages in-game. Press the `R` key while hovering over an item in your inventory to see its recipe, or press the `U` key to see its usages.

With **Health Indicator TXF** installed, you can see the health of entities by looking at them. The health bar will appear above the entity's head, showing their current health.

With **Inventory Essentials** installed, you can sort your inventory with a keybind. I would recommend binding it with `G`. In Minecraft, enter the settings panel, select "Controls", then "Key Binds", and scroll down to "Inventory Essentials", look for "Sort Inventory", and set it to `G`. Select other two entries and unbind a key (press `Esc`).

With **Jade** installed, you can see additional information about blocks and entities by looking at them. The information will be displayed on the screen, providing useful details about the object you are observing.

## Extra Game Commands

With **FTB Essentials** installed, you can use various in-game commands to enhance your gameplay. Some useful commands include:

- `/sethome <name>` - Set your current location as your home.
  - Note: the `<name>` parameter is optional. If not provided, it will set the default home.
  - **Max Number of Homes**: 4
- `/listhomes <player>` - Lists all player homes
  - Note: the `<player>` parameter is optional. If not provided, it will list your homes.
- `/delhome <name>` - Delete your set home location.
  - Note: the `<name>` parameter is optional. If not provided, it will delete the default home.
- `/home <name>` - Teleport to your set home location.
  - Note: the `<name>` parameter is optional. If not provided, it will teleport to the default home.
  - **Cooldown**: 8 minutes (480 seconds)
  - **Cast Time**: 4 seconds
- `/back` - Teleport back to the location of your last death.
  - **Cooldown**: 8 minutes (480 seconds)
  - **Cast Time**: 4 seconds
- `/tpa <player>` - Request to teleport to another player.
  - Note: the other player must accept the request.
  - **Cooldown**: 16 minutes (960 seconds)
- `/tpahere <player>` - Request to teleport another player to your location.
  - Note: the other player must accept the request.
  - **Cooldown**: 16 minutes (960 seconds)
- `/tpaccept <id>` - Accepts request (will have a button for it on screen).
  - Note: the `<id>` parameter is optional. If not provided, it will accept the most recent request.
- `/tpadeny <id>` - Denies request (will have a button for it on screen).
  - Note: the `<id>` parameter is optional. If not provided, it will deny the most recent request.

> **[NOTE] All other commands provided by FTB Essentials are disabled in the server configuration.**
