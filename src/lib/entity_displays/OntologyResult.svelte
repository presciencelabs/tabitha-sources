<script>
	import { PUBLIC_ONTOLOGY_API_HOST } from '$env/static/public'

	/** @type {OntologyResult} */
	export let data

	const { stem, sense, level, gloss, part_of_speech } = data

	/**
	 * @returns {string} fully-qualified URL to the ontology API
	 */
	function get_ontology_url() {
		return `${PUBLIC_ONTOLOGY_API_HOST}/?q=${stem}&category=${part_of_speech}`
	}
</script>

<div class="dropdown dropdown-hover dropdown-bottom">
	<div class="overflow-x-auto dropdown-content z-[1] text-sm p-2 shadow-xl rounded-box w-96 bg-base-200 tracking-normal">
		{gloss}
	</div>
	<div role="button">
		<span class="badge badge-lg border-base-content badge-outline px-4 py-5 text-lg {`L${level}`}">
			<a class="link not-prose" href={get_ontology_url()} target="_blank">
				{`${stem}-${sense}`}
			</a>
		</span>
	</div>
</div>
