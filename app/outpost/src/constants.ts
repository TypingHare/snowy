/** The name of the application. */
export const APP_NAME = 'snowy_outpost'

/** The version of the application. */
export const VERSION = '2026.1.0'

/** The name of the directory where template files are stored. */
export const TEMPLATE_DIR = 'template'

/** The name of the user data template file. */
export const USER_DATA_TEMPLATE_FILE = 'minecraft-droplet-init.yaml'

/** The path to the default user data template file. */
export const DEFAULT_USER_DATA_TEMPLATE_FILE_PATH = `${TEMPLATE_DIR}/${USER_DATA_TEMPLATE_FILE}`

/** The path to the panel template file. */
export const PANEL_TEMPLATE_FILE_PATH = `${TEMPLATE_DIR}/panel.html`

export const GITHUB_REDIRECT_TEMPLATE_FILE_PATH = `${TEMPLATE_DIR}/github-redirect.html`

/** The path to the credential token file. */
export const CREDENTIAL_TOKEN_FILE_PATH = 'credential/token'

/**
 * Game names map directly to local directories and remote paths, so restrict
 * them to a safe character set to prevent path traversal and shell injection.
 */
export const GAME_NAME_PATTERN = /^[A-Za-z0-9_-]+$/

/** The command name used to invoke the CLI tool. */
export const COMMAND_NAME = 'outpost'

/** The extension for backup game directories. */
export const BACKUP_DIR_EXTENSION = 'bak'
