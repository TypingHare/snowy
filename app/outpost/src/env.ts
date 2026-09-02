import { getEnv } from '@typinghare/cli-core'
import { APP_NAME } from './constants'

/** The default environment variables for the application. */
const defaultEnv = {
    // Temporary directory to use for storing temporary files.
    tempDir: '~/.cache/snowy_outpost',

    // State directory to use for storing persistent state files.
    stateDir: '~/.local/state/snowy_outpost',

    // DigitalOcean Droplet configuration
    dropletName: 'minecraft-server',
    dropletProjectId: '',
    dropletVpcUuid: '',
    dropletRegion: '',
    dropletSize: '',
    dropletSshKeyId: '',

    // The username to use for connecting to the Minecraft server via SSH.
    minecraftServerUsername: 'james',

    // The SSH private key file to use for connecting to the Droplet.
    sshPrivateKeyFile: '~/.ssh/id_ed25519_snowy_outpost',

    // The SSH public key file to use for creating the Droplet.
    sshPublicKeyFile: '~/.ssh/id_ed25519_snowy_outpost.pub',

    // The root directory storing all the Minecraft game directories.
    gameRootDir: '~/minecraft',

    // The name of the tmux session to use for running the Minecraft server.
    tmuxSession: 'minecraft',

    // The port to use for the Hono server.
    serverPort: '5882',

    // The application prefix to use for Hono routes.
    appPrefix: '/outpost',

    // The URL to the repository of the Outpost project.
    repositoryUrl: 'https://github.com/TypingHare/snowy/tree/main/app/outpost'
}

export type Env = Record<keyof typeof defaultEnv, string>
export const env = getEnv<Env>(defaultEnv, APP_NAME.toUpperCase() + '_')
