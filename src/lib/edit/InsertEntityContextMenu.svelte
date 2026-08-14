<script lang="ts">
	import { is_boundary_start } from '$lib/encoding/entity_filters'
	import ConceptDialog from '$lib/ConceptDialog.svelte'
	import { entity_clipboard } from './clipboard.svelte'
	import { DEFAULTS } from './default_entities'
	import { page } from '$app/state'
	import { fill_in_features } from '$lib/encoding/features'

	interface Props {
		source_entities: PageSourceEntity[]
		data: EntityContextMenuData
		onclose: (recalculate: boolean, id_to_select?: number) => void
	}
	let { source_entities = $bindable(), data, onclose }: Props = $props()

	let submenu = $state<string | null>(null)

	let parent = $derived.by(() => {
		const entity = source_entities[data.entity_id]
		if (!entity || entity.parent_id === -1) {
			return null
		}
		return source_entities[entity.parent_id] || null
	})

	function insert_entity(entity: PageSourceEntity) {
		const { feature_codes, features } = fill_in_features(entity, page.data.features as FeatureMap)
		entity.feature_codes = feature_codes
		entity.features = features
		
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

	function paste_entity() {
		const new_entities = entity_clipboard.paste()
		if (new_entities !== null) {
			source_entities.splice(data.entity_id, 0, ...new_entities)
			onclose(true, data.entity_id)
		} else {
			onclose(false)
		}
	}
	
	let dialog_open = $state(false)
	let new_concept_entity = $state<PageSourceEntity | null>(null)
	function open_concept_dialog(entity: PageSourceEntity) {
		new_concept_entity = entity
		dialog_open = true
	}
	function close_concept_dialog() {
		dialog_open = false

		if (new_concept_entity?.concept?.stem) {
			insert_entity(new_concept_entity)
		} else {
			onclose(false)
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card shadow-lg bg-base-100 min-w-50" style="position: fixed; left: {data.x}px; top: {data.y}px; z-index: 60;"
		onclick={e => e.stopPropagation()}
		onmouseleave={() => !dialog_open && onclose(false)}>
	<ul class="menu w-full">
		{#if entity_clipboard.has_value()}
			<li><button onclick={paste_entity}>Paste</button></li>
		{/if}
		{#if !parent || ['Clause', 'Noun Phrase', 'Adjective Phrase'].includes(parent.category)}
			<li>
				<div class="relative" onmouseenter={() => submenu = 'clause'}>
					<button>Clause</button>
					{#if submenu === 'clause'}
						<div class="card bg-base-100 min-w-50 shadow p-2 absolute left-full top-0 ml-2">
							<ul>
								{#if !parent}
									<li><button onclick={() => insert_entity(DEFAULTS.CLAUSE_MAIN)}>Main Clause</button></li>
								{:else if parent.category === 'Clause'}
									<li><button onclick={() => insert_entity(DEFAULTS.CLAUSE_ADVERBIAL)}>Adverbial Clause</button></li>
									<li><button onclick={() => insert_entity(DEFAULTS.CLAUSE_PATIENT)}>Patient (Object Complement)</button></li>
									<li><button onclick={() => insert_entity(DEFAULTS.CLAUSE_AGENT)}>Agent (Subject Complement)</button></li>
									<li><button onclick={() => insert_entity(DEFAULTS.CLAUSE_CLOSE_QUOTE)}>Closing Quotation Frame</button></li>
								{:else if parent.category === 'Noun Phrase'}
									<li><button onclick={() => insert_entity(DEFAULTS.CLAUSE_RELATIVE)}>Relative Clause</button></li>
								{:else if parent.category === 'Adjective Phrase'}
									<li><button onclick={() => insert_entity(DEFAULTS.CLAUSE_ADJ_PATIENT)}>Adjectival Complement</button></li>
								{/if}
							</ul>
						</div>
					{/if}
				</div>
			</li>
		{/if}
		{#if parent}
			<li>
				<div class="relative" onmouseenter={() => submenu = 'phrase'}>
					<button>Phrase</button>
					{#if submenu === 'phrase'}
						<div class="card bg-base-100 min-w-50 shadow p-2 absolute left-full top-0 ml-2">
							<ul>
								<li><button onclick={() => insert_entity(DEFAULTS.NOUN_PHRASE)}>Noun Phrase</button></li>
								<li><button onclick={() => insert_entity(DEFAULTS.VERB_PHRASE)}>Verb Phrase</button></li>
								{#if parent.category === 'Clause'}
									<li><button onclick={() => insert_entity(DEFAULTS.ADJECTIVE_PHRASE_PREDICATIVE)}>Adjective Phrase</button></li>
								{:else}
									<li><button onclick={() => insert_entity(DEFAULTS.ADJECTIVE_PHRASE)}>Adjective Phrase</button></li>
								{/if}
								<li><button onclick={() => insert_entity(DEFAULTS.ADVERB_PHRASE)}>Adverb Phrase</button></li>
							</ul>
						</div>
					{/if}
				</div>
			</li>
			<li>
				<div class="relative" onmouseenter={() => submenu = 'concept'}>
					<button>Concept</button>
					{#if submenu === 'concept'}
						<div class="card bg-base-100 min-w-50 shadow p-2 absolute left-full top-0 ml-2">
							<ul>
								<li><button onclick={() => open_concept_dialog(DEFAULTS.NOUN)}>Noun</button></li>
								<li><button onclick={() => open_concept_dialog(DEFAULTS.VERB)}>Verb</button></li>
								<li><button onclick={() => open_concept_dialog(DEFAULTS.ADJECTIVE)}>Adjective</button></li>
								<li><button onclick={() => open_concept_dialog(DEFAULTS.ADVERB)}>Adverb</button></li>
								<li><button onclick={() => open_concept_dialog(DEFAULTS.ADPOSITION)}>Adposition</button></li>
								<li><button onclick={() => open_concept_dialog(DEFAULTS.CONJUNCTION)}>Conjunction</button></li>
								<li><button onclick={() => open_concept_dialog(DEFAULTS.PARTICLE)}>Particle</button></li>
								<li><button onclick={() => open_concept_dialog(DEFAULTS.PHRASAL)}>Phrasal</button></li>
							</ul>
						</div>
					{/if}
				</div>
			</li>
		{/if}
	</ul>
</div>

{#if dialog_open && !!new_concept_entity?.concept}
	<ConceptDialog bind:concept={new_concept_entity.concept} onclose={close_concept_dialog} />
{/if}