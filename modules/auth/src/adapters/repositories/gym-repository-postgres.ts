import { makePersistenceError, DrizzleDatabase } from "@workspace/drizzle"
import { eq } from "drizzle-orm"
import { Effect, Layer, Option } from "effect"

import {
  GymAffiliationRecord,
  GymCreationRequestId,
  GymCreationRequestRecord,
  GymId,
  GymRecord,
} from "../../domain/gym.ts"
import { GymUserId } from "../../domain/gym-user.ts"
import { GymRepository } from "../../ports/repositories/gym-repository.ts"
import { gymAffiliations, gymCreationRequests, gyms } from "../../schema.ts"

type GymRow = typeof gyms.$inferSelect
type GymCreationRequestRow = typeof gymCreationRequests.$inferSelect
type GymAffiliationRow = typeof gymAffiliations.$inferSelect

export const GymRepositoryPostgresAdapter = Layer.effect(
  GymRepository,
  Effect.gen(function* () {
    const database = yield* DrizzleDatabase
    const db = database.db

    const run = <A>(operation: string, effect: Effect.Effect<A, unknown>) =>
      effect.pipe(
        Effect.mapError((error) => makePersistenceError(operation, error))
      )

    return {
      findGymById: (gymId) =>
        run(
          "auth.gym.findGymById",
          db.select().from(gyms).where(eq(gyms.id, gymId)).limit(1)
        ).pipe(
          Effect.map((rows) => Option.fromNullishOr(rows[0])),
          Effect.map(Option.map(rowToGymRecord))
        ),
      findCreationRequestById: (requestId) =>
        run(
          "auth.gym.findCreationRequestById",
          db
            .select()
            .from(gymCreationRequests)
            .where(eq(gymCreationRequests.id, requestId))
            .limit(1)
        ).pipe(
          Effect.map((rows) => Option.fromNullishOr(rows[0])),
          Effect.map(Option.map(rowToGymCreationRequestRecord))
        ),
      findAffiliation: (gymId, userId) =>
        run(
          "auth.gym.findAffiliation",
          db
            .select()
            .from(gymAffiliations)
            .where(eq(gymAffiliations.userId, userId))
        ).pipe(
          Effect.map((rows) =>
            rows.find((row) => row.gymId === gymId)
          ),
          Effect.map(Option.fromNullishOr),
          Effect.map(Option.map(rowToGymAffiliationRecord))
        ),
      findActiveAffiliationsByUserId: (userId) =>
        run(
          "auth.gym.findActiveAffiliationsByUserId",
          db
            .select()
            .from(gymAffiliations)
            .where(eq(gymAffiliations.userId, userId))
        ).pipe(
          Effect.map((rows) =>
            rows
              .filter((row) => row.status === "active")
              .map(rowToGymAffiliationRecord)
          )
        ),
      saveGym: (gym) =>
        run(
          "auth.gym.saveGym",
          db
            .insert(gyms)
            .values({
              id: gym.id,
              name: gym.name,
              status: gym.status,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: gyms.id,
              set: {
                name: gym.name,
                status: gym.status,
                updatedAt: new Date(),
              },
            })
        ),
      saveCreationRequest: (request) =>
        run(
          "auth.gym.saveCreationRequest",
          db
            .insert(gymCreationRequests)
            .values({
              id: request.id,
              gymId: request.gymId,
              requesterUserId: request.requesterUserId,
              status: request.status,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: gymCreationRequests.id,
              set: {
                gymId: request.gymId,
                requesterUserId: request.requesterUserId,
                status: request.status,
                updatedAt: new Date(),
              },
            })
        ),
      saveAffiliation: (affiliation) =>
        run(
          "auth.gym.saveAffiliation",
          db
            .insert(gymAffiliations)
            .values({
              gymId: affiliation.gymId,
              userId: affiliation.userId,
              role: affiliation.role,
              status: affiliation.status,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [gymAffiliations.gymId, gymAffiliations.userId],
              set: {
                role: affiliation.role,
                status: affiliation.status,
                updatedAt: new Date(),
              },
            })
        ),
    }
  })
)

const rowToGymRecord = (row: GymRow) =>
  new GymRecord({
    id: GymId.make(row.id),
    name: row.name,
    status: row.status,
  })

const rowToGymCreationRequestRecord = (row: GymCreationRequestRow) =>
  new GymCreationRequestRecord({
    id: GymCreationRequestId.make(row.id),
    gymId: GymId.make(row.gymId),
    requesterUserId: GymUserId.make(row.requesterUserId),
    status: row.status,
  })

const rowToGymAffiliationRecord = (row: GymAffiliationRow) =>
  new GymAffiliationRecord({
    gymId: GymId.make(row.gymId),
    userId: GymUserId.make(row.userId),
    role: row.role,
    status: row.status,
  })
