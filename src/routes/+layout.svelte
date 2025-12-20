<script lang="ts">
	import '@fontsource-variable/gabarito'
	import '../app.css'
	import favicon from '$lib/assets/favicon.svg'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<a href="/">Home</a>
</nav>
{@render children()}
