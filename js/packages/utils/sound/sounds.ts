import { Player } from '@react-native-community/audio-toolkit'
import mapValues from 'lodash/mapValues'

import { SoundKey, soundsMap } from './sound.types'

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
