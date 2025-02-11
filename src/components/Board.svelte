<script lang="ts">
	import History from './History.svelte'
	import { ModalType, viewState } from '../View.svelte.js'
	import {
		reversi,
		states,
		Constants,
		options,
	} from '../ViewConnect.svelte.js'
	import { Mode } from '../Reversi.js'
	import { floor } from '../utils.js'

	const { back2top } = $props()

	const { boardSize } = reversi
	const boxSize = floor(100 / boardSize, 2) + '%'

	const boardWidth_border = Constants.BoardWidthMax
	let boardWidth = $state(640)

	// let board_markers_index = Array(boardSize)
	// 	.fill(0)
	// 	.map((_, i) => i)

	function onresize() {
		const w = document.body.clientWidth
		boardWidth = (w > boardWidth_border ? boardWidth_border : w) - 24
	}
	onresize()

	const onkeydown = (e: KeyboardEvent) => {
		if (e.key === 'Backspace') {
			back2top()
		}
	}

	$effect(() => {
		if (states.winlose) {
			viewState.modal = ModalType.BackOrRestart
		}
	})
</script>

<svelte:window {onresize} {onkeydown} />

<div class="board-frame" style:--board-width={boardWidth + 'px'}>
	<div class="main-board">
		{#each { length: boardSize } as _, y}
			{#each { length: boardSize } as _, x}
				{@const tile = reversi.getViewTile(x, y)}
				<div
					class="square"
					class:itimatsu={(y + x) % 2}
					style:width={boxSize}
					style:height={boxSize}
					role="presentation"
					data-x-axis={x}
					data-y-axis={y}
					onclick={() => {
						if (states.playerTurn) {
							reversi.hit(x, y)
							viewState.hand = null
						}
					}}
				>
					{#if tile > 0}
						<div class="stone {reversi.getSymColor(tile)}"></div>
					{:else if states.playerTurn && viewState.historyIndex < 0 && reversi.checkOKtoPlace(x, y)}
						{#if viewState.dev && options.aiPlayer1LV}
							{@const _hand = reversi.getHand(
								x,
								y,
								options.aiPlayer1LV,
							)}
							<div
								class="can-hit"
								role="presentation"
								onmouseenter={(event) => {
									viewState.hand = _hand
									viewState.handPosition = [
										event.clientX,
										event.clientY,
									]
								}}
								onmouseleave={() => {
									viewState.hand = null
									viewState.handPosition = null
								}}
							>
								{_hand.scores.total.toFixed(1) || ''}
							</div>
						{:else}
							<div class="can-hit">
								<div class="predictor"></div>
							</div>
						{/if}
					{/if}
				</div>
			{/each}
		{/each}
	</div>

	<div class="h-markers-container">
		{#each { length: boardSize } as _, index}
			<div class="h-markers" style:width={boxSize}>
				{String.fromCharCode(65 + index)}
			</div>
		{/each}
	</div>
	<div class="v-markers-container">
		{#each { length: boardSize } as _, index}
			<div class="v-markers" style:height={boxSize}>
				{1 + index}
			</div>
		{/each}
	</div>
	<div class="footer h-markers-container">
		<div class="footer_text">
			Turn: {states.turn}
		</div>

		<div class="footer_text">
			<svg class="icon black_white">
				<use href="#{reversi.getSymColor(states.sym)}-tile"></use>
			</svg>
			{reversi.getName(states.sym)}
		</div>

		<div class="footer_text">
			<svg class="icon black_white black_score">
				<use href="#black-tile"></use>
			</svg>
			{states.blackScore}
			<svg class="icon black_white white_score">
				<use href="#white-tile"></use>
			</svg>
			{states.whiteScore}
		</div>
	</div>
</div>

{#if options.mode === Mode.Practice || viewState.dev}
	<History {boardWidth}></History>
{/if}

<style>
	:root {
		--board-frame: 30px;
	}

	.board-frame {
		width: var(--board-width);
		height: var(--board-width);
		padding: var(--board-frame);
		box-sizing: border-box;
		background: black;
		box-shadow: 1px 1px 18px;
		border-radius: 15px;
		position: relative;
		border-bottom: 5px solid black;
		border-right: 5px solid black;
	}

	.h-markers-container {
		line-height: var(--board-frame);
		position: absolute;
		width: calc(100% - 2 * var(--board-frame));
		box-sizing: border-box;
		height: var(--board-frame);
		top: 0;

		display: flex;
		flex-wrap: nowrap;
	}

	.h-markers {
		height: 100%;

		box-sizing: border-box;
		width: 100%;
		color: white;
		text-align: center;
	}

	.v-markers-container {
		position: absolute;
		display: flex;
		width: calc(var(--board-frame) + 2px);
		box-sizing: border-box;
		height: calc(100% - 2 * var(--board-frame));
		top: calc(var(--board-frame) - 1px);
		left: -1px;
		flex-direction: column;
		align-items: stretch;
		flex-wrap: nowrap;
	}

	.v-markers {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;

		box-sizing: border-box;
		width: 100%;
		color: white;
		text-align: center;
	}

	.main-board {
		display: flex;
		flex-flow: row wrap;
		width: 100%;
		height: 100%;

		margin: 0 auto;
		box-sizing: border-box;
	}

	.square {
		width: 12.5%;
		height: 100%;
		border: 1px solid white;
		background-color: #6e9e00;
		position: relative;
		box-sizing: border-box;
	}

	.itimatsu {
		background-color: #86b50f;
	}
	/*
	.square > .can-hit > .predictor
	*/
	.can-hit {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;

		cursor: pointer;
	}

	.stone {
		border-radius: 50%;
		width: 70%;
		padding-bottom: 70%;
		position: absolute;
		margin: 0 auto;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	.stone.black {
		background: linear-gradient(to bottom right, black, #565656);
		box-shadow: 1px 1px 6px;
	}
	.stone.white {
		background: linear-gradient(to bottom right, #bababa, white);
		box-shadow: 1px 1px 14px;
	}
	.stone::after {
		content: '';
		position: absolute;
		top: 5%;
		border-radius: 50%;
		left: 5%;
		width: 56%;
		height: 35%;
		transform: rotate(-32deg);
	}
	.stone.black::after {
		background: linear-gradient(
			rgba(255, 255, 255, 0.3),
			rgba(255, 255, 255, 0)
		);
	}
	.stone.white::after {
		background: linear-gradient(
			rgba(255, 255, 255, 1),
			rgba(255, 255, 255, 0)
		);
	}

	.footer.h-markers-container {
		top: auto;
		bottom: -2px;

		color: aliceblue;

		align-items: center;
		justify-content: space-between;
	}

	.footer_text {
		height: 34px;
		display: flex;
		align-items: center;
		margin: 0 4px;
	}
	.icon.black_white {
		width: 20px;
		height: 20px;
		display: inline-flex;
		margin: 4px;
	}
</style>
