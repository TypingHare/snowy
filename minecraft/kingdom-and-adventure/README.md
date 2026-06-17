# Kingdom & Adventure

**Kingdom & Adventure** is a Minecraft `1.21.1` Neoforge modpack that blends colony building with dungeon exploration. Here, you can found and manage your own kingdom with [MineColonies][mine-colonies], gear up through [Apotheosis][apotheosis], and conquer dungeons from [When Dungeons Arise][when-dungeons-arise] to [L-Ender's Cataclysm][l-enders-cataclysm].

## Installation

**Neoforge** `21.11.233` or higher for Minecraft `1.21.1` is required to run this modpack. Please download the Neoforge installer from the [official website][neoforge] and follow the instructions to install it. You can download the mods directory (`mods.zip`) [from Snowy (James' personal website)][mods].

Please make sure Java 21 is installed. For clients, please make sure the Minecraft Launcher is closed when installing Neoforge.

### macOS Client

Double-click the Neoforge JAR file. macOS will block it with a warning prompting you to move it to the Trash — click **"Done"** instead. Open Settings, go to **"Privacy & Security"**, scroll to the bottom, and click **"Open Anyway"**. Confirm by clicking **"Open Anyway"** once more in the dialog that follows. Finally, click **"Proceed"** in the Neoforge installer window.

Then, create a `mods` directory in `~/Library/Application Support/minecraft`, where `~` represents your user home directory. If the directory already exists, back it up by renaming it, then create an empty `mods` directory. Finally, move all the `.jar` files from the downloaded mods directory into the `mods` directory you just created.

### Windows Client

Double-click the Neoforge JAR file to launch the installer. If the file opens as an archive (e.g. in 7-Zip or WinRAR) instead of running, right-click it, choose **"Open with"**, and pick the Java Platform SE binary. If Windows SmartScreen blocks the file with a **"Windows protected your PC"** warning, click **"More info"** and then **"Run anyway"**. In the installer window, make sure **"Install client"** is selected, confirm the path points to your `.minecraft` folder, and click **"Proceed"**.

Then, create a `mods` directory in `%APPDATA%\.minecraft`, where `%APPDATA%` represents your user's roaming application data folder (typically `C:\Users\<YourUsername>\AppData\Roaming`). You can reach it quickly by typing `%APPDATA%\.minecraft` into the File Explorer address bar or the Run dialog (Win+R). If the directory already exists, back it up by renaming it, then create an empty `mods` directory. Finally, move all the `.jar` files from the downloaded mods directory into the `mods` directory you just created.

### Server (Linux)

Move the Neoforge installer to the server, `cd` into the directory where you want the server to be installed, and run the following command (assuming that the Neoforge installer is named `neoforge-installer.jar`):

```bash
java -jar neoforge-installer.jar --install-server .
```

Then, accept the [EULA (End User License Agreement)][eula] with the following command:

```bash
echo "eula=true" > eula.txt
```

Edit the `user_jvm_args.txt` file to set the appropriate JVM arguments for your server. A recommended set of JVM arguments is as follows:

```bash
-Xms4G
-Xmx8G
-XX:+UseG1GC
-XX:+ParallelRefProcEnabled
-XX:MaxGCPauseMillis=200
-XX:+UnlockExperimentalVMOptions
-XX:+DisableExplicitGC
-XX:+AlwaysPreTouch
-XX:G1NewSizePercent=30
-XX:G1MaxNewSizePercent=40
-XX:G1HeapRegionSize=8M
-XX:G1ReservePercent=20
-XX:G1HeapWastePercent=5
-XX:G1MixedGCCountTarget=4
-XX:InitiatingHeapOccupancyPercent=15
-XX:G1MixedGCLiveThresholdPercent=90
-XX:SurvivorRatio=32
-XX:+PerfDisableSharedMem
-XX:MaxTenuringThreshold=1
```

Finally, start the server with the following command:

```bash
./run.sh
```

## Modpack Description

This modpack allows players to build their own kingdoms and adventure through a world filled with various dungeons. With [MineColonies][mine-colonies], players can create and manage their own colony, where they can assign jobs to their citizens, build structures, and expand their territory.

In the early stages of a colony, players have to gather a lot of resources to build it up, which is where [Sophisticated Backpacks][sophisticated-backpacks] and [Waystones][waystones] come into play. Sophisticated Backpacks provide extended inventory space, allowing players to carry more items while exploring and gathering resources. Waystones, on the other hand, allow players to teleport between different locations in the world, making it easier to navigate and gather resources from different biomes.

As the colony becomes more developed, it grows self-sufficient and players can get most necessary resources from it. At this point, players can shift focus to adventuring and exploring the world. [When Dungeons Arise][when-dungeons-arise] and [When Dungeons Arise: Seven Seas][when-dungeons-arise-seven-seas] add various dungeons to the world, each with its own unique challenges and rewards. Generally, bigger dungeons are harder to conquer but provide better loot.

Some giant dungeons are almost impossible to conquer with top-tier vanilla gear, so players will have to rely on [Apotheosis][apotheosis] to enhance their gear with powerful enchantments and attributes. Apotheosis redesigns the enchanting table, introduces gems that can be socketed into gear, and adds affixes that can make gear far more powerful. With the help of Apotheosis, players can conquer dungeons that were previously out of reach.

In the late game, as players reach the highest tier in Apotheosis, they can start conquering the most difficult dungeons in the world, such as [L-Ender's Cataclysm][l-enders-cataclysm]. This mod adds a new dimension filled with powerful mobs and challenging dungeons that require top-tier gear and strategy to conquer.

When exploring dungeons in multiplayer mode, every player normally sees the same loot in a shared chest, which can leave whoever arrives later feeling shortchanged. With [Lootr][lootr], each player gets their own roll from the same chest, making it more fun and rewarding to explore dungeons with friends.

Players who have been playing vanilla Minecraft for too long may be tired of the structures in the game, so [YUNG's Better Mineshafts][yungs-better-mineshafts] and other "YUNG's mods" ([YUNG's Better Ocean Monuments][yungs-better-ocean-monuments], [YUNG's Better Dungeons][yungs-better-dungeons], [YUNG's Better End Island][yungs-better-end-island], [YUNG's Better Witch Huts][yungs-better-witch-huts], [YUNG's Better Strongholds][yungs-better-strongholds], [YUNG's Better Nether Fortresses][yungs-better-nether-fortresses], [YUNG's Better Desert Temples][yungs-better-desert-temples], and [YUNG's Better Jungle Temples][yungs-better-jungle-temples]) add more variety to the structures in the world, making exploration more exciting and rewarding.

[Alex's Mobs][alexs-mobs] adds a variety of new mobs to the game, each with its own unique behaviors and drops. This mod adds more life to the world and provides players with new challenges and rewards when exploring.

Other mods in the modpack are small, but they improve the quality of life and make the game more enjoyable:

- [Better Combat][better-combat] improves the combat system in the game, making it more responsive and engaging.
- [AttributeFix][attribute-fix] fixes various issues with attributes in the game, making them more consistent and balanced.
- [Patchouli][patchouli] allows mod developers to create in-game documentation for their mods, making it easier for players to learn how to use them.
- [Apple Skin][apple-skin] adds a visual indicator for how much hunger and saturation food items will restore, making it easier for players to manage their hunger.
- [Carry On][carry-on] allows players to pick up and carry blocks and entities, making it easier to move things around in the world.
- [FTB Essentials][ftb-essentials] adds various commands for players to set home, warp, teleport to other players, and so on. However, for the sake of balance, the server only enables the `tpa` command.
- [ModernFix][modern-fix] and [FerriteCore][ferrite-core] optimize the game and improve performance, making it run smoother and more efficiently.
- [Enchantment Descriptions][enchantment-descriptions] adds descriptions to enchantments, making it easier for players to understand what they do and how to use them effectively.

## Players Should Know

1. Players can send a teleport request to another player with the `/tpa <target-player-id>` command from FTB Essentials. Once the target accepts the request, the requesting player is teleported to them. **This command has an 8-minute cooldown.**
2. Each player can choose their own Apotheosis world tier. Open the world tier panel with the **Ctrl + T** key bind. We strongly discourage selecting a lower world tier before fighting bosses, which makes the game easier but far less fun. In multiplayer mode, world tiers are not shared between players. When two players activate different tiers, each one independently gets the mob spawns and loot quality matching their own selected tier. It is recommended that players select the same world tier when adventuring together.

## Mod List with Dependencies

### Server and Client

- [MineColonies][mine-colonies]
  - [Domum Ornamentum][domum-ornamentum]
  - [Structurize][structurize]
  - [BlockUI][block-ui]
  - [Multi-Piston][multi-piston]
- [When Dungeons Arise][when-dungeons-arise]
- [When Dungeons Arise: Seven Seas][when-dungeons-arise-seven-seas]
- [Apotheosis][apotheosis]
  - [Placebo][placebo]
  - [Apothic Attributes][apothic-attributes]
  - [Apothic Enchanting][apothic-enchanting]
  - [Apothic Spawners][apothic-spawners]
- [L-Ender's Cataclysm][l-enders-cataclysm]
  - [Curios API][curios-api]
  - [Lionfish API][lionfish-api]
- [YUNG's Better Mineshafts][yungs-better-mineshafts]
  - [YUNG's API][yungs-api]
- [YUNG's Better Ocean Monuments][yungs-better-ocean-monuments]
- [YUNG's Better Dungeons][yungs-better-dungeons]
- [YUNG's Better End Island][yungs-better-end-island]
- [YUNG's Better Witch Huts][yungs-better-witch-huts]
- [YUNG's Better Strongholds][yungs-better-strongholds]
- [YUNG's Better Nether Fortresses][yungs-better-nether-fortresses]
- [YUNG's Better Desert Temples][yungs-better-desert-temples]
- [YUNG's Better Jungle Temples][yungs-better-jungle-temples]
- [Alex's Mobs][alexs-mobs]
  - [Citadel][citadel]
- [Waystones][waystones]
  - [Balm][balm]
- [Better Combat][better-combat]
  - [Cloth Config][cloth-config]
  - [playerAnimator][player-animator]
- [AttributeFix][attribute-fix]
- [Patchouli][patchouli]
- [Sophisticated Backpacks][sophisticated-backpacks]
  - [Sophisticated Core][sophisticated-core]
- [Lootr][lootr]
- [Corpse][corpse]
- [AppleSkin][apple-skin]
- [Carry On][carry-on]
- [FTB Essentials][ftb-essentials]
  - [FTB Library][ftb-library]
  - [Architectury API][architectury-api]
- [ModernFix][modern-fix]
- [FerriteCore][ferrite-core]
- [Enchantment Descriptions][enchantment-descriptions]
  - [Prickle][prickle]
  - [Bookshelf][bookshelf]

### Client Only

- [Iris Shaders][iris-shaders]
  - [Sodium][sodium]
- [Entity Culling][entity-culling]
- [ImmediatelyFast][immediately-fast]
- [just enough items (JEi)][just-enough-items]
- [Inventory Essentials][inventory-essentials]
- [Jade][jade]
- [JourneyMap][journey-map]
- [Health Indicator TXF][health-indicator-txf]

### Server Only

- [spark][spark]

## Recommended Key Binds

In the Minecraft main menu, go to `Options` > `Controls` > `Key Binds` to edit key binds.

- Creative Mode
  - Load Hotbar Activator - **Not Bound**
  - Save Hotbar Activator - **Not Bound**
- Apotheosis
  - Change Radial Mining Mode - **Not Bound**
  - Compare Hovered Equipment - **Left Shift**
  - Link Hovered Item to Chat - **Shift + T**
  - Open World Tier Select - **Ctrl + T**
- Inventory Essentials
  - Sort Inventory - **S**
  - Transfer One - **Space**
- Iris
  - Reload Shaders - **Not Bound**
  - Shaderpack Selection Screen - **Not Bound**
  - Toggle Shaders - **Not Bound**
  - Wireframe (SP only) - **Not Bound**
- JEI (Cheat Mode)
  - Cheat 1 Item - **Not Bound**
  - Cheat 1 Item - **Not Bound**
  - Cheat 1 Stack - **Not Bound**
  - Cheat 1 Stack - **Not Bound**
- Jade
  - Narrate - **Not Bound**
  - Open Config - **Not Bound**
  - Show Details - **Not Bound**
  - Show Overlay - **Not Bound**
  - Show Recipes - **Not Bound**
  - Show Uses - **Not Bound**
  - Toggle Fluid - **Not Bound**
- JourneyMap FullScreen Map
  - Create Waypoint (at cursor) - **Not Bound**
- Sophisticated Mods
  - Sort Storage/Backpack - **S**
  - Transfer to Inventory - **I**
  - Transfer to Storage - **B**

[neoforge]: https://neoforged.net
[mods]: https://docs.jameschen.life/minecraft/kingdom-and-adventure/mods.zip
[eula]: https://www.minecraft.net/en-us/eula
[mine-colonies]: https://www.curseforge.com/minecraft/mc-mods/minecolonies
[domum-ornamentum]: https://www.curseforge.com/minecraft/mc-mods/domum-ornamentum
[structurize]: https://www.curseforge.com/minecraft/mc-mods/structurize
[block-ui]: https://www.curseforge.com/minecraft/mc-mods/blockui
[multi-piston]: https://www.curseforge.com/minecraft/mc-mods/multi-piston
[when-dungeons-arise]: https://modrinth.com/mod/when-dungeons-arise
[when-dungeons-arise-seven-seas]: https://modrinth.com/mod/when-dungeons-arise-seven-seas
[apotheosis]: https://www.curseforge.com/minecraft/mc-mods/apotheosis
[placebo]: https://www.curseforge.com/minecraft/mc-mods/placebo
[apothic-attributes]: https://www.curseforge.com/minecraft/mc-mods/apothic-attributes
[apothic-enchanting]: https://www.curseforge.com/minecraft/mc-mods/apothic-enchanting
[apothic-spawners]: https://www.curseforge.com/minecraft/mc-mods/apothic-spawners
[l-enders-cataclysm]: https://www.curseforge.com/minecraft/mc-mods/lendercataclysm
[curios-api]: https://modrinth.com/mod/curios
[lionfish-api]: https://www.curseforge.com/minecraft/mc-mods/lionfish-api
[yungs-better-mineshafts]: https://modrinth.com/mod/yungs-better-mineshafts
[yungs-api]: https://modrinth.com/mod/yungs-api
[yungs-better-ocean-monuments]: https://modrinth.com/mod/yungs-better-ocean-monuments
[yungs-better-dungeons]: https://modrinth.com/mod/yungs-better-dungeons
[yungs-better-end-island]: https://modrinth.com/mod/yungs-better-end-island
[yungs-better-witch-huts]: https://modrinth.com/mod/yungs-better-witch-huts
[yungs-better-strongholds]: https://modrinth.com/mod/yungs-better-strongholds
[yungs-better-nether-fortresses]: https://modrinth.com/mod/yungs-better-nether-fortresses
[yungs-better-desert-temples]: https://modrinth.com/mod/yungs-better-desert-temples
[yungs-better-jungle-temples]: https://modrinth.com/mod/yungs-better-jungle-temples
[waystones]: https://modrinth.com/mod/waystones
[alexs-mobs]: https://modrinth.com/mod/alexs-mobs(1.21.1)
[citadel]: https://modrinth.com/mod/citadel-(1.21.1-port)
[balm]: https://modrinth.com/mod/balm
[better-combat]: https://modrinth.com/mod/better-combat
[cloth-config]: https://modrinth.com/mod/cloth-config
[player-animator]: https://modrinth.com/mod/playeranimator
[attribute-fix]: https://modrinth.com/mod/attributefix
[patchouli]: https://modrinth.com/mod/patchouli
[sophisticated-backpacks]: https://modrinth.com/mod/sophisticated-backpacks
[sophisticated-core]: https://modrinth.com/mod/sophisticated-core
[lootr]: https://modrinth.com/mod/lootr
[corpse]: https://modrinth.com/mod/corpse
[apple-skin]: https://modrinth.com/mod/appleskin
[carry-on]: https://modrinth.com/mod/carry-on
[ftb-essentials]: https://www.curseforge.com/minecraft/mc-mods/ftb-essentials
[ftb-library]: https://www.curseforge.com/minecraft/mc-mods/ftb-library-forge
[architectury-api]: https://www.curseforge.com/minecraft/mc-mods/architectury-api
[modern-fix]: https://modrinth.com/mod/modernfix
[ferrite-core]: https://modrinth.com/mod/ferrite-core
[iris-shaders]: https://modrinth.com/mod/iris
[sodium]: https://modrinth.com/mod/sodium
[entity-culling]: https://modrinth.com/mod/entityculling
[immediately-fast]: https://modrinth.com/mod/immediatelyfast
[just-enough-items]: https://modrinth.com/mod/jei/versions
[inventory-essentials]: https://modrinth.com/mod/inventory-essentials
[jade]: https://modrinth.com/mod/jade
[journey-map]: https://modrinth.com/mod/journeymap
[health-indicator-txf]: https://modrinth.com/mod/health-indicator-txf
[enchantment-descriptions]: https://modrinth.com/mod/enchantment-descriptions
[prickle]: https://modrinth.com/mod/prickle
[bookshelf]: https://modrinth.com/mod/bookshelf-lib
[spark]: https://modrinth.com/mod/spark
