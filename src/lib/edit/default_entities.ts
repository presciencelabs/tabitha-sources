
const defaults: PageSourceEntity = {
	category: '',
	category_abbr: '',
	value: '',
	features: [],
	feature_codes: '',
	noun_list_index: null,
	concept: null,
	pairing_concept: null,
	pairing_type: '',
	id: -1,
	parent_id: -1,
	boundary_category: '',
}

const default_main_clause: PageSourceEntity = {
	...defaults,
	category: 'Clause',
	category_abbr: 'C',
	value: '{',
	features: [
		{ name: 'Type', value: 'Independent' },
	],
	boundary_category: 'C',
}

const default_subordinate_clause: PageSourceEntity = {
	...defaults,
	category: 'Clause',
	category_abbr: 'C',
	value: '[',
	features: [
		{ name: 'Type', value: 'Event Modifier (Adverbial Clause)' },
	],
}

const default_relative_clause: PageSourceEntity = {
	...default_subordinate_clause,
	features: [
		{ name: 'Type', value: 'Restrictive Thing Modifier (Relative Clause)' },
	],
}

const default_patient_clause: PageSourceEntity = {
	...default_subordinate_clause,
	features: [
		{ name: 'Type', value: 'Patient (Object Complement)' },
	],
}

const default_np: PageSourceEntity = {
	...defaults,
	category: 'Noun Phrase',
	category_abbr: 'NP',
	value: '(',
	feature_codes: 'N',	// for 'Not Applicable'
	features: [
		{ name: 'Semantic Role', value: 'Not Applicable' },
	],
	boundary_category: 'NP',
}

const default_vp: PageSourceEntity = {
	...defaults,
	category: 'Verb Phrase',
	category_abbr: 'VP',
	value: '(',
	boundary_category: 'NP',
}

const default_adjp: PageSourceEntity = {
	...defaults,
	category: 'Adjective Phrase',
	category_abbr: 'AdjP',
	value: '(',
	boundary_category: 'NP',
}

const default_advp: PageSourceEntity = {
	...defaults,
	category: 'Adverb Phrase',
	category_abbr: 'AdvP',
	value: '(',
	boundary_category: 'NP',
}

export const DEFAULTS = {
	EMPTY: defaults,
	CLAUSE_MAIN: default_main_clause,
	CLAUSE_SUBORDINATE: default_subordinate_clause,
	CLAUSE_RELATIVE: default_relative_clause,
	CLAUSE_PATIENT: default_patient_clause,
	NOUN_PHRASE: default_np,
	VERB_PHRASE: default_vp,
	ADJECTIVE_PHRASE: default_adjp,
	ADVERB_PHRASE: default_advp,
}