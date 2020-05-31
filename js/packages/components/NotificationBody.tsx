import React, { useEffect, useRef } from 'react'
import {
	TouchableOpacity,
	StatusBar,
	View,
	Text,
	Image,
	Vibration,
	ImageSourcePropType,
} from 'react-native'
import GestureRecognizer from 'react-native-swipe-gestures'
import { SafeAreaContext } from 'react-native-safe-area-context'
import { BlurView } from '@react-native-community/blur'
import { useStyles } from '@berty-tech/styles'

const Icon = (props: { iconApp?: ImageSourcePropType; icon?: ImageSourcePropType }) => {
	const { iconApp, icon } = props

	if (icon) {
		return (
			<Image
				source={icon}
				style={{
					marginTop: 10,
					marginLeft: 10,
					resizeMode: 'contain',
					width: 48,
					height: 48,
				}}
			/>
		)
	} else if (iconApp) {
		return (
			<Image
				source={iconApp}
				style={{
					marginTop: 10,
					marginLeft: 20,
					resizeMode: 'contain',
					width: 24,
					height: 24,
					borderRadius: 5,
				}}
			/>
		)
	}

	return null
}

function usePrevious<T>(value: T) {
	// https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
	const ref = useRef<T>()
	useEffect(() => {
		ref.current = value
	})
	return ref.current
}

const NotificationBody: React.FC<{
	isOpen: boolean
	vibrate: boolean
	title: string
	message: string
	onPress: () => {}
	onClose: () => {}
}> = (props) => {
	const prevProps = usePrevious(props)
	useEffect(() => {
		if ((prevProps?.vibrate || props.vibrate) && props.isOpen && !prevProps?.isOpen) {
			Vibration.vibrate(400)
		}
	})

	const { title, message } = props

	const [{ border }] = useStyles()

	const padding = 15

	return (
		<SafeAreaContext.Consumer>
			{(insets) => (
				<GestureRecognizer
					onSwipe={(gestureName) => {
						if (gestureName === 'SWIPE_UP' && typeof props.onClose === 'function') {
							props.onClose()
						}
					}}
					style={[
						border.shadow.big,
						{
							position: 'absolute',
							top: 0,
							width: '100%',
							alignItems: 'center',
						},
					]}
				>
					<BlurView
						style={{
							flex: 1,
							marginTop: insets?.top || 0,
							width: '80%',
							borderRadius: 15,
							paddingTop: padding,
						}}
						blurType='xlight'
						blurAmount={10}
					>
						<TouchableOpacity
							style={{
								flex: 1,
								flexDirection: 'row',
							}}
							activeOpacity={0.3}
							//underlayColor='transparent'
							onPress={() => {
								const { onPress, onClose } = props
								if (typeof onClose === 'function') {
									onClose()
								}
								if (typeof onPress === 'function') {
									onPress()
								}
							}}
						>
							<Icon />
							<View
								style={{
									alignSelf: 'center',
									marginLeft: 20,
								}}
							>
								<Text
									numberOfLines={1}
									style={{
										color: 'black',
										fontWeight: 'bold',
									}}
								>
									{title}
								</Text>
								<Text
									numberOfLines={1}
									style={{
										color: 'black',
										marginTop: 5,
									}}
								>
									{message}
								</Text>
							</View>
						</TouchableOpacity>
						<View
							style={{
								backgroundColor: '#696969',
								borderRadius: 5,
								alignSelf: 'center',
								height: 5,
								width: 35,
								margin: 5,
								marginTop: padding - 10,
							}}
						/>
					</BlurView>
				</GestureRecognizer>
			)}
		</SafeAreaContext.Consumer>
	)
}

export default NotificationBody
