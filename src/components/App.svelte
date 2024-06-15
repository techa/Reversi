<script lang="ts">
	import { AILVMAX } from '../AI.js'
	import { type Mode, Tile } from '../Reversi.js'

	import Board from './Board.svelte'
	import Modal from './Modal.svelte'

	import { options, reversi, states } from '../ViewConnect.svelte.js'

	// Title
	const title = 'REVERSI'
	let title_colorFlg = $state(false)
	function title_hover() {
		title_colorFlg = !title_colorFlg
	}

	// game start
	function start(_mode: Mode) {
		states.started = true
		options.mode = _mode
		reversi.init(options)
	}
</script>

<div class="header">
	<button
		class="title"
		onmouseenter={title_hover}
		onmouseleave={title_hover}
		onclick={() => {
			states.showModal = true
		}}
	>
		{#each title as char, i}
			<span class="{(i + +title_colorFlg) % 2 ? 'black' : 'white'}-letter"
				>{char}</span
			>
		{/each}
	</button>
</div>

<Modal></Modal>

{#if !states.started}
	<div class="settings-from-container">
		<form name="setting">
			<label>
				Board Size: {options.boardSize}
				<input
					type="range"
					name="boardSize"
					bind:value={options.boardSize}
					min="4"
					max="12"
				/>
			</label>
			<div>
				Initial Placement:
				<label>
					<input
						type="radio"
						name="initialPlacement"
						value="cross"
						checked
						bind:group={options.initialPlacement}
					/>cross
				</label>
				<label>
					<input
						type="radio"
						name="initialPlacement"
						value="parallel"
						bind:group={options.initialPlacement}
					/>parallel
				</label>
				<label>
					<input
						type="radio"
						name="initialPlacement"
						value="random"
						bind:group={options.initialPlacement}
					/>Random
				</label>
			</div>
			<div>
				Your Color:
				<label>
					<input
						type="radio"
						name="yourColor"
						value={Tile.B}
						bind:group={options.yourColor}
						checked
					/>Black
				</label>
				<label>
					<input
						type="radio"
						name="yourColor"
						value={Tile.W}
						bind:group={options.yourColor}
					/>White
				</label>
				<label>
					<input
						type="radio"
						name="yourColor"
						value={Tile.Null}
						bind:group={options.yourColor}
					/>Random
				</label>
			</div>
			<div>
				<label>
					AI LV: {states.aiLv}
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
		</div>
	{/if}
</div>

<style>
	.header {
		display: flex;
		justify-content: center;
	}
	.title {
		background-color: transparent;
		display: block;
		border: none;
		font-family: 'Archivo Black', sans-serif;
		font-size: 77px;
		margin-bottom: 10px;
		color: yellow;
		letter-spacing: 2px;
		text-align: center;
	}
	.main-container {
		flex-direction: column;
		align-items: center;
	}
</style>
