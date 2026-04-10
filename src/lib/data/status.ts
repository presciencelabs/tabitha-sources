import type { D1Database } from '@cloudflare/workers-types'

export async function get_verse_statuses(db: D1Database, references: Reference[]): Promise<StatusResult[]> {
	const sql = `
		SELECT status
		FROM Sources
		WHERE type LIKE ?
			AND id_primary LIKE ?
			AND id_secondary = ?
			AND id_tertiary = ?
	`

	const prepared_statement = db.prepare(sql)
	const bound_statements = references.map(({ type, id_primary, id_secondary, id_tertiary }) =>
		prepared_statement.bind(type, id_primary, id_secondary.toString(), id_tertiary.toString()),
	)

	const batch_result = await db.batch<{ status: SourceStatus }>(bound_statements)
	const statuses = batch_result.map(r => r.results[0]?.status || 'Not Started')

	const results = references.map((reference, i) => ({
		reference,
		status: statuses[i],
	}))
	return results
}