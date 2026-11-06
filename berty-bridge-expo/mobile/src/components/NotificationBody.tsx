import React, { useEffect, useRef } from 'react'
import { Vibration, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { useAccount, useAppSelector, usePlaySound, useThemeColor } from '@berty/hooks'
import { selectNotificationsInhibitors } from '@berty/redux/reducers/ui.reducer'
import { NotificationsInhibitor } from '@berty/utils/notification/notif-in-app'
import { SoundKey } from '@berty/utils/sound/sound.types'

import notifications, { DefaultNotification } from './notifications'

const NotificationContents: React.FC<{
	additionalProps: { type: beapi.messenger.StreamEvent.Notified.Type }
}> = props => {
	const NotificationComponent = notifications[props?.additionalProps?.type]
	if (NotificationComponent) {
		return <NotificationComponent {...props} />
	}
	return <DefaultNotification {...props} />
}

const NotificationBody: React.FC<any> = props => {
	const { border, flex, column } = useStyles()
	const colors = useThemeColor()
	const insets = useSafeAreaInsets()

	// Swipe the banner up to dismiss it.
	const swipeUp = React.useMemo(
		() =>
			Gesture.Pan()
				.runOnJS(true)
				.onEnd(event => {
					if (event.translationY < -20 && typeof props.onClose === 'function') {
						props.onClose()
					}
				}),
		[props.onClose],
	)

	return (
		<GestureDetector gesture={swipeUp}>
			<View
				style={[
					border.shadow.big,
					flex.tiny,
					flex.justify.center,
					column.item.center,
					{
						backgroundColor: colors['main-background'],
						position: 'absolute',
						marginTop: insets?.top || 0,
						width: '90%',
						borderRadius: 15,
						shadowColor: colors.shadow,
					},
				]}
			>
				<NotificationContents {...props} />
			</View>
		</GestureDetector>
	)
}

const T = beapi.messenger.StreamEvent.Notified.Type

const notifsSounds: { [key: number]: SoundKey } = {
	[T.TypeContactRequestReceived]: 'contactRequestReceived',
	[T.TypeMessageReceived]: 'messageReceived',
	[T.TypeContactRequestSent]: 'contactRequestSent',
}

const GatedNotificationBody: React.FC<any> = props => {
	const account = useAccount()
	const wasOpen = useRef(false)

	const notificationsInhibitors = useAppSelector(selectNotificationsInhibitors)
	const playSound = usePlaySound()

	const notif = props.additionalProps as beapi.messenger.StreamEvent.INotified | undefined

	const isValid = notif && props.isOpen && !account?.hideInAppNotifications

	const inhibit = isValid
		? notificationsInhibitors.reduce<ReturnType<NotificationsInhibitor>>((r, inh) => {
				if (r === false) {
					return inh(notif)
				}
				return r
		  }, false)
		: true

	const notifType = notif?.type || 0

	const isOpen = !!props.isOpen
	useEffect(() => {
		// Play the sound once, when the notification goes from closed to open.
		const justOpened = isOpen && !wasOpen.current
		wasOpen.current = isOpen
		const sound: SoundKey | undefined = notifsSounds[notifType]
		if (justOpened && sound && (!inhibit || inhibit === 'sound-only')) {
			Vibration.vibrate(400)
			playSound(sound)
		}
	}, [playSound, notifType, isOpen, inhibit])

	if (!isValid || inhibit) {
		if (props.isOpen) {
			props.onClose()
		}
		return null
	}

	return <NotificationBody {...props} />
}

export default GatedNotificationBody
