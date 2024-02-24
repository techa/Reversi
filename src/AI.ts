import {
	Tile,
	Sym,
	BoardSize,
	InitialPlacement,
	Mode,
	directionXYs,
	Reversi,
} from './Reversi.js'
export * from './Reversi.js'

export type AILV = 0 | 1 | 2 | 3 | 4 | 5

export interface ReversiOptions {
	/**
	 * range: 4-12
	 * default: 8
	 */
	boardSize: BoardSize
	initialPlacement: InitialPlacement
	mode: Mode
	random: () => number
	aiPlayer1LV: AILV
	aiPlayer2LV: AILV
}

export interface Hand {
	x: number
	y: number
	total: number
	opens: number
	opensAll: number
	score: number
}

interface BoardLog {
	// hand: Hand
	tiles: Tile[]
	counter: number
}

// 考慮の重要度
export interface AISetting {
	opens?: number[]
	opensAll?: number[]
	total?: number[]
	position_edge?: number[]
	position_edge2?: number[]
	next_turn?: number[]
}
export type AISettings = AISetting[]

export const AIsetting: AISettings = [
	{},
	// 1
	{ total: 1 },
	// 2
	{ total: [-1, 0, 1], opens: [0, 1, 0] },
	// 3
	{ total: [-1, 0, 1], opens: [0, 1, 0], position_edge: 0.5 },
	// 4
	{ total: [-1, 0, 2], opensAll: [0, 1, 0.5], position_edge: 1 },
	// 5
	{
		total: [-1, 0, 1],
		opensAll: [0, 1, 0.5],
		position_edge: 1,
		position_edge2: 1,
		next_turn: 100,
	},
].map((setting) => {
	for (const key in setting) {
		const value = setting[key]
		if (typeof value === 'number') {
			setting[key] = [value, value, value]
		}
	}
	return setting as AISetting
})

export class AIReversi extends Reversi {
	opens: number[]
	hands: Hand[] = []
	hiScore: number

	boardLog: string[] = []
	thinking = false

	aiPlayer1LV: AILV
	aiPlayer2LV: AILV

	getScore(hand: Hand) {
		const { total: _total, x, y } = hand
		const { boardSize } = this

		const lv = this.sym === Tile.B ? this.aiPlayer1LV : this.aiPlayer2LV
		const {
			total,
			opens,
			opensAll,
			position_edge,
			position_edge2,
			next_turn,
		} = AIsetting[lv]
		const term = this.term

		if (total) {
			hand.score += _total * total[term]
		}

		// 開放度が低いほど高スコア
		if (opensAll) {
			hand.score +=
				(boardSize - this.openedAll(x, y) / _total) * opensAll[term]
		}
		if (opens) {
			hand.score += (boardSize - this.opened(x, y)) * opens[term]
		}

		// Position score
		const edge = boardSize - 1
		if (position_edge) {
			if (
				(x === 0 && y !== 1) ||
				(x === 0 && y !== edge - 1) ||
				(x !== 1 && y === 0) ||
				(x !== 1 && y === edge)
			) {
				hand.score += (boardSize / 2) * position_edge[term]
			}
			if (
				(x === edge && y !== 1) ||
				(x === edge && y !== edge - 1) ||
				(x !== edge + 1 && y === 0) ||
				(x !== edge + 1 && y === edge)
			) {
				hand.score += (boardSize / 2) * position_edge[term]
			}
			// minus
			if (
				(x === 1 && y === 1) ||
				(x === 1 && y === edge - 1) ||
				(x === edge - 1 && y === 1) ||
				(x === edge - 1 && y === edge - 1)
			) {
				hand.score -= (boardSize / 2) * position_edge[term]
			}
		}
		if (position_edge2) {
			if (x === 2 || y === 2 || x === edge - 2 || y === edge - 2) {
				hand.score += boardSize * position_edge2[term]
			}
		}

		// console.log(
		// 	this.sym,
		// 	lv,
		// 	next_turn,
		// 	'LV',
		// 	this.aiPlayer1LV,
		// 	this.aiPlayer2LV
		// )
		if (next_turn) {
			this.thinking = true
			this.logging()
			const slots = this.hit(x, y)

			if (this.term === 2) {
				if (!slots.movable) {
					hand.score += 100
				}
			}
			this.reset()
			this.thinking = false
		}

		return hand
	}

	logging(/* hand: Hand */) {
		this.boardLog.push(
			// {
			// 	tiles: this.tiles.slice(),
			// 	counter: this.counter,
			// }
			JSON.stringify({
				// hand,
				tiles: this.tiles,
				counter: this.counter,
			})
		)
	}

	reset(index = 0) {
		const log = JSON.parse(this.boardLog[index]) as BoardLog
		if (log) {
			const { tiles, counter } = log
			this.tiles = tiles
			this.counter = counter
			this.sym = this.counter % 2 === 0 ? Tile.W : Tile.B
		}
		this.boardLog = []
	}

	constructor(options: Partial<ReversiOptions> = {}) {
		super(options)
		this.aiPlayer1LV = options.aiPlayer1LV ?? 1
		this.aiPlayer2LV = options.aiPlayer2LV ?? 1
	}

	/**
	 *   序        中         終
	 * +----+----+----+----+----+
	 * 0   0.2  0.4  0.6  0.8   1
	 */
	get term() {
		const per = this.countPer
		if (per > 0.8) {
			return 2
		} else if (per > 0.6) {
			if (this.random() > (per - 0.6) / 0.2) {
				return 2
			}
		} else if (per > 0.4) {
			return 1
		} else if (per > 0.2) {
			if (this.random() > (per - 0.2) / 0.2) {
				return 1
			}
		}
		return 0
	}

	get countPer() {
		const max = this.boardSize ** 2 - 4
		return this.counter / max
	}

	ai_nextHand() {
		this.getHands()
		return this.pick()
	}

	pick(range = 0) {
		const hands = this.hands
			.filter((hand) => hand.score >= this.hiScore - range)
			.sort((a, b) => b.score - a.score)

		return hands[Math.floor(this.random() * hands.length)]
	}

	getHands() {
		const { boardSize } = this
		this.hands = []
		this.hiScore = -Infinity

		for (let index = 0; index < boardSize ** 2; index++) {
			const x = index % boardSize
			const y = (index / boardSize) | 0
			if (this.isTileEmpty(x, y)) {
				if (this.checkOKtoPlace(this.sym, x, y)) {
					const hand = {
						x,
						y,
						total: this.accumulator(this.sym, x, y),
						opens: this.opened(x, y),
						opensAll: this.openedAll(x, y),
						score: 0,
					}
					this.getScore(hand)
					if (hand.score > this.hiScore) {
						this.hiScore = hand.score
					}
					this.hands.push(hand)
				}
			}
		}
		return this.hands
	}

	accumulator(sym: Sym, x: number, y: number) {
		let totalChanged = 0
		this.directionEach(sym, x, y, () => totalChanged++)
		return totalChanged
	}

	_opened(pX: number, pY: number, curr: number[] | false = false) {
		const { boardSize } = this
		directionXYs.forEach((dir) => {
			const x = pX + dir[0]
			const y = pY + dir[1]
			if (
				x >= 0 &&
				x < boardSize &&
				y >= 0 &&
				y < boardSize &&
				(!curr || curr[0] !== x || curr[1] !== y) &&
				this.isTileEmpty(x, y)
			) {
				const id = y * boardSize + x
				if (this.opens.indexOf(id) === -1) {
					this.opens.push(id)
				}
			}
		})
	}

	opened(dx: number, dy: number) {
		this.opens = []
		this._opened(dx, dy)
		return this.opens.length
	}

	openedAll(dx: number, dy: number) {
		this.opens = []
		this.directionEach(this.sym, dx, dy, (pX, pY) => {
			this._opened(pX, pY, [dx, dy])
		})
		this._opened(dx, dy)
		return this.opens.length
	}
}
