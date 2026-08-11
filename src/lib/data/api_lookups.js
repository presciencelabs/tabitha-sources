import { PUBLIC_ONTOLOGY_API_HOST } from '$env/static/public'

/**
 * Fetch ontology definition for a single concept without mutating the input object
 * @param {SourceConcept} concept
 * @returns {Promise<OntologyResult>}
 */
export async function fetch_concept_ontology_data(concept) {
	if (concept.ontology_data) {
		return concept.ontology_data
	}

	/** @type {OntologyResult} */
	const fallback = {
		...concept,
		level: '',
		gloss: '',
		categories: [],
		status: 'in ontology',
	}

	try {
		const { stem, sense, part_of_speech } = concept
		const response = await fetch(`${PUBLIC_ONTOLOGY_API_HOST}/search?q=${stem}-${sense}&category=${part_of_speech}`)

		if (!response.ok) {
			return fallback
		}

		/** @type {OntologyResult[]} */
		const results = await response.json()
		return results.find(r => r.stem === stem) ?? fallback
	} catch {
		return fallback
	}
}

/** @type {Map<string, OntologyResult[]>} */
const all_senses_cache = new Map()

/** @type {Map<string, OntologyResult[]>} */
const category_cache = new Map()

/**
 * @param {string} part_of_speech
 * @returns {Promise<OntologyResult[]>}
 */
export async function fetch_all_concepts_for_part_of_speech(part_of_speech) {
	if (category_cache.has(part_of_speech)) {
		return category_cache.get(part_of_speech) ?? []
	}

	try {
		const response = await fetch(`${PUBLIC_ONTOLOGY_API_HOST}/search?q=*&category=${part_of_speech}`)
		if (!response.ok) return []

		/** @type {OntologyResult[]} */
		const results = await response.json()
		const filtered = results.filter(result => result.status === 'in ontology')
		category_cache.set(part_of_speech, filtered)
		return filtered
	} catch {
		return []
	}
}

/**
 * @param {SourceConcept} concept
 * @returns {Promise<OntologyResult[]>}
 */
export async function fetch_ontology_data_for_all_senses(concept) {
	const { stem, part_of_speech } = concept
	const cache_key = `${stem}:${part_of_speech}`

	if (all_senses_cache.has(cache_key)) {
		return all_senses_cache.get(cache_key) ?? []
	}

	try {
		const response = await fetch(`${PUBLIC_ONTOLOGY_API_HOST}/search?q=${stem}&category=${part_of_speech}`)
		if (!response.ok) return []

		/** @type {OntologyResult[]} */
		const results = await response.json()
		const filtered = results.filter(result => result.stem === stem && result.status === 'in ontology')
		all_senses_cache.set(cache_key, filtered)
		return filtered
	} catch {
		return []
	}
}