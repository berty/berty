import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'

import { useAppDispatch } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import {
	addNotificationInhibitor,
	removeNotificationInhibitor,
} from '@berty/redux/reducers/ui.reducer'
import { NotificationsInhibitor } from '@berty/utils/notification/notif-in-app'
import { Maybe } from '@berty/utils/type/maybe'

import { useMountEffect } from './react.hooks'

export const useNotificationsInhibitor = (inhibitor: Maybe<NotificationsInhibitor>) => {
	const dispatch = useAppDispatch()
	const navigation = useNavigation()
	useMountEffect(() => {
		if (!inhibitor) {
			return
		}

		const inhibit = () => dispatch(addNotificationInhibitor({ inhibitor }))
		const revert = () => dispatch(removeNotificationInhibitor({ inhibitor }))

		const unsubscribeBlur = navigation.addListener('blur', revert)
		const unsubscribeFocus = navigation.addListener('focus', inhibit)

		inhibit()

		return () => {
			unsubscribeFocus()
			unsubscribeBlur()
			revert()
		}
	})
}

// Dismisses the conversation's tray notifications while its screen is focused.
export const useDismissNotificationsEffect = (convPK: Maybe<string>) => {
	const navigation = useNavigation()

	useEffect(() => {
		if (!convPK) {
			return
		}

		const dismiss = async () => {
			try {
				const presented = await Notifications.getPresentedNotificationsAsync()
				await Promise.all(
					presented
						.filter(
							n =>
								(n.request.content.data as { convPK?: string } | undefined)?.convPK === convPK,
						)
						.map(n => Notifications.dismissNotificationAsync(n.request.identifier)),
				)
			} catch (e) {
				console.warn('failed to dismiss conversation notifications', e)
			}
		}

		dismiss()
		const unsubscribeFocus = navigation.addListener('focus', dismiss)
		return () => {
			unsubscribeFocus()
		}
	}, [convPK, navigation])
}
