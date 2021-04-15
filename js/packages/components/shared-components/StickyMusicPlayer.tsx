import React, { useState, useEffect } from 'react'
import { Icon } from '@ui-kitten/components'
import { View, TouchableOpacity, Animated } from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { useMusicPlayer } from '@berty-tech/music-player'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const HEIGHT_OF_PLAYER = 60

export const StickMusicPlayer = () => {
	const [{ border, padding, margin }, { windowWidth, scaleSize }] = useStyles()
	const [animatedWidth] = useState(new Animated.Value(0))
	const { player, unload, handlePlayPause, refresh } = useMusicPlayer()
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
					0.92,
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
				border.radius.top.medium,
				{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					width: '100%',
					position: 'relative',
					marginBottom: -top,
					marginTop: top,
					zIndex: 9,
					backgroundColor: '#4F58C0',
					height: HEIGHT_OF_PLAYER,
				},
			]}
		>
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'flex-start',
				}}
			>
				<TouchableOpacity
					style={[
						border.radius.big,
						{
							padding: 1,
							borderWidth: 3,
							borderColor: '#8F95D7',
							transform: [
								{
									rotate: '45deg',
								},
							],
						},
					]}
					onPress={() => unload()}
				>
					<Icon
						height={16 * scaleSize}
						width={16 * scaleSize}
						name='plus'
						pack='custom'
						fill='#8F95D7'
					/>
				</TouchableOpacity>
			</View>

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
						name='prev'
						fill='white'
						height={25 * scaleSize}
						width={25 * scaleSize}
						pack='custom'
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						handlePlayPause()
					}}
					style={[
						border.radius.small,
						margin.horizontal.big,
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
						height={25 * scaleSize}
						width={25 * scaleSize}
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
					<Icon
						name='next'
						fill='white'
						height={25 * scaleSize}
						width={25 * scaleSize}
						pack='custom'
					/>
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
					<Icon
						name='volume'
						fill='white'
						height={20 * scaleSize}
						width={20 * scaleSize}
						pack='custom'
					/>
				</TouchableOpacity>
			</View>

			<View
				style={{
					position: 'absolute',
					top: 0,
					left: 15,
					right: 15,
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
							right: -15,
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
