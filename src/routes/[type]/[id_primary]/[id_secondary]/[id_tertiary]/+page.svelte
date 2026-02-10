<script>
	import { Navigation, SourceEntities } from '$lib'
	import Settings from '$lib/Settings.svelte'
	import Sidebar from '$lib/sidebar/Sidebar.svelte'

	/** @type {PageData} */
	export let data
	const { source, nav_data } = data

	/** @type {PageSourceEntity|null}*/
	$: selected_entity = null
	$: sidebar_open = false

	/**
	 * @param {PageSourceEntity} entity
	 */
	function handle_select_entity(entity) {
		selected_entity = entity
		sidebar_open = true
	}

	function close_sidebar() {
		selected_entity = null
		sidebar_open = false
	}
</script>

<div class="flex items-center max-w-full pb-5">
	<Settings />
	<div class="mx-auto">
		<Navigation {nav_data} />
	</div>
	<div></div>
</div>

{#if source.parsed_semantic_encoding.length > 0}
	<div class="flex h-screen">
		<div class="transition-all duration-300 flex-[1_1_auto]" style="margin-right: {sidebar_open ? '24rem' : '0'};">
			<SourceEntities source_entities={source.parsed_semantic_encoding} {selected_entity} on_select_entity={handle_select_entity} />
		</div>
		{#if sidebar_open}
			<Sidebar {selected_entity} is_open={sidebar_open} {close_sidebar} noun_list={source.noun_list} />
		{/if}
	</div>
{:else}
	<div class="flex justify-center prose max-w-full">
		<p>No source data yet for this verse.</p>
	</div>
{/if}
