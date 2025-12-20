<script lang="ts">
</script>

<main>
	<section>
		<header>
			<h2>Numbers</h2>
		</header>

		<article>
			<h3>Convert numbers between bases</h3>

			<div class="flex flex-col">
				<a href="/numbers?valueBase=2&targetBase=10"> Binary to Decimal Converter </a>
				<a href="/numbers?valueBase=8&targetBase=16"> Octal to Hexadecimal Converter </a>

				<a href="/numbers?valueBase=16&targetBase=8"> Hexadecimal to Octal Converter </a>
				<a href="/numbers?valueBase=10&targetBase=2"> Decimal to Binary Converter </a>
				<a href="/numbers?valueBase=custom&targetBase=custom"> Custom Base Converter </a>
			</div>
		</article>
	</section>
</main>

<style>
	@reference '../app.css';

	main {
		@apply min-h-screen p-8;
	}

	main > section > header {
		@apply text-2xl font-semibold mb-4;
	}

	article h3 {
		@apply text-xl font-medium mb-2;
	}
</style>
