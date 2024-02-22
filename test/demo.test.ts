// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { Reversi } from '../src/Reversi.js'
import { ParkMiller } from './ParkMiller.js'
import { boardStringify } from './util.js'

describe(`demo 1`, () => {
	const random = new ParkMiller(7)
	const reversi = new Reversi({
		boardLength: 4,
		mode: 'demo',
		random: () => random.float(),
	}).init()
	it(`result`, () => {
		expect(boardStringify(reversi.boardArray)).toBe(
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
	const reversi = new Reversi({
		boardLength: 4,
		mode: 'demo',
		random: () => random.float(),
	}).init()
	it(`result`, () => {
		expect(boardStringify(reversi.boardArray)).toBe(
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
