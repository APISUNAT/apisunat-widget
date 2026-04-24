<script lang="ts">
	import { onMount } from 'svelte';
	import { createRoot } from 'react-dom/client';
	import { createElement } from 'react';
	import { HeroUIDatePicker } from './HeroUIDatePicker.jsx';

	let { value = '', onChange = (nextValue: string) => {} } = $props();

	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot> | undefined;

	function renderPicker() {
		if (!root) {
			return;
		}

		root.render(createElement(HeroUIDatePicker, { value, onChange }));
	}

	onMount(() => {
		root = createRoot(container);
		renderPicker();

		return () => {
			root?.unmount();
			root = undefined;
		};
	});

	$effect(() => {
		renderPicker();
	});
</script>

<div bind:this={container}></div>
