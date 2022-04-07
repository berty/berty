import React, { createContext, useContext, useEffect, useState } from 'react'

import { Player } from '@react-native-community/audio-toolkit'

import { getSource } from '../utils'
import { useSelector } from 'react-redux'
import { selectProtocolClient } from '@berty/redux/reducers/ui.reducer'

type PlayerType = Player | undefined

class EndError extends Error {}

interface PlayerItemMetadata {
	id: String
	title?: String
	subtitle?: String
	duration?: String
	waveform?: Array<number>
	visualURI?: String
}

interface PlayerState {
	player: PlayerType
	metadata: PlayerItemMetadata
	next?: { cid: string; mimeType: string }
}

const INITIAL_PLAYER_METADATA: PlayerItemMetadata = {
	id: '',
	title: '',
	subtitle: '',
	duration: '',
	waveform: [],
	visualURI: '',
}

const INITIAL_PLAYER_VALUE: PlayerState = {
	player: undefined,
	metadata: INITIAL_PLAYER_METADATA,
}

const MusicPlayerContext = createContext<{
	player: PlayerState
	load: (cid: string, mimeType: string) => void
	unload: () => void
	handlePlayPause: () => void
	loading: boolean
	playing: boolean
	currentTime: number
}>({
	player: INITIAL_PLAYER_VALUE,
	load: () => {},
	unload: () => {},
	handlePlayPause: () => {},
	loading: false,
	playing: false,
	currentTime: 0,
})

export const MusicPlayerProvider: React.FC = ({ children }) => {
	const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER_VALUE)
	const protocolClient = useSelector(selectProtocolClient)
	const [loading, setLoading] = useState(false)
	const [playing, setPlaying] = useState(false)

	const [refresh, setRefresh] = useState(0)

	const { next } = player

	useEffect(() => {
		const intval = setInterval(() => setRefresh(prev => prev + 1), 100)
		return () => clearInterval(intval)
	}, [])

	useEffect(() => {
		if (!next) {
			return
		}

		if (!next.cid || !protocolClient) {
			return
		}

		let canceled = false
		;(async () => {
			try {
				if (canceled) {
					return
				}
				setLoading(true)
				setPlayer({
					player: undefined,
					metadata: {
						id: next.cid,
					},
					next,
				})
				const src = await getSource(protocolClient, next.cid)
				if (canceled) {
					return
				}

				const player = new Player(`data:${next.mimeType};base64,${src}`)
				player.play(err => {
					if (!err && !canceled) {
						setPlayer({
							player,
							metadata: {
								id: next.cid,
							},
							next: undefined,
						})
						setLoading(false)
					}
				})
			} catch (e) {
				if (e instanceof EndError) {
					return
				}

				console.warn('error while fetching next player item', e)
			}
		})()

		return () => {
			canceled = true
		}
	}, [next, protocolClient])

	useEffect(() => {
		if (!player.player) {
			return
		}
		if (playing != player.player.isPlaying) {
			setPlaying(player.player.isPlaying)
		}
	}, [playing, player.player, refresh])

	useEffect(() => {
		const p = player.player
		if (p) {
			return () => p.destroy()
		}
	}, [player.player])

	const unload = React.useCallback(() => {
		setPlayer(INITIAL_PLAYER_VALUE)
	}, [])

	const load = React.useCallback(
		(cid: string, mimeType: string) => {
			setPlayer({
				...player,
				next: { cid, mimeType },
			})
		},
		[player],
	)

	const handlePlayPause = React.useCallback(() => {
		if (!player.player) {
			return
		}

		player.player.playPause((err, paused) => {
			if (!err) {
				setPlaying(!paused)
			}
		})
	}, [player.player])

	return (
		<MusicPlayerContext.Provider
			value={{
				player,
				load: load,
				playing,
				unload: unload,
				handlePlayPause,
				currentTime: player.player?.currentTime || 0,
				loading,
			}}
		>
			{children}
		</MusicPlayerContext.Provider>
	)
}

export const useMusicPlayer = () => useContext(MusicPlayerContext)
