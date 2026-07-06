import { env } from './env'
import {
    GENERAL_ERROR,
    getProgram,
    setEnvCommand,
    USAGE_ERROR,
} from '@typinghare/cli-core'
import {
    createDropletAndStartMinecraftServer,
    gameDirExists,
    loadGameInstance,
    stopMinecraftServerAndDeleteDroplet,
} from './service'
import { GAME_NAME_PATTERN, VERSION } from './constants'

export const program = getProgram(
    'outpost',
    VERSION,
    'A CLI tool for Outpost (Snowy), which creates a DigitalOcean droplet ' +
        'and hosts a Minecraft server on it.'
)
setEnvCommand(program, env)

program
    .command('start')
    .description('Start a Minecraft server on a new droplet.')
    .argument('<game>', 'The name of the Minecraft game to start.')
    .action(async (game: string) => {
        const gameName = game.trim()
        if (!gameName) {
            console.error('Game name is required.')
            process.exit(USAGE_ERROR)
        }

        if (!GAME_NAME_PATTERN.test(gameName)) {
            console.error('Invalid game name.')
            process.exit(USAGE_ERROR)
        }

        if (await loadGameInstance(env, gameName)) {
            console.error(`Game "${gameName}" is already running.`)
            process.exit(GENERAL_ERROR)
        }

        await createDropletAndStartMinecraftServer(env, game)
    })

program
    .command('stop')
    .description('Stop the Minecraft server and delete the droplet.')
    .argument('<game>', 'The name of the Minecraft game to stop.')
    .action(async (game: string) => {
        const gameName = game.trim()
        if (!gameName) {
            console.error('Game name is required.')
            process.exit(USAGE_ERROR)
        }

        if (!GAME_NAME_PATTERN.test(gameName)) {
            console.error('Invalid game name.')
            process.exit(USAGE_ERROR)
        }

        if (!(await loadGameInstance(env, gameName))) {
            console.error(`Game instance for "${gameName}" is not created.`)
            process.exit(GENERAL_ERROR)
        }

        await stopMinecraftServerAndDeleteDroplet(env, gameName)
    })

program
    .command('status')
    .description('Check the status of the Minecraft server.')
    .argument('<game>', 'The name of the Minecraft game to check.')
    .action(async (game: string) => {
        const gameName = game.trim()
        if (!gameName) {
            console.error('Game name is required.')
            process.exit(USAGE_ERROR)
        }

        if (!GAME_NAME_PATTERN.test(gameName)) {
            console.error('Invalid game name.')
            process.exit(USAGE_ERROR)
        }

        if (!(await gameDirExists(env, gameName))) {
            console.error(`Game directory for "${gameName}" does not exist.`)
            process.exit(GENERAL_ERROR)
        }

        const gameInstance = await loadGameInstance(env, gameName)
        console.log(`Game name: ${gameName}`)
        if (!gameInstance) {
            console.log('Status: Not running')
        } else {
            const { dropletId, dropletPublicIpv4 } = gameInstance
            console.log('Status: Running')
            console.log(`Droplet ID: ${dropletId}`)
            console.log(`Droplet Public IPv4: ${dropletPublicIpv4}`)
        }
    })
