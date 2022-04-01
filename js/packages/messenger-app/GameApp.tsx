import React from 'react'
import { View, SafeAreaView, Pressable, PanResponder, Dimensions } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import '@berty/i18n'
import { GlobalPersistentOptionsKeys } from '@berty/store'
import WebView from '@berty/polyfill/react-native-webview'
import { BootSplashInhibitor } from './App'
import { PuzzleHtml } from './game-html'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Position = 'left' | 'right' | 'top' | 'bottom'
const ExitZone: React.FC<{ position: Position; checkPattern: () => void }> = ({
	position,
	checkPattern,
}) => {
	const _style = () => {
		switch (position) {
			case 'left':
				return {
					width: sizeOfExitZone,
					left: 0,
					top: 0,
					bottom: 0,
				}
			case 'right':
				return {
					width: sizeOfExitZone,
					right: 0,
					top: 0,
					bottom: 0,
				}
			case 'top':
				return {
					height: sizeOfExitZone,
					top: 0,
					left: 0,
					right: 0,
				}
			case 'bottom':
				return {
					height: sizeOfExitZone,
					left: 0,
					right: 0,
					bottom: 0,
				}
		}
	}

	return (
		<Pressable
			style={{
				position: 'absolute',
				borderWidth: 1,
				borderColor: 'blue',
				..._style(),
			}}
			onPressOut={() => checkPattern()}
		/>
	)
}

const sizeOfExitZone = 50
const pattern = ['top', 'right', 'bottom', 'left']

const { width, height } = Dimensions.get('window')

const GameApp: React.FC<{ runMessengerApp: () => void }> = ({ runMessengerApp }) => {
	const [indexOfPattern, setIndexOfPattern] = React.useState<number>(0)
	const insets = useSafeAreaInsets()

	React.useEffect(() => {
		const run = async () => {
			await AsyncStorage.setItem(GlobalPersistentOptionsKeys.IsHidden, JSON.stringify(false))
			runMessengerApp()
		}

		console.log('CHECK:', indexOfPattern, pattern.length)
		if (indexOfPattern === pattern.length) {
			run()
		}
	}, [indexOfPattern])

	const checkPattern = React.useCallback(
		({ top, bottom, left, right }) => {
			if (
				pattern[indexOfPattern] === top ||
				pattern[indexOfPattern] === bottom ||
				pattern[indexOfPattern] === left ||
				pattern[indexOfPattern] === right
			) {
				setIndexOfPattern(indexOfPattern + 1)
			} else {
				setIndexOfPattern(0)
			}
		},
		[indexOfPattern],
	)

	const panResponder = React.useMemo(
		() =>
			PanResponder.create({
				onMoveShouldSetPanResponder: () => true,
				onMoveShouldSetPanResponderCapture: () => true,
				onPanResponderRelease: (_evt, gestureState) => {
					const { moveX, moveY } = gestureState
					const top =
						moveY < sizeOfExitZone + insets.top && moveX > 0 && moveX < width ? 'top' : null
					const bottom =
						moveY > height - sizeOfExitZone - insets.bottom && moveX > 0 && moveX < width
							? 'bottom'
							: null
					const left = moveX < sizeOfExitZone && moveY > 0 && moveY < height ? 'left' : null
					const right =
						moveX > width - sizeOfExitZone && moveY > 0 && moveY < height ? 'right' : null
					checkPattern({ top, bottom, left, right })
				},
			}),
		[indexOfPattern],
	)

	return (
		panResponder?.panHandlers && (
			<>
				<BootSplashInhibitor />
				<SafeAreaView style={{ flex: 1 }}>
					<View
						style={{ flex: 1, padding: sizeOfExitZone, backgroundColor: 'white' }}
						{...panResponder.panHandlers}
					>
						<WebView style={{ borderWidth: 1, borderColor: 'red' }} source={{ html: PuzzleHtml }} />
						<ExitZone position='top' checkPattern={() => checkPattern({ top: 'top' })} />
						<ExitZone position='bottom' checkPattern={() => checkPattern({ bottom: 'bottom' })} />
						<ExitZone position='left' checkPattern={() => checkPattern({ left: 'left' })} />
						<ExitZone position='right' checkPattern={() => checkPattern({ right: 'right' })} />
					</View>
				</SafeAreaView>
			</>
		)
	)
}

export default GameApp
