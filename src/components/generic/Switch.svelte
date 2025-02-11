<script lang="ts">
	const uniqueID = Math.floor(Math.random() * 100)

	let {
		label = '',
		on = '',
		off = '',
		checked = $bindable(true),
		disabled = $bindable(false),
		onclick = () => {},
		class: klass = '',
		...rest
	} = $props()
</script>

<label class="switch {klass}">
	{#if label}
		<div class="label_text">{label}</div>
	{/if}
	<button
		id={`switch-${uniqueID}`}
		role="switch"
		aria-checked={checked}
		{disabled}
		onclick={(e) => {
			checked = !checked
			if (onclick) {
				onclick(e)
			}
		}}
		{...rest}
	>
	</button>
	{#if on && off}<span>{checked ? on : off}</span>{/if}
</label>

<style>
	.switch {
		--switch: #fff;
		--onColor: #2470ff;
		--offColor: #767676;
	}
	.label_text {
		margin-bottom: 0.25rem;
		font-size: 0.75rem;
	}
	button {
		position: relative;
		padding: 0 0.25rem;
		border: 0;
		border-radius: 1rem;
		height: 1.25rem;
		width: 2.5rem;
		font: inherit;
		color: inherit;
		line-height: inherit;
	}

	button:not([disabled]) {
		cursor: pointer;
	}

	button[disabled] {
		cursor: not-allowed;
		opacity: 0.6;
	}

	button:before {
		position: absolute;
		content: '';
		top: 0;
		bottom: 0;
		left: 0.125rem;
		margin: auto;
		height: 1rem;
		width: 1rem;
		text-align: center;
		border-radius: 50%;
		background-color: var(--switch);
		transition: transform 150ms ease-out;
	}

	button[aria-checked='true']:before {
		transform: translateX(1.25rem);
	}

	button[aria-checked='true'] {
		background-color: var(--onColor);
	}
	button[aria-checked='false'] {
		background-color: var(--offColor);
	}
</style>
