<script lang="ts">
	import History from './History.svelte'
	import { ModalType, viewState } from '../View.svelte.js'
	import {
		reversi,
		states,
		Constants,
		options,
	} from '../ViewConnect.svelte.js'

	const { back2top } = $props()

	const { boardSize } = reversi

	const boardWidth_border = Constants.BoardWidthMax
	let boardWidth = $state(640)

	let board_markers_index = Array(boardSize)
		.fill(0)
		.map((_, i) => i)

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
		{#each board_markers_index as _, y}
			<div class="row" style:height={100 / boardSize + '%'}>
				{#each board_markers_index as _, x}
					{@const tiles =
						states.historyIndex > -1
							? states.history[states.historyIndex].tiles
							: states.tiles}
					{@const tile = tiles[y * boardSize + x]}
					<div
						class="col square"
						class:itimatsu={(y + x) % 2}
						style:width={100 / boardSize + '%'}
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
							<div
								class="{reversi.getSymColor(tile)}-tiles"
							></div>
						{:else if states.playerTurn && states.historyIndex < 0 && reversi.checkOKtoPlace(x, y)}
							{#if import.meta.env.DEV && options.aiPlayer1LV}
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
			</div>
		{/each}
	</div>

	<div class="h-markers-container">
		{#each board_markers_index as index}
			<div class="h-markers" style:width={100 / boardSize + '%'}>
				{String.fromCharCode(65 + index)}
			</div>
		{/each}
	</div>
	<div class="v-markers-container">
		{#each board_markers_index as index}
			<div class="v-markers" style:height={100 / boardSize + '%'}>
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

{#if options.mode === '2' || import.meta.env.DEV}
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

	.itimatsu {
		background-color: #86b50f;
	}
</style>
