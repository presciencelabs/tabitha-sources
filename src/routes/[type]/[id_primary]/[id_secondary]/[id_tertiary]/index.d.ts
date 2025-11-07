
type Source = {
	type: string
	id_primary: string
	id_secondary: string
	id_tertiary: string
	phase_1_encoding: string
	semantic_encoding: string
	comments: string
	notes: string
}

type ApiSource = Source & {
	parsed_semantic_encoding: SourceEntity[]
}

type NavData = {
	previous: Reference | null
	next: Reference | null
}

type PageData = {
	source: PageSource
	nav_data: NavData
}

type PageSource = Source & {
	parsed_semantic_encoding: PageSourceEntity[]
}

type PageSourceEntity = SourceEntity & {
	id: number
	parent_id: number
	boundary_category: string
}