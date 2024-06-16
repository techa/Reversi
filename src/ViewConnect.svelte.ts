import { AIReversi, type ReversiOptions, AILVMAX, type Hand } from './AI.js'
import { type Sym, Tile, HistoryData } from './Reversi.js'
import { SoundID, Sounds } from './Sounds.js'

export const options: ReversiOptions = $state({
	boardSize: 8,
	initialPlacement: 'cross',
	yourColor: Tile.B,
	mode: '2',
	aiPlayer1LV: AILVMAX,
	aiPlayer2LV: AILVMAX,
})

export const enum ModalType {
	Hide,
	BackOrRestart,
	Config,
}

export const enum Constants {
	BoardWidthMax = 800,
}

export const states = $state({
	tiles: [] as Tile[],
	history: [] as HistoryData[],
	playerTurn: false,
	activePlayerName: '',
	blackTurn: true,
	whiteTurn: false,
	blackScore: 2,
	whiteScore: 2,
	aiLv: AILVMAX,

	turn: 0,
	started: false,
	modal: ModalType.Hide,
	winlose: '',
	hand: null as null | Hand,
	handPosition: null as null | [number, number],

	mute: false,
	aiWait: 2000,
	// 棋譜履歴の非表示化
	historyHide: false,
})

export const reversi = new (class extends AIReversi {
	sounds = new Sounds()
	timerID: number

	init(options: ReversiOptions) {
		clearTimeout(this.timerID)
		states.history = []
		states.winlose = ''
		states.turn = this.turn
		super.init(options)
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
			if (states.started && !this.thinking) {
				this.timerID = setTimeout(() => {
					super.$aiTurn()
				}, 2000)
			}
		}
	}
	$setTile(x: number, y: number, sym: Sym) {
		super.$setTile(x, y, sym)
		if (!this.thinking) {
			states.tiles = this.tiles
			states.playerTurn = false
			states.hand = null
		}
	}
	$tilesUpdate(x: number, y: number) {
		super.$tilesUpdate(x, y)
		if (!this.thinking) {
			states.tiles = this.tiles
		}
	}
	$insert(data: HistoryData, index: number) {
		states.playerTurn = false
		super.$insert(data)
		states.tiles = data.tiles
		states.turn = data.turn
		states.history = states.history.slice(index)
	}
	$addHistory(x: number, y: number) {
		if (!this.thinking) {
			states.history.unshift({
				sym: this.sym,
				x,
				y,
				tiles: $state.snapshot(this.tiles),
				turn: $state.snapshot(this.turn),
			})
		}
	}
	$tilesCounting() {
		if (!this.thinking) {
			super.$tilesCounting()
			states.blackScore = this.blackCount
			states.whiteScore = this.whiteCount
			states.turn = this.turn
		}
	}
	$turnSwitch() {
		if (!this.thinking) {
			if (this.sym === Tile.W) {
				states.blackTurn = false
				states.whiteTurn = true
			} else {
				states.blackTurn = true
				states.whiteTurn = false
			}
			states.activePlayerName =
				this.sym === Tile.B
					? this.blackPlayerName
					: this.whitePlayerName
		}
	}
	$checkWin() {
		const message = super.$checkWin()
		if (!this.thinking) {
			states.blackTurn = false
			states.whiteTurn = false
			states.modal = ModalType.BackOrRestart
			states.winlose = message
		}
		return message
	}
	S_invalid() {
		if (!this.thinking) {
			console.log('Invalid Move')
			this.sounds.sePlay(SoundID.Invalid)
		}
	}
	S_place() {
		if (!this.thinking) {
			this.sounds.sePlay(SoundID.Place)
		}
	}

	getSymColor(tile: Tile = this.sym) {
		return tile === Tile.B ? 'black' : 'white'
	}
})()
