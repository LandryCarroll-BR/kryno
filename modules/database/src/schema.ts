import type { AnyPgTable } from "drizzle-orm/pg-core"

export type KrynoSchemaContribution = Record<string, AnyPgTable>

export type KrynoSchema = Readonly<Record<string, AnyPgTable>>

export const mergeSchemaContributions = (
  contributions: ReadonlyArray<KrynoSchemaContribution>
): KrynoSchema => Object.freeze(Object.assign({}, ...contributions))

const schemaContributions = [] satisfies ReadonlyArray<KrynoSchemaContribution>

export const krynoSchema = mergeSchemaContributions(schemaContributions)
