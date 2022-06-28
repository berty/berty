import beapi from '@berty/api'

import { useAllConversations, useAllContacts } from '../messenger.hooks'
import { fakeContacts, fakeMultiMemberConversations } from './faking'

//
// Fake data generation
//

// Generate n fake conversations with n fake contacts, one UserMessage per conv
export const useGenerateFakeContacts = () => {
	//const ctx = useMessengerContext()
	const contacts = useAllContacts()
	const prevFakeCount: number = contacts.reduce((r, c) => ((c as any)?.fake ? r + 1 : r), 0)
	return (length = 10) => {
		/*const payload =*/ fakeContacts(length, prevFakeCount)
		/*ctx.dispatch({
			type: MessengerActions.AddFakeData,
			payload,
		})*/
	}
}

export const useGenerateFakeMultiMembers = () => {
	//const ctx = useMessengerContext()
	const prevFakeCount = useAllConversations().reduce(
		(r, c) =>
			(c as any).fake && c?.type === beapi.messenger.Conversation.Type.MultiMemberType ? r + 1 : r,
		0,
	)
	return (length = 10) => {
		/*const payload =*/ fakeMultiMemberConversations(length, prevFakeCount)
		/*ctx.dispatch({
			type: MessengerActions.AddFakeData,
			payload,
		})*/
	}
}

// Generate n fake messages for all fake conversations
// export const useGenerateFakeMessages = () => {
// 	return
// 	const ctx = useMessengerContext()
// 	const fakeConversationList = useAllConversations().filter(c => (c as any).fake === true)
// 	const fakeMembersListList = fakeConversationList.map(conv =>
// 		Object.values(ctx.members[conv.publicKey || ''] || {}).filter((member: any) => member.fake),
// 	)
// 	const prevFakeCount: number = fakeConversationList.reduce(
// 		(r, fakeConv) =>
// 			Object.values( || {}).reduce(
// 				(r2, inte) => ((inte as any).fake ? r2 + 1 : r2),
// 				r,
// 			),
// 		0,
// 	)
// 	return (length = 10) => {
// 		ctx.dispatch({
// 			type: MessengerActions.AddFakeData,
// 			payload: {
// 				interactions: fakeMessages(
// 					length,
// 					fakeConversationList,
// 					fakeMembersListList,
// 					prevFakeCount,
// 				),
// 			},
// 		})
// 	}
// }

// Delete all fake data
export const useDeleteFakeData = () => {
	/*const ctx = useMessengerContext()*/
	return () => {
		/*ctx.dispatch({
			type: MessengerActions.DeleteFakeData,
		})*/
	}
}
