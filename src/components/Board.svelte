<script lang="ts">
	import { reversi, states } from '../ViewConnect.svelte.js'

	const { boardSize } = reversi

	let board_markers_index = Array(boardSize)
		.fill(0)
		.map((_, i) => i)
</script>

<div class="board-frame">
	<div class="main-board">
		{#each board_markers_index as _, y}
			<div class="row" style:height={100 / boardSize + '%'}>
				{#each board_markers_index as _, x}
					{@const tile = states.tiles[y * boardSize + x]}
					<div
						class="col square"
						class:itimatsu={(y + x) % 2}
						style:width={100 / boardSize + '%'}
						role="presentation"
						data-x-axis={x}
						data-y-axis={y}
						onclick={() => {
							reversi.addTile(x, y)
						}}
					>
						{#if tile > 0}
							<div
								class="{reversi.getSymColor(tile)}-tiles"
							></div>
						{:else if states.playerTurn && reversi.checkOKtoPlace(x, y)}
							<div class="can-hit">
								{#if !reversi.demo && states.aiLv}
									{@const g = tile}
									{@const hand = reversi.getHand(
										x,
										y,
										states.aiLv,
									)}
									{hand.scores.total.toFixed(1) || ''}
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
			<div class="h-markers">{String.fromCharCode(65 + index)}</div>
		{/each}
	</div>
	<div class="v-markers-container">
		{#each board_markers_index as index}
			<div class="v-markers">{1 + index}</div>
		{/each}
	</div>
</div>

<div class="history-container">
	{#each states.history as data}
		<div class="last-move-slot">
			<div class="last-move-tile-{reversi.getSymColor(data.sym)}"></div>
			<div class="last-move-number">
				{String.fromCharCode(65 + data.x) + (data.y + 1)}
			</div>
		</div>
	{/each}
</div>

<div class="score-container" style:visibility="visible">
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
	.itimatsu {
		background-color: #86b50f;
	}
	.history-container {
		width: 100%;
		height: 100px;
		margin-top: 12px;
		max-width: 640px;

		box-sizing: border-box;
		background-color: #343434;
		border: none;
		border-radius: 15px;
		position: relative;
		box-shadow: 4px 4px 4px black;
		display: flex;
		flex-direction: row;
		padding: 10px;
		border-bottom: 2px solid #414141;
		border-right: 3px solid #414141;
		overflow-y: hidden;
		overflow-x: scroll;
	}
</style>
