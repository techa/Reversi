export const enum Tile {
	OutSide = -1,
	Null = 0,
	B = 1,
	W = 2,
}
export type Sym = Tile.B | Tile.W
export type BoardSize = 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type InitialPlacement = 'cross' | 'parallel' | 'random'
export type Mode = 'single' | '2' | 'demo'

export interface ReversiOptions {
	/**
	 * range: 4-12
	 * default: 8
	 */
	boardSize: BoardSize
	initialPlacement: InitialPlacement
	mode: Mode
	yourColor: Tile
	random: () => number
}

export const directionXYs: [number, number][] = [
	[0, -1], // top
	[0, 1], // bottom

	[1, 0], // right
	[-1, 0], // left

	[1, -1], // top-right
	[-1, 1], // bottom-left

	[-1, -1], // top-left
	[1, 1], // bottom-right
]

export interface HistoryData {
	sym: Sym
	x: number
	y: number
	tiles: Tile[]
	turn: number
}

export abstract class Reversi {
	boardSize: BoardSize = 8
	initialPlacement: InitialPlacement = 'cross'
	mode: Mode = '2'
	yourColor: Sym = Tile.B

	turn = 1
	sym: Sym = Tile.B
	nextTurn() {
		this.turn++
		this.sym = this.turn % 2 === 0 ? Tile.W : Tile.B
	}

	tiles: Tile[] = []
	opens: number[] = []

	botMode = false
	demo = false
	singlePlayerMode = false

	get blackPlayerName() {
		const mode = this.mode
		return mode === '2' || mode === 'demo'
			? 'Black'
			: mode === 'single' && this.yourColor === Tile.B
			? 'You'
			: 'AI'
	}
	get whitePlayerName() {
		const mode = this.mode
		return mode === '2' || mode === 'demo'
			? 'White'
			: mode === 'single' && this.yourColor === Tile.W
			? 'You'
			: 'AI'
	}

	whiteCount = 0
	blackCount = 0

	random: () => number

	setOptions(options: Partial<ReversiOptions> = {}) {
		this.boardSize = options.boardSize ?? this.boardSize
		this.initialPlacement =
			options.initialPlacement ?? this.initialPlacement

		this.mode = options.mode ?? this.mode
		this.random = options.random ?? Math.random

		if (this.initialPlacement === 'random') {
			this.initialPlacement = this.random() > 0.5 ? 'cross' : 'parallel'
		}

		const yc = options.yourColor
		this.yourColor =
			yc == null
				? this.yourColor
				: yc > 0
				? (yc as Sym)
				: this.random() > 0.5
				? Tile.B
				: Tile.W
	}

	init(options: Partial<ReversiOptions> = {}) {
		this.setOptions(options)
		this.turn = 1
		this.sym = Tile.B
		this.initBoardArray()
		this.initialPieces()

		this.demo = this.mode === 'demo'
		const single = this.mode === 'single'
		this.singlePlayerMode = single
		this.botMode = single || this.demo

		if (this.demo || (single && this.yourColor === Tile.W)) {
			this.$aiTurn()
		} else {
			this.$playerTurn()
		}
		return this
	}

	initBoardArray() {
		this.tiles = []
		for (let i = 0; i < this.boardSize ** 2; i++) {
			this.tiles.push(Tile.Null)
		}
	}

	/**
	 * * 初期配置の駒４つを配置する
	 *
	 * ```
	 * cross    parallel
	 * ____      ____
	 * _WB_      _WW_
	 * _BW_      _BB_
	 * ____      ____
	 * ```
	 */
	initialPieces(type = this.initialPlacement) {
		const center = ((this.boardSize / 2) | 0) - 1
		for (let i = 0; i < 4; i++) {
			let x = center
			let y = center
			if (i === 2 || i === 3) {
				y += 1
			}
			if (i === 1 || i === 3) {
				x += 1
			}
			let sym = Tile.B
			if (
				(type === 'cross' && (!i || i === 3)) ||
				(type === 'parallel' && i < 2)
			) {
				sym = Tile.W
			}

			this.$setTile(x, y, sym)
		}
		this.$tilesCounting()
	}

	isTileEmpty(x: number, y: number): boolean {
		return this.getTile(x, y) === Tile.Null
	}
	getTile(x: number, y: number): Tile {
		if (x < 0 || y < 0 || x >= this.boardSize || y >= this.boardSize) {
			return Tile.OutSide
		}
		return this.tiles[y * this.boardSize + x]
	}
	$setTile(x: number, y: number, sym: Sym) {
		this.tiles[y * this.boardSize + x] = sym
	}
	$tilesUpdate(x: number, y: number) {
		const result: Tile[] = this.tiles.slice()
		this.directionEach(x, y, (pX, pY) => {
			result[pY * this.boardSize + pX] = this.sym
		})
		this.tiles = result
	}

	/**
	 * * For override at ViewConnect
	 * @abstract ViewConnect
	 */
	abstract $playerTurn(): void
	$aiTurn() {
		if (this.botMode) {
			const tile = this.ai_nextHand()
			this._doTheMove(this.addTile(tile.x, tile.y), true)
		} else {
			throw new Error(`$aiTurn() is invaild`)
		}
	}

	/**
	 * * For override at AIReversi
	 * @abstract AIReversi
	 */
	abstract ai_nextHand(): { x: number; y: number }

	/**
	 * * Tileにコマを置くことが出来るかを判定。
	 * * 八方向の内、一つでもひっくり返せるなら true
	 */
	checkOKtoPlace(x: number, y: number): boolean {
		for (const dir of directionXYs) {
			if (this.checkDirection(x, y, dir)) {
				return true
			}
		}
		return false
	}

	/**
	 * * dirの方向へひっくり返せるなら true
	 */
	checkDirection(x: number, y: number, dir: [number, number]): boolean {
		const { boardSize, sym } = this
		const dX = dir[0]
		const dY = dir[1]
		//              x-1,     x,  x+1
		const xCheck = [x < 2, false, x > boardSize - 3][dX + 1]
		//              y-1,     y,  y+1
		const yCheck = [y < 2, false, y > boardSize - 3][dY + 1]

		if (!(xCheck || yCheck)) {
			const neighbour = this.getTile(x + dX, y + dY)
			if (neighbour && neighbour !== sym) {
				const minX = dX < 0 ? x : boardSize - x - 1
				const minY = dY < 0 ? y : boardSize - y - 1
				const minCount =
					(dX && dY
						? Math.min(minX, minY)
						: dX
						? minX
						: dY
						? minY
						: 0) + 1
				for (let i = 2; i < minCount; i++) {
					const tileSym = this.getTile(x + i * dX, y + i * dY)
					if (tileSym === sym) {
						return true
					} else if (!tileSym) {
						return false
					}
				}
			}
		}
		return false
	}

	isAiTurn() {
		return this.mode === '2'
			? false
			: this.mode === 'demo'
			? true
			: this.yourColor === Tile.B
			? !!(this.turn % 2)
			: !(this.turn % 2)
	}

	$insert(data: HistoryData) {
		this.tiles = data.tiles
		this.sym = data.sym
		this.turn = data.turn

		this.nextTurn()
		this.$tilesCounting()
		this._doTheMove(this._checkSlots(), this.isAiTurn())
	}

	/**
	 * * Classの外から操作するためのトリガーメソッド
	 */
	hit(x: number, y: number) {
		if (this.checkOKtoPlace(x, y)) {
			this._doTheMove(this.addTile(x, y))
		} else {
			this.S_invalid()
		}
	}

	addTile(x: number, y: number) {
		this.S_place()
		this.$setTile(x, y, this.sym)
		this.$tilesUpdate(x, y)
		this.$addHistory(x, y)
		this.nextTurn()
		this.$tilesCounting()

		return this._checkSlots()
	}

	_doTheMove(
		slots: {
			empty: number //check anymore playable empty square
			movable: number //check any move left
		},
		aiTurn = false
	): void {
		// console.log(this.sym + ' turn')
		if (slots.empty > 0) {
			if (slots.movable > 0) {
				// console.log(this.sym + ' still can')
				this.$turnSwitch()

				if (aiTurn) {
					if (this.singlePlayerMode) {
						this.$playerTurn()
					} else {
						this.$aiTurn()
					}
				} else {
					if (!this.singlePlayerMode) {
						this.$playerTurn()
					} else {
						this.$aiTurn()
					}
				}
			} else {
				// console.log(this.sym + ' no place to move, pass')
				this.nextTurn()
				// console.log(this.sym + ' turn')
				const slots = this._checkSlots()
				if (slots.movable > 0) {
					if (aiTurn) {
						// console.log(this.sym + 'still can')
						this.$aiTurn()
					} else {
						this.$playerTurn()
					}
				} else {
					// console.log(this.sym + ' also cannot, end game')
					this.botMode = false
					this.$checkWin()
				}
			}
		} else {
			// console.log(this.sym + ' cannot d')
			this.botMode = false
			this.$checkWin()
		}
	}

	_checkSlots() {
		let emptyCount = 0
		let roughtCount = 0
		for (let y = 0; y < this.boardSize; y++) {
			for (let x = 0; x < this.boardSize; x++) {
				if (this.isTileEmpty(x, y)) {
					emptyCount++
					if (this.checkOKtoPlace(x, y)) {
						roughtCount++
					}
				}
			}
		}

		return { empty: emptyCount, movable: roughtCount }
	}

	abstract $addHistory(x: number, y: number): void

	$tilesCounting() {
		this.whiteCount = 0
		this.blackCount = 0
		for (const val of this.tiles) {
			if (val === Tile.W) this.whiteCount += 1
			if (val === Tile.B) this.blackCount += 1
		}
	}

	/**
	 * 座標に駒を置いたとき引っくり返せる全ての駒に対してcallbackを実行する
	 */
	directionEach(
		x: number,
		y: number,
		callback: (x: number, y: number) => void
	) {
		for (const dir of directionXYs) {
			if (this.checkDirection(x, y, dir)) {
				let settle = false
				const dX = dir[0]
				const dY = dir[1]

				while (!settle) {
					if (!this.isTileEmpty(x + dX, y + dY)) {
						let a = 1
						let pX = x + dX * a
						let pY = y + dY * a
						while (this.getTile(pX, pY) !== this.sym) {
							callback(pX, pY)
							a++
							pX = x + dX * a
							pY = y + dY * a
						}
						settle = true
					} else {
						settle = true
					}
				}
			}
		}
	}

	/**
	 * @abstract ViewConnect
	 */
	abstract $turnSwitch(): void

	/**
	 * @returns winner name
	 */
	$checkWin() {
		return this.blackCount > this.whiteCount
			? `${this.blackPlayerName} Win!`
			: this.blackCount < this.whiteCount
			? `${this.whitePlayerName} Win!`
			: 'It is a Draw!!'
	}

	S_invalid() {
		throw new Error(`hit: invalid position x or y`)
	}
	abstract S_place(): void
}
