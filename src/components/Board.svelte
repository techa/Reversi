<script lang="ts">
	import { type AILV, AIReversi } from '../AI.js'
	import {
		type InitialPlacement,
		type Sym,
		type BoardSize,
		type Mode,
		Tile,
	} from '../Reversi.js'
	import { SoundID, Sounds } from '../Sounds.js'

	// props
	let {
		boardSize,
		initialPlacement,
		yourColor,
		aiLv,
		mode,
	}: {
		boardSize: BoardSize
		initialPlacement: InitialPlacement
		yourColor: Tile
		aiLv: AILV
		mode: Mode
	} = $props()

	let board_markers_index = Array(boardSize)
		.fill(0)
		.map((_, i) => i)

	// display parameters
	let tiles: Tile[] = $state([])
	let playerTurn = $state(false)

	interface History {
		sym: Sym
		x: number
		y: number
	}
	let history: History[] = $state([])
	let blackScore = $state(2)
	let whiteScore = $state(2)
	let blackTurn = $state(true)
	let whiteTurn = $state(false)

	// Connect Class
	class ReversiView extends AIReversi {
		sounds = new Sounds()
		timerID: number

		countIncr() {
			super.countIncr()
			playerTurn = this.yourColor === this.sym
		}
		init() {
			clearTimeout(this.timerID)
			super.init()

			playerTurn = this.yourColor === this.sym
			return this
		}
		$aiTurn() {
			clearTimeout(this.timerID)
			this.timerID = setTimeout(() => {
				super.$aiTurn()
			}, 2000)
		}
		$stopDualBotMode() {
			clearTimeout(this.timerID)
		}
		$setTile(x: number, y: number, sym: Sym) {
			super.$setTile(x, y, sym)
			if (!this.thinking) {
				tiles = this.tiles
				playerTurn = false
			}
		}
		$tilesUpdate(x: number, y: number) {
			super.$tilesUpdate(x, y)
			if (!this.thinking) {
				tiles = this.tiles
			}
		}
		$updateLastMove(x: number, y: number) {
			history.push({
				sym: this.sym,
				x,
				y,
			})
		}
		$tilesCounting() {
			super.$tilesCounting()
			blackScore = this.blackCount
			whiteScore = this.whiteCount
		}
		$glowchange() {
			if (this.sym === Tile.W) {
				// this.view.$stopGlow1()
				// this.view.$startGlow2()
				blackTurn = false
				whiteTurn = true
			} else {
				// this.view.$startGlow1()
				// this.view.$stopGlow2()
				blackTurn = true
				whiteTurn = false
			}
		}
		$checkWin() {
			const message = super.$checkWin()
			// this.view.$checkWin(message)
			return message
		}
		$playerTurn() {
			playerTurn = true
		}
		S_invalid() {
			console.log('Invalid Move')
			this.sounds.sePlay(SoundID.Invalid)
		}
		S_place() {
			this.sounds.sePlay(SoundID.Place)
		}

		getSymColor(tile: Tile = this.sym) {
			return tile === Tile.B ? 'black' : 'white'
		}
	}

	const reversi = new ReversiView({
		boardSize,
		initialPlacement,
		yourColor,
		mode,
		aiPlayer1LV: aiLv,
		aiPlayer2LV: aiLv,
	}).init()
</script>

<div class="board-frame">
	<div class="main-board">
		{#each board_markers_index as _, y}
			<div class="row" style:height={100 / boardSize + '%'}>
				{#each board_markers_index as _, x}
					{@const tile = tiles[y * boardSize + x]}
					<div
						class="col square"
						class:itimatsu={(y + x) % 2}
						style:width={100 / boardSize + '%'}
						role="presentation"
						data-x-axis={x}
						data-y-axis={y}
						onclick={() => {
							reversi.addTile(x, y)
							// hideHandScoreDetails
						}}
					>
						{#if tile > 0}
							<div
								class="{reversi.getSymColor(tile)}-tiles"
							></div>
						{:else if playerTurn && reversi.checkOKtoPlace(x, y)}
							<div class="can-hit">
								{#if !reversi.demo && aiLv}
									{@const g = tile}
									{@const hand = reversi.getHand(x, y, aiLv)}
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
	{#each history as data}
		<div class="last-move-slot" style="width: 120px;">
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
				id="glow-1"
				style:visibility={blackTurn ? 'visible' : 'hidden'}
			>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>
			<div class="score-tile score-black">
				<div class="score" id="black-score">{blackScore}</div>
			</div>
		</div>
	</div>
	<div class="score-inner-container">
		<div class="name" id="bot-name">{reversi.player2Name}</div>
		<div class="tile-container">
			<div
				class="glow"
				id="glow-2"
				style:visibility={whiteTurn ? 'visible' : 'hidden'}
			>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>
			<div class="score-tile score-white">
				<div class="score" id="white-score">{whiteScore}</div>
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
		height: 120px;
		margin-top: 20px;

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
