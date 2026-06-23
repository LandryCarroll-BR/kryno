import { Effect, Layer, Option } from "effect"
import { eq } from "drizzle-orm"
import { User, UserRepository } from "@auth/application"

import { AuthDB } from "../db/context"
import { usersTable } from "../schemas/user.schema"

export const UserDBRepository = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* AuthDB

    return {
      createUser: Effect.fn("UserRepository.createUser")(function* (
        user: User
      ) {
        yield* db
          .insert(usersTable)
          .values({
            id: user.id,
            username: user.username,
            email: user.email,
            passwordHash: user.passwordHash,
            createdAt: user.createdAt,
            role: user.role,
          })
          .pipe(Effect.orDie)

        return user
      }),

      findById: Effect.fn("UserRepository.findById")(function* (id) {
        const [user] = yield* db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, id))
          .limit(1)
          .pipe(Effect.orDie)

        return Option.fromNullishOr(user).pipe(
          Option.map((user) => User.make(user))
        )
      }),

      findByUsername: Effect.fn("UserRepository.findByUsername")(function* (
        username: string
      ) {
        const [user] = yield* db
          .select()
          .from(usersTable)
          .where(eq(usersTable.username, username))
          .limit(1)
          .pipe(Effect.orDie)

        return Option.fromNullishOr(user).pipe(
          Option.map((user) => User.make(user))
        )
      }),

      findByEmail: Effect.fn("UserRepository.findByEmail")(function* (
        email: string
      ) {
        const [user] = yield* db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1)
          .pipe(Effect.orDie)

        return Option.fromNullishOr(user).pipe(
          Option.map((user) => User.make(user))
        )
      }),
    }
  })
)
