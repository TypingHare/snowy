import path, { dirname } from 'node:path'
import {
    BACKUP_DIR_EXTENSION,
    DEFAULT_USER_DATA_TEMPLATE_FILE_PATH,
    TEMPLATE_DIR,
} from './constants'
import type { Env } from './env'
import { runScript } from './script'
import { mkdir } from 'node:fs/promises'
import type { GameInstance, GameInstanceStatus } from './interfaces'
import { getAbsPath } from '@typinghare/cli-core'
import { logger } from './logger'
import { getDateTimeStringForBackup } from './helper'
import { rename, rm, exists, cp } from 'node:fs/promises'
import { readdir } from 'node:fs/promises'

/** Returns the absolute path to the template directory. */
export function getTemplateDirPath(): string {
    return path.join(import.meta.dir, '..', TEMPLATE_DIR)
}

/**
 * Creates a user data file for the Droplet using the provided template file.
 *
 * @param env The environment variables to use when running the script.
 * @param templateFilePath The path to the user data template file to use when
 *   creating the user data file.
 * @returns The path to the created user data file.
 */
export async function createUserDataFile(
    env: Env,
    templateFilePath: string = path.join(
        import.meta.dir,
        '..',
        DEFAULT_USER_DATA_TEMPLATE_FILE_PATH
    )
): Promise<string> {
    const template = await Bun.file(templateFilePath).text()
    const sshPublicKey = (
        await Bun.file(getAbsPath(env.sshPublicKeyFile)).text()
    ).trim()
    const userDataFileContent = template
        .replace(/{{ username }}/g, env.minecraftServerUsername)
        .replace(/{{ ssh_public_key }}/g, sshPublicKey)

    const userDataFilePath = path.join(
        getAbsPath(env.tempDir),
        'minecraft-droplet-init.yaml'
    )
    await mkdir(dirname(userDataFilePath), { recursive: true })
    await Bun.file(userDataFilePath).write(userDataFileContent)

    return userDataFilePath
}

/**
 * Creates a new Droplet and returns its ID and public IPv4 address.
 *
 * This function runs {@link script/create-droplet.sh} to create a new Droplet
 * using the provided user data file.
 *
 * @param env The environment variables to use when running the script.
 * @param userDataFilePath The path to the user data file to use when creating
 *   the Droplet.
 */
export async function createDroplet(
    env: Env,
    userDataFilePath: string
): Promise<[string, string]> {
    const [exitCode, stdout, stderr] = await runScript(
        env,
        'create-droplet.sh',
        { USER_DATA_FILE: userDataFilePath }
    )
    if (exitCode !== 0) {
        throw new Error(`Failed to create droplet: ${stderr}`)
    }

    const [dropletId, dropletPublicIpv4] = stdout
        .trim()
        .split('\n')
        .map((line) => line.trim())

    if (!dropletId || !dropletPublicIpv4) {
        throw new Error(
            `Unexpected output from create-droplet.sh: ` +
                `${JSON.stringify(stdout)}`
        )
    }

    return [dropletId, dropletPublicIpv4]
}

/**
 * Returns the absolute path to the game instance file for the specified game
 * name.
 *
 * @param env The environment variables to use when running the script.
 * @param gameName The name of the game instance.
 * @returns The absolute path to the game instance file.
 */
export function getGameInstanceFilePath(env: Env, gameName: string): string {
    const stateDirAbsolute = getAbsPath(env.stateDir)
    return path.join(stateDirAbsolute, `${gameName}.json`)
}

/**
 * Creates a new game instance and saves it to the state directory.
 *
 * This function creates a new game instance with the specified name and status,
 * and saves it to a JSON file in the state directory. The Droplet ID and public
 * IPv4 address are initialized as empty strings.
 *
 * @param env The environment variables to use when running the script.
 * @param gameName The name of the game instance to create.
 * @param status The initial status of the game instance. Defaults to
 *   'droplet-creating'.
 * @returns A tuple containing two elements: (1) the absolute path to the game
 *   instance file and (2) the game instance.
 */
export async function createAndSaveGameInstance(
    env: Env,
    gameName: string,
    status: GameInstanceStatus = 'droplet-creating'
): Promise<[string, GameInstance]> {
    const gameInstance: GameInstance = {
        dropletId: '',
        dropletPublicIpv4: '',
        status,
    }
    const gameInstanceFilePath = getGameInstanceFilePath(env, gameName)
    await mkdir(dirname(gameInstanceFilePath), { recursive: true })
    await Bun.file(gameInstanceFilePath).write(JSON.stringify(gameInstance))

    return [gameInstanceFilePath, gameInstance]
}

/**
 * Loads an existing game instance from the state directory.
 *
 * @param env The environment variables to use when running the script.
 * @param gameName The name of the game instance to load.
 * @returns The loaded game instance, or null if the game instance file does not
 *   exist.
 */
export async function loadGameInstance(
    env: Env,
    gameName: string
): Promise<GameInstance | null> {
    const gameInstanceFilePath = getGameInstanceFilePath(env, gameName)
    if (!(await Bun.file(gameInstanceFilePath).exists())) {
        return null
    }

    const gameInstanceContent = await Bun.file(gameInstanceFilePath).text()
    return JSON.parse(gameInstanceContent) as GameInstance
}

/**
 * Deletes a game instance file from the state directory.
 *
 * @param env The environment variables to use when running the script.
 * @param gameName The name of the game instance to delete.
 */
export async function deleteGameInstanceFile(
    env: Env,
    gameName: string
): Promise<void> {
    const gameInstanceFilePath = getGameInstanceFilePath(env, gameName)
    await rm(gameInstanceFilePath, { force: true })
}

/**
 * Updates the status of a game instance in the state directory.
 *
 * @param env The environment variables to use when running the script.
 * @param gameName The name of the game instance to update.
 * @param newGameInstance A partial game instance object containing the new
 *   status to update.
 * @throws An error if the game instance file does not exist.
 */
export async function updateGameInstance(
    env: Env,
    gameName: string,
    newGameInstance: Partial<GameInstance>
): Promise<void> {
    const gameInstance = await loadGameInstance(env, gameName)
    if (!gameInstance) {
        throw new Error(
            `Game instance file does not exist for game "${gameName}".`
        )
    }

    const updatedGameInstance = { ...gameInstance, ...newGameInstance }
    const gameInstanceFilePath = getGameInstanceFilePath(env, gameName)
    await Bun.file(gameInstanceFilePath).write(
        JSON.stringify(updatedGameInstance)
    )
}

/**
 * Waits for the Droplet to be ready to accept SSH connections.
 *
 * This function runs {@link script/await-droplet.sh} to wait for the Droplet to
 * be ready to accept SSH connections.
 *
 * @param env The environment variables to use when running the script.
 * @param dropletPublicIpv4 The public IPv4 address of the Droplet to wait for.
 */
export async function awaitDroplet(
    env: Env,
    dropletPublicIpv4: string
): Promise<void> {
    const [exitCode, _, stderr] = await runScript(env, 'await-droplet.sh', {
        DROPLET_PUBLIC_IPV4: dropletPublicIpv4,
    })
    if (exitCode !== 0) {
        throw new Error(`Failed to await droplet: ${stderr}`)
    }
}

/**
 * Uploads the game directory to the Droplet.
 *
 * This function runs {@link script/upload-game-directory.sh} to upload the game
 * directory to the Droplet.
 *
 * @param env The environment variables to use when running the script.
 * @param dropletPublicIpv4 The public IPv4 address of the Droplet to upload to.
 * @param gameDir The path to the game directory to upload.
 */
export async function uploadGameDirectory(
    env: Env,
    dropletPublicIpv4: string,
    gameDir: string
): Promise<void> {
    const [exitCode, _, stderr] = await runScript(
        env,
        'upload-game-directory.sh',
        {
            DROPLET_PUBLIC_IPV4: dropletPublicIpv4,
            GAME_DIR: gameDir,
        }
    )
    if (exitCode !== 0) {
        throw new Error(`Failed to upload game directory: ${stderr}`)
    }
}

/**
 * Starts the Minecraft server on the Droplet.
 *
 * This function runs {@link script/start-minecraft-server.sh} to start the
 * Minecraft server on the Droplet.
 *
 * @param env The environment variables to use when running the script.
 * @param dropletPublicIpv4 The public IPv4 address of the Droplet to start the
 *   server on.
 * @param gameName The name of the game directory to start on the Droplet.
 */
export async function startMinecraftServer(
    env: Env,
    dropletPublicIpv4: string,
    gameName: string
): Promise<void> {
    const [exitCode, _, stderr] = await runScript(
        env,
        'start-minecraft-server.sh',
        { DROPLET_PUBLIC_IPV4: dropletPublicIpv4, GAME_NAME: gameName }
    )
    if (exitCode !== 0) {
        throw new Error(`Failed to start Minecraft server: ${stderr}`)
    }
}

/**
 * Stops the Minecraft server on the Droplet.
 *
 * This function runs {@link script/stop-minecraft-server.sh} to stop the
 * Minecraft server on the Droplet.
 *
 * @param env The environment variables to use when running the script.
 * @param dropletPublicIpv4 The public IPv4 address of the Droplet to stop the
 *   server on.
 */
export async function stopMinecraftServer(
    env: Env,
    dropletPublicIpv4: string
): Promise<void> {
    const [exitCode, _, stderr] = await runScript(
        env,
        'stop-minecraft-server.sh',
        { DROPLET_PUBLIC_IPV4: dropletPublicIpv4 }
    )
    if (exitCode !== 0) {
        throw new Error(`Failed to stop Minecraft server: ${stderr}`)
    }
}

/**
 * Downloads the game directory from the Droplet to a local snapshot directory.
 *
 * This function runs {@link script/download-game-directory.sh} to download the
 * game directory from the Droplet to a local snapshot directory.
 *
 * @param env The environment variables to use when running the script.
 * @param dropletPublicIpv4 The public IPv4 address of the Droplet to download
 *   from.
 * @param gameName The name of the game directory to download.
 * @returns The path to the snapshot directory that the game directory is
 *   downloaded to.
 */
export async function downloadGameDirectory(
    env: Env,
    dropletPublicIpv4: string,
    gameName: string
): Promise<string> {
    const tempDirAbs = getAbsPath(env.tempDir)
    await mkdir(tempDirAbs, { recursive: true })
    const snapshotDir: string = path.join(
        tempDirAbs,
        `${gameName}.${getDateTimeStringForBackup()}.${BACKUP_DIR_EXTENSION}`
    )
    const [exitCode, _, stderr] = await runScript(
        env,
        'download-game-directory.sh',
        {
            DROPLET_PUBLIC_IPV4: dropletPublicIpv4,
            GAME_NAME: gameName,
            SNAPSHOT_DIR: snapshotDir,
        }
    )
    if (exitCode !== 0) {
        throw new Error(`Failed to download game directory: ${stderr}`)
    }

    return snapshotDir
}

/**
 * Deletes all previous backup game directories.
 *
 * This function deletes all previous backup game directories in the game root
 * directory that match the pattern `${gameName}.*.${BACKUP_DIR_EXTENSION}`. It
 * is used to clean up old backups before creating a new backup.
 *
 * @param env The environment variables to use.
 * @param gameName The name of the game for which backup game directories are
 *   deleted.
 */
export async function deletePreviousBackupDirs(
    env: Env,
    gameName: string
): Promise<void> {
    const gameRootDirAbs = getAbsPath(env.gameRootDir)
    const entries = await readdir(gameRootDirAbs, { withFileTypes: true })
    const re = new RegExp(`^${gameName}\\.\\d+-\\d+\\.${BACKUP_DIR_EXTENSION}$`)
    for (const entry of entries) {
        if (entry.isDirectory() && re.test(entry.name)) {
            await rm(path.join(gameRootDirAbs, entry.name), {
                recursive: true,
                force: true,
            })
        }
    }
}

/**
 * Deletes the Droplet.
 *
 * This function runs {@link script/delete-droplet.sh} script to delete the
 * Droplet with the specified ID.
 *
 * @param env The environment variables to use when running the script.
 * @param dropletId The ID of the Droplet to delete.
 */
export async function deleteDroplet(
    env: Env,
    dropletId: string
): Promise<void> {
    const [exitCode, _, stderr] = await runScript(env, 'delete-droplet.sh', {
        DROPLET_ID: dropletId,
    })
    if (exitCode !== 0) {
        throw new Error(`Failed to delete droplet: ${stderr}`)
    }
}

/**
 * Creates Droplet and start Minecraft server.
 *
 * This function creates a new Droplet, waits for it to be ready, uploads the
 * game directory, and starts the Minecraft server on the Droplet.
 *
 * Note that if any errors arise over the course of this function, both the game
 * instance file and the Minecraft Droplet will not be deleted. Users need to
 * contact the Outpost maintainers to fix the issues.
 *
 * @param env The environment variables to use when running the script.
 * @param gameName The name of the game directory.
 */
export async function createDropletAndStartMinecraftServer(
    env: Env,
    gameName: string
): Promise<void> {
    logger.info({ gameName }, `Creating game instance file...`)
    const [gameInstanceFilePath] = await createAndSaveGameInstance(
        env,
        gameName
    )
    logger.info({ gameInstanceFilePath }, `Created game instance file.`)

    logger.info({ gameName }, `Creating user data file...`)
    const userDataFilePath = await createUserDataFile(env)
    logger.info({ userDataFilePath }, `Created user data file.`)

    logger.info('Creating Minecraft droplet...')
    await updateGameInstance(env, gameName, { status: 'droplet-creating' })
    const [dropletId, dropletPublicIpv4] = await createDroplet(
        env,
        userDataFilePath
    )
    await updateGameInstance(env, gameName, {
        dropletId,
        dropletPublicIpv4,
    })
    logger.info({ dropletId, dropletPublicIpv4 }, 'Created Minecraft droplet.')

    logger.info('Waiting for Minecraft droplet to be ready...')
    await awaitDroplet(env, dropletPublicIpv4)
    logger.info('The Minecraft droplet is ready to use.')

    const gameRootDirAbs = getAbsPath(env.gameRootDir)
    const gameDir: string = path.join(gameRootDirAbs, gameName)
    logger.info(
        { gameDir },
        'Uploading game directory to the Minecraft droplet...'
    )
    await updateGameInstance(env, gameName, {
        status: 'game-directory-uploading',
    })
    await uploadGameDirectory(env, dropletPublicIpv4, gameDir)
    logger.info(
        { gameDir },
        'Uploaded game directory to the Minecraft droplet.'
    )

    await updateGameInstance(env, gameName, { status: 'server-starting' })
    await startMinecraftServer(env, dropletPublicIpv4, gameName)
    logger.info({ dropletPublicIpv4 }, `Started Minecraft server.`)
    await updateGameInstance(env, gameName, { status: 'server-running' })
}

/**
 * Backs up the game directory from the Droplet server.
 *
 * The backup directory name is in the format of
 * `${gameName}.${timestamp}.manual.${BACKUP_DIR_EXTENSION}`.
 *
 * @param env The environment variables to use when running the script.
 * @param gameName The name of the game directory.
 * @returns The path to the backup directory.
 */
export async function backupGameDirectoryFromDropletServer(
    env: Env,
    gameName: string
): Promise<string> {
    logger.info(
        { gameName },
        `Backing up game directory from the Minecraft droplet server...`
    )
    const gameInstance = await loadGameInstance(env, gameName)
    if (!gameInstance) {
        throw Error(`Game instance file does not exist for game ${gameName}`)
    }

    const { dropletPublicIpv4 } = gameInstance
    const snapshotDirPath: string = await downloadGameDirectory(
        env,
        dropletPublicIpv4,
        gameName
    )
    const backupDirPath: string = path.join(
        getAbsPath(env.gameRootDir),
        `${gameName}.${getDateTimeStringForBackup()}.manual` +
            `.${BACKUP_DIR_EXTENSION}`
    )
    await cp(snapshotDirPath, backupDirPath, { recursive: true })
    await rm(snapshotDirPath, { recursive: true, force: true })
    logger.info(
        { gameName },
        `Backed up game directory from the Minecraft droplet server.`
    )

    return backupDirPath
}

/**
 * Stops the Minecraft server, downloads the game directory to a snapshot
 * directory, renames the game directory to a backup directory, and moves the
 * snapshot directory to the game root directory.
 *
 * @param env The environment variables to use when running the script.
 * @param gameName The name of the game directory.
 */
export async function stopMinecraftServerAndDeleteDroplet(
    env: Env,
    gameName: string
): Promise<void> {
    const gameInstance = await loadGameInstance(env, gameName)
    if (!gameInstance) {
        throw Error(`Game instance file does not exist for game ${gameName}`)
    }

    const { dropletId, dropletPublicIpv4 } = gameInstance
    logger.info({ dropletPublicIpv4 }, 'Stopping the Minecraft server.')
    await updateGameInstance(env, gameName, { status: 'server-stopping' })
    await stopMinecraftServer(env, dropletPublicIpv4)
    logger.info({ dropletPublicIpv4 }, 'Stopped the Minecraft server.')

    logger.info(
        { dropletPublicIpv4 },
        'Downloading game directory from the Minecraft droplet...'
    )
    await updateGameInstance(env, gameName, {
        status: 'game-directory-downloading',
    })
    const snapshotDirPath: string = await downloadGameDirectory(
        env,
        dropletPublicIpv4,
        gameName
    )
    logger.info(
        { snapshotDirPath },
        'Downloaded game directory to the snapshot directory.'
    )

    logger.info({ dropletId }, 'Deleting the Minecraft droplet.')
    await updateGameInstance(env, gameName, { status: 'droplet-deleting' })
    await deleteDroplet(env, dropletId)
    logger.info({ dropletId }, 'Deleted the Minecraft droplet.')

    logger.info({ gameName }, 'Deleting game instance file.')
    await deleteGameInstanceFile(env, gameName)
    logger.info({ gameName }, 'Deleted game instance file.')

    // Delete all previous backup directories.
    logger.info({ gameName }, 'Deleting all previous backup directories.')
    await deletePreviousBackupDirs(env, gameName)
    logger.info({ gameName }, 'Deleted all previous backup directories.')

    // Rename the game directory to a backup directory with a timestamp
    const backupDirName = path.basename(snapshotDirPath)
    const gameRootDirAbs = getAbsPath(env.gameRootDir)
    await rename(
        path.join(gameRootDirAbs, gameName),
        path.join(gameRootDirAbs, backupDirName)
    )
    logger.info(
        { gameName, dirName: backupDirName },
        `Renamed game directory to the backup directory.`
    )

    // Copy the snapshot directory into the game root directory, then remove the
    // snapshot.
    logger.info(
        { snapshotDirPath, gameRootDirAbs },
        `Moving snapshot directory to the game root directory.`
    )
    await cp(snapshotDirPath, path.join(gameRootDirAbs, gameName), {
        recursive: true,
    })
    await rm(snapshotDirPath, { recursive: true, force: true })
    logger.info(
        { snapshotDirPath, gameRootDirAbs },
        `Moved snapshot directory to the game root directory.`
    )
}

/**
 * Checks if the game directory exists in the game root directory.
 *
 * @param env The environment variables to use when running the script.
 * @param gameName The name of the game directory.
 * @returns A boolean indicating whether the game directory exists.
 */
export async function gameDirExists(
    env: Env,
    gameName: string
): Promise<boolean> {
    const gameRootDirAbs = getAbsPath(env.gameRootDir)
    const gameDir: string = path.join(gameRootDirAbs, gameName)
    return await exists(gameDir)
}
