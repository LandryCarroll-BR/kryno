import { SchemaIssue } from "effect"
import { StandardSchemaV1FailureResult } from "effect/Schema"

export const formatSchemaIssue = SchemaIssue.makeFormatterStandardSchemaV1()

export type Issues = (typeof StandardSchemaV1FailureResult.Type)["issues"]

export const fieldErrorFor = <T extends string>(
  issues: Issues,
  field: T
): string => issues.find((issue) => issue.path?.[0] === field)?.message ?? ""
