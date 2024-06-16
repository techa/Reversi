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
	sources = {
		[SoundID.Beep]: Beep,
		[SoundID.Invalid]: Invalid,
		[SoundID.Place]: Place,
	}
	play(id: keyof typeof this.sources) {
		if (!this.mute) {
			new Audio(this.sources[id]).play()
		}
	}
}
