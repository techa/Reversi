import { Reversi, Tile } from '../src/Reversi.ts'

export * from '../src/Reversi.ts'

export class ReversiTest extends Reversi {
	stringify() {
		let txt = '\n'
		let col = 0
		const strs = {
			[Tile.Null]: '_',
			[Tile.B]: 'B',
			[Tile.W]: 'W',
		}
		for (const val of this.tiles) {
			txt += strs[val]
			if (!(++col % this.boardLength)) {
				txt += '\n'
			}
		}
		return txt
	}
}
