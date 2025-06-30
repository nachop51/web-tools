<script lang="ts">
	import { cn } from '$lib/utils/fns'

	let value = $state<number>()
	let inputError = $state<string | null>(null)

	let valueBase = $state<string>('10')
	let targetBase = $state<string>('2')

	function getBinary(n: number | null | undefined, targetBase: number): string {
		if (n == null) return ''

		return n.toString(targetBase)
	}

	let binary = $derived(getBinary(value, parseInt(targetBase)))

	function validateNumberInput(input: string, base: number): number | null {
		if (!input) return null

		const parsed = parseInt(input, base)
		if (isNaN(parsed)) return null

		return parsed
	}

	function handleInput(event: Event) {
		const input = (event.target as HTMLInputElement).value
		const res = validateNumberInput(input, parseInt(valueBase))

		if (res == null) {
			inputError = 'Invalid number for the selected base'
			return
		}
		inputError = null
		value = res
	}
</script>

<main class="flex gap-4 justify-center min-h-screen items-start p-8">
	<section>
		<header>
			<h2>Input number settings</h2>
		</header>

		<div class="mb-8">
			<label>
				<span>Input number</span>
				<input
					type="number"
					bind:value
					class={cn('input input-primary', inputError && 'input-error!')}
					oninput={handleInput}
				/>
			</label>
			{#if inputError}
				<p class="text-error">{inputError}</p>
			{/if}
		</div>

		<div class="flex flex-col gap-4">
			<header>
				<h3 class="text-xl">Input settings</h3>
			</header>

			<label>
				<span>Input base</span>
				<select bind:value={valueBase} class="select">
					<option value="2">Binary</option>
					<option value="8">Octal</option>
					<option value="10" selected>Decimal</option>
					<option value="16">Hexadecimal</option>
				</select>
			</label>

			<label>
				<span>Target base</span>
				<select bind:value={targetBase} class="select">
					<option value="2" selected>Binary</option>
					<option value="8">Octal</option>
					<option value="10">Decimal</option>
					<option value="16">Hexadecimal</option>
				</select>
			</label>
		</div>
	</section>

	<section>
		<header>
			<h2>Output number</h2>
		</header>

		<label>
			<span> Output number </span>
			<textarea class="textarea textarea-primary" readonly bind:value={binary}></textarea>
		</label>
	</section>
</main>

<style lang="postcss">
	@reference '../../app.css';

	section {
		@apply bg-base-200 p-8 rounded-lg border border-base-300;
	}

	section > header {
		@apply mb-6;
	}

	section > header h2 {
		@apply text-2xl font-normal;
	}
</style>
