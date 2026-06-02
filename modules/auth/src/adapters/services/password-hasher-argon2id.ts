import { argon2, randomBytes, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

import { Data, Effect, Layer } from "effect"

import { PasswordHasher } from "../../ports/services/password-hasher.ts"

const argon2Async = promisify(argon2)

const algorithm = "argon2id"

class Argon2idHashingError extends Data.TaggedError(
  "Argon2idHashingError"
)<{
  readonly cause: unknown
}> {}

interface Argon2idPasswordHasherOptions {
  readonly memory: number
  readonly parallelism: number
  readonly passes: number
  readonly tagLength: number
}

const defaultOptions = {
  memory: 65536,
  parallelism: 1,
  passes: 3,
  tagLength: 32,
} satisfies Argon2idPasswordHasherOptions

const encodeHash = (
  options: Argon2idPasswordHasherOptions,
  nonce: Buffer,
  hash: Buffer
) =>
  [
    "$kryno-argon2id",
    `m=${options.memory},t=${options.passes},p=${options.parallelism}`,
    nonce.toString("base64url"),
    hash.toString("base64url"),
  ].join("$")

const parseOptions = (encodedOptions: string) => {
  const parsed = /^m=(\d+),t=(\d+),p=(\d+)$/.exec(encodedOptions)

  if (parsed === null) {
    return undefined
  }

  return {
    memory: Number(parsed[1]),
    passes: Number(parsed[2]),
    parallelism: Number(parsed[3]),
    tagLength: defaultOptions.tagLength,
  } satisfies Argon2idPasswordHasherOptions
}

const hashWithNonce = (
  options: Argon2idPasswordHasherOptions,
  password: string,
  nonce: Buffer
) =>
  Effect.tryPromise({
    try: () =>
      argon2Async(algorithm, {
        message: Buffer.from(password, "utf8"),
        nonce,
        parallelism: options.parallelism,
        memory: options.memory,
        passes: options.passes,
        tagLength: options.tagLength,
      }),
    catch: (cause) => new Argon2idHashingError({ cause }),
  }).pipe(Effect.map((hash) => Buffer.from(hash)))

const verifyEncodedHash = (password: string, passwordHash: string) =>
  Effect.gen(function* () {
    const parts = passwordHash.split("$")

    if (
      parts.length !== 5 ||
      parts[1] !== "kryno-argon2id"
    ) {
      return false
    }

    const options = parseOptions(parts[2] ?? "")

    if (options === undefined) {
      return false
    }

    const nonce = Buffer.from(parts[3] ?? "", "base64url")
    const expectedHash = Buffer.from(parts[4] ?? "", "base64url")
    const actualHash = yield* hashWithNonce(options, password, nonce)

    return (
      actualHash.byteLength === expectedHash.byteLength &&
      timingSafeEqual(actualHash, expectedHash)
    )
  }).pipe(Effect.catch(() => Effect.succeed(false)))

export const makePasswordHasherArgon2idAdapter = (
  options: Argon2idPasswordHasherOptions = defaultOptions
) =>
  Layer.succeed(PasswordHasher, {
    hashPassword: (password: string) =>
      Effect.gen(function* () {
        const nonce = randomBytes(16)
        const hash = yield* hashWithNonce(options, password, nonce).pipe(
          Effect.orDie
        )

        return encodeHash(options, nonce, hash)
      }),
    verifyPassword: verifyEncodedHash,
  })

export const PasswordHasherArgon2idAdapter = makePasswordHasherArgon2idAdapter()
