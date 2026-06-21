import { UserService } from "@auth/application"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { usersTable } from "../../src/schemas/user.schema"
import { UserServiceLive } from "../../src/services/user.service"

describe("UserServiceLive", () => {
  it.effect("hashes and validates a password with Argon2id", () =>
    Effect.gen(function* () {
      const userService = yield* UserService
      const userId = yield* userService.generateUserId()
      const passwordHash = yield* userService.hashPassword("correct horse")

      expect(userId).toHaveLength(24)
      expect(new TextDecoder().decode(passwordHash)).toMatch(
        /^\$argon2id\$v=19\$m=65536,t=3,p=1\$/
      )
      expect(usersTable.passwordHash.getSQLType()).toBe("bytea")
      expect(usersTable.passwordHash.mapToDriverValue(passwordHash)).toEqual(
        passwordHash
      )
      expect(usersTable.passwordHash.mapFromDriverValue(passwordHash)).toEqual(
        passwordHash
      )
      expect(
        yield* userService.validatePasswords({
          password: "correct horse",
          passwordHash,
        })
      ).toBe(true)
      expect(
        yield* userService.validatePasswords({
          password: "wrong battery",
          passwordHash,
        })
      ).toBe(false)
    }).pipe(Effect.provide(UserServiceLive))
  )
})
