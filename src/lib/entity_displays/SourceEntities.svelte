<script>
	import Concept from './Concept.svelte'
	import BoundaryEnd from './BoundaryEnd.svelte'
	import BoundaryStart from './BoundaryStart.svelte'
	import Punctuation from './Punctuation.svelte'
	import { onMount } from 'svelte'

	/** @type {SourceEntity[]} */
	export let source_entities

	const main_clauses = source_entities.reduce(clause_reducer, [])

	/**
	 * @param {SourceEntity[][]} clauses
	 * @param {SourceEntity} source_entity
	 */
	function clause_reducer(clauses, source_entity) {
		// Split the clauses so they're each on their own line.
		// A paragraph marking should be put on the same line as the clause that follows.
		if (source_entity.value === '|') {
			clauses.push([])
		} else if (source_entity.value === '{' && clauses.at(-1)?.at(-1)?.value !== '|') {
			clauses.push([])
		}
		clauses.at(-1)?.push(source_entity)
		return clauses
	}

	/** @type {[(entity: SourceEntity) => boolean, typeof Concept][]}*/
	const component_filters = [
		[({ value }) => ['{', '[', '('].includes(value), BoundaryStart],
		[({ value }) => ['}', ']', ')'].includes(value), BoundaryEnd],
		[({ concept }) => !!concept, Concept],
		[() => true, Punctuation],
	]

	onMount(() => {
		const all_entity_elems = document.querySelectorAll('.source-entity')

		function clear_highlight() {
			all_entity_elems.forEach(ed => ed.classList.remove('bg-base-300'))
		}
		/**
		 * @param {Element} elem
		*/
		function add_highlight(elem) {
			elem.classList.add('bg-base-300')
		}

		for (const entity_elem of all_entity_elems) {
			entity_elem.addEventListener('mouseover', () => {
				if (entity_elem.classList.contains('boundary-entity')) {
					const id = entity_elem.getAttribute('data-boundary-id')
					const child_elems = document.querySelectorAll(`[data-parent-ids~="${id}"], [data-boundary-id="${id}"]`)
					child_elems.forEach(add_highlight)
				} else {
					add_highlight(entity_elem)
				}
			})
			entity_elem.addEventListener('mouseout', clear_highlight)
		}
	})
</script>

{#each main_clauses as main_clause}
	<div class="inline-flex flex-wrap py-3">
		{#each main_clause as source_entity}
			{@const is_boundary = source_entity.boundary_id >= 0}
			{@const boundary_id = is_boundary ? source_entity.boundary_id : ''}
			{@const parent_ids = source_entity.parent_ids.join(' ')}
			{@const component = component_filters.find(([filter]) => filter(source_entity))?.[1]}

			<div class="content-center h-20 source-entity {is_boundary ? 'boundary-entity' : ''}" data-boundary-id={boundary_id} data-parent-ids={parent_ids}>
				<svelte:component this={component} {source_entity} />
			</div>
		{/each}
	</div>
{/each}
