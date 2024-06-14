import { AIReversi, ReversiOptions, AILVMAX } from './AI.js'
import { type Sym, Tile } from './Reversi.js'
import { SoundID, Sounds } from './Sounds.js'

export const options: ReversiOptions = $state({
	boardSize: 8,
	initialPlacement: 'cross',
	yourColor: Tile.B,
	mode: '2',
	aiPlayer1LV: AILVMAX,
	aiPlayer2LV: AILVMAX,
})

export const states = $state({
	tiles: [] as Tile[],
	history: [] as { sym: Sym; x: number; y: number }[],
	playerTurn: false,
	blackTurn: true,
	whiteTurn: false,
	blackScore: 2,
	whiteScore: 2,
	aiLv: AILVMAX,
})

export const reversi = new (class extends AIReversi {
	sounds = new Sounds()
	timerID: number

	init(options: ReversiOptions) {
		clearTimeout(this.timerID)
		super.init(options)
		states.history = []
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
			states.tiles = this.tiles
			states.playerTurn = false
		}
	}
	$tilesUpdate(x: number, y: number) {
		super.$tilesUpdate(x, y)
		if (!this.thinking) {
			states.tiles = this.tiles
		}
	}
	$updateLastMove(x: number, y: number) {
		states.history.push({
			sym: this.sym,
			x,
			y,
		})
	}
	$tilesCounting() {
		super.$tilesCounting()
		states.blackScore = this.blackCount
		states.whiteScore = this.whiteCount
	}
	$glowchange() {
		if (this.sym === Tile.W) {
			states.blackTurn = false
			states.whiteTurn = true
		} else {
			states.blackTurn = true
			states.whiteTurn = false
		}
	}
	$checkWin() {
		const message = super.$checkWin()
		// this.view.$checkWin(message)
		return message
	}
	$playerTurn() {
		states.playerTurn = true
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
})()