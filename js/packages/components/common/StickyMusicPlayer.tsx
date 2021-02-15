import React, { useState, useEffect } from 'react'
import { Icon } from '@ui-kitten/components'
import { View, TouchableOpacity, Animated } from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { useMusicPlayer } from '@berty-tech/music-player'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const HEIGHT_OF_PLAYER = 100
export const MARGIN_FIX = 10

export const StickMusicPlayer = () => {
	const [{ border, padding, margin }, { windowWidth }] = useStyles()
	const [animatedWidth] = useState(new Animated.Value(0))
	const { player, setPlayer, handlePlayPause, refresh } = useMusicPlayer()
	const { top } = useSafeAreaInsets()

	useEffect(() => {
		if (player.player?.isPlaying) {
			Animated.timing(animatedWidth, {
				toValue:
					((player.player?.currentTime === -1
						? player.player?.duration
						: player.player?.currentTime) /
						player.player?.duration) *
					windowWidth *
					1.05,
				duration: 100,
				useNativeDriver: false,
			}).start()
		} else if (player.player?.isStopped) {
			Animated.timing(animatedWidth, {
				toValue: 0,
				duration: 100,
				useNativeDriver: false,
			}).start()
		}
	}, [animatedWidth, windowWidth, player, refresh])

	if (!player.player) {
		return null
	}

	return (
		<View
			style={[
				padding.horizontal.large,
				padding.vertical.medium,
				{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					width: '100%',
					position: 'relative',
					marginBottom: -top + MARGIN_FIX,
					paddingTop: top,
					zIndex: 9,
					backgroundColor: '#4F58C0',
					height: HEIGHT_OF_PLAYER,
				},
			]}
		>
			<TouchableOpacity
				style={{
					flex: 1,
				}}
				onPress={() => setPlayer()}
			>
				<Icon height={30} width={30} name='close-circle-outline' fill='#8F95D7' />
			</TouchableOpacity>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<TouchableOpacity
					onPress={() => {
						if (player.player?.currentTime) {
							const seekValue = player.player.currentTime - 1000
							player.player.seek(seekValue < 0 ? 0 : seekValue)
						}
					}}
					style={[
						border.radius.small,
						{
							backgroundColor: '#4F58C0',
							alignItems: 'center',
							justifyContent: 'center',
						},
					]}
				>
					<Icon
						name='fast-forward'
						fill='#6D76CA'
						height={30}
						width={30}
						pack='feather'
						style={{
							transform: [{ rotate: '180deg' }],
						}}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						handlePlayPause()
					}}
					style={[
						border.radius.small,
						margin.horizontal.medium,
						{
							backgroundColor: '#4F58C0',
							alignItems: 'center',
							justifyContent: 'center',
						},
					]}
				>
					<Icon
						name={player.player?.isPlaying ? 'pause' : 'play'}
						fill='white'
						height={35}
						width={35}
						pack='custom'
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						if (player.player?.currentTime) {
							const seekValue = player.player.currentTime + 1000
							player.player.seek(
								seekValue > player.player.duration ? player.player.duration : seekValue,
							)
						}
					}}
					style={[
						border.radius.small,
						{
							backgroundColor: '#4F58C0',
							alignItems: 'center',
							justifyContent: 'center',
						},
					]}
				>
					<Icon name='fast-forward' fill='#6D76CA' height={30} width={30} pack='feather' />
				</TouchableOpacity>
			</View>

			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'flex-end',
				}}
			>
				<TouchableOpacity onPress={() => {}} style={[padding.tiny, margin.left.small]}>
					<Icon name='volume-up-outline' fill='white' height={30} width={30} />
				</TouchableOpacity>
			</View>

			<View
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					backgroundColor: '#8999FF',
					height: 5,
				}}
			>
				<Animated.View
					style={[
						{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							backgroundColor: '#3F49EA',
							height: 5,
							width: animatedWidth,
						},
						Number(animatedWidth).toFixed(2) !== windowWidth.toFixed(2) && border.radius.right.tiny,
					]}
				/>
			</View>
		</View>
	)
}
