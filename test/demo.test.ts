// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { ReversiTest } from './TestingClass.js'
import { ParkMiller } from './ParkMiller.js'

describe(`demo 1`, () => {
	const random = new ParkMiller(7)
	const reversi = new ReversiTest({
		boardLength: 4,
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
		boardLength: 4,
		mode: 'demo',
		random: () => random.float(),
	}).init()
	it(`result`, () => {
		expect(reversi.stringify()).toBe(
			`
			WWWB
			WWWW
			WWWW
			B_WW
			`.replace(/\t/g, '')
		)
		expect(reversi.$checkWin()).toBe('AI - White Win!')
	})
})
