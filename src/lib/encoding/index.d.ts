type SourceEntity = {
	category: CategoryName
	category_abbr: string
	value: string
} & SourceFeatures & SourceConceptData

type SourceFeatures = {
	feature_codes: string
	features: EntityFeature[]
}

type SourceConceptData = {
	concept: SourceConcept|null
	pairing_concept: SourceConcept|null
}

type SourceConcept = {
	stem: string
	sense: string
	part_of_speech: string
}

type EntityFilter = (entity: SourceEntity) => boolean

type CategoryName = string
type FeatureName = string
type FeatureValue = string

type DbFeature = {
	category: CategoryName
	position: number
	code: string
	feature: FeatureName
	value: FeatureValue
	example?: string
}

type EntityFeature = {
	name: FeatureName,
	value: FeatureValue,
}

type TargetApiFeature = DbFeature
type TargetApiFeatureResult = {
	source: TargetApiFeature[]
	lexical: TargetApiFeature[]
}

type ApiFeature = DbFeature

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

type TargetEntity = {
	category: CategoryName
	category_abbr: string
	value: string
	concept: SourceConcept|null
	target: string
} & SourceFeatures

// This is a combination of SourceEntity and TargetEntity
type EncodingEntity = {
	category: string
	category_abbr: string
	value: string
	concept: SourceConcept|null
	pairing_concept?: SourceConcept|null
	target?: string
} & SourceFeatures

type SimpleEncodingEntity = {
	category: string
	concept?: string
	pairing_concept?: string
	target?: string
	features?: EntityFeature[]
	children?: SimpleEncodingEntity[]
}
