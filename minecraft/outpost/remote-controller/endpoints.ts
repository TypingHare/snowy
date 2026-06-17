/**
 * Request handlers and the route table for the remote-controller service. The
 * route table is consumed by `start-service.ts`.
 *
 * Required environment variables:
 *
 * - `PREFIX` — URL path prefix the routes are mounted under.
 * - `OUTPOST_DIR` — path to the `outpost` directory, used to locate the
 *   `start-minecraft.sh` / `stop-minecraft.sh` scripts and the persisted
 *   droplet IP under `.temp`.
 * - `SSH_PRIVATE_KEY_FILE` — SSH key used to reach the droplet.
 */

import { file } from 'bun'

const { PREFIX = '', OUTPOST_DIR, SSH_PRIVATE_KEY_FILE = '' } = process.env

if (!OUTPOST_DIR) {
    console.error('Error: OUTPOST_DIR environment variable is not set.')
    process.exit(1)
}

if (!SSH_PRIVATE_KEY_FILE) {
    console.error(
        'Error: SSH_PRIVATE_KEY_FILE environment variable is not set.'
    )
    process.exit(1)
}

export const endpoints: ['GET' | 'POST', string, Handler][] = [
    ['POST', `${PREFIX}/start`, startMinecraftServer],
    ['POST', `${PREFIX}/stop`, stopMinecraftServer],
    ['GET', `${PREFIX}/status`, getMinecraftServerStatus],
]

export type Handler = (params: URLSearchParams) => Promise<Response>

/**
 * Provisions the Minecraft droplet and starts the server by running
 * `start-minecraft.sh <game>`. The game to host is read from the `game` query
 * parameter, which must name a directory alongside the `outpost` directory.
 *
 * @param params - Request query parameters; must include `game`.
 * @returns A JSON response carrying the script's `exitCode`, `stdout`, and
 *   `stderr`: `400` if `game` is missing, `200` if the script succeeds, or
 *   `500` if it fails.
 */
async function startMinecraftServer(
    params: URLSearchParams
): Promise<Response> {
    const SCRIPT_PATH = `${OUTPOST_DIR}/start-minecraft.sh`
    const gameName: string | null = params.get('game')
    if (!gameName) {
        console.log(`Error: Missing required 'game' query parameter.`)
        return new Response(
            "Bad Request: Missing required 'game' query parameter.",
            { status: 400 }
        )
    }

    const proc = Bun.spawn(['sh', SCRIPT_PATH, gameName], {
        stdout: 'pipe',
        stderr: 'pipe',
    })

    const exitCode = await proc.exited
    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()

    console.log(`Start Minecraft Server Result:`)
    console.log(`  - exit code: ${exitCode}`)
    console.log(`  - stdout: ${stdout}`)
    console.log(`  - stderr: ${stderr}`)

    return new Response(JSON.stringify({ exitCode, stdout, stderr }), {
        status: exitCode === 0 ? 200 : 500,
        headers: { 'Content-Type': 'application/json' },
    })
}

/**
 * Stops the Minecraft server and tears down the droplet by running
 * `stop-minecraft.sh`, which gracefully stops the server, downloads the world
 * back to Snowy, and deletes the droplet.
 *
 * @returns A JSON response carrying the script's `exitCode`, `stdout`, and
 *   `stderr`: `200` if the script succeeds, or `500` if it fails.
 */
async function stopMinecraftServer(): Promise<Response> {
    const SCRIPT_PATH = `${OUTPOST_DIR}/stop-minecraft.sh`
    const proc = Bun.spawn(['sh', SCRIPT_PATH], {
        stdout: 'pipe',
        stderr: 'pipe',
    })

    const exitCode = await proc.exited
    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()

    console.log(`Stop Minecraft Server Result:`)
    console.log(`  - exit code: ${exitCode}`)
    console.log(`  - stdout: ${stdout}`)
    console.log(`  - stderr: ${stderr}`)

    return new Response(JSON.stringify({ exitCode, stdout, stderr }), {
        status: exitCode === 0 ? 200 : 500,
        headers: { 'Content-Type': 'application/json' },
    })
}

/**
 * Reports whether the Minecraft server is currently running.
 *
 * The droplet's public IP is recovered from the `.temp` file that
 * `start-minecraft.sh` persists. If that file is absent or empty, no droplet is
 * provisioned, so the server is reported as offline. Otherwise the droplet is
 * probed over SSH with `tmux has-session`, whose exit code distinguishes a
 * running server (`0`), a reachable droplet with no server session (other
 * non-zero codes), and an unreachable droplet (`255`, e.g. a stale IP after the
 * droplet was deleted).
 *
 * @returns A `200` JSON response with `droplet`, `reachable`, and `running`
 *   booleans, plus the droplet `ip` when one is provisioned.
 */
async function getMinecraftServerStatus(): Promise<Response> {
    const IP_PATH = `${OUTPOST_DIR}/.temp/minecraft-droplet-public-ipv4`
    const SESSION = 'minecraft'

    const ipFile = file(IP_PATH)
    const ip = (await ipFile.exists()) ? (await ipFile.text()).trim() : ''
    if (!ip) {
        console.log(`Get Minecraft Server Status Result: no droplet.`)
        return new Response(
            JSON.stringify({
                droplet: false,
                reachable: false,
                running: false,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    }

    const proc = Bun.spawn(
        [
            'ssh',
            '-i',
            SSH_PRIVATE_KEY_FILE,
            '-o',
            'BatchMode=yes',
            '-o',
            'ConnectTimeout=5',
            '-o',
            'StrictHostKeyChecking=accept-new',
            `james@${ip}`,
            `tmux has-session -t ${SESSION}`,
        ],
        { stdout: 'pipe', stderr: 'pipe' }
    )

    const exitCode = await proc.exited
    const reachable = exitCode !== 255
    const running = exitCode === 0

    console.log(`Get Minecraft Server Status Result:`)
    console.log(`  - ip: ${ip}`)
    console.log(`  - exit code: ${exitCode}`)
    console.log(`  - reachable: ${reachable}`)
    console.log(`  - running: ${running}`)

    return new Response(
        JSON.stringify({ droplet: true, reachable, running, ip }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
}
