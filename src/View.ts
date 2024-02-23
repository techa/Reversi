/// <reference types="vite/client" />
import Place from '../audio/button-16.mp3'
import Beep from '../audio/button-21.mp3'
import Invalid from '../audio/button-24.mp3'

import { Reversi, type Sym } from './Reversi.js'

type ID = number

function getEl<T extends HTMLElement>(query: string | number): T {
	query = typeof query === 'number' ? `#cell${query}` : query
	const el = document.querySelector(query)
	if (el) return el as T
	else throw new TypeError(`(${query}) is invaild query`)
}

export class View {
	boardLength = getEl<HTMLInputElement>('#boardLength')
	initialPlacement = getEl<HTMLInputElement>('#parallel')
	mainContainer = getEl('.main-container')
	blackScore = getEl('#black-score')
	whiteScore = getEl('#white-score')
	glow1 = getEl('#glow-1')
	glow2 = getEl('#glow-2')

	addTile: (event: Event) => void

	predictorArray: ID[] = []

	reversi: Reversi

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
		this.reversi = new (class extends Reversi {
			$aiTurn() {
				clearTimeout(that.timerID)
				that.timerID = setTimeout(this._aiTurn.bind(this), 2000)
			}
			$stopDualBotMode() {
				clearTimeout(that.timerID)
			}
			$setTile(sym: Sym, x: number, y: number) {
				super.$setTile(sym, x, y)
				that.$setTile(sym, x, y)
			}
			$updateLastMove(sym: Sym, x: number, y: number) {
				that.$updateLastMove(sym, x, y)
			}
			$tilesCounting() {
				super.$tilesCounting()
				that.$tilesCounting()
			}
			$changeTileClassByNum(id: number, sym: Sym) {
				that.$changeTileClassByNum(id, sym)
			}
			$startGlow1() {
				that.$startGlow1()
			}
			$startGlow2() {
				that.$startGlow2()
			}
			$stopGlow1() {
				that.$stopGlow1()
			}
			$stopGlow2() {
				that.$stopGlow2()
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
			$predictionDots() {
				that.$predictionDots()
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
			boardLength: parseInt(this.boardLength.value),
			initialPlacement: this.initialPlacement.checked
				? 'parallel'
				: 'cross',
			mode,
		})

		this.allBoardInitialisation()
		this.reversi.init()

		this.addTile = (event: Event) => {
			const el = event.target as HTMLElement
			const x = parseInt(el.getAttribute('x-axis')!)
			const y = parseInt(el.getAttribute('y-axis')!)
			this.reversi.addTile(x, y)
		}

		this.closeModeSelectContainer()

		this.preStartGame(mode)()
	}

	changeTileClass(el: Element, sym: Sym) {
		el.setAttribute('class', sym === 'W' ? 'white-tiles' : 'black-tiles')
	}
	$changeTileClassByNum(id: number, sym: Sym) {
		this.changeTileClass(getEl(id).firstChild as Element, sym)
	}

	$setTile(sym: Sym, x: number, y: number) {
		const { boardLength } = this.reversi
		const aTile = document.createElement('div')
		this.changeTileClass(aTile, sym)

		const getSquare = getEl(y * boardLength + x)
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
		const { boardArray, boardLength } = this.reversi
		for (var y = 0; y < boardLength; y++) {
			for (var x = 0; x < boardLength; x++) {
				if (boardArray[y][x] === null) {
					getEl(y * boardLength + x).removeEventListener(
						'click',
						this.addTile
					)
				}
			}
		}
	}

	$startBackAllClicks() {
		const { boardArray, boardLength } = this.reversi
		for (var y = 0; y < boardLength; y++) {
			for (var x = 0; x < boardLength; x++) {
				if (boardArray[y][x] === null) {
					getEl(y * boardLength + x).addEventListener(
						'click',
						this.addTile
					)
				}
			}
		}
	}

	$checkWin(message: string) {
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

	$predictionDots() {
		const { boardArray, boardLength, sym } = this.reversi
		this.predictorArray = []

		for (let y = 0; y < boardLength; y++) {
			for (let x = 0; x < boardLength; x++) {
				if (boardArray[y][x] === null) {
					if (this.reversi.checkOKtoPlace(sym, x, y)) {
						const createPredictor = document.createElement('div')
						createPredictor.setAttribute('class', 'predictor')
						createPredictor.setAttribute('x-axis', x + '')
						createPredictor.setAttribute('y-axis', y + '')
						// createPredictor.setAttribute(
						// 	'onclick',
						// 	'runATile(this)'
						// )
						const id = y * boardLength + x
						const cell = getEl(id)
						cell.appendChild(createPredictor)
						cell.addEventListener('click', this.addTile)
						this.predictorArray.push(id)
					}
				}
			}
		}
	}

	$removePredictionDots() {
		for (let i = 0; i < this.predictorArray.length; i++) {
			const target = getEl(this.predictorArray[i])
			target.removeChild(target.firstChild!)
			target.removeEventListener
		}
	}

	closeModeSelectContainer() {
		getEl('.settings-from-container').style.display = 'none'
	}

	preStartGame(mode: typeof this.reversi.mode) {
		return () => {
			this.hideShroud()
			this.$startGlow1()
			this.$stopGlow2()
			if (mode !== 'demo') {
				this.$predictionDots()
			}
		}
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

		getEl('#stay').addEventListener('click', () => {
			this.hideShroud()
			this.showSettingsButton()
			this.sounds.beep.play()
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
		const { boardLength } = this.reversi
		for (let y = 0; y < boardLength; y++) {
			for (let x = 0; x < boardLength; x++) {
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
		const { boardLength } = this.reversi

		const boardContainer = document.createElement('div')
		boardContainer.setAttribute('class', 'main-board')
		const boardFrame = document.createElement('div')
		boardFrame.setAttribute('class', 'board-frame')

		// markers
		const boardHMarkersContainer = document.createElement('div')
		boardHMarkersContainer.setAttribute('class', 'h-markers-container')

		for (let i = 0; i < boardLength; i++) {
			const boardHMarkers = document.createElement('div')
			boardHMarkers.setAttribute('class', 'h-markers')
			boardHMarkersContainer.appendChild(boardHMarkers)
			boardHMarkers.innerHTML = String.fromCharCode(65 + i)
		}

		const boardVMarkersContainer = document.createElement('div')
		boardVMarkersContainer.setAttribute('class', 'v-markers-container')

		for (let i = 0; i < boardLength; i++) {
			const boardVMarkers = document.createElement('div')
			boardVMarkers.setAttribute('class', 'v-markers')
			boardVMarkersContainer.appendChild(boardVMarkers)
			boardVMarkers.innerHTML = i + 1 + ''
		}

		let squareColorCounter = 0

		for (let i = 0; i < boardLength; i++) {
			const row = document.createElement('div')
			row.setAttribute('class', 'row')
			row.style.height = 100 / boardLength + '%'
			squareColorCounter++
			for (let j = 0; j < boardLength; j++) {
				const square = document.createElement('div')
				square.setAttribute('class', 'col square')
				square.style.width = 100 / boardLength + '%'
				if (squareColorCounter % 2 === 1) {
					square.style.backgroundColor = '#86B50F'
				}
				squareColorCounter++
				row.appendChild(square)
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
		const createContainer = document.createElement('div')
		createContainer.setAttribute('class', 'last-move-display-container')
		this.mainContainer.appendChild(createContainer)
	}

	$updateLastMove(sym: Sym, x: number, y: number) {
		const getLastMoveContainer = getEl('.last-move-display-container')

		const newMove = document.createElement('div')
		newMove.setAttribute('class', 'last-move-slot')

		const lastMoveTile = document.createElement('div')
		const tileClass = `last-move-tile-${sym === 'W' ? 'white' : 'black'}`
		lastMoveTile.setAttribute('class', tileClass)

		newMove.appendChild(lastMoveTile)
		const lastMovePosition = document.createElement('div')
		lastMovePosition.setAttribute('class', 'last-move-number')
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
