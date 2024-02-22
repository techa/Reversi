import { BoardSym } from '../src/Reversi'

export function boardStringify(arr: BoardSym[][]) {
	let txt = '\n'
	for (const row of arr) {
		for (const val of row) {
			txt += val ? val : '_'
		}
		txt += '\n'
	}
	return txt
}
