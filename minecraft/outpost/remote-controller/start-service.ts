/**
 * HTTP service that exposes remote control endpoints for the Outpost Minecraft
 * server. Requests are authenticated with a shared secret loaded from
 * `credential/token` and matched against the `token` request header.
 *
 * Required environment variables:
 *
 * - `PORT` — TCP port to listen on.
 *
 * The request handlers in `./endpoints` require additional environment
 * variables (`PREFIX`, `OUTPOST_DIR`, `SSH_PRIVATE_KEY_FILE`); see that
 * module.
 */

import { file } from 'bun'
import { timingSafeEqual } from 'node:crypto'
import { endpoints } from './endpoints'

const { PORT } = process.env
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

        // Verify token.
        const token = req.headers.get('token')
        if (!token || !isTokenValid(token, expectedToken)) {
            console.log(`Error: Invalid or missing token in request.`)
            return new Response('Unauthorized', { status: 401 })
        }

        // Route request.
        for (const endpoint of endpoints) {
            const [method, path, handler] = endpoint
            if (url.pathname !== path) {
                continue
            }

            if (req.method !== method) {
                console.log(
                    `Error: Unsupported method ${req.method} for ${path}.`
                )
                return new Response('Method Not Allowed', { status: 405 })
            }

            try {
                return await handler(url.searchParams)
            } catch (error) {
                console.log(`Error handling ${method} ${path}:`, error)
                return new Response('Internal Server Error', { status: 500 })
            }
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

console.log(`Listening on ${port}...`)
