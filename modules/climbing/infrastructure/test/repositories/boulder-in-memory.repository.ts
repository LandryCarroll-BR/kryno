import { Effect, Layer, Option, Ref } from "effect"
import type { Boulder } from "@climbing/application/models/boulder"
import { BoulderRepository } from "@climbing/application/repositories/boulder"

export const BoulderInMemoryRepository = Layer.effect(
  BoulderRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, Boulder>())

    return {
      deleteByCreatorClimberId: Effect.fn(
        "BoulderRepository.deleteByCreatorClimberId"
      )(function* (climberId, boulderId) {
        return yield* Ref.modify(store, (boulders) => {
          const boulder = boulders.get(boulderId)

          if (boulder?.creatorClimberId !== climberId) {
            return [Option.none(), boulders]
          }

          const next = new Map(boulders)
          next.delete(boulderId)

          return [Option.some(boulder), next]
        })
      }),

      findByCreatorClimberId: Effect.fn(
        "BoulderRepository.findByCreatorClimberId"
      )(function* (climberId) {
        const boulders = yield* Ref.get(store)

        return [...boulders.values()]
          .filter((boulder) => boulder.creatorClimberId === climberId)
          .sort((left, right) => {
            const updatedAt = right.updatedAt.getTime() - left.updatedAt.getTime()

            if (updatedAt !== 0) {
              return updatedAt
            }

            return left.name.localeCompare(right.name)
          })
      }),

      findById: Effect.fn("BoulderRepository.findById")(function* (boulderId) {
        const boulders = yield* Ref.get(store)
        return Option.fromNullishOr(boulders.get(boulderId))
      }),

      findSavedById: Effect.fn("BoulderRepository.findSavedById")(
        function* (climberId, boulderId) {
          const boulders = yield* Ref.get(store)
          const boulder = boulders.get(boulderId)

          if (boulder?.creatorClimberId !== climberId) {
            return Option.none()
          }

          return Option.some(boulder)
        }
      ),

      insert: Effect.fn("BoulderRepository.insert")(function* (boulder) {
        return yield* Ref.update(store, (boulders) => {
          const next = new Map(boulders)
          next.set(boulder.id, boulder)
          return next
        }).pipe(Effect.as(boulder))
      }),
    }
  })
)
