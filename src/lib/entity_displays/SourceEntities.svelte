<script>
	import Concept from './Concept.svelte'
	import BoundaryEnd from './BoundaryEnd.svelte'
	import BoundaryStart from './BoundaryStart.svelte'
	import Punctuation from './Punctuation.svelte'

	/** @type {SourceEntity[]} */
	export let source_entities

	/** @type {[(entity: SourceEntity) => boolean, typeof Concept][]}*/
	const component_filters = [
		[({ value }) => ['{', '[', '('].includes(value), BoundaryStart],
		[({ value }) => ['}', ']', ')'].includes(value), BoundaryEnd],
		[({ ontology_result }) => !!ontology_result, Concept],
		[() => true, Punctuation],
	]
</script>

<div>
	{#each source_entities as source_entity}
		{@const component = component_filters.find(([filter]) => filter(source_entity))?.[1]}
		<svelte:component this={component} {source_entity} />
	{/each}
</div>
