import { PUBLIC_ONTOLOGY_API_HOST } from '$env/static/public'

export async function simplify_encoding(entities: SourceEntity[]): Promise<SimpleEncodingEntity[]> {
	const cleaned = await clean_encoding(entities)
	const structured = structure_encoding(cleaned)
	return structured
}

async function clean_encoding(entities: SourceEntity[]): Promise<SimpleEncodingEntity[]> {
	const end_categories_map: Record<string, string> = {
		')': 'Phrase End',
		']': 'Clause End',
		'}': 'Clause Sentence End',
	}
	return Promise.all(entities.map(async entity => {
		const entries: [string, any][] = []
		entries.push(['category', end_categories_map[entity.value] ?? entity.category])
		if (entity.concept) {
			const concept = `${entity.concept.stem}-${entity.concept.sense}`
			entries.push(['concept', concept])
			const gloss = await fetch_concept_gloss(concept, entity.category)
			if (gloss.length) {
				entries.push(['concept_gloss', gloss])
			}
		}
		if (entity.pairing_concept) {
			entries.push(['pairing_concept', `${entity.pairing_concept.stem}-${entity.pairing_concept.sense}`])
		}
		const simple_features = simplify_features(entity.features, entity.category)
		if (Object.keys(simple_features).length) {
			entries.push(['features', simple_features])
		}
		return Object.fromEntries(entries) as SimpleEncodingEntity
	}))
}

async function fetch_concept_gloss(concept: string, category: string): Promise<string> {
	const response = await fetch(`${PUBLIC_ONTOLOGY_API_HOST}/search?q=${concept}&category=${category}`)
	if (!response.ok) {
		return ''
	}
	const result: OntologyResult[] = await response.json()
	return result.length ? result[0].gloss : ''
}

type RemovableFeature = [string|null, string|null, string|null]
function simplify_features(features: EntityFeature[], category: string): Record<string, string> {
	const values_to_remove: RemovableFeature[] = [
		[null, null, 'Not Applicable'],
		[null, null, 'Unspecified'],
		[null, 'Sequence', null],
		[null, 'Implicit', 'No'],
		['Adjective', 'Degree', 'No Degree'],
		['Adverb', 'Degree', 'No Degree'],
		['Verb', 'Adjective Degree', 'No Degree'],
		['Noun', 'Surface Realization', 'Noun'],
		['Noun', 'Polarity', 'Affirmative'],
		['Verb', 'Polarity', 'Affirmative'],
		['Verb', 'Aspect', 'Unmarked'],
		['Verb', 'Mood', 'Indicative'],
		['Clause', 'Topic NP', 'Most Agent-like'],
		['Clause', 'Illocutionary Force', 'Declarative'],
		['Clause', 'Discourse Genre', 'Climactic Narrative Story'],
		['Clause', 'Salience Band', 'Primary Storyline'],
		['Noun Phrase', 'Relativized', 'No'],
	].filter(([cat]) => cat === null || cat === category) as RemovableFeature[]

	const feature_entries = features.map(({ name, value }) => [name, value])
		.filter(([name]) => name.length)
		.filter(([name, value]) => 
			!values_to_remove.some(([_, rm_name, rm_value]) => (rm_name === null || rm_name === name) && (rm_value === null || rm_value === value))
		)
	return Object.fromEntries(feature_entries)
}

function structure_encoding(encoding: SimpleEncodingEntity[]): SimpleEncodingEntity[] {
	const structured: SimpleEncodingEntity[] = []
	const parent_stack: SimpleEncodingEntity[] = []

	const end_categories = ['Phrase End', 'Clause End', 'Clause Sentence End']
	const start_categories = ['Clause', 'Noun Phrase', 'Verb Phrase', 'Adjective Phrase', 'Adverb Phrase']
	for (const entity of encoding) {
		if (end_categories.includes(entity.category)) {
			const parent = parent_stack.pop()!!
			if (!parent_stack.length) {
				structured.push(parent)
			}
		} else if (parent_stack.length) {
			parent_stack.at(-1)!!.children?.push(entity)
		}

		if (start_categories.includes(entity.category)) {
			entity.children = []
			parent_stack.push(entity)
		}
	}
	return structured
}