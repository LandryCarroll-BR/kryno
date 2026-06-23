import { Schema } from "effect"

import {
  ClimbingAttempt,
  ClimbingAttemptId,
  ClimbingDate,
} from "./climbing-attempt.models"

import { ClimberId } from "./climber.models"

export type ClimbingSessionId = typeof ClimbingSessionId.Type
export const ClimbingSessionId = Schema.Trim.pipe(
  Schema.check(
    Schema.isMinLength(1, { message: "Climbing session id must not be empty." })
  ),
  Schema.brand("ClimbingSessionId")
)

const ClimbingSessionFields = {
  id: ClimbingSessionId,
  climberId: ClimberId,
  attempts: Schema.Array(ClimbingAttempt),
  startedAt: ClimbingDate,
}

const validateAttempts = (
  session: {
    readonly attempts: ReadonlyArray<ClimbingAttempt>
    readonly startedAt: Date
  },
  endedAt?: Date
): ReadonlyArray<Schema.FilterIssue> => {
  const issues: Array<Schema.FilterIssue> = []
  const attemptIds = new Set<ClimbingAttemptId>()
  const ordinalsByBoulder = new Set<string>()
  let previousOccurredAt = session.startedAt.getTime()

  session.attempts.forEach((attempt, index) => {
    const occurredAt = attempt.occurredAt.getTime()

    if (occurredAt < session.startedAt.getTime()) {
      issues.push({
        path: ["attempts", index, "occurredAt"],
        issue: "Attempt cannot occur before the session starts.",
      })
    }

    if (occurredAt < previousOccurredAt) {
      issues.push({
        path: ["attempts", index, "occurredAt"],
        issue: "Attempts must be ordered chronologically.",
      })
    }

    if (endedAt !== undefined && occurredAt > endedAt.getTime()) {
      issues.push({
        path: ["attempts", index, "occurredAt"],
        issue: "Attempt cannot occur after the session ends.",
      })
    }

    if (attemptIds.has(attempt.id)) {
      issues.push({
        path: ["attempts", index, "id"],
        issue: "Attempt ids must be unique within a session.",
      })
    }

    const ordinalKey = `${attempt.boulderId}:${attempt.ordinal}`
    if (ordinalsByBoulder.has(ordinalKey)) {
      issues.push({
        path: ["attempts", index, "ordinal"],
        issue: "Attempt ordinals must be unique per boulder within a session.",
      })
    }

    attemptIds.add(attempt.id)
    ordinalsByBoulder.add(ordinalKey)
    previousOccurredAt = occurredAt
  })

  return issues
}

export const ActiveClimbingSession = Schema.TaggedStruct(
  "ActiveClimbingSession",
  ClimbingSessionFields
).check(Schema.makeFilter((session) => validateAttempts(session)))
export type ActiveClimbingSession = typeof ActiveClimbingSession.Type

export const CompletedClimbingSession = Schema.TaggedStruct(
  "CompletedClimbingSession",
  {
    ...ClimbingSessionFields,
    endedAt: ClimbingDate,
  }
).check(
  Schema.makeFilter((session) => {
    const issues = [...validateAttempts(session, session.endedAt)]

    if (session.endedAt.getTime() < session.startedAt.getTime()) {
      issues.push({
        path: ["endedAt"],
        issue: "Session cannot end before it starts.",
      })
    }

    return issues
  })
)
export type CompletedClimbingSession = typeof CompletedClimbingSession.Type

export const ClimbingSession = Schema.Union([
  ActiveClimbingSession,
  CompletedClimbingSession,
])
export type ClimbingSession = typeof ClimbingSession.Type
