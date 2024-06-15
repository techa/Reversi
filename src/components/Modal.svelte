<script lang="ts">
	import { type Snippet } from "svelte"
	import { reversi, options, states } from '../ViewConnect.svelte.js'

	let {
		children,
	}: {
		children?: Snippet
	} = $props()

	let dialog: HTMLDialogElement

	function close(_e: Event, btn = false) {
		if (states.winlose && !btn) {
			return
		}
		dialog.close()
		states.showModal = false
	}

	$effect(() => {
		if (dialog && states.showModal) {
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
	{#if states.winlose}
		<div class="win-lose-draw">{states.winlose}</div>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="result-container" onclick={(e)=>{e.stopPropagation()}}>
		<button
			class="name result-selections"
			onclick={(e)=> {
				close(e, true)
				states.started = false
			}}
		>
			Back to Top
		</button>

		<button
			class="name result-selections"
			onclick={(e)=> {
				close(e, true)
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
