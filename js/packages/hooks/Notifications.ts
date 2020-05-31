import { notifications } from '@berty-tech/store'
import { useSelector, useDispatch } from 'react-redux'

export const useNotifications: () => notifications.Entity[] = () => {
	return useSelector((state: notifications.GlobalState) => notifications.queries.list(state))
}

export const useNotify = () => {
	const dispatch = useDispatch()
	return (notif: notifications.Entity) => dispatch(notifications.commands.notify(notif))
}

export const useLastNotification: () => notifications.Entity | undefined = () => {
	const notifs = useNotifications()
	return notifs[0]
}
