import { notifications } from '@berty-tech/store'
import { useSelector, useDispatch } from 'react-redux'

export const useNotifications: () => notifications.Notification[] = () => {
	return useSelector((state: notifications.GlobalState) => notifications.queries.list(state))
}

export const useNotify = () => {
	const dispatch = useDispatch()
	return (notif: notifications.Notification) => dispatch(notifications.commands.notify(notif))
}

export const useLastNotification: () => notifications.Notification | undefined = () => {
	const notifs = useNotifications()
	return notifs[0]
}

const { Type } = notifications

export { Type }
