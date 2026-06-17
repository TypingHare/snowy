/**
 * Prints a ready-to-run `curl` command that invokes the remote-controller
 * service for the given action, with the shared-secret token loaded from
 * `credential/token` injected as the `token` header.
 *
 * The HTTP method is chosen per action to match the routes in `endpoints.ts`
 * (`status` is a GET; `start` and `stop` are POSTs).
 *
 * Usage:
 *
 * ```sh
 * bun show-command.ts <start|stop|status>
 * ```
 *
 * Required environment variables:
 *
 * - `DOMAIN` — host the remote-controller service is reachable at.
 * - `PORT` — port the remote-controller service listens on.
 * - `PREFIX` — URL path prefix for the remote-controller service.
 */

import { file } from 'bun'

const TOKEN_PATH = 'credential/token'
const { DOMAIN, PORT, PREFIX = '' } = process.env

// The HTTP method for each action must match the routes in `endpoints.ts`.
const METHODS: Record<string, 'GET' | 'POST'> = {
    start: 'POST',
    stop: 'POST',
    status: 'GET',
}

const action: string = Bun.argv[2]
if (!action) {
    console.error('Error: Action argument is required.')
    process.exit(1)
}

const method = METHODS[action]
if (!method) {
    const actions = Object.keys(METHODS).join(', ')
    console.error(
        `Error: Unknown action "${action}". Valid actions: ${actions}.`
    )
    process.exit(1)
}

const tokenFile = file(TOKEN_PATH)
if (!(await tokenFile.exists())) {
    console.error(`Error: Token file not found at ${TOKEN_PATH}.`)
    process.exit(1)
}
const token = (await tokenFile.text()).trim()

// In production the service sits behind a reverse proxy that terminates TLS on
// 443 and forwards to `PORT` internally, so the public URL is `https` with no
// port. Only local access talks plain `http` directly on `PORT`.
const isLocal = DOMAIN === 'localhost'
const scheme = isLocal ? 'http' : 'https'
const authority = isLocal ? `${DOMAIN}:${PORT}` : DOMAIN
console.log(
    `curl -X ${method} ${scheme}://${authority}${PREFIX}/${action} \\\n` +
        `    -H "token:${token}"`
)
