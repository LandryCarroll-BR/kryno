import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import {
  GymMemberId,
  GymMembership,
} from "@gym/application/models/gym-membership"
import { GymId } from "@gym/application/models/gym"
import { GymMembershipRepository } from "@gym/application/repositories/gym-membership"

import { GymMembershipInMemoryRepository } from "./repositories/gym-membership-in-memory.repository"

describe("GymMembershipInMemoryRepository", () => {
  it.effect("inserts once and finds memberships by member", () =>
    Effect.gen(function* () {
      const repository = yield* GymMembershipRepository
      const membership = GymMembership.make({
        gymId: GymId.make("gym-1"),
        memberId: GymMemberId.make("member-1"),
        joinedAt: new Date("2026-06-30T12:00:00.000Z"),
      })

      const inserted = yield* repository.insert(membership)
      const duplicate = yield* repository.insert(membership)
      const memberships = yield* repository.findByMemberId(
        GymMemberId.make("member-1")
      )
      const otherMemberships = yield* repository.findByMemberId(
        GymMemberId.make("member-2")
      )

      expect(Option.getOrNull(inserted)).toEqual(membership)
      expect(Option.isNone(duplicate)).toBe(true)
      expect(memberships).toEqual([membership])
      expect(otherMemberships).toEqual([])
    }).pipe(Effect.provide(GymMembershipInMemoryRepository))
  )
})
