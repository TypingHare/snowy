import path from 'node:path'
import { Hono } from 'hono'
import {
    createDropletAndStartMinecraftServer,
    gameDirExists,
    loadGameInstance,
    stopMinecraftServerAndDeleteDroplet,
} from './service'
import { env } from './env'
import {
    CREDENTIAL_TOKEN_FILE_PATH,
    GAME_NAME_PATTERN,
    STATUS_TEMPLATE_FILE_PATH,
} from './constants'

// Anchor these paths to the package root (this file lives in `src/`) so they
// resolve regardless of the current working directory the server is run from.
const credentialTokenFilePath = path.join(
    import.meta.dir,
    '..',
    CREDENTIAL_TOKEN_FILE_PATH
)
const statusTemplateFilePath = path.join(
    import.meta.dir,
    '..',
    STATUS_TEMPLATE_FILE_PATH
)

const app = new Hono().basePath(env.appPrefix)

app.use('*', async (c, next) => {
    if (c.req.method !== 'POST') {
        return next()
    }

    const credentialToken = (
        await Bun.file(credentialTokenFilePath).text()
    ).trim()
    const token = c.req.header('Authorization')?.replace('Bearer ', '').trim()
    if (token !== credentialToken) {
        return c.json({ error: 'Invalid or missing token.' }, 401)
    }

    await next()
})

app.post('/start', async (c) => {
    const body = await c.req.json()
    const gameName: string = body.game
    if (!gameName) {
        return c.json({ error: 'Game name is required.' }, 400)
    }

    if (!GAME_NAME_PATTERN.test(gameName)) {
        return c.json({ error: 'Invalid game name.' }, 400)
    }

    if (await loadGameInstance(env, gameName)) {
        return c.json({ error: `Game "${gameName}" is already running.` }, 400)
    }

    if (!(await gameDirExists(env, gameName))) {
        return c.json(
            { error: `Game directory for "${gameName}" does not exist.` },
            400
        )
    }

    void createDropletAndStartMinecraftServer(env, gameName)
    return c.json({ message: `Starting Minecraft game "${gameName}".` })
})

app.post('/stop', async (c) => {
    const body = await c.req.json()
    const gameName: string = body.game
    if (!gameName) {
        return c.json({ error: 'Game name is required.' }, 400)
    }

    if (!GAME_NAME_PATTERN.test(gameName)) {
        return c.json({ error: 'Invalid game name.' }, 400)
    }

    if (!(await loadGameInstance(env, gameName))) {
        return c.json(
            { error: `Game instance for "${gameName}" is not created.` },
            400
        )
    }

    void stopMinecraftServerAndDeleteDroplet(env, gameName)
    return c.json({ message: `Stopping Minecraft game "${gameName}".` })
})

app.get('/status', async (c) => {
    const gameName: string | undefined = c.req.query('game')
    if (!gameName) {
        return c.json({ error: 'Game name is required.' }, 400)
    }

    if (!GAME_NAME_PATTERN.test(gameName)) {
        return c.json({ error: 'Invalid game name.' }, 400)
    }

    if (!(await gameDirExists(env, gameName))) {
        return c.json(
            { error: `Game directory for "${gameName}" does not exist.` },
            400
        )
    }

    const gameInstance = await loadGameInstance(env, gameName)
    const isGameStarted = gameInstance !== null
    const statusPageTemplate = await Bun.file(statusTemplateFilePath).text()
    const statusPageContent = statusPageTemplate
        .replace(/{{ game_name }}/g, gameName)
        .replace(
            /{{ droplet_status }}/g,
            isGameStarted ? 'Running' : 'Not Started'
        )
        .replace(/{{ status_class }}/g, isGameStarted ? 'running' : 'stopped')
        .replace(/{{ droplet_ip }}/g, gameInstance?.dropletPublicIpv4 || '—')
        .replace(/{{ app_prefix }}/g, env.appPrefix)

    return c.html(statusPageContent)
})

app.notFound((c) => {
    const prefix = env.appPrefix
    return c.json(
        {
            message:
                `Available endpoints: (1) GET ${prefix}/status ` +
                `(2) POST ${prefix}/start` +
                `(3) POST ${prefix}/stop`,
        },
        400
    )
})

const port: string = env.serverPort.trim() || ''
if (!port || isNaN(Number(port))) {
    console.error(`Invalid PORT environment variable: ${port}`)
    process.exit(1)
}

export default {
    port: Number(port),
    fetch: app.fetch,
}
