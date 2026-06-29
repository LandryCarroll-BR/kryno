import { Effect, Layer } from "effect"
import { PasswordHash, UserId } from "@auth/application/models/user"
import { UserService } from "@auth/application/services/user"
import crypto from "node:crypto"

// Password hashing policy: Argon2id with 64 MiB memory, 3 passes, and one
// degree of parallelism. Reassess these production parameters as deployment
// hardware and authentication traffic become known.
const ARGON2_MEMORY_COST = 65_536
const ARGON2_PASSES = 3
const ARGON2_PARALLELISM = 1
const ARGON2_SALT_LENGTH = 16
const ARGON2_TAG_LENGTH = 32
const ARGON2_VERSION = 19

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

const encodeBase64 = (value: Uint8Array) =>
  Buffer.from(value).toString("base64").replace(/=+$/, "")

const decodeBase64 = (value: string) => {
  if (!/^[A-Za-z0-9+/]+$/.test(value)) {
    return null
  }

  const decoded = Buffer.from(value, "base64")
  return encodeBase64(decoded) === value ? decoded : null
}

const parsePasswordHash = (passwordHash: PasswordHash) => {
  const match =
    /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([^$]+)\$([^$]+)$/.exec(
      textDecoder.decode(passwordHash)
    )

  if (match === null) {
    return null
  }

  const memory = Number(match[1])
  const passes = Number(match[2])
  const parallelism = Number(match[3])
  const nonce = decodeBase64(match[4])
  const hash = decodeBase64(match[5])

  if (
    !Number.isSafeInteger(memory) ||
    memory < 16_384 ||
    memory > 1_048_576 ||
    !Number.isSafeInteger(passes) ||
    passes < 3 ||
    passes > 10 ||
    !Number.isSafeInteger(parallelism) ||
    parallelism < 1 ||
    parallelism > 16 ||
    nonce === null ||
    nonce.length < ARGON2_SALT_LENGTH ||
    hash === null ||
    hash.length < ARGON2_TAG_LENGTH
  ) {
    return null
  }

  return { hash, memory, nonce, parallelism, passes }
}

export const UserServiceLive = Layer.effect(
  UserService,
  Effect.gen(function* () {
    return {
      generateUserId: Effect.fn("UserService.generateUserId")(function* () {
        return UserId.make(crypto.randomBytes(18).toString("base64url"))
      }),
      hashPassword: Effect.fn("UserService.hashPassword")(function* (
        password: string
      ) {
        const nonce = crypto.randomBytes(ARGON2_SALT_LENGTH)
        const hash = crypto.argon2Sync("argon2id", {
          message: textEncoder.encode(password),
          nonce,
          parallelism: ARGON2_PARALLELISM,
          tagLength: ARGON2_TAG_LENGTH,
          memory: ARGON2_MEMORY_COST,
          passes: ARGON2_PASSES,
        })

        const encodedHash = [
          "",
          "argon2id",
          `v=${ARGON2_VERSION}`,
          `m=${ARGON2_MEMORY_COST},t=${ARGON2_PASSES},p=${ARGON2_PARALLELISM}`,
          encodeBase64(nonce),
          encodeBase64(hash),
        ].join("$")

        return PasswordHash.make(textEncoder.encode(encodedHash))
      }),
      validatePasswords: Effect.fn("UserService.validatePasswords")(function* ({
        password,
        passwordHash,
      }) {
        const parsedHash = parsePasswordHash(passwordHash)

        if (parsedHash === null) {
          return false
        }

        const computedHash = crypto.argon2Sync("argon2id", {
          message: textEncoder.encode(password),
          nonce: parsedHash.nonce,
          parallelism: parsedHash.parallelism,
          tagLength: parsedHash.hash.length,
          memory: parsedHash.memory,
          passes: parsedHash.passes,
        })

        return crypto.timingSafeEqual(computedHash, parsedHash.hash)
      }),
    }
  })
)
