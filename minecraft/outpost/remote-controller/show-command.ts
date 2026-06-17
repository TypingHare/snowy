/**
 * Prints a ready-to-run `curl` command that invokes the remote-controller
 * service for the given action, with the shared-secret token loaded from
 * `credential/token` injected as the `token` header.
 *
 * Usage:
 *
 * ```sh
 * bun show-command.ts <action>
 * ```
 *
 * Required environment variables:
 *
 * - `DOMAIN` — host the remote-controller service is reachable at.
 * - `PORT` — port the remote-controller service listens on.
 */

import { file } from 'bun'

const TOKEN_PATH = 'credential/token'
const { DOMAIN, PORT, PREFIX } = process.env

const action: string = Bun.argv[2]
if (!action) {
    console.error('Error: Action argument is required.')
    process.exit(1)
}

const tokenFile = file(TOKEN_PATH)
if (!(await tokenFile.exists())) {
    console.error(`Error: Token file not found at ${TOKEN_PATH}.`)
    process.exit(1)
}
const token = (await tokenFile.text()).trim()

console.log(
    `curl -X POST http://${DOMAIN}:${PORT}${PREFIX}/${action} \\\n` +
        `    -H "token:${token}"`
)
