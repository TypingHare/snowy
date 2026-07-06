import path from 'path'
import type { Env } from './env'
import {
    getAbsPath,
    getEnvObject,
    runExternalCommand,
} from '@typinghare/cli-core'

export async function runScript(
    env: Env,
    scriptName: string,
    extraArgs: Record<string, string> = {}
): Promise<[number, string, string]> {
    const scriptPath = path.normalize(
        path.join(import.meta.dir, '..', 'script', scriptName)
    )

    const resolvedEnv = {
        ...env,
        sshPrivateKeyFile: getAbsPath(env.sshPrivateKeyFile),
        sshPublicKeyFile: getAbsPath(env.sshPublicKeyFile),
    }

    return await runExternalCommand(scriptPath, {
        env: {
            ...getEnvObject(resolvedEnv),
            ...extraArgs,
        },
    })
}
