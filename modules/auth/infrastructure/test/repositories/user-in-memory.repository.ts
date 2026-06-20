import { User, UserRepository } from "@auth/application"
import { Effect, Layer, Option, Ref } from "effect"

export const UserInMemoryRepository = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, User>())

    return {
      createUser: Effect.fn("UserRepository.createUser")(function* (
        user: User
      ) {
        return yield* Ref.modify(store, (current) => {
          const next = new Map(current)
          next.set(user.id, user)

          return [user, next]
        })
      }),
      findByUsername: Effect.fn("UserRepository.findByUsername")(
        function* (username: string) {
          const current = yield* Ref.get(store)
          const user = Array.from(current.values()).find(
            (user) => user.username === username
          )

          return user ? Option.some(user) : Option.none()
        }
      ),
      findByEmail: Effect.fn("UserRepository.findByEmail")(function* (
        email: string
      ) {
        const current = yield* Ref.get(store)
        const user = Array.from(current.values()).find(
          (user) => user.email === email
        )

        return user ? Option.some(user) : Option.none()
      }),
    }
  })
)
