<script lang="ts">
	import { type Mode } from '../Reversi.js'

	import Board from './Board.svelte'
	import Modal from './Modal.svelte'

	import {
		ModalType,
		options,
		reversi,
		states,
		Constants,
	} from '../ViewConnect.svelte.js'
	import { blackOrWhite } from '../utils.js'
	import Settings from './Settings.svelte'

	// Title
	const title = 'REVERSI'
	let title_hover = $state(false)
	function titlehover() {
		title_hover = !title_hover
	}

	// game start
	function start(_mode: Mode) {
		states.started = true
		options.mode = _mode
		reversi.init(options)
	}
</script>

<svg style="display: none;">
	<defs>
		<symbol id="random" viewBox="0 0 24 24">
			<path
				stroke="black"
				d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"
			/>
			<path d="m18 2 4 4-4 4" stroke="black" />
			<path d="m18 14 4 4-4 4" stroke="white" />
			<path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" stroke="white" />
			<path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" stroke="white" />
		</symbol>
	</defs>
	<symbol id="black-tile" viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="10" fill="black"></circle>
	</symbol>
	<symbol id="white-tile" viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="10" fill="white"></circle>
	</symbol>
</svg>

<div class="header-wrapper" style="max-width: {Constants.BoardWidthMax}px;">
	<div class="btn"></div>
	<div class="header">
		<button
			class="title"
			onmouseenter={titlehover}
			onmouseleave={titlehover}
			onclick={() => {
				if (states.started) {
					states.modal = ModalType.BackOrRestart
				}
			}}
		>
			{#each title as char, i}
				<span class="{blackOrWhite((i + +title_hover) % 2)}-letter"
					>{char}</span
				>
			{/each}
		</button>
	</div>
	<div class="btn">
		<button
			onclick={() => {
				states.modal = ModalType.Config
			}}
		>
			<svg class="icon config" stroke="white">
				<path
					d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
				/><circle cx="12" cy="12" r="3" />
			</svg>
		</button>
	</div>
</div>

<Modal></Modal>

<div class="main-container">
	{#if states.started}
		<Board></Board>
	{:else}
		<Settings></Settings>
		<div class="main-page-container">
			<button class="selections" onclick={() => start('single')}>
				Single Player
			</button>
			<button class="selections" onclick={() => start('2')}>
				2 Players
			</button>
			<button class="selections" onclick={() => start('demo')}>
				Demo
			</button>

			<div class="footer">
				<a
					href="https://github.com/techa/Reversi"
					target="_blank"
					rel="github repository"
				>
					<img
						height="32"
						width="32"
						alt="github icon"
						src="https://cdn.simpleicons.org/github/eee"
					/>
				</a>
			</div>
		</div>
	{/if}
</div>

{#if import.meta.env.DEV && states.hand && states.handPosition}
	<div
		class="score-details"
		style:top="{states.handPosition[1] + 10}px"
		style:left="{states.handPosition[0] + 10}px"
	>
		{#each Object.entries(states.hand.scores) as [key, score]}
			{#if score}
				{@const value = states.hand[key]}
				<div class="score-details-item">
					{`${key}: ${
						typeof score === 'number'
							? +score.toFixed(2) + 'pt'
							: score
					}`}{value ? ` (${value})` : ''}
				</div>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.header-wrapper,
	.main-container {
		/* max-width: 640px; */
		width: 100%;
	}
	.header-wrapper {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		margin: auto;
	}
	.header {
		position: relative;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: stretch;
	}
	.title {
		background-color: transparent;
		display: block;
		border: none;
		font-family: 'Archivo Black', sans-serif;
		font-size: 52px;
		margin-bottom: 10px;
		color: yellow;
		letter-spacing: 2px;
		text-align: center;
	}
	.btn {
		/* position: absolute; */
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 64px;
	}
	.btn button {
		background: transparent;
		border: none;
		color: gainsboro;
	}

	.main-container {
		flex-direction: column;
		align-items: center;
	}
	.footer {
		text-align: center;
		margin: 24px 0;
	}
</style>
