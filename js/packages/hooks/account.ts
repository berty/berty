import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { messenger, protocol } from '@berty-tech/store'

// account queries
export const useAccountList = () => {
	const list = useSelector((state: messenger.account.GlobalState) =>
		messenger.account.queries.list(state, {}),
	)
	return list
}

export const useAccountLength = () => {
	return useAccountList().length
}

export const useAccount = () => {
	const accounts = useAccountList()
	const len = useAccountLength()
	return len > 0 ? accounts[0] : null
}

export const useAccountDelete = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: messenger.account.Command.Delete) =>
			dispatch(messenger.account.commands.delete(payload)),
		[dispatch],
	)
}

export const useClient = () => {
	const account = useAccount()
	return useSelector(
		(state: protocol.client.GlobalState) =>
			account && protocol.client.queries.get(state, { id: account.id }),
	)
}

export const useDevShareInstanceBertyID = () => {
	const dispatch = useDispatch()
	const account = useAccount()
	if (!account) {
		return () => {}
	}
	return () => {
		dispatch(
			protocol.client.commands.devShareInstanceBertyID({
				id: account.id,
				displayName: account.name,
				reset: false,
			}),
		)
	}
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
	const account = useAccount()
	if (!account) {
		return () => {}
	}
	return (name: string, rdvSeed: string, pubKey: string) => {
		dispatch(
			messenger.account.commands.sendContactRequest({
				id: account.id,
				contactName: name,
				contactPublicKey: pubKey,
				contactRdvSeed: rdvSeed,
			}),
		)
	}
}
