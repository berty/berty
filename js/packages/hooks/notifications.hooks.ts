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
