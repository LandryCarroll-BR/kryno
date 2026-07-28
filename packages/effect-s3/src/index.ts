import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig as AwsS3ClientConfig,
} from "@aws-sdk/client-s3"
import { Effect } from "effect"
import * as Redacted from "effect/Redacted"

export type S3ClientConfig = {
  readonly region: string
  readonly endpoint: string
  readonly accessKeyId: Redacted.Redacted<string>
  readonly secretAccessKey: Redacted.Redacted<string>
}

export type PutObjectInput = {
  readonly bucket: string
  readonly key: string
  readonly body: Uint8Array | string
  readonly contentType?: string
  readonly contentLength?: number
  readonly cacheControl?: string
}

export type DeleteObjectInput = {
  readonly bucket: string
  readonly key: string
}

export type S3ObjectClient = {
  readonly putObject: (input: PutObjectInput) => Effect.Effect<void, unknown>
  readonly deleteObject: (
    input: DeleteObjectInput
  ) => Effect.Effect<void, unknown>
}

export type S3ObjectClientFactory = (
  config: S3ClientConfig
) => S3ObjectClient

type SdkCommand = PutObjectCommand | DeleteObjectCommand

type SdkClient = {
  readonly send: (command: unknown) => Promise<unknown>
}

type SdkClientFactory = (config: unknown) => SdkClient

const createSdkClient: SdkClientFactory = (config) => {
  const client = new S3Client(config as AwsS3ClientConfig)

  return {
    send: (command) => client.send(command as SdkCommand),
  }
}

const awsConfigFor = (config: S3ClientConfig): AwsS3ClientConfig => ({
  region: config.region,
  endpoint: config.endpoint,
  credentials: {
    accessKeyId: Redacted.value(config.accessKeyId),
    secretAccessKey: Redacted.value(config.secretAccessKey),
  },
})

const makeWithSdkClientFactory =
  (createClient: SdkClientFactory): S3ObjectClientFactory =>
  (config) => {
    const client = createClient(awsConfigFor(config))

    return {
      putObject: Effect.fn("S3ObjectClient.putObject")(function* (input) {
        yield* Effect.tryPromise(() =>
          client.send(
            new PutObjectCommand({
              Bucket: input.bucket,
              Key: input.key,
              Body: input.body,
              ContentType: input.contentType,
              ContentLength: input.contentLength,
              CacheControl: input.cacheControl,
            })
          )
        )
      }),
      deleteObject: Effect.fn("S3ObjectClient.deleteObject")(
        function* (input) {
          yield* Effect.tryPromise(() =>
            client.send(
              new DeleteObjectCommand({
                Bucket: input.bucket,
                Key: input.key,
              })
            )
          )
        }
      ),
    }
  }

export const S3ObjectClient: {
  readonly make: S3ObjectClientFactory
  readonly makeWithSdkClientFactory: (
    createClient: SdkClientFactory
  ) => S3ObjectClientFactory
} = {
  make: makeWithSdkClientFactory(createSdkClient),
  makeWithSdkClientFactory,
}

export const R2 = {
  endpointForAccountId: (accountId: string) =>
    `https://${accountId}.r2.cloudflarestorage.com`,
}
