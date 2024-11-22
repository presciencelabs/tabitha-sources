<script>
	/** @type {SourceEntity} */
	export let source_entity
	export let classes = ''

	const { category, feature_codes, features } = source_entity

	const last_feature_to_display = features.findLastIndex(({ name }) => !name.startsWith('Spare'))

	const features_to_display = features.slice(0, last_feature_to_display + 1)
	const feature_codes_to_display = feature_codes.slice(0, last_feature_to_display + 1)

	const CATEGORY_ABBREVIATIONS = new Map([
		['Noun', 'N'],
		['Verb', 'V'],
		['Adjective', 'Adj'],
		['Adverb', 'Adv'],
		['Adposition', 'Adp'],
		['Conjunction', 'Con'],
		['Phrasal', 'Phr'],
		['Particle', 'Par'],
		['Noun Phrase', 'NP'],
		['Verb Phrase', 'VP'],
		['Adjective Phrase', 'AdjP'],
		['Adverb Phrase', 'AdvP'],
		['Clause', 'C'],
		['Paragraph', 'R'],
		['Section', 'E'],
		['period', 'period'],
	])

	/**
	 * @param {EntityFeature} feature
	 * @returns {boolean}
	 */
	function can_be_dulled({ value }) {
		return value === 'No' || ['Un', 'No ', 'Not '].some(prefix => value.startsWith(prefix))
	}
</script>

{#if features.length}
	<div class="dropdown dropdown-hover dropdown-bottom {classes}">
		<div class="overflow-x-auto dropdown-content z-[1] text-sm p-2 shadow-xl rounded-box w-96 bg-base-200 tracking-normal">
			<ul>
				<li class='font-semibold'>{category}</li>
				{#each features_to_display as feature}
					<li class='{can_be_dulled(feature) ? 'opacity-50' : ''}'>
						<span class='font-semibold'>{feature.name}</span> = {feature.value}
					</li>
				{/each}
			</ul>
		</div>
		<div role="button">
			<span class="text-sm tracking-tight">
				{CATEGORY_ABBREVIATIONS.get(category) ?? ''}-{feature_codes_to_display}
			</span>
		</div>
	</div>
{/if}
