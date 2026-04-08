<script>
	/** @type {{ data: PageSourceEntity, all_features: FeatureMap }} */
	const { data = $bindable(), all_features } = $props()

	let filtered_features = $derived(data.features.filter(({ name }) => !name.includes('Spare')))
	let category_features = $derived(all_features.get(data.category) ?? [])

	/**
	 * @param {EntityFeature} feature
	 * @returns {boolean}
	 */
	function can_be_dulled({ value }) {
		return value === 'No' || ['Un', 'No ', 'Not '].some(prefix => value.startsWith(prefix))
	}
</script>

{#if filtered_features.length === 0}
	<p>No features to show.</p>
{:else}
	<table class="table table-sm table-zebra">
		<tbody>
			{#each data.features as feature}
				{#if !feature.name.includes('Spare')}
					{@const possible_values = category_features.find(f => f.name === feature.name)?.values || []}
					<tr class='{can_be_dulled(feature) ? 'opacity-50' : ''}'>
						<td>{feature.name}</td>
						<td>
							<select bind:value={feature.value} class="select select-sm select-ghost">
								{#each possible_values as value}
									<option value={value.value}>{value.value}</option>
								{/each}
							</select>
						</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
{/if}
