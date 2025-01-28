import { type Hand } from './AI.js'

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

export const viewState = $state({
	page: PageType.Top,
	modal: ModalType.Hide,

	hand: null as null | Hand,
	handPosition: null as null | [number, number],
})
