// https://github.com/sindresorhus/park-miller/blob/main/index.js
// https://github.com/vincenzomaritato/parkmiller-random/blob/main/index.js

const MAX_INT32 = 2147483647 // 2^31 - 1

/**
 * Pseudorandom Number Generator (PRNG)
 */
export class ParkMiller {
	// private _count = 0
	// get count() {
	// 	return this._count
	// }

	private _state: number

	constructor(readonly seed: number) {
		this._state = seed % MAX_INT32

		if (this._state <= 0) {
			this._state += MAX_INT32 - 1
		}
	}

	/**
	 * @returns 0 < n < 1
	 * @link https://en.wikipedia.org/wiki/Lehmer_random_number_generator#Parameters_in_common_use
	 */
	next() {
		// this._count++
		// const MINSTD = 16807 // 7^5
		this._state = (this._state * 16807) % MAX_INT32
		return (this._state - 1) / (MAX_INT32 - 1)
	}

	/**
	 * @returns min <= n <= max
	 */
	integer(max = 1, min = 0) {
		if (min > max) [min, max] = [max, min]
		return Math.floor(this.next() * (max - min + 1)) + min
	}

	/**
	 * @returns min < n < max
	 */
	float(max = 1, min = 0) {
		if (min > max) [min, max] = [max, min]
		return min + (max - min) * this.next()
	}

	boolean() {
		return this.next() < 0.5
	}
}
