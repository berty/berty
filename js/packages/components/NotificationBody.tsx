import React, { useEffect } from 'react'
import { Vibration } from 'react-native'
import GestureRecognizer from 'react-native-swipe-gestures'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import {
	useMessengerContext,
	useThemeColor,
	NotificationsInhibitor,
	SoundKey,
} from '@berty-tech/store'

import { usePrevious } from './hooks'
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
	const [{ border, flex, column }] = useStyles()
	const colors = useThemeColor()
	const insets = useSafeAreaInsets()

	return (
		<GestureRecognizer
			onSwipe={gestureName => {
				if (gestureName === 'SWIPE_UP' && typeof props.onClose === 'function') {
					props.onClose()
				}
			}}
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
		</GestureRecognizer>
	)
}

const T = beapi.messenger.StreamEvent.Notified.Type

const notifsSounds: { [key: number]: SoundKey } = {
	[T.TypeContactRequestReceived]: 'contactRequestReceived',
	[T.TypeMessageReceived]: 'messageReceived',
	[T.TypeContactRequestSent]: 'contactRequestSent',
}

const GatedNotificationBody: React.FC<{
	isOpen?: boolean
	additionalProps?: beapi.messenger.StreamEvent.INotified
	onClose?: () => void
}> = props => {
	const prevProps = usePrevious(props)
	const ctx = useMessengerContext()

	const justOpened = props.isOpen && !prevProps?.isOpen
	const notif = props.additionalProps
	const isValid = !!(notif && props.isOpen && !ctx.account?.noNotification)
	const notifType = notif?.type || 0
	const inhibit = isValid
		? ctx.notificationsInhibitors.reduce<ReturnType<NotificationsInhibitor>>((r, inh) => {
				if (r === false) {
					return inh(ctx, notif as any)
				}
				return r
		  }, false)
		: true

	useEffect(() => {
		const sound: SoundKey | undefined = notifsSounds[notifType]
		if (justOpened && sound && (!inhibit || inhibit === 'sound-only')) {
			Vibration.vibrate(400)
			ctx.playSound(sound)
		}
	}, [ctx, notifType, justOpened, inhibit])

	if (!isValid || inhibit) {
		if (props.isOpen && typeof props.onClose === 'function') {
			props.onClose()
		}
		return null
	}

	return <NotificationBody {...props} />
}

export default GatedNotificationBody
