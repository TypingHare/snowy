/**
 * HTTP service that exposes remote control endpoints for the Outpost Minecraft
 * server. Requests are authenticated with a shared secret loaded from
 * `credential/token` and matched against the `token` request header.
 *
 * Required environment variables:
 *
 * - `PORT` — TCP port to listen on.
 * - `HOME` — used to locate the `stop-minecraft.sh` script.
 *
 * Endpoints:
 *
 * - `POST /stop` — runs `stop-minecraft.sh` and returns its exit code, stdout,
 *   and stderr as JSON.
 */

import { file } from 'bun'
import { timingSafeEqual } from 'node:crypto'

const { HOME, PORT, PREFIX = '' } = process.env
const TOKEN_PATH = 'credential/token'

if (!PORT) {
    console.error('Error: PORT environment variable is not set.')
    process.exit(1)
}

const port = parseInt(PORT)
if (Number.isNaN(port)) {
    console.error('Error: PORT environment variable is not a valid number.')
    process.exit(1)
}

const tokenFile = file(TOKEN_PATH)
if (!(await tokenFile.exists())) {
    console.error(`Error: Token file not found at ${TOKEN_PATH}.`)
    process.exit(1)
}
const expectedToken = (await tokenFile.text()).trim()

Bun.serve({
    port,
    async fetch(req) {
        const url = new URL(req.url)

        console.log(`Received: [${req.method}] ${url.pathname}`)
        if (req.method !== 'POST') {
            console.log(
                `Error: Unsupported method ${req.method} for ${url.pathname}.`
            )
            return new Response('Method Not Allowed', { status: 405 })
        }

        if (url.pathname === `${PREFIX}/stop`) {
            const token = req.headers.get('token')

            if (!token || !isTokenValid(token, expectedToken)) {
                console.log(`Error: Invalid or missing token in request.`)
                return new Response('Unauthorized', { status: 401 })
            }

            const [exitCode, stdout, stderr] = await stopMinecraft()
            console.log(`Performing a "stop" action.`)
            console.log(`  - exit code: ${exitCode}`)
            console.log(`  - stdout: ${stdout}`)
            console.log(`  - stderr: ${stderr}`)

            return new Response(JSON.stringify({ exitCode, stdout, stderr }), {
                status: exitCode === 0 ? 200 : 500,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        return new Response('Not Found', { status: 404 })
    },
})

/**
 * Compares a received token against the expected token in constant time to
 * avoid leaking the token via response-time differences.
 *
 * The length check short-circuits to `false` on mismatch (and is required
 * because `timingSafeEqual` throws on buffers of differing lengths). Token
 * length is not considered secret.
 *
 * @param received - Token value supplied by the caller.
 * @param expected - Token value loaded from `credential/token`.
 * @returns `true` iff the two tokens are byte-for-byte equal.
 */
function isTokenValid(received: string, expected: string): boolean {
    const a = Buffer.from(received)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Runs `stop-minecraft.sh` and collects its exit status and output streams.
 *
 * @returns A tuple of `[exitCode, stdout, stderr]` from the script invocation.
 */
async function stopMinecraft(): Promise<[number, string, string]> {
    const SCRIPT_PATH = `${HOME}/minecraft/outpost/stop-minecraft.sh`
    const proc = Bun.spawn(['sh', SCRIPT_PATH], {
        stdout: 'pipe',
        stderr: 'pipe',
    })

    const exitCode = await proc.exited
    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()

    return [exitCode, stdout, stderr]
}

console.log(`Listening on ${port}...`)
