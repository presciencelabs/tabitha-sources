<script lang="ts">
	import { is_boundary_start } from '$lib/encoding/entity_filters'

	interface Props {
		source_entities: PageSourceEntity[]
		data: EntityContextMenuData
		onclose: (recalculate: boolean) => void
	}
	let { source_entities = $bindable(), data, onclose }: Props = $props()

	let entity = $derived(source_entities[data.entity_id])

	function delete_entity() {
		source_entities.splice(data.entity_id, 1)
		onclose(true)
	}

	function delete_entity_and_children() {
		const entity_id = data.entity_id
		const last_child_index = source_entities.findLastIndex(entity => entity.parent_id === entity_id)
		source_entities.splice(entity_id, last_child_index - entity_id + 1)
		onclose(true)
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card shadow-lg bg-base-100 min-w-50" style="position: fixed; left: {data.x}px; top: {data.y}px; z-index: 60;"
		onclick={e => e.stopPropagation()}
		onmouseleave={() => onclose(false)}>
	<ul class="menu w-full">
		<li><button onclick={delete_entity}>Delete</button></li>
		{#if is_boundary_start(entity)}
			<li><button onclick={delete_entity_and_children}>Delete whole {entity.category}</button></li>
		{/if}
	</ul>
</div>