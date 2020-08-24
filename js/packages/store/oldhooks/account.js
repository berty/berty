import { useMemo, useReducer, useCallback } from 'react'
import { useAccount } from '../hooks'
import { useMsgrContext } from '@berty-tech/store/context'
import cloneDeep from 'lodash/cloneDeep'
import mapValues from 'lodash/mapValues'

// TODO: create conv instantly on incoming contact request accepted

// account queries

export { useAccount }

const useDispatch = () => () => {}
const useSelector = () => () => undefined

export const useClient = () => {
	console.warn('using deprecated hook: useClient')
	return {} // useSelector(protocol.client.queries.get)
}

export const useDevShareInstanceBertyID = () => {
	const dispatch = useDispatch()
	const account = useAccount()
	return () => {}
	/*return () => {
		dispatch(
			protocol.client.commands.devShareInstanceBertyID({
				displayName: account?.name || 'Unknown',
				reset: false,
			}),
		)
	}*/
}

// account commands
export const useAccountGenerate = () => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(messenger.account.commands.generate()), [dispatch])
}

export const useAccountCreate = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: messenger.account.Command.Create) =>
			dispatch(messenger.account.commands.create(payload)),
		[dispatch],
	)
}

export const useAccountSendContactRequest = () => {
	const dispatch = useDispatch()
	return (name: string, rdvSeed: string, pubKey: string) => {
		dispatch(
			messenger.account.commands.sendContactRequest({
				contactName: name,
				contactPublicKey: pubKey,
				contactRdvSeed: rdvSeed,
			}),
		)
	}
}

export const useHandleDeepLink = () => {
	const dispatch = useDispatch()
	return (url: string) => {
		dispatch(messenger.account.commands.handleDeepLink({ url }))
	}
}

export const useDeepLinkStatus = () => {
	return useSelector(
		(state: messenger.account.GlobalState) => state.messenger.account?.deepLinkStatus,
	)
}
