<script lang="ts">
	import { type AILV, AILVMAX } from '../AI.js'
	import {
		type InitialPlacement,
		type Mode,
		Tile,
		type BoardSize,
	} from '../Reversi.js'
	import Board from './Board.svelte'

	// Title
	const title = 'REVERSI'
	let title_colorFlg = $state(true)
	function title_hover() {
		title_colorFlg = !title_colorFlg
	}

	// settings
	let boardSize: BoardSize = $state(8)
	let initialPlacement = $state<InitialPlacement>('cross')
	let yourColor = $state(Tile.B)
	let aiLv: AILV = $state(5)

	let started = $state(false)
	let mode: Mode = $state('2')
	function start(_mode: Mode) {
		started = true
		mode = _mode
	}
</script>

<div
	class="header"
	role="button"
	tabindex="0"
	onmouseenter={title_hover}
	onmouseleave={title_hover}
>
	{#each title as char, i}
		<span class="{(i + +title_colorFlg) % 2 ? 'white' : 'black'}-letter"
			>{char}</span
		>
	{/each}
</div>

{#if !started}
	<div class="settings-from-container">
		<form name="setting">
			<label>
				Board Size: {boardSize}
				<input
					type="range"
					name="boardSize"
					id="boardSize"
					bind:value={boardSize}
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
						id="cross"
						checked
						bind:group={initialPlacement}
					/>cross
				</label>
				<label>
					<input
						type="radio"
						name="initialPlacement"
						value="parallel"
						id="parallel"
						bind:group={initialPlacement}
					/>parallel
				</label>
				<label>
					<input
						type="radio"
						name="initialPlacement"
						value="random"
						id="random"
						bind:group={initialPlacement}
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
						id="black"
						bind:group={yourColor}
						checked
					/>Black
				</label>
				<label>
					<input
						type="radio"
						name="yourColor"
						value={Tile.W}
						id="white"
						bind:group={yourColor}
					/>White
				</label>
				<label>
					<input
						type="radio"
						name="yourColor"
						value={Tile.Null}
						id="random"
						bind:group={yourColor}
					/>Random
				</label>
			</div>
			<div>
				<label>
					AI LV: {aiLv}
					<input
						type="range"
						name="aiLv"
						id="aiLv"
						bind:value={aiLv}
						min="0"
						max={AILVMAX}
					/>
				</label>
			</div>
		</form>
	</div>
{/if}

<div class="main-container">
	{#if started}
		<Board {boardSize} {initialPlacement} {yourColor} {aiLv} {mode}></Board>
	{:else}
		<div class="main-page-container">
			<button
				class="selections"
				onclick={() => start('single')}
				id="single-player"
			>
				Single Player
			</button>
			<button
				class="selections"
				onclick={() => start('2')}
				id="two-players"
			>
				2 Players
			</button>
			<button class="selections" onclick={() => start('demo')} id="demo">
				Demo
			</button>
		</div>
	{/if}
</div>

<style>
	.main-container {
		flex-direction: column;
		align-items: center;
	}
</style>
