<script lang="ts">
	import { AILVMAX } from '../AI.js'
	import { type Mode, Tile } from '../Reversi.js'

	import Board from './Board.svelte'
	import Modal from './Modal.svelte'

	import {
		ModalType,
		options,
		reversi,
		states,
		Constants,
	} from '../ViewConnect.svelte.js'
	import { blackOrWhite, capitarize } from '../utils.js'

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

<svg
	xmlns="http://www.w3.org/2000/svg"
	width="24"
	height="24"
	viewBox="0 0 24 24"
	style="display: none;"
>
	<defs>
		<symbol id="config" viewBox="0 0 24 24">
			<path
				d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
			/><circle cx="12" cy="12" r="3" />
		</symbol>
		<symbol id="menu" viewBox="0 0 24 24">
			<line x1="4" x2="20" y1="12" y2="12" />
			<line x1="4" x2="20" y1="6" y2="6" />
			<line x1="4" x2="20" y1="18" y2="18" />
		</symbol>
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

		<symbol id="black-tile" viewBox="0 0 24 24">
			<circle cx="12" cy="12" r="10" fill="black"></circle>
		</symbol>
		<symbol id="white-tile" viewBox="0 0 24 24">
			<circle cx="12" cy="12" r="10" fill="white"></circle>
		</symbol>

		<symbol id="volume-mute" viewBox="0 0 24 24" class="volume">
			<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
			<line x1="22" x2="16" y1="9" y2="15" /><line
				x1="16"
				x2="22"
				y1="9"
				y2="15"
			/>
		</symbol>
		<symbol id="volume" viewBox="0 0 24 24" class="volume">
			<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
			<path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path
				d="M19.07 4.93a10 10 0 0 1 0 14.14"
			/>
		</symbol>
	</defs>
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
				<use href="#config"></use>
			</svg>
		</button>
	</div>
</div>

<Modal></Modal>

{#if !states.started}
	<div class="settings-from-container">
		<form name="setting">
			<h4>Board Size: <span class="number">{options.boardSize}</span></h4>
			<label>
				<input
					type="range"
					name="boardSize"
					bind:value={options.boardSize}
					min="4"
					max="12"
				/>
			</label>
			<div>
				<h4>
					Initial Placement: <span
						>{capitarize(options.initialPlacement)}</span
					>
				</h4>
				<label title="cross">
					<input
						type="radio"
						name="initialPlacement"
						value="cross"
						checked
						bind:group={options.initialPlacement}
					/>
					<svg viewBox="0 0 24 24" class="icon ip-cross">
						<circle cx="6" cy="6" r="5" fill="white"></circle>
						<circle cx="18" cy="6" r="5" fill="black"></circle>
						<circle cx="6" cy="18" r="5" fill="black"></circle>
						<circle cx="18" cy="18" r="5" fill="white"></circle>
					</svg>
					<!-- <span>Cross</span> -->
				</label>
				<label title="parallel">
					<input
						type="radio"
						name="initialPlacement"
						value="parallel"
						bind:group={options.initialPlacement}
					/>
					<svg viewBox="0 0 24 24" class="icon ip-parallel">
						<circle cx="6" cy="6" r="5" fill="white"></circle>
						<circle cx="18" cy="6" r="5" fill="white"></circle>
						<circle cx="6" cy="18" r="5" fill="black"></circle>
						<circle cx="18" cy="18" r="5" fill="black"></circle>
					</svg>
					<!-- <span>Parallel</span> -->
				</label>
				<label title="random">
					<input
						type="radio"
						name="initialPlacement"
						value="random"
						bind:group={options.initialPlacement}
					/>
					<svg class="icon ip-random">
						<use href="#random"></use>
					</svg>
					<!-- <span>Random</span> -->
				</label>
			</div>
			<div>
				<h4>
					Your Color: <span>
						{['Random', 'Black', 'White'][options.yourColor]}</span
					>
				</h4>
				<label title="black">
					<input
						type="radio"
						name="yourColor"
						value={Tile.B}
						bind:group={options.yourColor}
						checked
					/>
					<svg class="icon yc-black">
						<use href="#black-tile"></use>
					</svg>
				</label>
				<label title="white">
					<input
						type="radio"
						name="yourColor"
						value={Tile.W}
						bind:group={options.yourColor}
					/>
					<svg class="icon yc-white">
						<use href="#white-tile"></use>
					</svg>
				</label>
				<label title="random">
					<input
						type="radio"
						name="yourColor"
						value={Tile.Null}
						bind:group={options.yourColor}
					/>
					<svg class="icon yc-random">
						<use href="#random"></use>
					</svg>
				</label>
			</div>
			<div>
				<h4>AI LV: <span class="number">{states.aiLv}</span></h4>
				<label>
					<input
						type="range"
						name="aiLv"
						bind:value={states.aiLv}
						min="0"
						max={AILVMAX}
					/>
				</label>
			</div>
		</form>
	</div>
{/if}

<div class="main-container">
	{#if states.started}
		<Board></Board>
	{:else}
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

{#if states.hand && states.handPosition}
	<div
		class="score-details"
		style="top: {states.handPosition[1] + 10}px;left: {states
			.handPosition[0] + 10}px;"
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
	.settings-from-container,
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

	form {
		text-align: center;
	}
	h4 {
		margin: 1rem 0 0.5rem;
	}
	h4 span {
		display: inline-flex;
		font-size: large;
	}
	h4 span.number {
		width: 2rem;
	}
	form label {
		margin: 0 0.5rem;
		cursor: pointer;
	}
	form input[type='radio'] {
		display: none;
	}
	:global(svg.icon) {
		width: 32px;
		height: 32px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	form input[type='radio'] + .icon {
		opacity: 0.5;
	}
	form input[type='radio']:checked + .icon {
		opacity: 1;
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
