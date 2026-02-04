<script>
	import Punctuation from '../entity_displays/Punctuation.svelte'

	/** @type {PageSourceEntity} */
	export let selected_entity

	/**
	 * @param {PageSourceEntity} entity
	 */
	function is_boundary_start({ value }) {
		return ['{', '[', '('].includes(value)
	}

	/**
	 * @param {PageSourceEntity} entity
	 */
	function is_boundary_end({ value }) {
		return ['}', ']', ')'].includes(value)
	}
</script>

<div class="entity-{selected_entity.boundary_category}">
	{#if is_boundary_start(selected_entity)}
		<div class="inline-flex items-center pe-2">
			<Punctuation source_entity={{ ...selected_entity, value: '[' }} classes={selected_entity.value === '{' ? 'text-7xl' : ''} />
			<span class="font-semibold -ms-1">{selected_entity.category_abbr}</span>
		</div>
	{:else if is_boundary_end(selected_entity)}
		<div class="inline-flex">
			<Punctuation source_entity={{ ...selected_entity, value: ']' }} classes={selected_entity.value === '}' ? 'text-7xl' : ''} />
		</div>
	{:else if selected_entity.concept !== null}
		<div class="badge badge-lg rounded-full border-base-content badge-outline mx-1 py-5 text-md entity-{selected_entity.category_abbr}">
			<span class="pe-2 py-4">
				{selected_entity.category_abbr}
				{#if selected_entity.category === 'Noun'}
					<sub class="-bottom-1.5 -left-1 italic">{selected_entity.feature_codes[0]}</sub>
				{/if}
			</span>

			<div class="py-4">
				{#if selected_entity.pairing_concept === null}
					<span>{selected_entity.concept.stem}-{selected_entity.concept.sense}</span>
				{:else}
					<div class="join">
						<span>{selected_entity.concept.stem}-{selected_entity.concept.sense}</span>
						<span class="px-1">{selected_entity.pairing_type}</span>
						<span>{selected_entity.pairing_concept.stem}-{selected_entity.pairing_concept.sense}</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>