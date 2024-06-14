// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { ReversiTest } from './TestingClass.js'
import { Tile } from '../src/Reversi.js'

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
				fixed: 0,
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
					next_turn: 0,
					fixed: 0,
					position_corner_clue: 0,
				},
			},
			{
				fixed: 0,
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
					next_turn: 0,
					fixed: 0,
					position_corner_clue: 0,
				},
			},
			{
				fixed: 0,
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
					next_turn: 0,
					fixed: 0,
					position_corner_clue: 0,
				},
			},
			{
				fixed: 0,
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
					next_turn: 0,
					fixed: 0,
					position_corner_clue: 0,
				},
			},
			{
				fixed: 0,
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
					next_turn: 0,
					fixed: 0,
					position_corner_clue: 0,
				},
			},
		])
	})

	it(`get outside`, () => {
		expect(reversi.getTile(0, 8)).toBe(-1)
		expect(reversi.getTile(8, 0)).toBe(-1)
	})
})

describe(`fixed`, () => {
	const reversi = new ReversiTest({
		boardSize: 5,
	}).init()

	it(`fixed`, () => {
		reversi.insert(`
			WW_BB
			_____
			_____
			_____
			WW_BB
			`)
		expect(reversi.sym).toBe(1)
		expect(reversi.getTile(1, 0)).toBe(2)
		expect(reversi.tiles).toStrictEqual([
			2, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0,
			1, 1,
		])
		expect(reversi.fixedCount(2, 0)).toBe(1)

		// WWoBB
		// _____
		// _____
		// _____
		// WW_BB
		expect(reversi.fixed(Tile.B, 2, 0)).toBe(true)

		// WW_BB
		// ____o
		// _____
		// _____
		// WW_BB
		expect(reversi.fixed(Tile.B, 4, 1)).toBe(true)

		// WW_BB
		// ___x_
		// _____
		// _____
		// WW_BB
		expect(reversi.fixed(Tile.B, 3, 1)).toBe(false)
		// WW_BB
		// x____
		// _____
		// _____
		// WW_BB
		expect(reversi.fixed(Tile.B, 0, 1)).toBe(false)

		reversi.insert(`
			W_B__
			_____
			_____
			_____
			B_W__
			`)
		// WxB__
		// _____
		// _____
		// _____
		// B_W__
		expect(reversi.fixed(Tile.B, 1, 0)).toBe(false)

		// W_B__
		// _____
		// _____
		// _____
		// BxW__
		expect(reversi.fixed(Tile.B, 1, 4)).toBe(true)
		reversi.insert(`
			W_W__
			_____
			_____
			_____
			B_WB_
			`)
		// WxW__ -> WBWx_ -> WBBBx -> WWWWW
		expect(reversi.fixed(Tile.B, 1, 0)).toBe(false)
		// BxWB_  -> BBBB_
		expect(reversi.fixed(Tile.B, 1, 4)).toBe(true)

		reversi.insert(`
			W_BW_
			_____
			_____
			_____
			W_W__
			`)
		// WxBW_ -> WBBW_ -> WBBBB
		expect(reversi.fixed(Tile.B, 1, 0)).toBe(true)
		// WxW__ -> WBBB_ -> WWWWW
		expect(reversi.fixed(Tile.B, 1, 4)).toBe(false)
	})

	it(`fixedCount`, () => {
		const reversi = new ReversiTest({
			boardSize: 4,
		}).init()
		expect(reversi.stringify()).toBe(
			`
			____
			_WB_
			_BW_
			____
			`.replace(/\t/g, '')
		)
		expect(reversi.fixedCount(2, 0)).toBe(0)

		reversi.addTile(2, 3)
		reversi.addTile(3, 1)

		expect(reversi.stringify()).toBe(
			`
			____
			_WWW
			_BB_
			__B_
			`.replace(/\t/g, '')
		)
		// ____
		// _WWW
		// _BB_
		// __Bw
		expect(reversi.fixedCount(3, 3)).toBe(1)
		// ____   ____
		// _WWW   _WWW
		// _BB_   _ww_
		// _wB_   _wB_
		expect(reversi.fixedCount(1, 3)).toBe(0)
	})
})
