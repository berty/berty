import React from 'react'
import { View, SafeAreaView, Pressable, PanResponder, Dimensions, StyleSheet } from 'react-native'

import WebView from 'react-native-webview'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const _defaultBorderSize = 40
const exitMessageEvent = 'ExitGame'

const styles = StyleSheet.create({
	debug: {
		borderWidth: 1,
		borderColor: 'red',
		backgroundColor: 'white',
		opacity: 0.5,
	},
})

type Position = 'left' | 'right' | 'top' | 'bottom'
const ExitZone: React.FC<{
	position: Position
	checkPattern: () => void
	borderSize?: number
	debug?: boolean
}> = ({ position, checkPattern, borderSize = _defaultBorderSize, debug = false }) => {
	const _style = () => {
		switch (position) {
			case 'left':
				return {
					width: borderSize,
					left: 0,
					top: 0,
					bottom: 0,
				}
			case 'right':
				return {
					width: borderSize,
					right: 0,
					top: 0,
					bottom: 0,
				}
			case 'top':
				return {
					height: borderSize,
					top: 0,
					left: 0,
					right: 0,
				}
			case 'bottom':
				return {
					height: borderSize,
					left: 0,
					right: 0,
					bottom: 0,
				}
		}
	}

	return (
		<Pressable
			style={[
				debug && styles.debug,
				{
					position: 'absolute',
					..._style(),
				},
			]}
			onPressOut={() => checkPattern()}
		/>
	)
}

enum PatternType {
	top = 'top',
	right = 'right',
	left = 'left',
	bottom = 'bottom',
}
const { width, height } = Dimensions.get('window')

export const MiniGame: React.FC<{
	htmlString: string
	exit: () => void
	borderSize?: number
	pattern?: PatternType[]
	debug?: boolean
}> = ({
	htmlString,
	exit,
	borderSize = _defaultBorderSize,
	pattern = ['top', 'right', 'bottom', 'left'],
	debug = false,
}) => {
	const [indexOfPattern, setIndexOfPattern] = React.useState<number>(0)
	const insets = useSafeAreaInsets()

	React.useEffect(() => {
		const f = async () => {
			exit()
		}

		console.log('CHECK:', indexOfPattern, pattern.length)
		if (indexOfPattern === pattern.length) {
			f()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
		[indexOfPattern, pattern],
	)

	const panResponder = React.useMemo(
		() =>
			PanResponder.create({
				onMoveShouldSetPanResponder: () => true,
				onMoveShouldSetPanResponderCapture: () => true,
				onPanResponderRelease: (_evt, gestureState) => {
					const { moveX, moveY } = gestureState
					const top = moveY < borderSize + insets.top && moveX > 0 && moveX < width ? 'top' : null
					const bottom =
						moveY > height - borderSize - insets.bottom && moveX > 0 && moveX < width
							? 'bottom'
							: null
					const left = moveX < borderSize && moveY > 0 && moveY < height ? 'left' : null
					const right = moveX > width - borderSize && moveY > 0 && moveY < height ? 'right' : null
					checkPattern({ top, bottom, left, right })
				},
			}),
		[borderSize, checkPattern, insets.bottom, insets.top],
	)

	return (
		panResponder?.panHandlers && (
			<SafeAreaView style={{ flex: 1 }}>
				<View style={{ flex: 1, backgroundColor: 'white' }} {...panResponder.panHandlers}>
					<WebView
						source={{ html: htmlString }}
						textZoom={100}
						originWhitelist={['nope']}
						showsHorizontalScrollIndicator={false}
						showsVerticalScrollIndicator={false}
						onMessage={msg => {
							if (msg.nativeEvent.data === exitMessageEvent) {
								exit()
							}
						}}
						bounces={false}
					/>
					<ExitZone
						debug={debug}
						position='top'
						checkPattern={() => checkPattern({ top: 'top' })}
					/>
					<ExitZone
						debug={debug}
						position='bottom'
						checkPattern={() => checkPattern({ bottom: 'bottom' })}
					/>
					<ExitZone
						debug={debug}
						position='left'
						checkPattern={() => checkPattern({ left: 'left' })}
					/>
					<ExitZone
						debug={debug}
						position='right'
						checkPattern={() => checkPattern({ right: 'right' })}
					/>
				</View>
			</SafeAreaView>
		)
	)
}
