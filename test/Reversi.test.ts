// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { ReversiTest } from './TestingClass.js'

describe(`Reversi 2 players`, () => {
	const reversi = new ReversiTest().init()
	it(`init`, () => {
		expect(reversi.stringify()).toStrictEqual(
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
		expect(reversi.stringify()).toStrictEqual(
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

	it(`addTile(4, 2)`, () => {
		reversi.addTile(4, 2)
		expect(reversi.counter).toBe(3)
		expect(reversi.stringify()).toStrictEqual(
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
})
