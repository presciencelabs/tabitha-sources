<script>
	import { PUBLIC_ONTOLOGY_API_HOST } from '$env/static/public'

	/** @type {SourceConcept} */
	export let data

	/**
	 * @param {SourceConcept} concept
	 * @returns {Promise<OntologyResult>}
	 */
	async function fetch_ontology_data(concept) {
		const { stem, sense, part_of_speech } = concept
		const response = await fetch(`${PUBLIC_ONTOLOGY_API_HOST}/search?q=${stem}-${sense}&category=${part_of_speech}`)

		const DEFAULT_DATA = {
			...concept,
			level: '',
			gloss: '',
		}

		if (!response.ok) {
			return DEFAULT_DATA
		}

		/** @type {OntologyResult[]} */
		const results = await response.json()
		
		// Use the result that exactly matches the original stem (eg. "lot" vs "Lot")
		return results.find(result => result.stem === stem) ?? DEFAULT_DATA
	}

	/**
	 * @param {SourceConcept} concept
	 * @returns {string} fully-qualified URL to the ontology API
	 */
	function get_ontology_url_for_link({ stem, part_of_speech }) {
		return `${PUBLIC_ONTOLOGY_API_HOST}/?q=${stem}&category=${part_of_speech}`
	}
</script>

{#await fetch_ontology_data(data)}
	<span>Loading Ontology data...</span>
{:then ontology_data}
	{@const {stem, sense, level, gloss} = ontology_data}
	<table class="table table-sm table-zebra">
		<tbody>
			<tr>
				<th>Sense</th>
				<td>
					<a class="link-hover not-prose py-3" href={get_ontology_url_for_link(data)} target="_blank">
						{stem}-{sense}
					</a>
					<!--TODO include the brief gloss-->
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
			<tr>
				<th>Occurrences</th>
				<td><!--TODO--><em>Coming soon...</em></td>
			</tr>
		</tbody>
	</table>
{/await}
