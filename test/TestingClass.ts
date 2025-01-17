import { AIReversi } from '../src/AI.js'
import { Tile } from '../src/Reversi.js'

export class ReversiTest extends AIReversi {
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
			if (!(++col % this.boardSize)) {
				txt += '\n'
			}
		}
		return txt
	}

	insert(data: string) {
		const tiles = data
			.replace(/\s*/g, '')
			.split('')
			.map(
				(char) =>
					({
						_: Tile.Null,
						B: Tile.B,
						W: Tile.W,
					}[char] ?? Tile.OutSide)
			)
		if (
			tiles.length === this.boardSize ** 2 &&
			tiles.every((tile) => tile >= 0)
		) {
			this.tiles = tiles
		} else {
			throw new Error(`data(${data}) ${tiles}is invaild`)
		}
	}

	$addHistory(x: number, y: number) {}
	$turnSwitch() {}
	$playerTurn() {}
	S_place() {}
}
