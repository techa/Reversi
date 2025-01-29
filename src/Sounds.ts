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
	urls = [Beep, Invalid, Place]

	audioCtx = new AudioContext()
	gainNode = this.audioCtx.createGain()

	buffers = {} as Record<SoundID, AudioBuffer>

	constructor() {
		let i = -1
		for (const url of this.urls) {
			this.load(++i, url)
		}
		return this
	}

	async load(id: SoundID, url: string) {
		return fetch(url)
			.then((response) => response.arrayBuffer())
			.then((arrayBuffer) => this.audioCtx.decodeAudioData(arrayBuffer))
			.then((audioBuffer) => (this.buffers[id] = audioBuffer))
			.catch((error) =>
				console.error('音声ファイルの読み込みエラー:', error)
			)
	}

	async play(id: SoundID) {
		if (this.mute) return

		let buffer: void | AudioBuffer = this.buffers[id]
		if (!buffer) {
			buffer = await this.load(id, this.urls[id])
		}
		if (buffer) {
			const source = this.audioCtx.createBufferSource()
			source.buffer = buffer

			// chainじゃないとだめ
			source.connect(this.gainNode).connect(this.audioCtx.destination)
			source.start(0)
		}
	}

	/**
	 * 0.5  音量を50%に設定
	 */
	volume(value: number) {
		this.gainNode.gain.value = value
	}
}
