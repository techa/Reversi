<script lang="ts">
	import { onMount } from 'svelte'
	import {
		reversi,
		states,
		Constants,
		options,
	} from '../ViewConnect.svelte.js'

	const { boardSize } = reversi

	const boardWidth_border = Constants.BoardWidthMax
	let boardWidth = $state(640)

	let historyIndex = $state(-1)

	let board_markers_index = Array(boardSize)
		.fill(0)
		.map((_, i) => i)

	onMount(onresize)
	function onresize() {
		console.log('boardWidth', boardWidth)
		const val = document.body.clientWidth
		boardWidth = (val > boardWidth_border ? boardWidth_border : val) - 24
	}
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
							reversi.hit(x, y)
						}}
					>
						{#if tile > 0}
							<div
								class="{reversi.getSymColor(tile)}-tiles"
							></div>
						{:else if historyIndex < 0 && states.playerTurn && reversi.checkOKtoPlace(x, y)}
							{@const _hand = reversi.getHand(x, y, states.aiLv)}
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
								{#if options.mode !== 'demo' && states.aiLv}
									{@const g = historyIndex}
									{_hand.scores.total.toFixed(1) || ''}
								{:else}
									<div class="predictor"></div>
								{/if}
							</div>
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
		Turn: {states.turn}
	</div>
</div>

{#if options.mode === '2' || import.meta.env.DEV}
	<div class="history-container" style:width={boardWidth + 'px'}>
		{#each states.history as data, i (data)}
			<div class="">
				<div class="last-move-turn">
					Turn: {data.turn}
				</div>
				<div
					class="last-move-slot"
					role="presentation"
					onmouseenter={() => {
						historyIndex = i
					}}
					onmouseleave={() => {
						historyIndex = -1
					}}
					onclick={() => {
						historyIndex = -1
						reversi.$insert(data, i)
					}}
				>
					<div
						class="last-move-tile-{reversi.getSymColor(data.sym)}"
					></div>
					<div class="last-move-number">
						{String.fromCharCode(65 + data.x) + (data.y + 1)}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<div
	class="score-container"
	style:visibility="visible"
	style:width={boardWidth + 'px'}
>
	<div class="score-inner-container">
		<div class="name" id="player-name">{reversi.player1Name}</div>
		<div class="tile-container">
			<div
				class="glow"
				style:visibility={states.blackTurn ? 'visible' : 'hidden'}
			>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>
			<div class="score-tile score-black">
				<div class="score" id="black-score">
					{states.blackScore}
				</div>
			</div>
		</div>
	</div>
	<div class="score-inner-container">
		<div class="name" id="bot-name">{reversi.player2Name}</div>
		<div class="tile-container">
			<div
				class="glow"
				style:visibility={states.whiteTurn ? 'visible' : 'hidden'}
			>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>
			<div class="score-tile score-white">
				<div class="score" id="white-score">
					{states.whiteScore}
				</div>
			</div>
		</div>
	</div>
</div>

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
		display: flex;
		width: calc(100% - 2 * var(--board-frame));
		box-sizing: border-box;
		height: var(--board-frame);
		top: 0;
		flex-wrap: nowrap;
	}

	.footer.h-markers-container {
		top: auto;
		bottom: 0;

		color: aliceblue;
		padding: 4px;
		box-sizing: border-box;
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
