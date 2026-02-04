<script>
	import { SourceEntities } from '$lib'
	import Settings from '$lib/Settings.svelte'
	import Sidebar from '$lib/sidebar/Sidebar.svelte'

	/** @type {PageData} */
	export let data
	const { source, nav_data } = data
	
	/**
	 * @param {Reference} reference
	 */
	function create_reference_string({ id_primary, id_secondary, id_tertiary }) {
		return `${id_primary} ${id_secondary}:${id_tertiary}`
	}

	/**
	 * @param {Reference} reference
	 */
	function create_url({ type, id_primary, id_secondary, id_tertiary }) {
		return `/${type}/${id_primary}/${id_secondary}/${id_tertiary}`
	}

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

<Settings />

<div class="flex justify-center max-w-full pb-5 join">
	{#if nav_data.previous}
		<a class="btn btn-md join-item text-xl" href="{create_url(nav_data.previous)}" title="{create_reference_string(nav_data.previous)}" target="_self" >
			«
		</a>
	{/if}

	<!--'content-center' gets overwritten by 'prose', so use the element style to prioritize its effect-->
	<div class="join-item px-5 prose bg-base-200 border border-base-300" style="align-content: center">
		<h2>{create_reference_string(source)}</h2>
	</div>

	{#if nav_data.next}
		<a class="btn btn-md join-item text-xl" href="{create_url(nav_data.next)}" title="{create_reference_string(nav_data.next)}" target="_self">
			»
		</a>
	{/if}
</div>

{#if source.parsed_semantic_encoding.length > 0}
	<div class="flex h-screen">
		<div class="transition-all duration-300 flex-[1_1_auto]" style="margin-right: {sidebar_open ? '20rem' : '0'};">
			<SourceEntities source_entities={source.parsed_semantic_encoding} on_select_entity={handle_select_entity} />
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
