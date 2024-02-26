/// <reference types="vite/client" />
import Place from '../audio/button-16.mp3'
import Beep from '../audio/button-21.mp3'
import Invalid from '../audio/button-24.mp3'

import { AIReversi, type Sym, Tile, BoardSize, Hand } from './AI.js'

type ID = number

function getEl<T extends HTMLElement>(id: number): T
function getEl<T extends HTMLElement>(query: string): T
function getEl<T extends HTMLElement>(query: string | number): T {
	query = typeof query === 'number' ? `#cell${query}` : query
	const el = document.querySelector(query)
	if (el) return el as T
	else throw new TypeError(`(${query}) is invaild query`)
}

function createEl(className: string) {
	const el = document.createElement('div')
	el.setAttribute('class', className)
	return el as HTMLDivElement
}

export class View {
	boardSize = getEl<HTMLInputElement>('#boardSize')
	initialPlacement = getEl<HTMLInputElement>('#parallel')
	mainContainer = getEl('.main-container')
	squares: HTMLDivElement[] = []

	blackScore = getEl('#black-score')
	whiteScore = getEl('#white-score')
	glow1 = getEl('#glow-1')
	glow2 = getEl('#glow-2')

	addTile: (event: Event) => void

	predictorArray: ID[] = []
	scoreViwLV = import.meta.env.DEV ? 5 : 0

	reversi: AIReversi

	sounds = {
		beep: new Audio(),
		place: new Audio(),
		invalid: new Audio(),
	}

	timerID: number

	constructor() {
		this.sounds.beep.src = Beep
		this.sounds.place.src = Place
		this.sounds.invalid.src = Invalid
	}

	init(mode: typeof this.reversi.mode) {
		const that = this

		clearTimeout(that.timerID)
		this.reversi = new (class extends AIReversi {
			$aiTurn() {
				clearTimeout(that.timerID)
				that.timerID = setTimeout(() => {
					super.$aiTurn()
				}, 2000)
			}
			$stopDualBotMode() {
				clearTimeout(that.timerID)
			}
			$setTile(sym: Sym, x: number, y: number) {
				super.$setTile(sym, x, y)
				if (!this.thinking) {
					that.$setTile(sym, x, y)
				}
			}
			$updateLastMove(sym: Sym, x: number, y: number) {
				that.$updateLastMove(sym, x, y)
			}
			$tilesCounting() {
				super.$tilesCounting()
				that.$tilesCounting()
			}
			$changeTileClassByNum(id: number, sym: Sym) {
				if (!this.thinking) {
					that.$changeTileClassByNum(id, sym)
				}
			}
			$glowchange() {
				if (this.sym === Tile.W) {
					that.$stopGlow1()
					that.$startGlow2()
				} else {
					that.$startGlow1()
					that.$stopGlow2()
				}
			}
			$tempStopAllClicks() {
				that.$tempStopAllClicks()
			}
			$startBackAllClicks() {
				that.$startBackAllClicks()
			}
			$checkWin() {
				const message = super.$checkWin()
				that.$checkWin(message)
				return message
			}
			$playerTurn() {
				that.$playerTurn()
			}
			$removePredictionDots() {
				that.$removePredictionDots()
			}
			S_invalid() {
				console.log('Invalid Move')
				that.sounds.invalid.play()
			}
			S_place() {
				that.sounds.place.play()
			}
		})({
			boardSize: parseInt(this.boardSize.value) as BoardSize,
			initialPlacement: this.initialPlacement.checked
				? 'parallel'
				: 'cross',
			mode,
		})

		this.addTile = (event: Event) => {
			const el = event.target as HTMLElement
			const x = parseInt(el.getAttribute('x-axis')!)
			const y = parseInt(el.getAttribute('y-axis')!)
			this.reversi.addTile(x, y)

			this.hideHandScoreDetails()
		}

		this.allBoardInitialisation()
		this.closeSettingFormContainer()

		this.reversi.init()

		this.hideShroud()
		this.$startGlow1()
		this.$stopGlow2()
	}

	getSymColor(sym: Sym) {
		return sym === Tile.W ? 'white' : 'black'
	}

	changeTileClass(el: Element, sym: Sym) {
		el.setAttribute('class', `${this.getSymColor(sym)}-tiles`)
	}
	$changeTileClassByNum(id: number, sym: Sym) {
		this.changeTileClass(this.squares[id].firstChild as Element, sym)
	}

	$setTile(sym: Sym, x: number, y: number) {
		const { boardSize } = this.reversi
		const aTile = document.createElement('div')
		this.changeTileClass(aTile, sym)

		const getSquare = this.squares[y * boardSize + x]
		getSquare.appendChild(aTile)
		getSquare.removeEventListener('click', this.addTile)
		// getSquare.removeEventListener("click", tilePlaceSound);
	}

	$tilesCounting() {
		this.blackScore.innerHTML = this.reversi.blackCount + ''
		this.whiteScore.innerHTML = this.reversi.whiteCount + ''
	}

	// startGlowBlack
	$startGlow1() {
		this.glow1.style.visibility = 'visible'
	}
	// startGlowWhite
	$startGlow2() {
		this.glow2.style.visibility = 'visible'
	}

	// stopGlowBlack
	$stopGlow1() {
		this.glow1.style.visibility = 'hidden'
	}
	// stopGlowWhite
	$stopGlow2() {
		this.glow2.style.visibility = 'hidden'
	}

	$tempStopAllClicks() {
		const { boardSize } = this.reversi
		for (var y = 0; y < boardSize; y++) {
			for (var x = 0; x < boardSize; x++) {
				if (this.reversi.isTileEmpty(x, y)) {
					this.squares[y * boardSize + x].removeEventListener(
						'click',
						this.addTile
					)
				}
			}
		}
	}

	$startBackAllClicks() {
		const { boardSize } = this.reversi
		for (var y = 0; y < boardSize; y++) {
			for (var x = 0; x < boardSize; x++) {
				if (this.reversi.isTileEmpty(x, y)) {
					this.squares[y * boardSize + x].addEventListener(
						'click',
						this.addTile
					)
				}
			}
		}
	}

	$checkWin(message: string) {
		this.$stopGlow1()
		this.$stopGlow2()
		getEl('.win-lose-draw').innerHTML = message
		this.startAnimations()
	}

	startAnimations() {
		const getDarkShroud = getEl('.dark-shroud')
		getDarkShroud.style.visibility = 'visible'
		getDarkShroud.style.animation = '2s fadein forwards'

		const getWinDisplay = getEl('.win-lose-draw')
		getWinDisplay.style.animation = '2s fadein forwards'

		setTimeout(() => {
			const getResultContainer = getEl('.result-container')
			getResultContainer.style.animation = '2s fadein forwards'
		}, 2000)
	}

	/**
	 * show predictionDots
	 */
	$playerTurn() {
		const { boardSize, sym } = this.reversi
		this.predictorArray = []

		for (let y = 0; y < boardSize; y++) {
			for (let x = 0; x < boardSize; x++) {
				if (this.reversi.isTileEmpty(x, y)) {
					if (this.reversi.checkOKtoPlace(sym, x, y)) {
						const id = y * boardSize + x
						const cell = this.squares[y * boardSize + x]
						cell.addEventListener('click', this.addTile)
						this.predictorArray.push(id)

						const canhit = createEl('can-hit')
						canhit.setAttribute('x-axis', x + '')
						canhit.setAttribute('y-axis', y + '')

						const lv = this.scoreViwLV
						if (!this.reversi.demo && lv) {
							const hand = this.reversi.getHand(x, y, lv)
							canhit.textContent = hand.scores.total.toFixed(1)
							canhit.addEventListener(
								'mouseover',
								this.showHandScoreDetails(hand)
							)
							canhit.addEventListener(
								'mouseleave',
								this.hideHandScoreDetails
							)
						} else {
							const predictor = createEl('predictor')
							canhit.appendChild(predictor)
						}
						cell.appendChild(canhit)
					}
				}
			}
		}
	}

	showHandScoreDetails(hand: Hand) {
		return (event: MouseEvent) => {
			const box = createEl('score-details')
			box.style.left = event.clientX + 10 + 'px'
			box.style.top = event.clientY + 10 + 'px'
			for (const key in hand.scores) {
				const score = hand.scores[key]
				if (score) {
					const item = createEl('score-details-item')
					item.innerHTML = `${key}: ${
						typeof score === 'number' ? +score.toFixed(2) : score
					}`
					const value = hand[key]
					if (value) {
						item.innerHTML += ` (${value})`
					}
					box.appendChild(item)
				}
			}
			document.body.appendChild(box)
		}
	}
	hideHandScoreDetails() {
		document.body.removeChild(getEl('.score-details'))
	}

	$removePredictionDots() {
		for (let i = 0; i < this.predictorArray.length; i++) {
			const target = this.squares[this.predictorArray[i]]
			target.removeChild(target.firstChild!)
			target.removeEventListener
		}
	}

	closeSettingFormContainer() {
		getEl('.settings-from-container').style.display = 'none'
	}

	addEventToStart() {
		getEl('#single-player').addEventListener('click', () => {
			this.init('single')
			this.sounds.beep.play()
		})

		getEl('#two-players').addEventListener('click', () => {
			this.init('2')
			this.sounds.beep.play()
		})

		getEl('#demo').addEventListener('click', () => {
			this.init('demo')
			this.sounds.beep.play()
		})

		getEl('.dark-shroud').addEventListener('click', () => {
			this.hideShroud()
			this.showSettingsButton()
			this.sounds.beep.play()
		})
		getEl('.result-container').addEventListener('click', (event) => {
			event.stopPropagation()
		})
		getEl('#restart').addEventListener('click', () => {
			this.hideShroud()
			this.removeBoard()
			this.init(this.reversi.mode)
			this.sounds.beep.play()
		})
		getEl('#back-to-top').addEventListener('click', () => {
			this.hideShroud()
			this.removeBoard()
			this.reversi.$stopDualBotMode()
			this.showStartPage()
			this.$stopGlow1()
			this.$stopGlow2()
			this.sounds.beep.play()
		})

		getEl('#menu').addEventListener('click', () => {
			this.hideSettingsButton()
			this.showShroud()
			this.sounds.beep.play()
		})
	}

	removeBoard() {
		const boardFrame = document.querySelector('.board-frame')
		if (boardFrame) {
			this.mainContainer.removeChild(boardFrame)
			this.mainContainer.removeChild(
				getEl('.last-move-display-container')
			)
		}
	}

	allBoardInitialisation() {
		this.createBoard()
		this.showSettingsButton()
		let id = 0
		const getSquares = document.querySelectorAll('.col')
		const { boardSize } = this.reversi
		for (let y = 0; y < boardSize; y++) {
			for (let x = 0; x < boardSize; x++) {
				getSquares[id].setAttribute('x-axis', x + '')
				getSquares[id].setAttribute('y-axis', y + '')
				getSquares[id].setAttribute('id', `cell${id}`)

				if (this.reversi.demo) {
					console.log('no clicking')
				} else {
					getSquares[id].addEventListener('click', this.addTile)
				}
				id++
			}
		}

		this.hideStartPage()
	}

	createBoard() {
		const { boardSize } = this.reversi

		const boardContainer = createEl('main-board')
		const boardFrame = createEl('board-frame')

		// markers
		const boardHMarkersContainer = createEl('h-markers-container')

		for (let i = 0; i < boardSize; i++) {
			const boardHMarkers = createEl('h-markers')
			boardHMarkersContainer.appendChild(boardHMarkers)
			boardHMarkers.innerHTML = String.fromCharCode(65 + i)
		}

		const boardVMarkersContainer = createEl('v-markers-container')

		for (let i = 0; i < boardSize; i++) {
			const boardVMarkers = createEl('v-markers')
			boardVMarkersContainer.appendChild(boardVMarkers)
			boardVMarkers.innerHTML = i + 1 + ''
		}

		let squareColorCounter = 0

		for (let i = 0; i < boardSize; i++) {
			const row = createEl('row')
			row.style.height = 100 / boardSize + '%'
			squareColorCounter++
			for (let j = 0; j < boardSize; j++) {
				const square = createEl('col square')
				square.style.width = 100 / boardSize + '%'
				if (squareColorCounter % 2 === 1) {
					square.style.backgroundColor = '#86B50F'
				}
				squareColorCounter++
				row.appendChild(square)
				this.squares.push(square)
			}
			boardContainer.appendChild(row)
		}
		boardFrame.appendChild(boardContainer)
		boardFrame.appendChild(boardHMarkersContainer)
		boardFrame.appendChild(boardVMarkersContainer)
		this.mainContainer.appendChild(boardFrame)

		this.lastMoveDisplayCreator()
	}

	lastMoveDisplayCreator() {
		const createContainer = createEl('last-move-display-container')
		this.mainContainer.appendChild(createContainer)
	}

	$updateLastMove(sym: Sym, x: number, y: number) {
		const getLastMoveContainer = getEl('.last-move-display-container')

		const newMove = createEl('last-move-slot')
		const lastMoveTile = createEl(`last-move-tile-${this.getSymColor(sym)}`)

		newMove.appendChild(lastMoveTile)
		const lastMovePosition = createEl('last-move-number')
		lastMovePosition.innerHTML = String.fromCharCode(65 + x) + (y + 1)
		newMove.appendChild(lastMovePosition)

		getLastMoveContainer.insertBefore(
			newMove,
			getLastMoveContainer.childNodes[0]
		)
	}

	showStartPage() {
		getEl('.main-page-container').style.display = 'flex'
		getEl('.score-container').style.visibility = 'collapse'

		getEl('.settings-from-container').style.display = 'flex'
	}
	hideStartPage() {
		getEl('.main-page-container').style.display = 'none'
		getEl('.score-container').style.visibility = 'visible'

		// Score Name
		getEl('#player-name').innerHTML = this.reversi.player1Name
		getEl('#bot-name').innerHTML = this.reversi.player2Name
	}

	showSettingsButton() {
		getEl('.settings').style.visibility = 'visible'
	}

	hideSettingsButton() {
		getEl('.settings').style.visibility = 'hidden'
	}

	showShroud() {
		const getDarkShroud = getEl('.dark-shroud')
		getDarkShroud.style.visibility = 'visible'
		getDarkShroud.style.opacity = '1'

		const getResultContainer = getEl('.result-container')
		getResultContainer.style.opacity = '1'
		this.sounds.beep.play()
	}

	hideShroud() {
		getEl('.dark-shroud').style.visibility = 'hidden'
		getEl('.dark-shroud').style.opacity = '0'
		getEl('.dark-shroud').style.animation = ''
		getEl('.win-lose-draw').style.animation = ''
		getEl('.win-lose-draw').style.opacity = '0'
		getEl('.result-container').style.animation = ''
		getEl('.result-container').style.opacity = '0'
	}
}
