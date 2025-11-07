<script>
	const { dropdownContent, buttonContent } = $props()
</script>

<div class="dropdown dropdown-hover dropdown-bottom">
	<div class="overflow-x-auto dropdown-content z-[1] text-sm p-2 shadow-xl rounded-box w-96 text-base-content bg-base-100 tracking-normal">
		{@render dropdownContent()}
	</div>
	<div role="button">
		{@render buttonContent()}
	</div>
</div>
