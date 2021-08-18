import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Player } from '@react-native-community/audio-toolkit'

type PlayerType = Player | undefined

export class EndError extends Error {}

export interface PlayerItemMetadata {
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
	next?: Promise<[string, PlayerItemMetadata]>
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

export const MusicPlayerContext = createContext<{
	player: PlayerState
	load: (contentPromise: Promise<[string, PlayerItemMetadata]>) => void
	unload: () => void
	handlePlayPause: () => void
	refresh: number
}>({
	player: INITIAL_PLAYER_VALUE,
	load: () => {},
	unload: () => {},
	handlePlayPause: () => {},
	refresh: 0,
})

export const MusicPlayerProvider: React.FC = ({ children }) => {
	const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER_VALUE)
	const [refresh, setRefresh] = useState(0)
	const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval>>()
	const [startPlay, setStartPlay] = useState(false)

	const startRefresh = useCallback(() => {
		if (intervalId) {
			clearInterval(intervalId)
		}

		setIntervalId(setInterval(() => setRefresh(prev => prev + 1), 100))
	}, [intervalId])

	useEffect(() => {
		if (!player.next) {
			return
		}

		let canceled = false
		;(async () => {
			try {
				const contentMetadata = await player.next
				if (canceled || contentMetadata === undefined) {
					return
				}

				const [content, metadata] = contentMetadata

				setRefresh(0)
				setPlayer({
					player: new Player(content),
					metadata: metadata || INITIAL_PLAYER_METADATA,
					next: undefined,
				})
				setStartPlay(true)
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
	}, [player.next])

	useEffect(() => () => player.player?.destroy(), [player.player])

	const unload = () => {
		intervalId && clearInterval(intervalId)
		setPlayer(INITIAL_PLAYER_VALUE)
	}

	const load = (promise: Promise<[string, PlayerItemMetadata]>) => {
		setPlayer({
			...player,
			next: promise,
		})
	}

	const handlePlayPause = () => {
		if (player.player?.isPlaying) {
			player.player.pause(err => {
				if (!err) {
					setTimeout(() => {
						intervalId && clearInterval(intervalId)
					}, 1000)
				}
			})
		} else if (player.player?.isPaused) {
			player.player?.playPause(err => {
				if (!err) {
					startRefresh()
				}
			})
		} else {
			player.player?.play(err => {
				if (!err) {
					startRefresh()
				}
			})
		}
	}

	useEffect(() => {
		if (refresh > 10 && player.player?.isStopped) {
			intervalId && clearInterval(intervalId)
			setRefresh(0)
		}
	}, [player, refresh, intervalId])

	useEffect(() => {
		if (startPlay && !player.player?.isPlaying && !player.next) {
			player.player?.play(err => {
				if (!err) {
					setStartPlay(false)
					startRefresh()
				}
			})
		}
	}, [startRefresh, startPlay, player])

	return (
		<MusicPlayerContext.Provider
			value={{
				player,
				load: load,
				unload: unload,
				handlePlayPause,
				refresh,
			}}
		>
			{children}
		</MusicPlayerContext.Provider>
	)
}

export const useMusicPlayer = () => useContext(MusicPlayerContext)
