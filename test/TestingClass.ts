import { AIReversi, Sym, Tile } from '../src/AI.ts'

export * from '../src/Reversi.ts'

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

	$stopDualBotMode() {}
	$updateLastMove(x: number, y: number) {}
	$changeTileClassByNum(id: number, sym: Sym) {}
	$glowchange() {}
	$tempStopAllClicks() {}
	$startBackAllClicks() {}
	$playerTurn() {}
	$removePredictionDots() {}
	S_place() {}
}
