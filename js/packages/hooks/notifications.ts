import { chat } from '@berty-tech/store'
import { useSelector, useDispatch } from 'react-redux'

export const useNotifications: () => chat.notifications.Entity[] = () => {
	return useSelector((state: chat.notifications.GlobalState) =>
		chat.notifications.queries.list(state),
	)
}

export const useNotify = () => {
	const dispatch = useDispatch()
	return (notif: chat.notifications.Entity) => dispatch(chat.notifications.commands.notify(notif))
}

export const useLastNotification: () => chat.notifications.Entity | undefined = () => {
	const notifs = useNotifications()
	return notifs[0]
}
