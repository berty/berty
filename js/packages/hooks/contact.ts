import { useDispatch, useSelector } from 'react-redux'
import { chat } from '@berty-tech/store'
import { Buffer } from 'buffer'
import { useAccount, useClient } from './account'

// contact commands
export const useAcceptContactRequest = () => {
	const dispatch = useDispatch()
	return ({ id }: { id: string }) =>
		dispatch(
			chat.contact.commands.acceptRequest({
				id,
			}),
		)
}

export const useDiscardContactRequest = () => {
	const dispatch = useDispatch()
	return ({ id }: { id: string }) =>
		dispatch(
			chat.contact.commands.discardRequest({
				id,
			}),
		)
}

// requests queries
export const useContactRequestReference = () => {
	const client = useClient()
	const account = useAccount()
	if (!client || !account) {
		return
	}
	const rdvSeed = client.contactRequestRdvSeed
	const pubKey = client.accountPk
	const b64Name = Buffer.from(account.name, 'utf-8').toString('base64')
	return `${b64Name} ${rdvSeed} ${pubKey}`
}

export const useContactRequestEnabled = () => {
	const ref = useContactRequestReference()
	return !!ref
}

export const useAccountContacts = () => {
	const account = useAccount()
	return useSelector((state: chat.contact.GlobalState) =>
		account ? chat.contact.queries.list(state) : [],
	)
}

export const useAccountContactsWithIncomingRequests = () => {
	const account = useAccount()
	return useSelector((state: chat.contact.GlobalState) =>
		account
			? chat.contact.queries
					.list(state)
					.filter((contact) => contact.request.type === chat.contact.ContactRequestType.Incoming)
			: [],
	)
}

export const useAccountContactsWithOutgoingRequests = () => {
	const account = useAccount()
	return useSelector((state: chat.contact.GlobalState) =>
		account
			? chat.contact.queries
					.list(state)
					.filter((contact) => contact.request.type === chat.contact.ContactRequestType.Outgoing)
			: [],
	)
}

export const useAccountContactSearchResults = (searchText: string): chat.contact.Entity[] => {
	const account = useAccount()
	return useSelector((state: chat.contact.GlobalState) =>
		account ? chat.contact.queries.search(state, { accountId: account.id, searchText }) : [],
	)
}

export const useInitiateContactRequest = () => {
	const dispatch = useDispatch()
	const account = useAccount()
	if (!account) {
		return () => {}
	}
	return (url: string) => {
		dispatch(chat.contact.commands.initiateRequest({ accountId: account.id, url }))
	}
}

export const useRequestDraft = () => {
	return useSelector((state: chat.contact.GlobalState) =>
		chat.contact.queries.getRequestDraft(state),
	)
}

export const useResetDraft = () => {
	const dispatch = useDispatch()
	const account = useAccount()
	if (!account) {
		return () => {}
	} else {
		return () => dispatch(chat.contact.events.draftReset({ accountId: account.id }))
	}
}
