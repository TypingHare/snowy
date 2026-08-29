/** Represents the possible statuses of a Minecraft game instance. */
export type GameInstanceStatus =
    | 'droplet-creating'
    | 'game-directory-uploading'
    | 'server-starting'
    | 'server-running'
    | 'server-stopping'
    | 'game-directory-downloading'
    | 'droplet-deleting'

/**
 * Represents a Minecraft game instance with its associated Droplet information.
 *
 * When the status is 'droplet-creating', the `dropletId` and
 * `dropletPublicIpv4` are empty strings; otherwise, they contain the unique
 * identifier and public IPv4 address of the Droplet hosting the game instance.
 *
 * The game instance file is immediately deleted after the Droplet is deleted.
 *
 * @property dropletId - The unique identifier of the Droplet hosting the game
 *   instance.
 * @property dropletPublicIpv4 - The public IPv4 address of the Droplet hosting
 *   the game instance.
 * @property status - The current status of the game instance.
 */
export interface GameInstance {
    dropletId: string
    dropletPublicIpv4: string
    status: GameInstanceStatus
}
