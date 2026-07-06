/** The name of the application. */
export const APP_NAME = 'snowy_outpost'

/** The version of the application. */
export const VERSION = '2026.1.0'

/** The path to the default user data template file. */
export const DEFAULT_USER_DATA_TEMPLATE_FILE_PATH =
    'template/minecraft-droplet-init.yaml'

/** The path to the status template file. */
export const STATUS_TEMPLATE_FILE_PATH = 'template/status.html'

/** The path to the credential token file. */
export const CREDENTIAL_TOKEN_FILE_PATH = 'credential/token'

/**
 * Game names map directly to local directories and remote paths, so restrict
 * them to a safe character set to prevent path traversal and shell injection.
 */
export const GAME_NAME_PATTERN = /^[A-Za-z0-9_-]+$/

/** The command name used to invoke the CLI tool. */
export const COMMAND_NAME = 'outpost'
