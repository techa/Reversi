<script lang="ts">
	import { viewState } from '../View.svelte.js'
	import { reversi, states } from '../ViewConnect.svelte.js'

	const { boardWidth }: { boardWidth: number } = $props()

	const undo = () => {
		console.log('undo')
		if (viewState.history.length - 1 > viewState.historyIndex) {
			viewState.historyIndex++
		}

		reversi.$insert(viewState.history[viewState.historyIndex])
		viewState.historyIndex = -1
	}
	const redo = () => {
		console.log('redo')
		if (viewState.historyIndex > 0) {
			viewState.historyIndex--
		}
		reversi.$insert(viewState.history[viewState.historyIndex])
		viewState.historyIndex = -1
	}
	const onkeydown = (e: KeyboardEvent) => {
		if (e.ctrlKey) {
			if (e.key === 'z') {
				if (e.shiftKey) {
					redo()
				} else {
					undo()
				}
			} else if (e.key === 'y') {
				redo()
			}
		}
	}
</script>

<svelte:window {onkeydown} />

<div class="history-container" style:width={boardWidth + 'px'}>
	{#each viewState.history as data, i (data)}
		<div>
			<div class="last-move-turn">
				Turn: {data.turn}
			</div>
			<div
				class="last-move-slot"
				class:active={states.turn === data.turn}
				role="presentation"
				onmouseenter={() => {
					viewState.historyIndex = i
				}}
				onmouseleave={() => {
					viewState.historyIndex = -1
				}}
				onclick={() => {
					viewState.historyIndex = -1
					reversi.$insert(data)
				}}
			>
				{#if data.turn}
					<div
						class="last-move-tile-{reversi.getSymColor(data.sym)}"
					></div>
					<div class="last-move-number">
						{String.fromCharCode(65 + data.x) + (data.y + 1)}
					</div>
				{:else}
					<div class="last-move-number">Initial</div>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	:root {
		--board-frame: 30px;
	}

	.history-container {
		width: 100%;
		height: 108px;
		margin-top: 12px;

		box-sizing: border-box;
		background-color: #343434;
		border: none;
		border-radius: 15px;
		position: relative;
		box-shadow: 4px 4px 4px black;
		display: flex;
		flex-direction: row;
		padding: 2px 10px;
		border-bottom: 2px solid #414141;
		border-right: 3px solid #414141;
		overflow-y: hidden;
		overflow-x: scroll;
	}
	.last-move-turn {
		color: aliceblue;
		text-align: center;
	}
	.last-move-slot {
		width: 120px;
		padding: 0 8px;
		border: none;
		border-bottom: 3px solid black;
		border-right: 2px solid black;
		height: 60px;
		border-radius: 5px;
		box-sizing: border-box;
		margin-bottom: 5px;
		background: linear-gradient(white, #bfbab6);
		box-shadow: 2px 2px 4px black;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		opacity: 0;
		animation: fadein 1s forwards;

		cursor: pointer;
		--tile-size: 32px;
	}

	.last-move-slot.active,
	.last-move-slot:hover {
		background: linear-gradient(#bfbab6, #928e8b);
	}

	.last-move-tile-black {
		border-radius: 50%;
		width: var(--tile-size);
		height: var(--tile-size);
		background: linear-gradient(to bottom right, black, #565656);
		box-shadow: 1px 1px 6px;
	}

	.last-move-tile-white {
		border-radius: 50%;
		width: var(--tile-size);
		height: var(--tile-size);
		background: linear-gradient(to bottom right, #bababa, white);
		box-shadow: 1px 1px 6px;
	}

	.last-move-tile-black:after {
		content: '';
		position: absolute;
		top: 13px;
		border-radius: 50%;
		left: 19px;
		width: 20%;
		height: 27%;
		background: linear-gradient(
			rgba(255, 255, 255, 0.3),
			rgba(255, 255, 255, 0)
		);
		transform: rotate(-38deg);
	}

	.last-move-tile-white:after {
		content: '';
		position: absolute;
		top: 11px;
		border-radius: 50%;
		left: 18px;
		width: 20%;
		height: 27%;
		background: linear-gradient(
			rgba(255, 255, 255, 0.8),
			rgba(255, 255, 255, 0)
		);
		transform: rotate(-38deg);
	}

	.last-move-number {
		padding: 0 8px;
		font-size: 29px;
		font-weight: bold;
	}
</style>
