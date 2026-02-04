<script>
	import { PUBLIC_ONTOLOGY_API_HOST } from '$env/static/public'

	/** @type {SourceConcept} */
	export let data

	/**
	 * @param {SourceConcept} concept
	 * @returns {string} fully-qualified URL to the ontology API
	 */
	function get_ontology_url_for_link({ stem, part_of_speech }) {
		return `${PUBLIC_ONTOLOGY_API_HOST}/?q=${stem}&category=${part_of_speech}`
	}

	/**
	 * @param {SourceConcept} concept
	 * @returns {[string, string[]]}
	 */
	function get_category_and_usage(concept) {
		const categories = concept.ontology_data?.categories || []
		if (concept.part_of_speech === 'Noun') {
			return [categories[0], []]
		} else if (concept.part_of_speech === 'Adjective') {
			return [categories[0], categories.slice(1)]
		} else {
			return ['', categories]
		}
	}
</script>

{#if data.ontology_data}
	{@const {stem, sense, level, gloss } = data.ontology_data}
	{@const [category, usages] = get_category_and_usage(data)}
	<table class="table table-sm table-zebra">
		<tbody>
			<tr>
				<th>Sense</th>
				<td>
					<a class="link-hover not-prose py-3" href={get_ontology_url_for_link(data)} target="_blank">
						{stem}-{sense}
					</a>
				</td>
			</tr>
			<tr>
				<th>Gloss</th>
				<td>{gloss}</td>
			</tr>
			<tr>
				<th>Level</th>
				<td><span class="badge badge-outline L{level} badge-sm font-mono me-1">L{level}</span></td>
			</tr>
			{#if category.length}
				<tr>
					<th>Category</th>
					<td>{category}</td>
				</tr>
			{/if}
			{#if usages.length}
				<tr>
					<th>Usage</th>
					<td>
						<ul>
							{#each usages.filter(cat => !cat.startsWith('never')) as usage}
								<li>{usage}</li>
							{/each}
						</ul>
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
{:else}
	<span>Loading Ontology data...</span>
{/if}
