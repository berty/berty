import React, { createContext, useContext, useEffect, useState } from 'react'
import { Player } from '@react-native-community/audio-toolkit'

type PlayerType = Player | undefined
type IDType = string | number | undefined

const INITIAL_PLAYER_VALUE = {
	player: undefined,
	id: '',
}
export const MusicPlayerContext = createContext<{
	player: { player: PlayerType; id: IDType }
	setPlayer: (source?: string, id?: IDType) => void
	handlePlayPause: () => void
	refresh: number
}>({
	player: {
		player: undefined,
		id: '',
	},
	setPlayer: () => {},
	handlePlayPause: () => {},
	refresh: 0,
})

export const MusicPlayerProvider: React.FC<{ children: JSX.Element[] }> = ({ children }) => {
	const [player, setPlayer] = useState<{
		player: PlayerType
		id: IDType
	}>(INITIAL_PLAYER_VALUE)
	const [refresh, setRefresh] = useState(0)
	const [intervalId, setIntervalId] = useState<any>()
	const [startPlay, setStartPlay] = useState(false)
	const [source, setSource] = useState('')

	const startRefresh = () => {
		setIntervalId(setInterval(() => setRefresh((prev) => prev + 1), 100))
	}

	const setPlayerFn = (source?: string, id?: IDType): void => {
		if (player.player?.isPlaying) {
			player.player?.stop()
		}
		if (source) {
			setRefresh(0)
			setPlayer({ player: new Player(source), id })
			setSource(source)
			setStartPlay(true)
		} else {
			intervalId && clearInterval(intervalId)
			setPlayer(INITIAL_PLAYER_VALUE)
		}
	}

	const handlePlayPause = () => {
		if (player.player?.isPlaying) {
			player.player.pause((err) => {
				if (!err) {
					setTimeout(() => {
						intervalId && clearInterval(intervalId)
					}, 1000)
				}
			})
		} else if (player.player?.isPaused) {
			player.player?.playPause((err) => {
				if (!err) {
					startRefresh()
				}
			})
		} else {
			player.player?.play((err) => {
				if (!err) {
					startRefresh()
				}
			})
		}
	}

	useEffect(() => {
		if (refresh > 10 && player.player?.isStopped) {
			intervalId && clearInterval(intervalId)
			setPlayer({
				player: new Player(source),
				id: player.id,
			})
			setRefresh(0)
		}
	}, [player, refresh, intervalId, source])

	useEffect(() => {
		if (startPlay && !player.player?.isPlaying) {
			player.player?.play((err) => {
				if (!err) {
					setStartPlay(false)
					startRefresh()
				}
			})
		}
	}, [startPlay, player])

	return (
		<MusicPlayerContext.Provider
			value={{ player, setPlayer: setPlayerFn, handlePlayPause, refresh }}
		>
			{children}
		</MusicPlayerContext.Provider>
	)
}

export const useMusicPlayer = () => useContext(MusicPlayerContext)
