<script>
	import Punctuation from './Punctuation.svelte'

	/** @type {SourceEntity} */
	export let source_entity

	const classes = `entity-${source_entity.boundary_category} ${source_entity.value === '}' ? 'text-7xl' : ''}`
	const bracket_entity = { ...source_entity, value: ']' }
</script>

<Punctuation source_entity={bracket_entity} {classes} />
