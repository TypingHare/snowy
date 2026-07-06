import path, { dirname } from 'node:path'
import { DEFAULT_USER_DATA_TEMPLATE_FILE_PATH } from './constants'
import type { Env } from './env'
import { runScript } from './script'
import { mkdir } from 'node:fs/promises'
import type { GameInstance } from './interfaces'
import { getAbsPath } from '@typinghare/cli-core'
import { logger } from './logger'
import { getDateTimeStringForBackup } from './helper'
import { rename, rm, exists, cp } from 'node:fs/promises'

/**
 * Creates a user data file for the droplet using the provided template file.
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
 * Creates a new droplet and returns its ID and public IPv4 address.
 *
 * @param env The environment variables to use when running the script.
 * @param userDataFilePath The path to the user data file to use when creating
 *   the droplet.
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
 * Creates a new game instance and saves it to the state directory.
 *
 * @param env The environment variables to use when running the script.
 * @param gameName The name of the game instance to create.
 * @param dropletId The ID of the droplet to associate with the game instance.
 * @param dropletPublicIpv4 The public IPv4 address of the droplet to associate
 *   with the game instance.
 * @returns A tuple containing two elements: (1) the absolute path to the game
 *   instance file and (2) the game instance.
 */
export async function createAndSaveGameInstance(
    env: Env,
    gameName: string,
    dropletId: string,
    dropletPublicIpv4: string
): Promise<[string, GameInstance]> {
    const { stateDir } = env
    const stateDirAbsolute = getAbsPath(stateDir)
    const gameInstance: GameInstance = {
        dropletId,
        dropletPublicIpv4,
    }
    const gameInstanceFilePath = path.join(stateDirAbsolute, `${gameName}.json`)
    await mkdir(dirname(gameInstanceFilePath), { recursive: true })
    await Bun.file(gameInstanceFilePath).write(JSON.stringify(gameInstance))

    return [gameInstanceFilePath, gameInstance]
}

/**
 * Loads a game instance from the state directory.
 *
 * @param env The environment variables to use when running the script.
 * @param gameName The name of the game instance to load.
 */
export async function loadGameInstance(
    env: Env,
    gameName: string
): Promise<GameInstance | null> {
    const { stateDir } = env
    const stateDirAbsolute = getAbsPath(stateDir)
    const gameInstanceFilePath = path.join(stateDirAbsolute, `${gameName}.json`)

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
    const { stateDir } = env
    const stateDirAbsolute = getAbsPath(stateDir)
    const gameInstanceFilePath = path.join(stateDirAbsolute, `${gameName}.json`)
    await rm(gameInstanceFilePath, { force: true })
}

/**
 * Waits for the droplet to be ready to accept SSH connections.
 *
 * @param env The environment variables to use when running the script.
 * @param dropletPublicIpv4 The public IPv4 address of the droplet to wait for.
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
 * Uploads the game directory to the droplet.
 *
 * @param env The environment variables to use when running the script.
 * @param dropletPublicIpv4 The public IPv4 address of the droplet to upload to.
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
 * Starts the Minecraft server on the droplet.
 *
 * @param env The environment variables to use when running the script.
 * @param dropletPublicIpv4 The public IPv4 address of the droplet to start the
 *   server on.
 * @param gameName The name of the game directory to start on the droplet.
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
 * Stops the Minecraft server on the droplet.
 *
 * @param env The environment variables to use when running the script.
 * @param dropletPublicIpv4 The public IPv4 address of the droplet to stop the
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
 * Downloads the game directory from the droplet to a local snapshot directory.
 *
 * @param env The environment variables to use when running the script.
 * @param dropletPublicIpv4 The public IPv4 address of the droplet to download
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
        gameName + '.' + getDateTimeStringForBackup() + '.bak'
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
 * Deletes the droplet.
 *
 * @param env The environment variables to use when running the script.
 * @param dropletId The ID of the droplet to delete.
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
 * Creates droplet and start Minecraft server.
 *
 * @param env The environment variables to use when running the script.
 * @param gameName The name of the game directory.
 */
export async function createDropletAndStartMinecraftServer(
    env: Env,
    gameName: string
): Promise<void> {
    const userDataFilePath = await createUserDataFile(env)
    logger.info(`Created user data file: ${userDataFilePath}`)

    const [dropletId, dropletPublicIpv4] = await createDroplet(
        env,
        userDataFilePath
    )
    logger.info(
        `Created Minecraft droplet (ID: ${dropletId}; ` +
            `Public IPv4 Address: ${dropletPublicIpv4})`
    )

    await awaitDroplet(env, dropletPublicIpv4)
    logger.info('The Minecraft droplet is ready to use.')

    const [gameInstanceFilePath] = await createAndSaveGameInstance(
        env,
        gameName,
        dropletId,
        dropletPublicIpv4
    )
    logger.info(`Created game instance file: ${gameInstanceFilePath}.`)

    const gameRootDirAbs = getAbsPath(env.gameRootDir)
    const gameDir: string = path.join(gameRootDirAbs, gameName)
    await uploadGameDirectory(env, dropletPublicIpv4, gameDir)
    logger.info(
        `Uploaded game directory "${gameDir}" to the Minecraft droplet.`
    )

    await startMinecraftServer(env, dropletPublicIpv4, gameName)
    logger.info(
        `Started Minecraft server (Public IPv4 Address: ${dropletPublicIpv4})`
    )
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
    await stopMinecraftServer(env, dropletPublicIpv4)
    logger.info(
        `Stopped Minecraft server (Public Ipv4 Address: ${dropletPublicIpv4}).`
    )

    const snapshotDirPath: string = await downloadGameDirectory(
        env,
        dropletPublicIpv4,
        gameName
    )
    logger.info(
        `Downloaded game directory to snapshot directory: ${snapshotDirPath}`
    )

    await deleteDroplet(env, dropletId)
    logger.info(`Deleted droplet (Droplet ID: ${dropletId})`)

    await deleteGameInstanceFile(env, gameName)
    logger.info(`Deleted game instance file for game "${gameName}".`)

    // Rename the game directory to a backup directory with a timestamp
    const dirName = path.basename(snapshotDirPath)
    const gameRootDirAbs = getAbsPath(env.gameRootDir)
    await rename(
        path.join(gameRootDirAbs, gameName),
        path.join(gameRootDirAbs, dirName)
    )
    logger.info(
        `Renamed game directory "${gameName}" to backup directory "${dirName}".`
    )

    // Copy the snapshot directory into the game root directory, then remove the
    // snapshot. `cp` (not `rename`) is used because the snapshot lives in the
    // temp directory, which may be on a different filesystem — `rename` would
    // fail with EXDEV across devices.
    await cp(snapshotDirPath, path.join(gameRootDirAbs, gameName), {
        recursive: true,
    })
    await rm(snapshotDirPath, { recursive: true, force: true })
    logger.info(
        `Moved snapshot directory "${snapshotDirPath}" to game root ` +
            `directory "${gameRootDirAbs}".`
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
