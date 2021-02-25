import mapValues from 'lodash/mapValues'
import { Player } from '@react-native-community/audio-toolkit'

const soundsMap = {
	messageReceived: 'message_received.mp3',
	messageSent: 'message_sent.mp3',
	contactRequestSent: 'contact_request_sent.mp3',
	contactRequestReceived: 'contact_request_received.mp3',
	contactRequestAccepted: 'contact_request_accepted.mp3',
	groupCreated: 'group_created.mp3',
}

export type SoundKey = keyof typeof soundsMap

const preloadedSounds = mapValues(soundsMap, (fileName) => {
	const p = new Player(fileName, { autoDestroy: false, mixWithOthers: true })
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
	return new Promise((resolve) => {
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
