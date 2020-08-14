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
import { Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { ProceduralCircleAvatar } from './shared-components'

function usePrevious(value) {
	// https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
	const ref = useRef()
	useEffect(() => {
		ref.current = value
	})
	return ref.current
}

const NotificationMessage = ({ onClose, onPress, title, message, padding }) => {
	const [{ text, margin, opacity }] = useStyles()

	return (
		<>
			<TouchableOpacity
				style={{
					flex: 1,
					flexDirection: 'row',
				}}
				activeOpacity={0.3}
				//underlayColor='transparent'
				onPress={() => {
					if (typeof onClose === 'function') {
						onClose()
					}
					if (typeof onPress === 'function') {
						onPress()
					}
				}}
			>
				<View
					style={{
						// marginTop: 10,
						marginLeft: 10,
						resizeMode: 'contain',
						width: 24,
						height: 40,
						borderRadius: 12,
					}}
				>
					<ProceduralCircleAvatar
						// TODO publickKey of the conv
						seed='1igPxTFHkJzCYlK84Xxyn1AI1zN/T+8kGZFqmjlAS58='
						size={40}
					/>
				</View>
				<View
					style={{
						alignSelf: 'center',
						marginLeft: 30,
						justifyContent: 'space-evenly',
					}}
				>
					<Text
						numberOfLines={1}
						style={[
							{
								color: 'black',
							},
							text.bold.small,
							margin.right.tiny,
						]}
					>
						{title}
					</Text>
					<Text
						numberOfLines={1}
						style={[
							{
								color: 'black',
							},
							opacity(0.8),
						]}
					>
						{message}
					</Text>
				</View>
			</TouchableOpacity>
			<View
				style={{
					alignSelf: 'center',
					margin: 5,
					marginTop: padding - 10,
				}}
			/>
		</>
	)
}

const NotificationBasic = ({ onClose, onPress, title, message, padding }) => {
	const [{ color, text, margin }] = useStyles()

	return (
		<>
			<TouchableOpacity
				style={{
					flex: 1,
					flexDirection: 'row',
				}}
				activeOpacity={0.3}
				//underlayColor='transparent'
				onPress={() => {
					if (typeof onClose === 'function') {
						onClose()
					}
					if (typeof onPress === 'function') {
						onPress()
					}
				}}
			>
				<View
					style={{
						// marginTop: 10,
						marginLeft: 20,
						resizeMode: 'contain',
						width: 24,
						height: 40,
						borderRadius: 12,
					}}
				>
					<View
						style={{
							alignSelf: 'center',
							alignItems: 'center',
							width: 40,
							height: 40,
							backgroundColor: color.green,
							borderRadius: 20,
							justifyContent: 'center',
						}}
					>
						<Icon name='paper-plane-outline' width={20} height={20} fill={color.white} />
					</View>
				</View>
				<View
					style={{
						alignSelf: 'center',
						marginLeft: 20,
						flexDirection: 'row',
					}}
				>
					<Text
						numberOfLines={1}
						style={[
							{
								color: 'black',
							},
							text.bold.small,
							margin.right.tiny,
						]}
					>
						{message}
					</Text>
					<Icon name='checkmark-outline' fill={color.green} width={15} height={15} />
				</View>
			</TouchableOpacity>
			<View
				style={{
					alignSelf: 'center',
					margin: 5,
					marginTop: padding - 10,
				}}
			/>
		</>
	)
}

const NotificationBody = (props) => {
	const prevProps = usePrevious(props)
	useEffect(() => {
		if ((prevProps?.vibrate || props.vibrate) && props.isOpen && !prevProps?.isOpen) {
			Vibration.vibrate(400)
		}
	})

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
							width: '90%',
							borderRadius: 15,
							paddingTop: padding,
						}}
						blurType='xlight'
						blurAmount={10}
					>
						<NotificationBasic {...props} padding={padding} />
						{/* <NotificationMessage {...props} padding={padding} /> */}
					</BlurView>
				</GestureRecognizer>
			)}
		</SafeAreaContext.Consumer>
	)
}

export default NotificationBody
