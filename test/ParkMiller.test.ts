// https://vitest.dev/api/expect.html
// https://jestjs.io/docs/expect
import { describe, it, expect } from 'vitest'
import { ParkMiller } from './ParkMiller.ts'

function minmax(cb: () => number) {
	let max = -Infinity
	let min = Infinity
	for (let i = 0; i < 1000; i++) {
		const value = cb()
		if (value > max) {
			max = value
		}
		if (value < min) {
			min = value
		}
	}
	return [min, max]
}

describe(`./ParkMiller.ts`, () => {
	it(`seed 0`, () => {
		const random = new ParkMiller(0)
		expect(random.seed).toBe(0)
		expect(random.float()).toBe(0.9999921736307369)
		expect(random.float()).toBe(0.8684622117955817)
		expect(random.float()).toBe(0.24439467745311064)
		expect(random.float(10)).toBe(5.413498678629751)

		const [min, max] = minmax(() => random.float(10, 20))
		expect(min).toBe(10.00542120542882)
		expect(max).toBe(19.994049575174273)
	})

	it(`seed 3`, () => {
		const random = new ParkMiller(3)
		expect(random.float()).toBe(0.000023478642127922403)
		expect(random.float()).toBe(0.3946133641475936)
		expect(random.float()).toBe(0.26681596624368425)
		expect(random.seed).toBe(3)

		const [min, max] = minmax(() => random.integer(10, 20))
		expect(min).toBe(10)
		expect(max).toBe(20)

		expect(random.integer()).toBe(1)
		expect(random.integer()).toBe(1)
		expect(random.integer()).toBe(1)
		expect(random.integer()).toBe(0)
		expect(random.integer(6)).toBe(3)
	})
})
