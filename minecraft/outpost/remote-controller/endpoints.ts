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
 * - `SERVER_STATUS_FILE_PATH` — optional path to an HTML file that is rewritten
 *   on every successful start/stop so an external page can display the current
 *   server status. When unset, this side effect is skipped.
 */

import { file } from 'bun'

const {
    PREFIX = '',
    OUTPOST_DIR,
    SSH_PRIVATE_KEY_FILE = '',
    SERVER_STATUS_FILE_PATH = '',
} = process.env

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
 * Starts the Minecraft server by running `start-minecraft.sh <game>` in the
 * background. The game to host is read from the `game` query parameter, which
 * must name a directory alongside the `outpost` directory.
 *
 * Provisioning takes minutes, so the script is fire-and-forget: this responds
 * immediately and the caller polls `GET /status` to learn when the server is
 * up. When the script later succeeds and `SERVER_STATUS_FILE_PATH` is set, the
 * status file is rewritten with the hosted game name and the droplet's public
 * IPv4.
 *
 * @param params - Request query parameters; must include `game`.
 * @returns `400` if `game` is missing, otherwise a `200` JSON acknowledgement
 *   that the start was kicked off.
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

    void runScript(
        'Start Minecraft Server',
        ['sh', SCRIPT_PATH, gameName],
        async () => {
            // Publish the server status (game name and droplet IP) so an
            // external page can show players that the server is up and where to
            // connect.
            if (!SERVER_STATUS_FILE_PATH) return
            const ipv4Address = (
                await file(
                    `${OUTPOST_DIR}/.temp/minecraft-droplet-public-ipv4`
                ).text()
            ).trim()
            await file(SERVER_STATUS_FILE_PATH).write(
                `<h2>Game Name: ${gameName}</h2>\n` +
                    `<h2>IPv4 Address: ${ipv4Address}</h2>`
            )
        }
    )

    return new Response(
        JSON.stringify({ message: 'Starting the Minecraft server.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
}

/**
 * Stops the Minecraft server by running `stop-minecraft.sh` in the background,
 * which gracefully stops the server, downloads the world back to Snowy, and
 * deletes the droplet.
 *
 * Teardown takes minutes, so the script is fire-and-forget: this responds
 * immediately and the caller polls `GET /status` to learn when the server is
 * down. When the script later succeeds and `SERVER_STATUS_FILE_PATH` is set,
 * the status file is rewritten to indicate the server is down.
 *
 * @returns A `200` JSON acknowledgement that the stop was kicked off.
 */
async function stopMinecraftServer(): Promise<Response> {
    const SCRIPT_PATH = `${OUTPOST_DIR}/stop-minecraft.sh`

    void runScript('Stop Minecraft Server', ['sh', SCRIPT_PATH], async () => {
        // Mark the server as down so the external status page reflects it.
        if (!SERVER_STATUS_FILE_PATH) return
        await file(SERVER_STATUS_FILE_PATH).write(
            `<h2>THE SERVER IS NOT UP YET.</h2>`
        )
    })

    return new Response(
        JSON.stringify({ message: 'Stopping the Minecraft server.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
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

/**
 * Runs an Outpost script in the background and logs its outcome. The `start`
 * and `stop` handlers fire this without awaiting it (provisioning and teardown
 * take minutes), so it never rejects: on a `0` exit it runs `onSuccess` to
 * refresh the status file, and any failure — from the script or the callback —
 * is logged rather than thrown.
 *
 * @param label - Human-readable prefix for the log lines.
 * @param command - The command and arguments to spawn.
 * @param onSuccess - Optional callback run only when the script exits `0`.
 */
async function runScript(
    label: string,
    command: string[],
    onSuccess?: () => Promise<void>
): Promise<void> {
    try {
        const proc = Bun.spawn(command, { stdout: 'pipe', stderr: 'pipe' })

        const exitCode = await proc.exited
        const stdout = await new Response(proc.stdout).text()
        const stderr = await new Response(proc.stderr).text()

        console.log(`${label} Result:`)
        console.log(`  - exit code: ${exitCode}`)
        console.log(`  - stdout: ${stdout}`)
        console.log(`  - stderr: ${stderr}`)

        if (exitCode === 0 && onSuccess) {
            await onSuccess()
        }
    } catch (error) {
        console.log(`${label} failed:`, error)
    }
}
