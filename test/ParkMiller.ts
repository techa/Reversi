// https://github.com/sindresorhus/park-miller/blob/main/index.js
const MAX_INT32 = 2147483647
const MINSTD = 16807

export class ParkMiller {
	#seed: number
	constructor(seed: number) {
		if (!Number.isInteger(seed)) {
			throw new TypeError('Expected `seed` to be a `integer`')
		}

		this.#seed = seed % MAX_INT32

		if (this.#seed <= 0) {
			this.#seed += MAX_INT32 - 1
		}
	}

	integer() {
		this.#seed *= MINSTD
		this.#seed %= MAX_INT32
		return this.#seed
	}

	integerInRange(min: number, max: number) {
		return Math.round(this.floatInRange(min, max))
	}

	float() {
		return (this.integer() - 1) / (MAX_INT32 - 1)
	}

	floatInRange(min: number, max: number) {
		return min + (max - min) * this.float()
	}

	boolean() {
		return this.integer() % 2 === 0
	}
}
