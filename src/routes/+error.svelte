<script lang="ts">
	import { page } from '$app/state'
</script>

<div class="flex justify-center prose max-w-full">
	<h2>{page.status}</h2>
</div>

<div class="flex justify-center prose max-w-full">
	<p>{page.error?.message}</p>
</div>