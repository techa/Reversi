import { Tile, Sym, ReversiOptions, directionXYs, Reversi } from './Reversi.js'
import { HistoryData } from './View.svelte.js'

export type AILV = 0 | 1 | 2 | 3 | 4 | 5

export type AIReversiOptions = ReversiOptions & {
	aiPlayer1LV: AILV
	aiPlayer2LV: AILV
}

export interface Hand {
	x: number
	y: number
	count: number
	/**
	 * 着手点
	 * * 配列は自分（0）、相手（1）
	 */
	choices: number[]
	opens: number
	fixed: number
	scores: {
		count: number
		choices: number
		opens: number
		position_corner: number
		position_corner_clue: number
		position_edge: number[]
		next_turn: number
		fixed: number
		total: number
	}
}

// 考慮の重要度
export interface AISetting {
	/**
	 * ひっくり返せる石の数
	 * * 配列は序盤（0）、中盤（1）、終盤（2）を表す
	 */
	count?: number[]
	/**
	 * 着手点
	 * * 配列は自分（0）、相手（1）
	 */
	choices?: number[]
	/**
	 * 開放度理論：隣接する空きマスの数
	 * * 配列は序盤（0）、中盤（1）、終盤（2）を表す
	 */
	opens?: number[]
	position_corner?: number
	position_corner_clue?: number

	/**
	 * ```
	 * 00000000
	 * 01111110
	 * 01222210
	 * 01233210
	 * 01233210
	 * 01222210
	 * 01111110
	 * 00000000
	 * ```
	 *
	 * [5,6,7] の場合上の図の０を５点、１を６点、２を７点とする
	 */
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
		choices: [1, 1],
		opens: [0.5, 0.5, 0.5],
		position_corner: 1,
		position_corner_clue: -1,
		position_edge: [0.5, -0.5, 0.5],
		blur: 1,
	},
	// 5
	{
		count: [-1, 0, 1],
		choices: [0, 1],
		opens: [0.5, 0.5, 0.5],
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
	hiScore: number

	boardLog: HistoryData[] = []
	/**
	 * If this is true, it is the thinking stage of AI
	 */
	thinking = false

	/**
	 * * vs 'single' player
	 * * black player when 'demo'
	 */
	aiPlayer1LV: AILV
	/**
	 * * white player when 'demo'
	 */
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
			choices,
			opens,
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

		if (choices) {
			for (let i = 0; i < 2; i++) {
				scores.choices += hand.choices[i] * choices[i]
			}
		}

		// 開放度が低いほど高スコア
		// 開放度理論
		// ひっくり返した石に隣接する空きマスが少ないほど良い手
		// どこに置くか迷ったら、なるべく多くの石に囲まれているものをひっくり返す
		if (opens) {
			scores.opens +=
				(boardSize - this.opens(x, y) / hand.count) * opens[term]
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
			this.logging(x, y)
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

	logging(x: number, y: number) {
		this.thinking = true
		this.boardLog.push({
			x,
			y,
			sym: this.sym,
			tiles: this.tiles.slice(),
			turn: this.turn,
		})
	}

	virtualHit(x: number, y: number) {
		this.thinking = true
		this.boardLog.push({
			x,
			y,
			sym: this.sym,
			tiles: this.tiles.slice(),
			turn: this.turn,
		})

		return this.addTile(x, y)
	}

	reset(index = 0) {
		const log = this.boardLog[index]
		if (log) {
			const { tiles, turn } = log
			this.tiles = tiles
			this.turn = turn
			this.sym = this.turn % 2 === 0 ? Tile.W : Tile.B
		}
		this.boardLog = []
		if (!index) {
			this.thinking = false
		}
	}

	init(options: Partial<AIReversiOptions> = {}) {
		this.aiPlayer1LV = options.aiPlayer1LV ?? 1
		this.aiPlayer2LV = options.aiPlayer2LV ?? 1
		return super.init(options)
	}

	/**
	 *   序0       中1        終2
	 * +----+----+----+----+----+
	 * 0   0.2  0.4  0.6  0.8   1
	 */
	get term(): 0 | 1 | 2 {
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
		const lv = this.singleMode
			? this.aiPlayer1LV
			: this.sym === Tile.B
			? this.aiPlayer1LV
			: this.aiPlayer2LV

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
		return hands
	}

	getHand(x: number, y: number, lv: number) {
		const hand: Hand = {
			x,
			y,
			count: this.accumulator(x, y),
			choices: this.getChoices(x, y),
			opens: this.opens(x, y),
			fixed: this.fixedCount(x, y),
			scores: {
				count: 0,
				choices: 0,
				opens: 0,
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

	/**
	 * いくつ石を返せるか
	 */
	accumulator(x: number, y: number) {
		let totalChanged = 0
		this.directionEach(x, y, () => totalChanged++)
		return totalChanged
	}

	/**
	 * 着手可能数（自分の打てる選択肢ー相手の打てる選択肢）
	 *
	 * virtualHit後に使用
	 * * 自分の打てる選択肢を多くすると有利になる
	 * * 相手の打てる選択肢を減らせば不利にできる
	 */
	getChoices(x: number, y: number) {
		// 自分の手を打つ
		this.virtualHit(x, y)

		// 相手のターンなので相手の打てる選択肢を数える
		const enemy = -this._getChoices()
		// 相手の手は打たずターンだけ進めて
		this.nextTurn()
		// 自分の打てる選択肢を数える
		const self = this._getChoices()

		this.reset()

		return [self, enemy]
	}
	private _getChoices() {
		let score = 0
		const { boardSize } = this
		for (let y = 0; y < boardSize; y++) {
			for (let x = 0; x < boardSize; x++) {
				if (this.checkOKtoPlace(x, y)) {
					score++
				}
			}
		}
		return score
	}

	/**
	 * 開放度理論
	 */
	opens(x: number, y: number) {
		const { boardSize } = this
		const opens = new Set<number>()
		this.directionEach(x, y, (pX, pY) => {
			directionXYs.forEach(([dx, dy]) => {
				dx += pX
				dy += pY
				if (
					dx >= 0 &&
					dx < boardSize &&
					dy >= 0 &&
					dy < boardSize &&
					this.isTileEmpty(dx, dy)
				) {
					opens.add(dy * boardSize + dx)
				}
			})
		})
		opens.delete(y * boardSize + x)
		return opens.size
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
