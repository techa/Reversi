<script lang="ts">
	import {
		reversi,
		states,
		Constants,
		options,
	} from '../ViewConnect.svelte.js'
	import { blackOrWhite } from '../utils.js'

	const { boardSize } = reversi

	const boardWidth_border = Constants.BoardWidthMax
	let boardWidth = $state(640)

	let historyIndex = $state(-1)

	let board_markers_index = Array(boardSize)
		.fill(0)
		.map((_, i) => i)

	function onresize() {
		const w = document.body.clientWidth
		boardWidth = (w > boardWidth_border ? boardWidth_border : w) - 24
	}
	onresize()
</script>

<svelte:window {onresize} />

<div class="board-frame" style:--board-width={boardWidth + 'px'}>
	<div class="main-board">
		{#each board_markers_index as _, y}
			<div class="row" style:height={100 / boardSize + '%'}>
				{#each board_markers_index as _, x}
					{@const tiles =
						historyIndex > -1
							? states.history[historyIndex].tiles
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
							}
						}}
					>
						{#if tile > 0}
							<div
								class="{reversi.getSymColor(tile)}-tiles"
							></div>
						{:else if states.playerTurn && historyIndex < 0 && reversi.checkOKtoPlace(x, y)}
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
										states.hand = _hand
										states.handPosition = [
											event.clientX,
											event.clientY,
										]
									}}
									onmouseleave={() => {
										states.hand = null
										states.handPosition = null
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
		<div class="icon-wrapper">
			<svg class="icon black_white">
				<use href="#{blackOrWhite(states.blackTurn)}-tile"></use>
			</svg>
			Turn: {states.turn}
		</div>

		<div class="name-wrapper">{states.activePlayerName}</div>

		<div class="score-wrapper">
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
	<div class="history-container" style:width={boardWidth + 'px'}>
		{#each states.history as data, i (data)}
			<div>
				<div class="last-move-turn">
					Turn: {data.turn}
				</div>
				<div
					class="last-move-slot"
					class:active={states.turn === data.turn}
					role="presentation"
					onmouseenter={() => {
						historyIndex = i
					}}
					onmouseleave={() => {
						historyIndex = -1
					}}
					onclick={() => {
						historyIndex = -1
						reversi.$insert(data)
					}}
				>
					{#if data.turn}
						<div
							class="last-move-tile-{reversi.getSymColor(
								data.sym,
							)}"
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
	.icon-wrapper {
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
	.score-wrapper {
		height: 34px;
		display: flex;
		align-items: center;
		margin: 0 4px;
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
</style>
