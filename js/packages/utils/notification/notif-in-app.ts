import beapi from '@berty/api'

// returns true if the notification should be inhibited
export type NotificationsInhibitor = (
	evt: beapi.messenger.StreamEvent.INotified,
) => boolean | 'sound-only'

export const showNeedRestartNotification = (showNotification: any, restart: () => void, t: any) => {
	showNotification({
		title: t('notification.need-restart.title'),
		message: t('notification.need-restart.desc'),
		onPress: () => {
			restart()
		},
		additionalProps: { type: 'message' },
	})
}
