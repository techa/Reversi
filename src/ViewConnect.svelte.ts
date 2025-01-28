import { AIReversi, type AIReversiOptions, AILVMAX } from './AI.js'
import {
	type Sym,
	Tile,
	type HistoryData,
	ReversiStatesDefault,
} from './Reversi.js'
import { SoundID, Sounds } from './Sounds.js'
import { clamp } from './utils.js'

export const options: AIReversiOptions = $state({
	boardSize: 8,
	initialPlacement: 'cross',
	yourColor: Tile.Null, // Random
	mode: '2',
	aiPlayer1LV: AILVMAX,
	aiPlayer2LV: AILVMAX,
})

export const enum Constants {
	BoardWidthMax = 800,
}

export const states = $state(ReversiStatesDefault)

export const reversi = new (class extends AIReversi {
	sounds = new Sounds()
	timerID: number

	init(options: AIReversiOptions) {
		clearTimeout(this.timerID)
		states.winlose = ''
		states.turn = this.turn
		super.init(options)
		states.history = [
			{
				sym: this.sym,
				x: -1,
				y: -1,
				tiles: $state.snapshot(this.tiles),
				turn: 0,
			},
		]
		this.$turnSwitch()
		return this
	}
	$playerTurn() {
		if (!this.thinking) {
			states.playerTurn = true
		}
	}
	$aiTurn() {
		if (this.thinking) {
			super.$aiTurn()
		} else {
			clearTimeout(this.timerID)
			this.timerID = setTimeout(() => {
				super.$aiTurn()
			}, clamp(states.aiWait, 500, 4000))
		}
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
	$insert(data: HistoryData) {
		states.playerTurn = false
		super.$insert(data)
		states.tiles = data.tiles
		states.turn = data.turn
	}
	$addHistory(x: number, y: number) {
		if (!this.thinking) {
			const oldHand = states.history[states.history.length - this.turn]
			const isNewHand = oldHand && (oldHand.x != x || oldHand.y !== y)

			if (states.history.length > this.turn && isNewHand) {
				states.history = states.history.slice(-this.turn)
			}

			if (!oldHand || isNewHand) {
				states.history.unshift({
					sym: this.sym,
					x,
					y,
					tiles: $state.snapshot(this.tiles),
					turn: $state.snapshot(this.turn),
				})
			}
		}
	}
	$tilesCounting() {
		if (!this.thinking) {
			super.$tilesCounting()
			states.blackScore = this.blackScore
			states.whiteScore = this.whiteScore
			states.turn = this.turn
		}
	}
	$turnSwitch() {
		if (!this.thinking) {
			states.sym = this.sym
		}
	}
	$checkWin() {
		const message = super.$checkWin()
		if (!this.thinking) {
			states.winlose = message
		}
		return message
	}
	S_invalid() {
		if (!this.thinking) {
			console.log('Invalid Move')
			this.sounds.play(SoundID.Invalid)
		}
	}
	S_place() {
		if (!this.thinking) {
			this.sounds.play(SoundID.Place)
		}
	}

	getSymColor(tile: Tile = this.sym) {
		return tile === Tile.B ? 'black' : 'white'
	}
})()
