import { Effect, Layer, Option } from "effect"
import { Service } from "effect/Context"
import type { ActiveClimbingSession } from "@climbing/application"

export type GetCurrentClimbingSessionViewModel =
  | {
      readonly status: "active"
      readonly sessionId: string
      readonly startedAt: string
    }
  | {
      readonly status: "none"
    }

export class GetCurrentClimbingSessionPresenter extends Service<
  GetCurrentClimbingSessionPresenter,
  {
    readonly present: (
      session: Option.Option<ActiveClimbingSession>
    ) => Effect.Effect<GetCurrentClimbingSessionViewModel>
  }
>()("@climbing/adapters/next/GetCurrentClimbingSessionPresenter") {
  static Live = Layer.succeed(GetCurrentClimbingSessionPresenter, {
    present: (session) =>
      Effect.succeed(
        Option.match(session, {
          onNone: () => ({ status: "none" }),
          onSome: (activeSession) => ({
            status: "active",
            sessionId: activeSession.id,
            startedAt: activeSession.startedAt.toISOString(),
          }),
        })
      ),
  })
}
