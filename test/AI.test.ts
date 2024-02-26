// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { ReversiTest } from './TestingClass.js'

describe(`AI`, () => {
	const reversi = new ReversiTest().init()
	reversi.addTile(2, 3)
	reversi.addTile(4, 2)

	it(`getHands(1)`, () => {
		// ________
		// _____0__
		// ____W1__
		// __BBW2__
		// ___BW3__
		// _____4__
		// ________
		// ________
		expect(reversi.getHands(1)).toStrictEqual([
			{
				opens: 7,
				opensAll: 10,
				count: 1,
				x: 5,
				y: 1,
				scores: {
					count: 1,
					opens: 0,
					opensAll: 0,
					position_corner: 0,
					position_edge: [0, 0, 0],
					total: 1,
				},
			},
			{
				opens: 6,
				opensAll: 8,
				count: 1,
				x: 5,
				y: 2,
				scores: {
					count: 1,
					opens: 0,
					opensAll: 0,
					position_corner: 0,
					position_edge: [0, 0, 0],
					total: 1,
				},
			},
			{
				opens: 5,
				opensAll: 6,
				count: 1,
				x: 5,
				y: 3,
				scores: {
					count: 1,
					opens: 0,
					opensAll: 0,
					position_corner: 0,
					position_edge: [0, 0, 0],
					total: 1,
				},
			},
			{
				opens: 6,
				opensAll: 7,
				count: 1,
				x: 5,
				y: 4,
				scores: {
					count: 1,
					opens: 0,
					opensAll: 0,
					position_corner: 0,
					position_edge: [0, 0, 0],
					total: 1,
				},
			},
			{
				opens: 7,
				opensAll: 9,
				count: 1,
				x: 5,
				y: 5,
				scores: {
					count: 1,
					opens: 0,
					opensAll: 0,
					position_corner: 0,
					position_edge: [0, 0, 0],
					total: 1,
				},
			},
		])
	})
})
