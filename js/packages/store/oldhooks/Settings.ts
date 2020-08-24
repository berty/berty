import * as Messenger from './Messenger'

const settings = {}

const useDispatch = () => () => {}
const useSelector = () => () => undefined

export const useSettings = () => {
	return useSelector(settings.main.queries.get)
}

export const useSystemInfo = () => {
	const dispatch = useDispatch()
	const account = Messenger.useAccount()
	if (!account) {
		return () => {}
	}
	return () => {
		dispatch(settings.main.commands.systemInfo())
	}
}

type UseDebugGroup = (kwargs: { pk: string }) => () => void

export const useDebugGroup: UseDebugGroup = ({ pk }) => {
	const dispatch = useDispatch()
	const account = Messenger.useAccount()
	if (!account) {
		return () => {}
	}
	return () => {
		dispatch(settings.main.commands.debugGroup({ pk }))
	}
}

export const useToggleTracing = () => {
	const dispatch = useDispatch()
	return () => dispatch(settings.main.commands.toggleTracing())
}

export { settings as store }
