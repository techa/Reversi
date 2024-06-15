import {
	Tile,
	Sym,
	BoardSize,
	InitialPlacement,
	Mode,
	directionXYs,
	Reversi,
} from './Reversi.js'

export type AILV = 0 | 1 | 2 | 3 | 4 | 5

export interface ReversiOptions {
	/**
	 * range: 4-12
	 * default: 8
	 */
	boardSize: BoardSize
	initialPlacement: InitialPlacement
	mode: Mode
	yourColor: Tile
	random?: () => number
	aiPlayer1LV: AILV
	aiPlayer2LV: AILV
}

export interface Hand {
	x: number
	y: number
	count: number
	opens: number
	opensAll: number
	fixed: number
	scores: {
		count: number
		opens: number
		opensAll: number
		position_corner: number
		position_corner_clue: number
		position_edge: number[]
		next_turn: number
		fixed: number
		total: number
	}
}

interface BoardLog {
	// hand: Hand
	tiles: Tile[]
	counter: number
}

// 考慮の重要度
export interface AISetting {
	count?: number[]
	opens?: number[]
	opensAll?: number[]
	position_corner?: number
	position_corner_clue?: number
	position_edge?: number[]
	next_turn?: number
	fixed?: number
	blur?: number
}
export type AISettings = AISetting[]

export const AIsettings: AISettings = [
	{},
	// 1
	{ count: [1, 1, 1] },
	// 2
	{ count: [-1, 0, 1], opens: [0, 1, 0.5], position_corner: 0.5, blur: 3 },
	// 3
	{
		count: [-1, 0, 1],
		opens: [0, 1, 0.5],
		position_corner: 1,
		position_corner_clue: -1,
		position_edge: [1, -0.5],
		blur: 2,
	},
	// 4
	{
		count: [-1, 0, 1],
		opens: [0.5, 0.5, 0.5],
		opensAll: [0, 1, 0.5],
		position_corner: 1,
		position_corner_clue: -1,
		position_edge: [0.5, -0.5, 0.5],
		blur: 1,
	},
	// 5
	{
		count: [-1, 0, 1],
		opens: [0.5, 0.5, 0.5],
		opensAll: [0, 1, 0.5],
		position_corner: 1,
		position_corner_clue: -1,
		position_edge: [0.5, -0.5, 0.5],
		next_turn: 100,
		fixed: 1,
		blur: 0,
	},
]
export const AILVMAX = (AIsettings.length - 1) as AILV

export abstract class AIReversi extends Reversi {
	opens: number[]
	hiScore: number

	boardLog: BoardLog[] = []
	thinking = false

	aiPlayer1LV: AILV
	aiPlayer2LV: AILV

	private _corner_clue(x: number, y: number, dx: number, dy: number) {
		const cx = dx > 2 ? -1 : 1
		const cy = dy > 2 ? -1 : 1
		return (
			this.isTileEmpty(dx, dy) &&
			(((dx > 2 ? x >= dx - 1 : x <= 1) && y === dy + cy) ||
				((dy > 2 ? y >= dy - 1 : y <= 1) && x === dx + cx))
		)
	}

	getScore(hand: Hand, lv: number) {
		const { x, y, scores } = hand
		const { boardSize, term } = this
		if (!AIsettings[lv]) {
			console.log('lv', lv)
		}
		const {
			count,
			opens,
			opensAll,
			position_corner,
			position_corner_clue,
			position_edge,
			next_turn,
			fixed,
		} = AIsettings[lv]

		if (count) {
			// 序盤は少なく取る
			scores.count += hand.count * count[term]
		}

		// 開放度が低いほど高スコア
		// 開放度理論
		// ひっくり返した石に隣接する空きマスが少ないほど良い手
		// どこに置くか迷ったら、なるべく多くの石に囲まれているものをひっくり返す
		if (opensAll) {
			scores.opensAll +=
				(boardSize - this.openedAll(x, y) / hand.count) * opensAll[term]
		}
		if (opens) {
			scores.opens += (boardSize - this.opened(x, y)) * opens[term]
		}

		// Position score
		const edge = boardSize - 1
		if (position_corner) {
			if (
				(x === 0 && y === 0) ||
				(x === 0 && y === edge) ||
				(x === edge && y === 0) ||
				(x === edge && y === edge)
			) {
				scores.position_corner += boardSize * position_corner
			}
		}
		if (position_corner_clue) {
			if (
				this._corner_clue(x, y, 0, 0) ||
				this._corner_clue(x, y, 0, edge) ||
				this._corner_clue(x, y, edge, 0) ||
				this._corner_clue(x, y, edge, edge)
			) {
				scores.position_corner_clue += boardSize * position_corner_clue
			}
		}
		if (position_edge) {
			for (let i = 0; i < position_edge.length; i++) {
				if (x === i || x === edge - i) {
					scores.position_edge[i] += boardSize * position_edge[i]
				}
				if (y === i || y === edge - i) {
					scores.position_edge[i] += boardSize * position_edge[i]
				}
			}
		}

		if (next_turn) {
			this.logging()
			if (this.term === 2) {
				const slots = this.addTile(x, y)
				if (slots.empty) {
					if (!slots.movable) {
						scores.next_turn += next_turn
					} else {
						// const hand = this.ai_nextHand()
						// hand.score +=
						// 	this.getHand(hand.x, hand.y, lv).score || 0
					}
				}
			}
			this.reset()
		}

		if (fixed) {
			scores.fixed += hand.fixed * fixed
		}

		// score total
		for (const key in scores) {
			const value = scores[key]
			if (Array.isArray(value)) {
				scores.total += value.reduce<number>(
					(score, val) => score + val,
					0
				)
			} else if (key !== 'total' && typeof value === 'number') {
				scores.total += value
			}
		}

		return hand
	}

	logging() {
		this.thinking = true
		this.boardLog.push({
			tiles: this.tiles.slice(),
			counter: this.turn,
		})
	}

	reset(index = 0) {
		const log = this.boardLog[index]
		if (log) {
			const { tiles, counter } = log
			this.tiles = tiles
			this.turn = counter
			this.sym = this.turn % 2 === 0 ? Tile.W : Tile.B
		}
		this.boardLog = []
		if (!index) {
			this.thinking = false
		}
	}

	init(options: Partial<ReversiOptions> = {}) {
		this.aiPlayer1LV = options.aiPlayer1LV ?? 1
		this.aiPlayer2LV = options.aiPlayer2LV ?? 1
		return super.init(options)
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
		return this.turn / max
	}

	ai_nextHand() {
		const lv = this.sym === Tile.B ? this.aiPlayer1LV : this.aiPlayer2LV

		return this.pick(this.getHands(lv), AIsettings[lv].blur)
	}

	pick(hands: Hand[], blur = 0.001) {
		hands = hands
			.filter((hand) => hand.scores.total >= this.hiScore - blur)
			.sort((a, b) => b.scores.total - a.scores.total)

		return hands[Math.floor(this.random() * hands.length)]
	}

	getHands(lv: number) {
		const { boardSize } = this
		const hands: Hand[] = []
		this.hiScore = -Infinity

		for (let y = 0; y < boardSize; y++) {
			for (let x = 0; x < boardSize; x++) {
				if (this.isTileEmpty(x, y)) {
					if (this.checkOKtoPlace(x, y)) {
						const hand = this.getHand(x, y, lv)
						if (hand.scores.total > this.hiScore) {
							this.hiScore = hand.scores.total
						}
						if (hand) {
							hands.push(hand)
						}
					}
				}
			}
		}
		return hands
	}

	getHand(x: number, y: number, lv: number) {
		const hand: Hand = {
			x,
			y,
			count: this.accumulator(x, y),
			opens: this.opened(x, y),
			opensAll: this.openedAll(x, y),
			fixed: this.fixedCount(x, y),
			scores: {
				count: 0,
				opens: 0,
				opensAll: 0,
				position_corner: 0,
				position_corner_clue: 0,
				position_edge: [0, 0, 0],
				next_turn: 0,
				fixed: 0,
				total: 0,
			},
		}
		this.getScore(hand, lv)
		return hand
	}

	accumulator(x: number, y: number) {
		let totalChanged = 0
		this.directionEach(x, y, () => totalChanged++)
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

	// 開放度理論
	opened(dx: number, dy: number) {
		this.opens = []
		this._opened(dx, dy)
		return this.opens.length
	}

	openedAll(dx: number, dy: number) {
		this.opens = []
		this.directionEach(dx, dy, (pX, pY) => {
			this._opened(pX, pY, [dx, dy])
		})
		this._opened(dx, dy)
		return this.opens.length
	}

	/**
	 * 確定タイル：自分の色で固定されるタイルかを確認する
	 * ```
	 * ----tiles0----+target+----tiles1-----
	 * B   B   B     |  W   | W   W   _   _    =false
	 * B   B   B     |  B   | W   W   _   _    =true
	 * B   B   B     |  W   | W   W   B   B    =true
	 *
	 * B   B   B     |  W   | B   _   _   _    =true
	 * ```
	 */
	fixed(sym: Sym, x: number, y: number, hitting?: [number, number]) {
		let tiles0: Tile[] = []
		let tiles1: Tile[] = []

		// symの反色か空きマスが一つでもあればcanReverseFlag=true
		let flagTile: Tile
		const canReverseFlag = (tiles: Tile[]) => {
			return tiles.some((tile) => (flagTile = tile) !== sym)
		}
		const canReverse = (tiles: Tile[]) => {
			// return tiles.some((tile) => tile === Tile.Null)
			let before: Tile = sym
			for (let i = 0; i < tiles.length; i++) {
				const tile = tiles[i]
				if (tile === Tile.Null) {
					if (flagTile === Tile.Null || before === Tile.Null) {
						return true
					}
					// * -tiles0+target+----tiles1-----
					// *  B     |  W   | W   B   _    =false
					// *  B     |  W   | B   _   _    =true
					// *  W     |  B   | B   W   _    =false
					// *  W     |  B   | W   _   _    =true
					if (before !== sym) {
						return tiles.length - i > 1
					}
				}
				before = tile
			}

			return false
		}

		const getTile = (px: number, py: number) => {
			return hitting && px === hitting[0] && py === hitting[1]
				? this.sym
				: this.getTile(px, py)
		}

		// top&bottom, right&left, top-right&bottom-left, top-left&bottom-right ４つのラインを調べる
		for (let i = 0; i < 8; i++) {
			const [dX, dY] = directionXYs[i]
			if (i % 2 === 0) {
				tiles0 = []
				tiles1 = []
			}

			let a = 0
			while (true) {
				a++
				let pX = x + dX * a
				let pY = y + dY * a
				const tile = getTile(pX, pY)

				if (tile === Tile.OutSide) {
					break
				} else {
					if (i % 2 === 0) {
						tiles0.push(tile)
					} else {
						tiles1.push(tile)
					}
				}
			}

			if (i % 2) {
				// console.log('tiles0', tiles0)
				// console.log('tiles1', tiles1)

				// * ----tiles0----+target+----tiles1-----
				// * B   B   B     |  W   | W   W   _   _    =false
				//   ↑targetの反色が一つでもあればcanReverseFlag=true
				// 空きマスが一つでもあれば引っくり返せる可能性がある
				if (
					(canReverseFlag(tiles0) && canReverse(tiles1)) ||
					(canReverseFlag(tiles1) && canReverse(tiles0))
				) {
					return false
				}
			}
		}
		return true
	}

	// 確定タイル：自分の色で固定されるタイルを数える
	fixedCount(x: number, y: number) {
		let count = 0
		this.directionEach(x, y, (px, py) => {
			if (this.fixed(this.sym, px, py, [x, y])) {
				count++
			}
		})
		if (this.fixed(this.sym, x, y)) {
			count++
		}
		return count
	}
}
