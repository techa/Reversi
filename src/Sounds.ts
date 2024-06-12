import Beep from '../audio/button-21.mp3'
import Invalid from '../audio/button-24.mp3'
import Place from '../audio/button-16.mp3'

export const enum SoundID {
	Beep,
	Invalid,
	Place,
}

export class Sounds {
	mute = false
	sounds = {
		[SoundID.Beep]: new Audio(),
		[SoundID.Invalid]: new Audio(),
		[SoundID.Place]: new Audio(),
	}
	constructor() {
		this.sounds[SoundID.Beep].src = Beep
		this.sounds[SoundID.Invalid].src = Invalid
		this.sounds[SoundID.Place].src = Place
	}
	sePlay(id: keyof typeof this.sounds) {
		if (!this.mute) {
			this.sounds[id].play()
		}
	}
}
