<script lang="ts">
	import Features from './Features.svelte'
	import OntologyResult from './OntologyResult.svelte'

	export let source_entity: SourceEntity
	const ontology_data = source_entity.ontology_result!	// will always be non-null at this point
</script>

<span class="inline-flex border-solid border-base-content px-3 py-6 text-lg tracking-normal">
	<table>
		<tr>
			<td>
				<OntologyResult data={ontology_data} />
			</td>
			{#if source_entity.complex_pairing !== null}
				<td>/</td>
				<td><OntologyResult data={source_entity.complex_pairing} /></td>
			{/if}
		</tr>
		<tr><td>
			<Features {source_entity} classes={'ps-2'} />
		</td></tr>
	</table>
</span>
