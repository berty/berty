import React, { useEffect } from 'react'
import { Vibration } from 'react-native'
import GestureRecognizer from 'react-native-swipe-gestures'
import { SafeAreaContext } from 'react-native-safe-area-context'

import { berty } from '@berty-tech/api/index.pb'
import { useStyles } from '@berty-tech/styles'
import { usePersistentOptions } from '@berty-tech/store/hooks'

import { usePrevious } from './hooks'
import notifications, { DefaultNotification } from './notifications'

const NotificationContents: React.FC<{
	additionalProps: { type: berty.messenger.v1.StreamEvent.Notified.Type }
}> = (props) => {
	const NotificationComponent = notifications[props?.additionalProps?.type]
	if (NotificationComponent) {
		return <NotificationComponent {...props} />
	}
	return <DefaultNotification {...props} />
}

const NotificationBody: React.FC<any> = (props) => {
	const prevProps = usePrevious(props)
	const justOpened = props.isOpen && !prevProps?.isOpen

	useEffect(() => {
		if ((prevProps?.vibrate || props.vibrate) && justOpened) {
			Vibration.vibrate(400)
		}
	})

	const [{ border, flex, column, background }] = useStyles()

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
					<NotificationContents {...props} justOpened={justOpened} />
				</GestureRecognizer>
			)}
		</SafeAreaContext.Consumer>
	)
}

const GatedNotificationBody: React.FC<any> = (props) => {
	const persistentOptions = usePersistentOptions()

	const evt = props.additionalProps

	const isValid = evt && props.isOpen && persistentOptions?.notifications?.enable

	if (!isValid) {
		return null
	}

	return <NotificationBody {...props} />
}

export default GatedNotificationBody
