// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { ReversiTest } from './TestingClass.js'

describe(`AI`, () => {
	const reversi = new ReversiTest().init()
	reversi.addTile(2, 3)
	reversi.addTile(4, 2)

	it(`getHands`, () => {
		// ________
		// _____0__
		// ____W1__
		// __BBW2__
		// ___BW3__
		// _____4__
		// ________
		// ________
		expect(reversi.getHands()).toStrictEqual([
			{
				opens: 7,
				opensAll: 10,
				total: 1,
				x: 5,
				y: 1,
				score: 1,
			},
			{
				opens: 6,
				opensAll: 8,
				total: 1,
				x: 5,
				y: 2,
				score: 1,
			},
			{
				opens: 5,
				opensAll: 6,
				total: 1,
				x: 5,
				y: 3,
				score: 1,
			},
			{
				opens: 6,
				opensAll: 7,
				total: 1,
				x: 5,
				y: 4,
				score: 1,
			},
			{
				opens: 7,
				opensAll: 9,
				total: 1,
				x: 5,
				y: 5,
				score: 1,
			},
		])
	})
})
