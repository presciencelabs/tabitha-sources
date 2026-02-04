<script>
	import { PUBLIC_ONTOLOGY_API_HOST } from '$env/static/public'
	import { onMount } from 'svelte'
	import HoverPopup from './HoverPopup.svelte'

	/** @type {SourceConcept} */
	export let data

	onMount(async () => {
		const { stem, sense, part_of_speech } = data
		const response = await fetch(`${PUBLIC_ONTOLOGY_API_HOST}/search?q=${stem}-${sense}&category=${part_of_speech}`)

		const DEFAULT_DATA = {
			...data,
			level: '',
			gloss: '',
			categories: [],
		}

		if (!response.ok) {
			return DEFAULT_DATA
		}

		/** @type {OntologyResult[]} */
		const results = await response.json()
		
		// Use the result that exactly matches the original stem (eg. "lot" vs "Lot")
		const result = results.find(result => result.stem === stem) ?? DEFAULT_DATA
		data.ontology_data = result
	})

	/**
	 * @param {SourceConcept} concept
	 * @returns {string} fully-qualified URL to the ontology API
	 */
	function get_ontology_url_for_link({ stem, part_of_speech }) {
		return `${PUBLIC_ONTOLOGY_API_HOST}/?q=${stem}&category=${part_of_speech}`
	}
</script>

<HoverPopup>
	{#snippet buttonContent()}
		{#if data.sense === 'A'}
			{data.stem}
		{:else}
			{data.stem}-{data.sense}
		{/if}
	{/snippet}
	{#snippet dropdownContent()}
		<div class="text-base-content">
			{#if data.ontology_data}
				{@const {level, gloss} = data.ontology_data}
				<p>
					<span class="badge badge-outline L{level} badge-lg font-mono me-1">L{level}</span>
					<span>{gloss}</span>
				</p>
				<p class="mt-1 text-xs">
					<a class="link not-prose py-3" href={get_ontology_url_for_link(data)} target="_blank">
						View in Ontology
					</a>
				</p>
			{:else}
				<span>Loading Ontology data...</span>
			{/if}
		</div>
	{/snippet}
</HoverPopup>
