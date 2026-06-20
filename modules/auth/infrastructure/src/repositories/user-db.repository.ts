import { DB } from "@/db/context"
import { usersTable } from "@/schemas/user.schema"
import { User, UserRepository } from "@auth/application"
import { eq } from "drizzle-orm"
import { Effect, Layer, Option } from "effect"

export const UserDBRepository = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* DB

    return {
      createUser: Effect.fn("UserDBRepository.createUser")(function* (
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

      findByUsername: Effect.fn("UserDBRepository.findByUsername")(function* (
        username: string
      ) {
        const [user] = yield* db
          .select()
          .from(usersTable)
          .where(eq(usersTable.username, username))
          .limit(1)
          .pipe(Effect.orDie)

        return Option.fromNullishOr(user).pipe(Option.map(User.make))
      }),

      findByEmail: Effect.fn("UserDBRepository.findByEmail")(function* (
        email: string
      ) {
        const [user] = yield* db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1)
          .pipe(Effect.orDie)

        return Option.fromNullishOr(user).pipe(Option.map(User.make))
      }),
    }
  })
)
