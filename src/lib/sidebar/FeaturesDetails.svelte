<script>
	/** @type {PageSourceEntity} */
	export let data

	const filtered_features = data.features.filter(({ name }) => !name.includes('Spare'))
</script>

{#if filtered_features.length === 0}
	<p>No features to show.</p>
{:else}
	<table class="table table-sm table-zebra">
		<tbody>
			{#each filtered_features as feature}
				<tr>
					<td>{feature.name}</td>
					<td>{feature.value}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
