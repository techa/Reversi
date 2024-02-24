export const enum Tile {
	Null = 0,
	B = 1,
	W = 2,
}
export type Sym = Tile.B | Tile.W
export type BoardSize = 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type InitialPlacement = 'cross' | 'parallel'
export type Mode = 'single' | '2' | 'demo'

export interface ReversiOptions {
	/**
	 * range: 4-12
	 * default: 8
	 */
	boardSize: BoardSize
	initialPlacement: InitialPlacement
	mode: Mode
	random: () => number
}

export const directionXYs: [number, number][] = [
	[-1, -1], // top-left
	[0, -1], // top
	[1, -1], // top-right
	[1, 0], // right
	[1, 1], // bottom-right
	[0, 1], // bottom
	[-1, 1], // bottom-left
	[-1, 0], // left
]

export abstract class Reversi {
	boardSize: BoardSize = 8
	initialPlacement: InitialPlacement = 'cross'
	mode: Mode = '2'

	counter = 1
	sym: Sym = Tile.B
	countIncr() {
		this.counter++
		this.sym = this.counter % 2 === 0 ? Tile.W : Tile.B
	}

	tiles: Tile[] = []
	opens: number[] = []

	botMode = false
	demo = false
	singlePlayerMode = false

	get player1Name() {
		const mode = this.mode
		return mode === '2'
			? 'Player 1'
			: mode === 'demo'
			? 'AI - Black'
			: 'You'
	}
	get player2Name() {
		const mode = this.mode
		return mode === '2' ? 'Player 2' : 'AI - White'
	}

	whiteCount = 0
	blackCount = 0

	random: () => number

	constructor(options: Partial<ReversiOptions> = {}) {
		this.boardSize = options.boardSize ?? this.boardSize
		this.initialPlacement =
			options.initialPlacement ?? this.initialPlacement

		this.mode = options.mode ?? this.mode
		this.random = options.random ?? Math.random
	}

	init() {
		this.initBoardArray()
		this.initialPieces()

		if (this.mode === 'single') {
			this.singlePlayerMode = true
			this.botMode = true
		} else if (this.mode === 'demo') {
			this.demo = true
		}

		if (this.demo) {
			this.botMode = true
			this.$aiTurn()
		}
		return this
	}

	initBoardArray() {
		this.tiles = []
		for (let i = 0; i < this.boardSize ** 2; i++) {
			this.tiles.push(Tile.Null)
		}
	}

	initialPieces() {
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
				(this.initialPlacement === 'cross' && (!i || i === 3)) ||
				(this.initialPlacement === 'parallel' && i < 2)
			) {
				sym = Tile.W
			}

			this.$setTile(sym, x, y)
		}
		this.$tilesCounting()
	}

	isTileEmpty(x: number, y: number) {
		return this.tiles[y * this.boardSize + x] === Tile.Null
	}
	getTile(x: number, y: number) {
		return this.tiles[y * this.boardSize + x]
	}
	$setTile(sym: Sym, x: number, y: number) {
		this.tiles[y * this.boardSize + x] = sym
	}

	$aiTurn() {
		this._aiTurn()
	}

	_aiTurn() {
		if (this.botMode) {
			const tile = this.ai_nextHand()
			this._doTheMove(tile.x, tile.y, true)
		} else {
			if (this.demo) {
				this.demo = false
				this.$stopDualBotMode()
			}
		}
	}
	$stopDualBotMode() {}

	ai_nextHand(): any {}

	checkOKtoPlace(sym: Sym, x: number, y: number) {
		return (
			directionXYs
				.map((value) => {
					return this._checkDirection(sym, x, y, value)
				})
				.indexOf(true) > -1
		)
	}

	private _checkDirection(
		sym: Sym,
		x: number,
		y: number,
		dir: [number, number]
	) {
		const { boardSize } = this
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

	addTile(x: number, y: number) {
		if (this.checkOKtoPlace(this.sym, x, y)) {
			this.$removePredictionDots()
			this._doTheMove(x, y)
			//bot mode on and off
		} else {
			this.S_invalid()
		}
	}

	hit(x: number, y: number) {
		this.$setTile(this.sym, x, y)
		this._changeRespectiveTiles(this.sym, x, y)
		this.countIncr()

		return this._checkSlots(this.sym)
	}

	_doTheMove(x: number, y: number, ai = false) {
		this.S_place()
		this.$updateLastMove(this.sym, x, y)

		/////////Check anymore playable empty square
		//check any move left///////////////////////////
		// console.log(this.sym + ' turn')
		const slots = this.hit(x, y)

		this.$tilesCounting()

		if (slots.empty > 0) {
			if (slots.movable > 0) {
				// console.log(this.sym + ' still can')
				this.$glowchange()

				if (ai) {
					if (this.singlePlayerMode) {
						this.$startBackAllClicks()
						this.$predictionDots()
					} else {
						this.$aiTurn()
					}
				} else {
					if (this.singlePlayerMode) {
						this.$tempStopAllClicks()
					} else {
						this.$predictionDots()
					}
					if (this.botMode) {
						this.$aiTurn()
					}
				}
			} else {
				// console.log(this.sym + ' no place to move, pass')
				this.countIncr()
				// console.log(this.sym + ' turn')
				const slots = this._checkSlots(this.sym)
				if (slots.movable > 0) {
					if (ai) {
						// console.log(this.sym + 'still can')
						this.$aiTurn()
					} else {
						this.$predictionDots()
					}
				} else {
					// console.log(this.sym + ' also cannot, end game')
					this.botMode = false
					if (!ai) {
						this.$tempStopAllClicks()
					}
					this.$checkWin()
				}
			}
		} else {
			// console.log(this.sym + ' cannot d')
			this.botMode = false
			if (!ai) {
				this.$tempStopAllClicks()
			}
			this.$checkWin()
		}
	}

	private _checkSlots(sym: Sym) {
		let emptyCount = 0
		let roughtCount = 0
		for (let y = 0; y < this.boardSize; y++) {
			for (let x = 0; x < this.boardSize; x++) {
				if (this.isTileEmpty(x, y)) {
					emptyCount++
					if (this.checkOKtoPlace(sym, x, y)) {
						roughtCount++
					}
				}
			}
		}

		return { empty: emptyCount, movable: roughtCount }
	}

	$updateLastMove(sym: Sym, x: number, y: number) {}

	$tilesCounting() {
		this.whiteCount = 0
		this.blackCount = 0
		for (const val of this.tiles) {
			if (val === Tile.W) this.whiteCount += 1
			if (val === Tile.B) this.blackCount += 1
		}
	}

	private _changeRespectiveTiles(sym: Sym, x: number, y: number) {
		this.directionEach(sym, x, y, (pX, pY) => {
			this.tiles[pY * this.boardSize + pX] = sym
			this.$changeTileClassByNum(this.boardSize * pY + pX, sym)
		})
	}

	$changeTileClassByNum(id: number, sym: Sym) {}

	directionEach(
		sym: Sym,
		x: number,
		y: number,
		callback: (x: number, y: number) => void
	) {
		const directionToGo = directionXYs.map((value) => {
			return this._checkDirection(sym, x, y, value)
		})
		for (let i = 0; i < 8; i++) {
			if (directionToGo[i]) {
				let settle = false
				const dir = directionXYs[i]
				const dX = dir[0]
				const dY = dir[1]

				while (!settle) {
					if (!this.isTileEmpty(x + dX, y + dY)) {
						let a = 1
						let pX = x + dX * a
						let pY = y + dY * a
						while (this.getTile(pX, pY) !== sym) {
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

	$glowchange() {}

	$tempStopAllClicks() {}

	$startBackAllClicks() {}

	/**
	 * @returns winner name
	 */
	$checkWin() {
		return this.blackCount > this.whiteCount
			? `${this.player1Name} Win!`
			: this.blackCount < this.whiteCount
			? `${this.player2Name} Win!`
			: 'It is a Draw!!'
	}

	$predictionDots() {}
	$removePredictionDots() {}

	S_invalid() {
		throw new Error(`addTile: invalid position x or y`)
	}
	S_place() {}
}
