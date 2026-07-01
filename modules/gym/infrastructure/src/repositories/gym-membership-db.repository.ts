import { asc, eq } from "drizzle-orm"
import { Effect, Layer, Option, Schema } from "effect"
import { GymMembership } from "@gym/application/models/gym-membership"
import { GymMembershipRepository } from "@gym/application/repositories/gym-membership"

import { GymDB } from "../db/context"
import { gymMembershipsTable } from "../schemas/gym-memberships.schema"

const toGymMembership = (
  row: typeof gymMembershipsTable.$inferSelect
): GymMembership =>
  Schema.decodeUnknownSync(GymMembership)({
    gymId: row.gymId,
    memberId: row.memberId,
    joinedAt: row.joinedAt,
  })

export const GymMembershipDBRepository = Layer.effect(
  GymMembershipRepository,
  Effect.gen(function* () {
    const db = yield* GymDB

    return {
      findByMemberId: Effect.fn("GymMembershipRepository.findByMemberId")(
        function* (memberId) {
          const memberships = yield* db
            .select()
            .from(gymMembershipsTable)
            .where(eq(gymMembershipsTable.memberId, memberId))
            .orderBy(asc(gymMembershipsTable.joinedAt))
            .pipe(Effect.orDie)

          return memberships.map(toGymMembership)
        }
      ),

      insert: Effect.fn("GymMembershipRepository.insert")(
        function* (membership) {
          const [created] = yield* db
            .insert(gymMembershipsTable)
            .values({
              gymId: membership.gymId,
              memberId: membership.memberId,
              joinedAt: membership.joinedAt,
            })
            .onConflictDoNothing()
            .returning()
            .pipe(Effect.orDie)

          return Option.fromNullishOr(created).pipe(
            Option.map(toGymMembership)
          )
        }
      ),
    }
  })
)
