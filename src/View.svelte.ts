import { type Hand } from './AI.js'
import { type Sym, Tile } from './Reversi.js'

export const enum ModalType {
	Hide,
	BackOrRestart,
	Config,
}

export const enum PageType {
	Top,
	AILVSelect,
	Game,
}

export interface HistoryData {
	sym: Sym
	x: number
	y: number
	tiles: Tile[]
	turn: number
}

export const viewState = $state({
	page: PageType.Top,
	modal: ModalType.Hide,

	hand: null as null | Hand,
	handPosition: null as null | [number, number],

	history: [] as HistoryData[],
	historyIndex: -1,
})
