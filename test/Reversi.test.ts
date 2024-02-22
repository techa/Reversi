// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { Reversi } from '../src/Reversi.js'
import { boardStringify } from './util.js'

class ReversiTest extends Reversi {
	stringify() {
		let txt = '\n'
		for (const row of this.boardArray) {
			for (const val of row) {
				txt += val ? val : '_'
			}
			txt += '\n'
		}
		return txt
	}
}

describe(`Reversi 2 players`, () => {
	const reversi = new ReversiTest().init()
	it(`init`, () => {
		expect(boardStringify(reversi.boardArray)).toStrictEqual(
			`
			________
			________
			________
			___WB___
			___BW___
			________
			________
			________
			`.replace(/\t/g, '')
		)

		expect(reversi.mode).toBe('2')
	})

	it(`error position [0, 0]`, () => {
		expect(() => {
			reversi.addTile(0, 0)
		}).toThrowError()
	})

	it(`error position [3, 5]`, () => {
		expect(() => {
			reversi.addTile(3, 5)
		}).toThrowError()
	})

	it(`error position (on a piece) [3, 4]`, () => {
		expect(() => {
			reversi.addTile(3, 4)
		}).toThrowError()
	})

	it(`addTile(2, 3)`, () => {
		reversi.addTile(2, 3)
		expect(boardStringify(reversi.boardArray)).toStrictEqual(
			`
			________
			________
			________
			__BBB___
			___BW___
			________
			________
			________
			`.replace(/\t/g, '')
		)
	})

	it(`addTile(5, 2)`, () => {
		reversi.addTile(4, 2)
		expect(reversi.counter).toBe(3)
		expect(boardStringify(reversi.boardArray)).toStrictEqual(
			`
			________
			________
			____W___
			__BBW___
			___BW___
			________
			________
			________
			`.replace(/\t/g, '')
		)
	})

	it(`_openedScore`, () => {
		// ________
		// ________
		// ___xW___
		// __BBW___
		// ___BW___
		// ________
		// ________
		// ________
		expect(reversi._openedScore(3, 2)).toBe(4)
		// ________
		// ________
		// ____W___
		// __BBWx__
		// ___BW___
		// ________
		// ________
		// ________
		expect(reversi._openedScore(5, 3)).toBe(5)

		// ________
		// ________
		// __0_W___
		// _1BBW __
		// __2BW___
		// __3_____
		// ________
		// ________
		expect(reversi._getCanTileData('W')).toStrictEqual([
			{
				opens: 6,
				opensAll: 7,
				total: 1,
				x: 2,
				y: 2,
			},
			{
				opens: 7,
				opensAll: 8,
				total: 2,
				x: 1,
				y: 3,
			},
			{
				opens: 5,
				opensAll: 8,
				total: 2,
				x: 2,
				y: 4,
			},
			{
				opens: 7,
				opensAll: 8,
				total: 1,
				x: 2,
				y: 5,
			},
		])
	})
})
