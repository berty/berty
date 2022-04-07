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

// https://github.com/react-native-audio-toolkit/react-native-audio-toolkit/blob/master/docs/API.md
const PlaybackCategories = {
	Playback: 1,
	Ambient: 2,
	SoloAmbient: 3,
}

const preloadedSounds = mapValues(soundsMap, fileName => {
	const p = new Player(fileName, {
		autoDestroy: false,
		mixWithOthers: true,
		category: PlaybackCategories.Ambient,
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
