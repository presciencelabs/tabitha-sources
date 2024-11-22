type Reference = {
	type: string
	id_primary: string
	id_secondary: string
	id_tertiary: string
}

type SourceEntity = {
	category: CategoryName
	value: string
} & SourceFeatures & SourceOntologyData

type SourceFeatures = {
	feature_codes: string
	features: EntityFeature[]
}

type SourceOntologyData = {
	ontology_result: OntologyResult|null
	complex_pairing: OntologyResult|null
}

type EntityFilter = (entity: SourceEntity) => boolean

type CategoryName = string
type FeatureName = string
type FeatureValue = string

type EntityFeature = {
	name: FeatureName,
	value: FeatureValue,
}

type OntologyResult = {
	stem: string
	sense: string
	part_of_speech: string
	level: string
	gloss: string
	// TODO include more info?
	// brief_gloss: string
	// categorization: string[]
}
