<script lang="ts">
	import { PUBLIC_EDITOR_API_HOST } from '$env/static/public'
	import { SourceEntities } from '$lib'
    import Sidebar from '$lib/sidebar/Sidebar.svelte'
	import Icon from '@iconify/svelte'

	// export let data: AnalyzerData

	let phase1_text = $state('John left the big house [that John lived in]. John said to me(Paul), "You(Paul) (imp) come to me(John)." So I(Paul) was called by John.')

	let is_checked = $state(false)
	let checking = $state(false)
	let check_result: CheckerResult|null = $state(null)
	let errors_and_warnings: [CheckerMessage, CheckerToken][] = $state([])

	let analyzing = $state(false)
	let analysis_result: AnalysisResult|null = $state(null)

	function text_changed() {
		is_checked = false
	}

	async function check_text() {
		analysis_result = null
		check_result = null
		checking = true
		const response = await fetch(`${PUBLIC_EDITOR_API_HOST}/check?text=${sanitize_input(phase1_text)}`)

		const check_response: CheckerResult = await response.json()
		// console.log(check_response)
		check_response.tokens = check_response.tokens.flatMap(flatten_tokens)

		errors_and_warnings = check_response.tokens
			.flatMap(token => token.messages.map<[CheckerMessage, CheckerToken]>(msg => [msg, token]))
			.filter(([msg]) => ['error', 'warning'].includes(msg.label))

		check_result = check_response
		is_checked = true
		checking = false

		function flatten_tokens(token: CheckerToken): CheckerToken[] {
			if (token.sub_tokens.length) {
				return token.sub_tokens.flatMap(flatten_tokens)
			} else {
				return [token]
			}
		}
	}

	async function analyze_text() {
		if (!is_checked) {
			if (!confirm('The text has not been checked yet. Are you sure you want to continue?')) {
				return
			}
		}
		if (check_result && check_result.status !== 'ok') {
			if (!confirm(`The checker found some ${check_result?.status} in the text. Are you sure you want to continue?`)) {
				return
			}
		}

		check_result = null
		analyzing = true
		analysis_result = null
		const response = await fetch(`/analyzer/analyze?text=${sanitize_input(phase1_text)}`)
		analysis_result = await response.json()
		analyzing = false
	}

	function sanitize_input(text: string) {
		return text.replaceAll('\n', ' ')
	}

	let selected_entity: PageSourceEntity|null = $state(null)
	let sidebar_open = $state(false)

	function handle_select_entity(entity: PageSourceEntity) {
		selected_entity = entity
		sidebar_open = true
	}

	function close_sidebar() {
		selected_entity = null
		sidebar_open = false
	}
</script>

<form class="grid justify-items-center">
	<!-- svelte-ignore a11y_autofocus -->
	<textarea bind:value={phase1_text} rows="5" autofocus class="textarea textarea-bordered textarea-lg w-4/5"></textarea>

	<div class="mt-8">
		<div class="flex flex-row flex-wrap">
			<button onclick={ check_text } onchange={ text_changed } class="btn btn-primary" type="submit" disabled={checking}>
				Check
				<Icon icon="mdi:format-list-checks" class="h-6 w-6" />
			</button>

			<button onclick={ analyze_text } class="btn btn-secondary ml-4" type="submit" disabled={analyzing}>
				Analyze
				<Icon icon="mdi:magnify" class="h-6 w-6" />
			</button>
		</div>
	</div>
</form>

{#if check_result}
	<div>
		<p>
			{check_result.tokens.map(t => t.token).join(' ')}
			<!-- {#each check_result.tokens as token}
				{token.token}
			{/each} -->
		</p>
	</div>

	<div>
		{#each errors_and_warnings as [message, token]}
			{@const is_error = message.label === 'error'}
			<div class="alert {is_error ? 'alert-error' : 'alert-warning'} shadow-lg my-2">
				<div>
					<Icon icon={is_error ? 'mdi:close-circle' : 'mdi:alert-circle'} class="h-6 w-6" />
					<span>{message.message} <sup>(token: "{token.token}")</sup></span>
				</div>
			</div>
		{/each}
	</div>
{/if}

{#if analysis_result}
	<div class="flex h-screen">
		<div class="transition-all duration-300 flex-[1_1_auto]" style="margin-right: {sidebar_open ? '20rem' : '0'};">
			<SourceEntities source_entities={analysis_result.source_entities} on_select_entity={handle_select_entity} />
		</div>
		{#if sidebar_open}
			<Sidebar {selected_entity} is_open={sidebar_open} {close_sidebar} noun_list={analysis_result.noun_list} />
		{/if}
	</div>
{/if}
