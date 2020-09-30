import React, { useEffect, useRef } from 'react'
import { TouchableOpacity, StatusBar, View, Text, Vibration } from 'react-native'
import GestureRecognizer from 'react-native-swipe-gestures'
import { SafeAreaContext } from 'react-native-safe-area-context'

import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { useStyles } from '@berty-tech/styles'
import { useInteraction, useConversation, useOneToOneContact } from '@berty-tech/store/hooks'

import BlurView from './shared-components/BlurView'
import Logo from './main/1_berty_picto.svg'
import { navigate, Routes } from '@berty-tech/navigation'

//
// Styles
//

const useStylesNotification = () => {
	const [{ flex }] = useStyles()
	return {
		touchable: [flex.tiny, flex.direction.row, { paddingHorizontal: 10 }],
		innerTouchable: [flex.direction.row, { padding: 15, flexGrow: 0, flexShrink: 1 }],
		titleAndTextWrapper: [flex.justify.spaceAround, { marginLeft: 15, flexShrink: 1, flexGrow: 0 }],
	}
}

function usePrevious(value) {
	// https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
	const ref = useRef()
	useEffect(() => {
		ref.current = value
	})
	return ref.current
}

//
// Components
//

const NotificationTmpLogo: React.FC<{}> = () => {
	return (
		<View
			style={{
				alignSelf: 'center',
				alignItems: 'center',
				width: 40,
				height: 40,
				flexGrow: 0,
				flexShrink: 0,
				borderRadius: 30,
				justifyContent: 'center',

				borderWidth: 2,
				borderColor: 'rgba(215, 217, 239, 1)',
			}}
		>
			{/*<Icon name='checkmark-outline' fill={color.green} width={15} height={15} />*/}
			<Logo
				width={26}
				height={26}
				style={{ marginLeft: 4 }} // nudge logo to appear centered
			/>
		</View>
	)
}

const NotificationMessage: React.FC<any> = ({ onClose, title, message, ...props }) => {
	const [{ text }] = useStyles()
	const _styles = useStylesNotification()
	const { payload } = props?.additionalProps?.payload || {}
	const convExists = useConversation(payload.conversation?.publicKey)
	const inteExists = useInteraction(payload?.interaction?.cid, payload.conversation?.publicKey)

	const handlePressConvMessage = () => {
		if (convExists && inteExists) {
			// TODO: Investigate: doesn't work if app crashes and is restarted
			navigate(
				payload.conversation.type === messengerpb.Conversation.Type.ContactType
					? Routes.Chat.OneToOne
					: Routes.Chat.Group,
				{ convId: payload.conversation?.publicKey, scrollToMessage: payload?.interaction?.cid },
			)
		} else {
			console.warn('Notif: Conversation or interaction not found')
		}
	}

	return (
		<TouchableOpacity
			style={_styles.touchable}
			activeOpacity={convExists ? 0.3 : 1}
			//underlayColor='transparent'
			onPress={() => {
				handlePressConvMessage()
				if (typeof onClose === 'function') {
					onClose()
				}
			}}
		>
			<View style={_styles.innerTouchable}>
				<NotificationTmpLogo />
				<View style={_styles.titleAndTextWrapper}>
					<Text numberOfLines={1} style={[text.color.black, text.bold.medium]}>
						{title}
					</Text>
					<Text numberOfLines={1} ellipsizeMode='tail' style={[text.color.black]}>
						{message}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

const NotificationBasic: React.FC<any> = ({ onClose, title, message, additionalProps: notif }) => {
	const [{ text }] = useStyles()
	const _styles = useStylesNotification()
	console.log('notif', notif)
	if (!notif) {
		return null
	}
	return (
		<TouchableOpacity
			style={_styles.touchable}
			activeOpacity={0.3}
			//underlayColor='transparent'
			onPress={() => {
				if (typeof onClose === 'function') {
					onClose()
				}
			}}
		>
			<View style={_styles.innerTouchable}>
				<NotificationTmpLogo />
				<View style={_styles.titleAndTextWrapper}>
					<Text numberOfLines={1} style={[text.color.black, text.bold.medium]}>
						{title}
					</Text>
					<Text numberOfLines={1} ellipsizeMode='tail' style={[text.color.black]}>
						{message}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

const NotificationBody: React.FC<any> = (props) => {
	console.log('RENDERING NOTIFICATION', props)

	const prevProps = usePrevious(props)
	useEffect(() => {
		if ((prevProps?.vibrate || props.vibrate) && props.isOpen && !prevProps?.isOpen) {
			Vibration.vibrate(400)
		}
	})

	const [{ border, flex, column, background }] = useStyles()

	if (!props.isOpen) {
		return null
	}

	const NotificationContents = () =>
		props?.additionalProps?.type === 2 ? (
			<NotificationMessage {...props} />
		) : (
			<NotificationBasic {...props} />
		)

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
						flex.tiny,
						flex.justify.center,
						column.item.center,
						background.white,
						{
							position: 'absolute',
							marginTop: insets?.top || 0,
							width: '90%',
							borderRadius: 15,
						},
					]}
				>
					<NotificationContents />
				</GestureRecognizer>
			)}
		</SafeAreaContext.Consumer>
	)
}

export default NotificationBody
