<script lang="ts">
	import { is_boundary_start } from '$lib/encoding/entity_filters'
	import { entity_clipboard } from './clipboard.svelte'
	import { DEFAULTS } from './default_entities'

	interface Props {
		source_entities: PageSourceEntity[]
		data: EntityContextMenuData
		onclose: (recalculate: boolean, id_to_select?: number) => void
	}
	let { source_entities = $bindable(), data, onclose }: Props = $props()

	let submenu: string | null = $state(null)

	function insert_before(entity: PageSourceEntity) {
		if (is_boundary_start(entity)) {
			const end_map: Record<string, string> = {
				'{': '}',
				'[': ']',
				'(': ')',
			}

			const end_entity: PageSourceEntity = {
				...DEFAULTS.EMPTY,
				value: end_map[entity.value],
				boundary_category: entity.boundary_category,
			}

			source_entities.splice(data.entity_id, 0, entity, end_entity)
			onclose(true, data.entity_id)

		} else {
			source_entities.splice(data.entity_id, 0, entity)
			onclose(true, data.entity_id)
		}
	}

	function paste_before() {
		const new_entities = entity_clipboard.paste()
		if (new_entities !== null) {
			source_entities.splice(data.entity_id, 0, ...new_entities)
			onclose(true, data.entity_id)
		} else {
			onclose(false)
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card shadow-lg bg-base-100 min-w-50" style="position: fixed; left: {data.x}px; top: {data.y}px; z-index: 60;"
		onclick={e => e.stopPropagation()}
		onmouseleave={() => onclose(false)}>
	<ul class="menu w-full">
		{#if entity_clipboard.has_value()}
			<li><button onclick={paste_before}>Paste</button></li>
		{/if}
		<li>
			<div class="relative" onmouseenter={() => submenu = 'clause'}>
				<button>Clause</button>
				{#if submenu === 'clause'}
					<div class="card bg-base-100 min-w-50 shadow p-2 absolute left-full top-0 ml-2">
						<ul>
							<li><button onclick={() => insert_before(DEFAULTS.CLAUSE_MAIN)}>Main Clause</button></li>
							<li><button onclick={() => insert_before(DEFAULTS.CLAUSE_SUBORDINATE)}>Subordinate Clause</button></li>
							<li><button onclick={() => insert_before(DEFAULTS.CLAUSE_RELATIVE)}>Relative Clause</button></li>
							<li><button onclick={() => insert_before(DEFAULTS.CLAUSE_PATIENT)}>Patient Clause</button></li>
						</ul>
					</div>
				{/if}
			</div>
		</li>
		<li>
			<div class="relative" onmouseenter={() => submenu = 'phrase'}>
				<button>Phrase</button>
				{#if submenu === 'phrase'}
					<div class="card bg-base-100 min-w-50 shadow p-2 absolute left-full top-0 ml-2">
						<ul>
							<li><button onclick={() => insert_before(DEFAULTS.NOUN_PHRASE)}>Noun Phrase</button></li>
							<li><button onclick={() => insert_before(DEFAULTS.VERB_PHRASE)}>Verb Phrase</button></li>
							<li><button onclick={() => insert_before(DEFAULTS.ADJECTIVE_PHRASE)}>Adjective Phrase</button></li>
							<li><button onclick={() => insert_before(DEFAULTS.ADVERB_PHRASE)}>Adverb Phrase</button></li>
						</ul>
					</div>
				{/if}
			</div>
		</li>
	</ul>
</div>