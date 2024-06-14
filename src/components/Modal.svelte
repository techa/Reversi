<script lang="ts">
	import { type Snippet } from "svelte"
	import { reversi, options } from '../ViewConnect.svelte.js'

	let {
		showModal = $bindable(),
		started = $bindable(),
		children,
	}:{
		showModal: boolean
		started: boolean
		children?: Snippet
	} = $props()

	let dialog: HTMLDialogElement

	function close() {
		dialog.close()
		showModal = false
	}

	$effect(() => {
		if (dialog && showModal) {
			dialog.showModal()
		}
	})
</script>

<!-- svelte-ignore a11y_click_events_have_key_events  a11y_no_noninteractive_element_interactions-->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	onclose={close}
	onclick={close}
>
	<div class="win-lose-draw">You Win!</div>
	<div class="result-container">
		<button
			class="name result-selections"
			onclick={()=> {
				started = false
				close()
			}}
		>
			Back to Top
		</button>

		<button
			class="name result-selections"
			onclick={()=> {
				close()
				reversi.init(options)
			}}
		>
			Restart
		</button>
		{#if children}
			{@render children()}
		{/if}
	</div>
</dialog>

<style>
	dialog {
		max-width: 32em;
		border-radius: 0.2em;
		border: none;
		padding: 0;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}
</style>
