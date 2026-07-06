/**
 * Represents a Minecraft game instance with its associated droplet information.
 *
 * @property dropletId - The unique identifier of the droplet hosting the game
 *   instance.
 * @property dropletPublicIpv4 - The public IPv4 address of the droplet hosting
 *   the game instance.
 */
export interface GameInstance {
    dropletId: string
    dropletPublicIpv4: string
}
