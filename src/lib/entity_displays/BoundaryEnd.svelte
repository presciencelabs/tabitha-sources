<script>
	import Punctuation from './Punctuation.svelte'

	/** @type {SourceEntity} */
	export let source_entity

	const bracket_entity = { ...source_entity, value: ']' }
</script>

<div class="inline-flex">
	<Punctuation source_entity={bracket_entity} classes={source_entity.value === '}' ? 'text-7xl' : ''} />
</div>
