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

	dev: import.meta.env.DEV,
})

export const config = $state({
	mute: false,
	/**
	 * * 0=mute
	 * * 1=等倍
	 * * 2=２倍
	 */
	volume: 1,
	/**
	 * ms. default:1000, min: 500, max: 2000
	 */
	aiWait: 1000,
})
