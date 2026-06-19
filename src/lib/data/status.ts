import type { D1Database } from '@cloudflare/workers-types'
import { get_primary_ids } from './read'

export async function get_all_book_statuses(db: D1Database, type: string): Promise<StatusResult[]> {
	const primary_ids = await get_primary_ids(db, type)
	return await Promise.all(primary_ids.map(({ id_primary }) => get_book_status(db, { type, id_primary })))
}

export async function get_book_status(db: D1Database, reference: StatusRequestReference): Promise<StatusResult> {
	const sql = `
		SELECT status
		FROM ChapterStatus
		WHERE type LIKE ?
			AND id_primary LIKE ?
	`

	const { results } = await db.prepare(sql).bind(reference.type, reference.id_primary).all<{ status: SourceStatus }>()
	const chapter_statuses = results.map(({ status }) => status)

	const status_mapping: [(statuses: SourceStatus[]) => boolean, SourceStatus][] = [
		[statuses => statuses.every(s => s === 'Ready to Translate'), 'Ready to Translate'],
		[statuses => statuses.every(s => s === 'Not Started'), 'Not Started'],
		[statuses => statuses.some(s => s === 'Not Started'), 'Initial Analysis in Progress'],
		[statuses => statuses.some(s => s === 'Initial Analysis in Progress'), 'Initial Analysis in Progress'],
		[statuses => statuses.some(s => s === 'Final Review in Progress'), 'Final Review in Progress'],
		[() => true, 'Initial Analysis Complete'],
	]

	return {
		reference,
		status: chapter_statuses.length ? status_mapping.find(([predicate]) => predicate(chapter_statuses))![1] : 'Not Started',
	}
}

export async function get_chapter_status(db: D1Database, reference: StatusRequestReference): Promise<StatusResult> {
	const sql = `
		SELECT status
		FROM ChapterStatus
		WHERE type LIKE ?
			AND id_primary LIKE ?
			AND id_secondary = ?
	`

	const prepared_statement = db.prepare(sql).bind(reference.type, reference.id_primary, reference.id_secondary!.toString())
	const result = await prepared_statement.first<{ status: SourceStatus }>()
	
	return {
		reference,
		status: result?.status ?? 'Not Started',
	}
}

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