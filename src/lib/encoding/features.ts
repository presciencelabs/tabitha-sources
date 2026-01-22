import type { D1Database } from '@cloudflare/workers-types'
import { PUBLIC_TARGETS_API_HOST } from '$env/static/public'
import { WORD_ENTITY_CATEGORIES } from './lookups'

export async function get_source_features(db: D1Database): Promise<DbFeature[]> {
	const sql = 'SELECT * FROM Features'
	const { results } = await db.prepare(sql).all<DbFeature>()
	return results
}

export async function load_source_features(db: D1Database): Promise<Map<string, DbFeature[]>> {
	const results = await get_source_features(db)
	return Map.groupBy(results, ({ category, position }) => `${category}:${position}`)
}

export async function load_target_features(project: string): Promise<Map<string, DbFeature[]>|undefined> {
	if (!project.length) {
		return undefined
	}
	const response = await fetch(`${PUBLIC_TARGETS_API_HOST}/${project}/lookup/features`)
	if (!response.ok) {
		console.error(`Failed to load target features for project ${project}: ${response.status} ${response.statusText}`)
		return undefined
	}
	const results = await response.json() as TargetApiFeatureResult

	const categories = [...new Set(results.source.map(f => f.category))]
	const max_source_positions_by_category = new Map(categories.map(c => [c, Math.max(0, ...results.source.filter(f => f.category === c).map(f => f.position))]))
	const features = [
		...results.source,
		...results.lexical.map(f => ({ ...f, position: f.position + (max_source_positions_by_category.get(f.category) || 0) }))
	]
	return Map.groupBy(features, ({ category, position }) => `${category}:${position}`)
}

export function transform_features(feature_codes: string, category: string, all_features: Map<string, DbFeature[]>): SourceFeatures {
	if (!feature_codes.length) {
		return { feature_codes, features: [] }
	}

	if (WORD_ENTITY_CATEGORIES.has(category)) {
		// The first feature is the semantic complexity level, which is set during generation.
		// It is therefore meaningless at this stage and can be dropped.

		// The second feature is the lexical sense, which is treated specially elsewhere.
		// So it too can be dropped from the features.

		feature_codes = feature_codes.slice(2)
	}

	// The first feature on a Noun is the Noun List Index, and its value is just the character itself.
	// This feature is not included in the 'Features' database, and so needs to be handled separately.
	const is_noun = category === 'Noun'

	const features = [...feature_codes].map((feature_code, index) => get_feature_value(category, is_noun ? index - 1 : index, feature_code, all_features))

	if (is_noun) {
		// at this point, entity_features[0] is an empty value
		features[0] = { name: 'Noun List Index', value: feature_codes[0] }
	}

	return {
		feature_codes,
		features,
	}
}

function get_feature_value(category: CategoryName, position: number, feature_code: string, all_features: Map<string, DbFeature[]>): EntityFeature {
	// Add 1 to position because the position in the db is not zero-based like an index
	const feature_key = `${category}:${position + 1}`
	const db_features = all_features.get(feature_key)
	if (!db_features) {
		return {
			name: `Unknown feature at ${position+1}`,
			value: feature_code,
		}
	}
	const result = db_features.find(({ code }) => code === feature_code)
	return {
		name: result?.feature ?? db_features[0].feature,
		value: result?.value ?? feature_code,
	}
}