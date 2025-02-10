// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { ReversiTest } from './TestingClass.js'
import { AILV, AIReversiOptions, AIsettings } from '../src/AI.js'
import { InitialPlacement, Mode, Tile } from '../src/Reversi.js'

describe(`demo 1`, () => {
	const reversi = new ReversiTest(0).init({
		boardSize: 4,
		mode: Mode.Demo,
	})
	it(`result`, () => {
		expect(reversi.yourColor).toBe(Tile.B)
		expect(reversi.stringify()).toBe(
			`
			WWWW
			WWWW
			BBWB
			WWWW
			`.replace(/\t/g, '')
		)
		expect(reversi.$checkWin()).toBe('White Win!')
	})
})

describe(`demo 2`, () => {
	const reversi = new ReversiTest(2).init({
		boardSize: 4,
		mode: Mode.Demo,
	})
	it(`result`, () => {
		expect(reversi.yourColor).toBe(Tile.W)
		expect(reversi.stringify()).toBe(
			`
			WWWW
			BWBW
			BBWW
			BBBW
			`.replace(/\t/g, '')
		)
		expect(reversi.$checkWin()).toBe('White Win!')
	})
})

const AIBattle = (options: Partial<AIReversiOptions>) => {
	const wins = {
		black: 0,
		white: 0,
		draw: 0,
		total: 200,
	}

	for (let i = 0; i < wins.total; i++) {
		const reversi = new ReversiTest().init({
			...options,
			mode: Mode.Demo,
			aiPlayer2LV: (i % 6) as AILV,
		})

		if (reversi.blackScore > reversi.whiteScore) {
			wins.black++
		} else if (reversi.whiteScore > reversi.blackScore) {
			wins.white++
		} else {
			wins.draw++
		}
	}
	return wins
}

;(async () => {
	for (let i = 0; i < AIsettings.length; i++) {
		const wins = AIBattle({
			yourColor: 0,
			initialPlacement: InitialPlacement.Random,
			aiPlayer1LV: i as AILV,
		})
		// console.log(`B-${i}, W-1`, wins)
		console.log(
			`B-${i}`,
			((wins.black / wins.total) * 100).toFixed(1) + '%'
		)
	}
})()
