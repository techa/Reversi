// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { ReversiTest } from './TestingClass.js'
import { ParkMiller } from './ParkMiller.js'
import { AILV, ReversiOptions } from '../src/AI.js'

describe(`demo 1`, () => {
	const random = new ParkMiller(7)
	const reversi = new ReversiTest({
		boardSize: 4,
		mode: 'demo',
		random: () => random.float(),
	}).init()
	it(`result`, () => {
		expect(reversi.stringify()).toBe(
			`
			WBBB
			WWWW
			WBWW
			WWWW
			`.replace(/\t/g, '')
		)
		expect(reversi.$checkWin()).toBe('AI - White Win!')
	})
})

describe(`demo 2`, () => {
	const random = new ParkMiller(2)
	const reversi = new ReversiTest({
		boardSize: 4,
		mode: 'demo',
		random: () => random.float(),
	}).init()
	it(`result`, () => {
		expect(reversi.stringify()).toBe(
			`
			WWWB
			WWWW
			WWWW
			BBBW
			`.replace(/\t/g, '')
		)
		expect(reversi.$checkWin()).toBe('AI - White Win!')
	})
})

const AIBattle = (options: Partial<ReversiOptions>) => {
	const wins = {
		black: 0,
		white: 0,
		draw: 0,
	}

	for (let i = 0; i < 500; i++) {
		const reversi = new ReversiTest({
			...options,
			mode: 'demo',
			// aiPlayer2LV: ((i / 100) | 0) as AILV,
		}).init()

		if (reversi.blackCount > reversi.whiteCount) {
			wins.black++
		} else if (reversi.whiteCount > reversi.blackCount) {
			wins.white++
		} else {
			wins.draw++
		}
	}
	return wins
}

;(async () => {
	for (let i = 0; i <= 5; i++) {
		const wins = AIBattle({
			aiPlayer1LV: i as AILV,
		})
		// console.log(`B-${i}, W-1`, wins)
		console.log(`B-${i}`, (wins.black / 5).toFixed(0) + '%')
	}
})()
