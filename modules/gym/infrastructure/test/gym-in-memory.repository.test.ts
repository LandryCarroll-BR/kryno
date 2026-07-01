import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { Gym, GymId, GymName } from "@gym/application/models/gym"
import { GymRepository } from "@gym/application/repositories/gym"

import { GymInMemoryRepository } from "./repositories/gym-in-memory.repository"

describe("GymInMemoryRepository.insert", () => {
  it.effect("allows gyms to share a name", () =>
    Effect.gen(function* () {
      const repository = yield* GymRepository
      const first = Gym.make({
        id: GymId.make("gym-1"),
        name: GymName.make("The Cliffs"),
      })
      const second = Gym.make({
        id: GymId.make("gym-2"),
        name: GymName.make("The Cliffs"),
      })

      expect(yield* repository.insert(first)).toEqual(first)
      expect(yield* repository.insert(second)).toEqual(second)
    }).pipe(Effect.provide(GymInMemoryRepository))
  )
})
