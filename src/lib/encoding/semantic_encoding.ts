import { PUBLIC_ONTOLOGY_API_HOST } from '$env/static/public'
import type { D1Database } from '@cloudflare/workers-types'

const CATEGORY_NAME_LOOKUP = new Map([
	['N', 'Noun'],
	['V', 'Verb'],
	['A', 'Adjective'],
	['a', 'Adverb'],
	['P', 'Adposition'],
	['C', 'Conjunction'],
	['p', 'Phrasal'],
	['r', 'Particle'],
	['n', 'Noun Phrase'],
	['v', 'Verb Phrase'],
	['j', 'Adjective Phrase'],
	['d', 'Adverb Phrase'],
	['c', 'Clause'],
	['R', 'Paragraph'],
	['E', 'Section'],
	['.', 'period'],
])

const WORD_ENTITY_CATEGORIES = new Set(['Noun', 'Verb', 'Adjective', 'Adverb', 'Adposition', 'Conjunction', 'Phrasal', 'Particle'])

/**
 * The phase_2_encoding looks something like:
 * ~\wd ~\tg c-IDp00NNNNNNNNNNNNN.............~\lu {~\wd ~\tg C-1A.....~\lu then~\wd ~\tg n-SAN.N........~\lu (...
 *
 * If present, the first character of the features indicates the 'entity' type.
 * This could be a clause/phrase boundary, part of speech, or even certain punctuation.
 *
 * '{' and '}' indicate a main clause boundary
 * '[' and ']' indicate a subordinate clause boundary
 * '(' and ')' indicate a phrase boundary
 *
 * Examples:
 * ~\wd ~\tg c-IDp00NNNNNNNNNNNNN.............~\lu {    => { type: 'c', label: 'Clause', features: 'IDp00NNNNNNNNNNNNN.............', value: '{' }
 * ~\wd ~\tg N-1A1SDAnK3NN........~\lu God  => { type: 'N', label: 'Noun', features: '1A1SDAnK3NN........', value: 'God' }
 * ~\wd ~\tg v-S.....~\lu (     => { type: 'v', label: 'VP', features: 'S.....', value: '(' }
 * ~\wd ~\tg C-1A.....~\lu then => { type: 'C', label: 'Conjunction', features: '1A.....', value: 'then' }
 * ~\wd ~\tg ~\lu )             => { type: '', label: '', features: '', value: ')' }
 * ~\wd ~\tg .-~\lu .           => { type: '.', label: 'period', features: '', value: '.' }
 * ~\\wd ~\\tg R-~\\lu |        => { type: 'R', label: 'Paragraph', features: '', value: '|' }
 */
export async function transform_semantic_encoding(semantic_encoding: string, db: D1Database): Promise<SourceEntity[]> {
	const EXTRACT_TYPE_FEATURES_VALUES = /~\\wd ~\\tg (?:([\w.])-([^~]*))?~\\lu ([^~]+)/g
	const entities = [...semantic_encoding.matchAll(EXTRACT_TYPE_FEATURES_VALUES)]

	return await Promise.all(entities.map(decode_entity))

	// ['~\wd ~\tg N-1A1SDAnK3NN........~\lu God', 'N', '1A1SDAnK3NN........', 'God']
	async function decode_entity(entity_match: RegExpMatchArray): Promise<SourceEntity> {
		const category_code = entity_match[1] ?? ''
		const feature_codes = entity_match[2] ?? ''
		const value = entity_match[3]

		const category = CATEGORY_NAME_LOOKUP.get(category_code) || ''
		const features = await transform_features(feature_codes, category_code, db)
		const ontology_data = await get_concept_data(value, category, feature_codes)

		return {
			category,
			value,
			...features,
			...ontology_data,
		}
	}
}

async function transform_features(feature_codes: string, category_code: string, db: D1Database): Promise<SourceFeatures> {
	if (!feature_codes.length) {
		return { feature_codes, features: [] }
	}

	const category = CATEGORY_NAME_LOOKUP.get(category_code) ?? ''

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

	const features = await Promise.all(
		Array.from(feature_codes).map((feature_code, index) => get_feature_value(category, is_noun ? index - 1 : index, feature_code, db))
	)
	
	if (is_noun) {
		// at this point, entity_features[0] is an empty value
		features[0] = { name: 'Noun List Index', value: feature_codes[0] }
	}

	return {
		feature_codes,
		features,
	}
}

async function get_feature_value(category: CategoryName, position: number, feature_code: string, db: D1Database): Promise<EntityFeature> {
	const sql = `
		SELECT feature AS name, value
		FROM Features
		WHERE category = ? AND position = ? AND code = ?
	`

	// Add 1 to position because the position in the db is not zero-based like an index
	const result = await db.prepare(sql).bind(category, position + 1, feature_code).first<EntityFeature>()

	return result ?? { name: '', value: '' }
}

async function get_concept_data(value: string, category: string, feature_codes: string): Promise<SourceConceptData> {
	if (!WORD_ENTITY_CATEGORIES.has(category)) {
		return { concept: null, pairing_concept: null }
	}

	const sense = feature_codes[1]

	// follower/Adisciple -> follower / disciple-A
	const EXTRACT_PAIRING = /^([^/]+)\/([A-Z])(.+)$/
	const match = value.match(EXTRACT_PAIRING)
	if (match) {
		const [, stem, pairing_sense, pairing_stem] = match
		return {
			concept: {
				stem,
				sense,
				part_of_speech: category,
			},
			pairing_concept: {
				stem: pairing_stem,
				sense: pairing_sense,
				part_of_speech: category,
			},
		}
	}

	return {
		concept: {
			stem: value,
			sense,
			part_of_speech: category,
		},
		pairing_concept: null,
	}
}
