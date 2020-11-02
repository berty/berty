import mapValues from 'lodash/mapValues'
import { Player } from '@react-native-community/audio-toolkit'

const soundsMap = {
	messageReceived: 'Berty_Notif_Message.mp3',
	messageSent: 'Notif_Berty15message_envoye.mp3',
	contactRequestSent: 'Notif_Berty02.mp3',
	contactRequestReceived: 'Notif_Berty04.mp3',
	contactRequestAccepted: 'Notif_Berty14.mp3',
	groupCreated: 'Notif_Berty13.mp3',
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
