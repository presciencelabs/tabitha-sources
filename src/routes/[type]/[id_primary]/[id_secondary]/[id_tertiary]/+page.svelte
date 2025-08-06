<script>
	import { SourceEntities } from '$lib'

	/** @type {PageData} */
	export let data
	const { source, parsed_encoding, nav_data } = data
	
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
</script>

<div class="flex justify-center max-w-full">
	{#if nav_data.previous}
		<a class="btn btn-secondary btn-sm" href="{create_url(nav_data.previous)}" title="{create_reference_string(nav_data.previous)}" target="_self" >
			&lt;
		</a>
	{/if}

	<div class="prose mx-5">
		<h2>{create_reference_string(source)}</h2>
	</div>

	{#if nav_data.next}
		<a class="btn btn-secondary btn-sm" href="{create_url(nav_data.next)}" title="{create_reference_string(nav_data.next)}" target="_self">
			&gt;
		</a>
	{/if}
</div>

{#if parsed_encoding.length > 0}
	<SourceEntities source_entities={parsed_encoding} />
{:else}
	<div class="flex justify-center prose max-w-full">
		<p>No source data yet for this verse.</p>
	</div>
{/if}
