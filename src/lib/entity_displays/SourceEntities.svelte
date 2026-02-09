<script>
	import Concept from './Concept.svelte'
	import BoundaryEnd from './BoundaryEnd.svelte'
	import BoundaryStart from './BoundaryStart.svelte'
	import Punctuation from './Punctuation.svelte'

	/** @type {PageSourceEntity[]} */
	export let source_entities

	/** @type {(entity: PageSourceEntity) => void}*/
	export let on_select_entity = () => {}

	/** @type {HTMLElement[]} */
	let entity_divs = []

	const main_clauses = source_entities.reduce(clause_reducer, [])

	/**
	 * @param {PageSourceEntity[][]} clauses
	 * @param {PageSourceEntity} source_entity
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

	/** @type {[(entity: PageSourceEntity) => boolean, typeof Concept][]}*/
	const component_filters = [
		[is_boundary_start, BoundaryStart],
		[is_boundary_end, BoundaryEnd],
		[({ concept }) => !!concept, Concept],
		[() => true, Punctuation],
	]

	/**
	 * @param {number} i
	 */
	function entity_mouseover(i) {
		const [start, end_inclusive] = get_parent_range(i)
		add_highlight(start, end_inclusive)
	}

	/**
	 * @param {number} start
	 * @param {number} end_inclusive
	*/
	function add_highlight(start, end_inclusive) {
		entity_divs.slice(start, end_inclusive+1).forEach(elem => elem.classList.add('bg-base-300'))
	}

	function clear_highlight() {
		entity_divs.forEach(div => div.classList.remove('bg-base-300'))
	}

	/**
	 * @param {number} i
	 */
	function entity_focus(i) {
		const entity = source_entities[i]
		if (is_boundary_end(entity)) {
			// focus on the boundary start instead
			on_select_entity(source_entities[entity.parent_id])
		} else {
			on_select_entity(entity)
		}
		
	}

	/**
	 * @param {number} i
	 * @returns {[number, number]}
	 */
	function get_parent_range(i) {
		const entity = source_entities[i]
		if (is_boundary_start(entity)) {
			const last_id = source_entities.findLastIndex(e => e.parent_id === i)
			return [i, last_id]

		} else if (is_boundary_end(entity)) {
			return [entity.parent_id, entity.id]

		} else if (entity.parent_id >= 0) {
			const last_id = source_entities.findLastIndex(e => e.parent_id === entity.parent_id)
			return [entity.parent_id, last_id]

		} else {
			return [i, i]
		}
	}
</script>

{#each main_clauses as main_clause}
	<div class="inline-flex flex-wrap py-3">
		{#each main_clause as source_entity}
			{@const i = source_entity.id}
			{@const component = component_filters.find(([filter]) => filter(source_entity))?.[1]}
			<div bind:this={entity_divs[i]} role="button" tabindex="0" class="content-center h-20 entity-{source_entity.boundary_category}"
					on:mouseover={() => entity_mouseover(i)}
					on:focus={() => entity_focus(i)}
					on:mouseout={clear_highlight}
					on:blur={() => {}} >
				<svelte:component this={component} {source_entity} />
			</div>
		{/each}
	</div>
{/each}
