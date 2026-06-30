import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import {
  Boulder,
  BoulderId,
  BoulderName,
} from "@climbing/application/models/boulder"
import { ClimberId } from "@climbing/application/models/climber"
import { BoulderRepository } from "@climbing/application/repositories/boulder"

import { BoulderInMemoryRepository } from "./repositories/boulder-in-memory.repository"

describe("BoulderInMemoryRepository.deleteByCreatorClimberId", () => {
  it.effect("does not delete a boulder owned by another climber", () =>
    Effect.gen(function* () {
      const repository = yield* BoulderRepository
      const ownerId = ClimberId.make("climber-1")
      const otherClimberId = ClimberId.make("climber-2")
      const boulder = Boulder.make({
        id: BoulderId.make("boulder-1"),
        creatorClimberId: ownerId,
        name: BoulderName.make("Owner's boulder"),
        grade: "V4",
        wallAngle: "OVERHANG",
        movementStyle: "POWER",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      })

      yield* repository.insert(boulder)
      const deleted = yield* repository.deleteByCreatorClimberId(
        otherClimberId,
        boulder.id
      )
      const remaining = yield* repository.findByCreatorClimberId(ownerId)

      expect(Option.isNone(deleted)).toBe(true)
      expect(remaining).toEqual([boulder])
    }).pipe(Effect.provide(BoulderInMemoryRepository))
  )
})
