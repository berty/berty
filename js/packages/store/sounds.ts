import mapValues from 'lodash/mapValues'
import { Player } from '@react-native-community/audio-toolkit'

import { SoundKey, soundsMap } from './types'

export const playSoundFile = (encodedFile: string) => {
	const p = new Player(`data:audio/aac;base64,${encodedFile}`, {
		autoDestroy: false,
		mixWithOthers: true,
	})
	p.play()
	return p
}

const preloadedSounds = mapValues(soundsMap, fileName => {
	const p = new Player(fileName, {
		autoDestroy: false,
		mixWithOthers: true,
		// https://github.com/react-native-audio-toolkit/react-native-audio-toolkit/blob/master/docs/API.md
		// https://developer.apple.com/documentation/avfaudio/avaudiosession/category
		// 3 is the SoloAmbient PlaybackCategories
		category: 3,
	})
	p.prepare()
	return p
})

export const playSound = (name: SoundKey) => {
	const p = preloadedSounds[name]
	if (!p) {
		console.warn(`Tried to play unknown sound "${name}"`)
		return
	}
	if (!p.isPlaying) {
		p.play()
		return
	}
	p.seek(0, () => {
		p.play()
	})
}

export const playSoundAsync = (name: SoundKey) => {
	return new Promise<void>(resolve => {
		const p = preloadedSounds[name]
		if (!p) {
			console.warn(`Tried to play unknown sound "${name}"`)
			return
		}

		const endListener = () => {
			resolve()
			p.removeListener(endListener)
		}

		p.on('ended', endListener)

		if (!p.isPlaying) {
			p.play()
			return
		}
		p.seek(0, () => {
			p.play()
		})
	})
}
