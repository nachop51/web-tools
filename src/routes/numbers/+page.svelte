<script lang="ts">
	import { page } from '$app/state'
	import { cn } from '$lib/utils/fns'
	import { computeOutputNumber, NumberMode, validateNumberBase } from '$lib/utils/numbers/converter'
	import { SvelteURLSearchParams } from 'svelte/reactivity'

	let value = $state<number>()
	let inputError = $state<string | null>(null)

	const options = [
		{
			title: 'Integer only',
			description: 'Accepts any integer numbers.',
			mode: NumberMode.INT
		},
		{
			title: '32-bit Integer only',
			description: 'Only 32-bit integer numbers.',
			mode: NumberMode.INT32
		},
		{
			title: 'Float 32 (Decimal & Binary)',
			description: 'Floats with single precision.',
			mode: NumberMode.FLOAT32
		},
		{
			title: 'Float 64 (Decimal & Binary)',
			description: 'Double precision floats.',
			mode: NumberMode.FLOAT64
		}
	]

	const commonOptions = [
		{ label: 'Binary', value: '2' },
		{ label: 'Octal', value: '8' },
		{ label: 'Decimal', value: '10' },
		{ label: 'Hexadecimal', value: '16' },
		{ label: 'Custom', value: 'custom' }
	]

	const urlParams = new SvelteURLSearchParams(page.url.searchParams)

	function parseSelectedParam(param: string | null, defaultValue: string): string {
		if (!param) return defaultValue

		if (commonOptions.some((option) => option.value === param)) {
			return param
		}

		return 'custom'
	}

	function parseValueParam(param: string | null, defaultValue: number): number {
		if (!param) return defaultValue

		const parsed = Number(param)

		if (isNaN(parsed)) return defaultValue

		return parsed
	}

	let selectedValueBase = $state<string>(parseSelectedParam(urlParams.get('valueBase'), '10'))
	let selectedTargetBase = $state<string>(parseSelectedParam(urlParams.get('targetBase'), '2'))

	let valueBase = $state(parseValueParam(urlParams.get('valueBase'), 10))
	let targetBase = $state(parseValueParam(urlParams.get('targetBase'), 2))

	let selectedMode = $state(NumberMode.INT)

	let outputNumber = $derived(computeOutputNumber(value, valueBase, targetBase, selectedMode))

	$effect(() => {
		const isValid = validateNumberBase(value, valueBase, selectedMode)

		if (isValid !== true) {
			inputError = isValid
			return
		}

		inputError = null
	})

	$effect(() => {
		if (selectedValueBase !== 'custom') {
			valueBase = parseInt(selectedValueBase)
		}
		if (selectedTargetBase !== 'custom') {
			targetBase = parseInt(selectedTargetBase)
		}
	})

	$effect(() => {
		if (selectedValueBase === selectedTargetBase && selectedValueBase !== 'custom') {
			// Auto switch target base to custom if both are the same
			selectedTargetBase = '10'
			targetBase = valueBase === 2 ? 10 : 2
		}
	})
</script>

<main class="flex gap-4 justify-center min-h-screen items-start p-8">
	<section>
		<header>
			<h2>Input number</h2>
		</header>

		<div>
			<textarea
				bind:value
				class={cn('textarea textarea-primary textarea-lg w-full', inputError && 'textarea-error!')}
				placeholder="Insert your number"
			></textarea>
			{#if inputError}
				<p class="text-error mt-2">{inputError}</p>
			{/if}
		</div>

		<hr class="my-6" />

		<div class="flex flex-col gap-4 mb-4">
			<header>
				<h3 class="text-xl">Input settings</h3>
			</header>

			<label>
				<span>Input base</span>
				<select bind:value={selectedValueBase} class="select w-full">
					{#each commonOptions as option (option.value)}
						<option value={option.value} selected={option.value === selectedValueBase}>
							{option.label}
						</option>
					{/each}
				</select>
				{#if selectedValueBase === 'custom'}
					<input
						type="number"
						max="36"
						min="2"
						step="1"
						bind:value={valueBase}
						placeholder="Enter custom base"
						class={cn(
							'input input-primary mt-2 w-full',
							valueBase < 2 || (valueBase > 36 && 'input-error!')
						)}
					/>
					{#if valueBase < 2 || valueBase > 36}
						<p class="text-error">Input base must be between 2 and 36</p>
					{/if}
				{/if}
			</label>

			<label>
				<span>Target base</span>
				<select bind:value={selectedTargetBase} class="select w-full">
					{#each commonOptions as option (option.value)}
						<option
							value={option.value}
							selected={option.value === selectedTargetBase}
							disabled={option.value !== 'custom' && option.value === selectedValueBase}
						>
							{option.label}
						</option>
					{/each}
				</select>
				{#if selectedTargetBase === 'custom'}
					<input
						type="number"
						max="36"
						min="2"
						step="1"
						bind:value={targetBase}
						placeholder="Enter custom base"
						class={cn(
							'input input-primary mt-2 w-full',
							targetBase < 2 || (targetBase > 36 && 'input-error!')
						)}
					/>
					{#if targetBase < 2 || targetBase > 36}
						<p class="text-error">Target base must be between 2 and 36</p>
					{/if}
				{/if}
			</label>

			<!-- <label class="flex items-center gap-2">
				<input type="checkbox" class="checkbox checkbox-primary" />
				Signed to unsigned conversion
			</label> -->
		</div>

		<div class="space-y-2">
			{#each options as button (button.title)}
				<button
					class={cn(
						'border-2 border-base-content rounded-xl block px-4 py-2 text-sm transition-colors hover:border-primary/60 hover:bg-primary/10 text-left w-full disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
						selectedMode === button.mode && 'border-primary bg-primary/20'
					)}
					onclick={() => (selectedMode = button.mode)}
					disabled={(targetBase !== 2 || valueBase !== 10) &&
						(button.mode === NumberMode.FLOAT32 || button.mode === NumberMode.FLOAT64)}
				>
					<span class="block font-semibold text-base">{button.title}</span>

					<span> {button.description} </span>
				</button>
			{/each}
		</div>
	</section>

	<section>
		<header>
			<h2>Output number</h2>
		</header>

		<textarea
			class="textarea textarea-primary textarea-lg w-full"
			readonly
			bind:value={outputNumber}
			placeholder="Result will appear here"
		></textarea>

		<hr class="my-6" />

		<div>
			<header>
				<h3 class="text-xl">Breakdown of the conversion</h3>
			</header>
		</div>
	</section>
</main>

<style lang="postcss">
	@reference '../../app.css';

	section {
		@apply bg-base-200 p-8 rounded-lg border border-base-300 max-w-md w-full;
	}

	section > header {
		@apply mb-6;
	}

	section > header h2 {
		@apply text-2xl font-normal;
	}
</style>
