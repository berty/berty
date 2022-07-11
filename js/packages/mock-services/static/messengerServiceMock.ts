import faker from '@faker-js/faker'
import { Buffer } from 'buffer'
import EventEmitter from 'events'
import cloneDeep from 'lodash/cloneDeep'
import range from 'lodash/range'
import Long from 'long'

import beapi from '@berty/api'

import { IMessengerServiceMock } from '../mockedServicesInterfaces.gen'
import { getGoldenData } from './goldenData'

export class MessengerServiceMock implements Partial<IMessengerServiceMock> {
	account = cloneDeep(getGoldenData().account)
	eventEmitter = new EventEmitter()

	EventStream = (
		request: beapi.messenger.EventStream.IRequest,
		send: (reply: beapi.messenger.EventStream.IReply) => Promise<void>,
	) =>
		new Promise<void>(async () => {
			await send({
				event: {
					type: beapi.messenger.StreamEvent.Type.TypeAccountUpdated,
					payload: beapi.messenger.StreamEvent.AccountUpdated.encode({
						account: this.account,
					}).finish(),
				},
			})

			for (const conv of getGoldenData().conversations) {
				await send({
					event: {
						type: beapi.messenger.StreamEvent.Type.TypeConversationUpdated,
						payload: beapi.messenger.StreamEvent.ConversationUpdated.encode({
							conversation: conv,
						}).finish(),
					},
				})
			}

			for (const contact of getGoldenData().contacts) {
				await send({
					event: {
						type: beapi.messenger.StreamEvent.Type.TypeContactUpdated,
						payload: beapi.messenger.StreamEvent.ContactUpdated.encode({
							contact,
						}).finish(),
					},
				})
			}

			for (const convIntes of Object.values(getGoldenData().interactionsMap)) {
				for (const inte of convIntes.slice(0, request.shallowAmount || convIntes.length)) {
					await send({
						event: {
							type: beapi.messenger.StreamEvent.Type.TypeInteractionUpdated,
							payload: beapi.messenger.StreamEvent.InteractionUpdated.encode({
								interaction: inte,
							}).finish(),
						},
					})
				}
			}

			for (const member of getGoldenData().members) {
				await send({
					event: {
						type: beapi.messenger.StreamEvent.Type.TypeMemberUpdated,
						payload: beapi.messenger.StreamEvent.MemberUpdated.encode({
							member,
						}).finish(),
					},
				})
			}

			for (const peerNetworkStatus of getGoldenData().peersNetworkStatus) {
				await send({
					event: {
						type: beapi.messenger.StreamEvent.Type.TypePeerStatusConnected,
						payload: beapi.messenger.StreamEvent.PeerStatusConnected.encode({
							peerId: peerNetworkStatus.peerId,
							transport: peerNetworkStatus.transport,
						}).finish(),
					},
				})
			}

			for (const groupDevicesToPeer of getGoldenData().groupsDevicesToPeer) {
				await send({
					event: {
						type: beapi.messenger.StreamEvent.Type.TypePeerStatusGroupAssociated,
						payload: beapi.messenger.StreamEvent.PeerStatusGroupAssociated.encode({
							peerId: groupDevicesToPeer.peerId,
							groupPk: groupDevicesToPeer.groupPk,
							devicePk: groupDevicesToPeer.devicePk,
						}).finish(),
					},
				})
			}

			this.eventEmitter.on('stream-event', event => {
				send({ event })
			})

			await send({
				event: {
					type: beapi.messenger.StreamEvent.Type.TypeListEnded,
					payload: beapi.messenger.StreamEvent.ListEnded.encode({}).finish(),
				},
			})
		})

	AccountGet = async (_request: beapi.messenger.AccountGet.IRequest) => {
		return { account: this.account }
	}

	AccountUpdate = async (request: beapi.messenger.AccountUpdate.IRequest) => {
		if (request.displayName) {
			this.account.displayName = request.displayName
		}
		if (request.avatarCid) {
			this.account.avatarCid = request.avatarCid
		}
		this.emitStreamEvent({
			type: beapi.messenger.StreamEvent.Type.TypeAccountUpdated,
			payload: beapi.messenger.StreamEvent.AccountUpdated.encode({
				account: this.account,
			}).finish(),
		})
		return {}
	}

	InstanceShareableBertyID = async (_request: beapi.messenger.AccountUpdate.IRequest) => {
		return {
			webUrl: getGoldenData().account.link,
		}
	}

	ContactAccept = async (request: beapi.messenger.ContactAccept.IRequest) => {
		const contact = cloneDeep(getGoldenData().contactsMap[request.publicKey || ''])
		if (contact.state === beapi.messenger.Contact.State.Accepted) {
			return {}
		}
		contact.state = beapi.messenger.Contact.State.Accepted
		this.emitStreamEvent({
			type: beapi.messenger.StreamEvent.Type.TypeContactUpdated,
			payload: beapi.messenger.StreamEvent.ContactUpdated.encode({
				contact,
			}).finish(),
		})
		this.bumpConversationLastUpdated(contact.conversationPublicKey)
		return {}
	}

	Interact = async (request: beapi.messenger.Interact.IRequest) => {
		if (request.type === beapi.messenger.AppMessage.Type.TypeUserReaction) {
			if (!request.payload) {
				throw new Error('no reaction payload')
			}
			const payload = beapi.messenger.AppMessage.UserReaction.decode(request.payload)
			const reactionCID = faker.datatype.uuid()
			let target = getGoldenData().interactionsMap[request.conversationPublicKey || ''].find(
				inte => inte.cid === request.targetCid,
			)
			if (!target) {
				return { cid: reactionCID }
			}
			target = cloneDeep(target)
			if (!target.reactions) {
				target.reactions = []
			}
			target.reactions = target.reactions
				.map(reaction => {
					if (reaction.emoji !== payload.emoji) {
						return reaction
					}
					if (!reaction.count) {
						reaction.count = Long.ZERO
					}
					reaction.count.add(boolDiff(reaction.ownState || false, payload.state || false))
					reaction.ownState = payload.state
					return reaction
				})
				.filter(reactions => reactions.count?.isPositive())
			this.emitStreamEvent({
				type: beapi.messenger.StreamEvent.Type.TypeInteractionUpdated,
				payload: beapi.messenger.StreamEvent.InteractionUpdated.encode({
					interaction: target,
				}).finish(),
			})
			this.bumpConversationLastUpdated(request.conversationPublicKey)
			return { cid: reactionCID }
		}

		const cid = faker.datatype.uuid()
		this.emitStreamEvent({
			type: beapi.messenger.StreamEvent.Type.TypeInteractionUpdated,
			payload: beapi.messenger.StreamEvent.InteractionUpdated.encode({
				interaction: {
					cid,
					conversationPublicKey: request.conversationPublicKey,
					type: request.type,
					payload: request.payload,
					sentDate: Long.fromNumber(Date.now()),
					isMine: true,
					targetCid: request.targetCid,
				},
			}).finish(),
		})
		this.bumpConversationLastUpdated(request.conversationPublicKey)
		return { cid }
	}

	PushTokenSharedForConversation = async (
		_request: beapi.messenger.PushTokenSharedForConversation.IRequest,
		_send: (reply: beapi.messenger.PushTokenSharedForConversation.IReply) => Promise<void>,
	) => {}

	ListMemberDevices = async (
		request: beapi.messenger.ListMemberDevices.IRequest,
		send: (reply: beapi.messenger.ListMemberDevices.IReply) => Promise<void>,
	) => {
		const devices = getGoldenData().devices
		const device = devices.find(val => val.memberPk === request.memberPk)
		await Promise.all(
			range(0, 1).map(() =>
				send({
					device: {
						memberPublicKey: device?.memberPk || request.memberPk,
						publicKey: device?.devicePk || faker.datatype.uuid(),
					},
				}),
			),
		)
	}

	ConversationOpen = async (_request: beapi.messenger.ConversationOpen.IRequest) => {
		return {}
	}

	ConversationClose = async (_request: beapi.messenger.ConversationClose.IRequest) => {
		return {}
	}

	SystemInfo = async (_request: beapi.messenger.SystemInfo.IRequest) => {
		return {}
	}

	ConversationLoad = async (request: beapi.messenger.ConversationLoad.IRequest) => {
		let convIntes = getGoldenData().interactionsMap[request.options?.conversationPk || ''] || []

		const refIndex = convIntes.findIndex(inte => inte.cid === request.options?.refCid)
		if (refIndex === -1) {
			throw new Error('invalid ref cid')
		}
		if (refIndex === convIntes.length - 1) {
			throw new Error('no more interactions')
		}

		const amount = request.options?.amount || 0
		if (amount > 0) {
			convIntes = convIntes.slice(refIndex, refIndex + amount)
		} else {
			convIntes = convIntes.slice(refIndex)
		}

		for (const inte of convIntes) {
			this.emitStreamEvent({
				type: beapi.messenger.StreamEvent.Type.TypeInteractionUpdated,
				payload: beapi.messenger.StreamEvent.InteractionUpdated.encode({
					interaction: inte,
				}).finish(),
			})
		}
		return {}
	}

	ConversationCreate = async (request: beapi.messenger.ConversationCreate.IRequest) => {
		const now = Date.now()
		const pk = faker.datatype.uuid()
		const link = `https://berty.tech/mock#group/${pk}/name=${request.displayName}`
		const memberPK = faker.datatype.uuid()
		this.emitStreamEvent({
			type: beapi.messenger.StreamEvent.Type.TypeConversationUpdated,
			payload: beapi.messenger.StreamEvent.ConversationUpdated.encode({
				conversation: {
					publicKey: pk,
					displayName: request.displayName,
					type: beapi.messenger.Conversation.Type.MultiMemberType,
					isOpen: false,
					link,
					unreadCount: 0,
					lastUpdate: Long.fromNumber(now),
					createdDate: Long.fromNumber(now),
					accountMemberPublicKey: memberPK,
				},
			}).finish(),
		})

		this.emitOwnMember(pk, memberPK)

		for (const contactPK of request.contactsToInvite || []) {
			const contact = getGoldenData().contactsMap[contactPK || '']
			this.emitStreamEvent({
				type: beapi.messenger.StreamEvent.Type.TypeInteractionUpdated,
				payload: beapi.messenger.StreamEvent.InteractionUpdated.encode({
					interaction: {
						cid: faker.datatype.uuid(),
						conversationPublicKey: contact.conversationPublicKey,
						type: beapi.messenger.AppMessage.Type.TypeGroupInvitation,
						payload: beapi.messenger.AppMessage.GroupInvitation.encode({
							link,
						}).finish(),
						sentDate: Long.fromNumber(now),
						isMine: true,
					},
				}).finish(),
			})
		}
		return { publicKey: pk }
	}

	MessageSearch = async (request: beapi.messenger.MessageSearch.IRequest) => {
		if (!request.query || request.query.length < 3) {
			return {}
		}
		const query = request.query.toLowerCase()

		let results = Object.values(getGoldenData().interactionsMap).reduce((results, convIntes) => {
			results.push(
				...convIntes.filter(inte => {
					if (inte.type !== beapi.messenger.AppMessage.Type.TypeUserMessage || !inte.payload) {
						return false
					}
					const payload = beapi.messenger.AppMessage.UserMessage.decode(inte.payload)
					if (!payload.body) {
						return false
					}
					return payload.body.toLowerCase().indexOf(query) !== -1
				}),
			)
			return results
		}, [] as beapi.messenger.IInteraction[])

		if (request.oldestToNewest) {
			results = results.sort(
				(a, b) => (a.sentDate?.toNumber() || 0) - (b.sentDate?.toNumber() || 0),
			)
		} else {
			results = results.sort(
				(a, b) => (b.sentDate?.toNumber() || 0) - (a.sentDate?.toNumber() || 0),
			)
		}

		if (request.refCid) {
			const lastIndex = results.findIndex(inte => inte.cid === request.refCid)
			if (lastIndex === -1 || lastIndex + 1 >= results.length) {
				return {}
			}
			results = results.slice(lastIndex + 1)
		}

		if (request.limit) {
			results = results.slice(0, request.limit)
		}

		return { results }
	}

	ParseDeepLink = async (request: beapi.messenger.ParseDeepLink.IRequest) => {
		const { link } = request
		if (!link) {
			throw new Error('empty link')
		}

		const nameRegexp = /name=(.*)&?/
		const nameMatch = link.match(nameRegexp)
		const displayName = decodeURIComponent(firstCaptureGroup(nameMatch))

		const result: beapi.messenger.IBertyLink = {}

		const kindRegexp = /#(group|contact)\//
		const kindMatch = link.match(kindRegexp)
		const kindString = firstCaptureGroup(kindMatch)
		switch (kindString) {
			case 'group':
				result.kind = beapi.messenger.BertyLink.Kind.GroupV1Kind

				const groupPKRegexp = /#group\/(.+)\/?/
				const groupPKMatch = link.match(groupPKRegexp)
				const groupPKString = firstCaptureGroup(groupPKMatch)
				const groupPK = Buffer.from(groupPKString, 'utf-8')

				result.bertyGroup = { displayName, group: { publicKey: groupPK } }
				break
			case 'contact':
				result.kind = beapi.messenger.BertyLink.Kind.ContactInviteV1Kind

				const pkRegexp = /#contact\/(.+)\//
				const pkMatch = link.match(pkRegexp)
				const pkString = firstCaptureGroup(pkMatch)
				const pk = Buffer.from(pkString, 'utf-8')

				result.bertyId = { displayName, accountPk: pk }
				break
			default:
				result.kind = beapi.messenger.BertyLink.Kind.UnknownKind
				break
		}

		return { link: result }
	}

	ContactRequest = async (request: beapi.messenger.ContactRequest.IRequest) => {
		const parsedLink = await this.ParseDeepLink({ link: request.link })
		if (parsedLink.link?.kind !== beapi.messenger.BertyLink.Kind.ContactInviteV1Kind) {
			throw new Error('invalid link kind')
		}
		const longNow = Long.fromNumber(Date.now())
		const convPK = faker.datatype.uuid()
		const contactPK = faker.datatype.uuid()
		this.emitStreamEvent({
			type: beapi.messenger.StreamEvent.Type.TypeContactUpdated,
			payload: beapi.messenger.StreamEvent.ContactUpdated.encode({
				contact: {
					publicKey: contactPK,
					displayName: parsedLink.link.bertyId?.displayName,
					createdDate: longNow,
					infoDate: longNow,
					state: beapi.messenger.Contact.State.OutgoingRequestEnqueued,
					conversationPublicKey: convPK,
				},
			}).finish(),
		})
		this.emitStreamEvent({
			type: beapi.messenger.StreamEvent.Type.TypeConversationUpdated,
			payload: beapi.messenger.StreamEvent.ConversationUpdated.encode({
				conversation: {
					publicKey: convPK,
					contactPublicKey: contactPK,
					type: beapi.messenger.Conversation.Type.ContactType,
					accountMemberPublicKey: getGoldenData().account.publicKey,
					createdDate: longNow,
				},
			}).finish(),
		})
		return {}
	}

	ConversationJoin = async (request: beapi.messenger.ConversationJoin.IRequest) => {
		const parsedLink = await this.ParseDeepLink({ link: request.link })
		if (parsedLink.link?.kind !== beapi.messenger.BertyLink.Kind.GroupV1Kind) {
			throw new Error('invalid link kind')
		}
		const longNow = Long.fromNumber(Date.now())
		const convPK = faker.datatype.uuid()
		const memberPK = faker.datatype.uuid()
		this.emitStreamEvent({
			type: beapi.messenger.StreamEvent.Type.TypeConversationUpdated,
			payload: beapi.messenger.StreamEvent.ConversationUpdated.encode({
				conversation: {
					publicKey: convPK,
					type: beapi.messenger.Conversation.Type.MultiMemberType,
					accountMemberPublicKey: memberPK,
					createdDate: longNow,
					displayName: parsedLink.link.bertyGroup?.displayName,
					link: request.link,
				},
			}).finish(),
		})
		this.emitOwnMember(convPK, memberPK)
		return {}
	}

	emitStreamEvent = (event: beapi.messenger.IStreamEvent) => {
		this.eventEmitter.emit('stream-event', event)
	}

	bumpConversationLastUpdated = (publicKey: string | null | undefined) => {
		if (!publicKey) {
			return
		}
		const conversation = cloneDeep(getGoldenData().conversationsMap[publicKey])
		conversation.lastUpdate = Long.fromNumber(Date.now())
		this.emitStreamEvent({
			type: beapi.messenger.StreamEvent.Type.TypeConversationUpdated,
			payload: beapi.messenger.StreamEvent.ConversationUpdated.encode({
				conversation,
			}).finish(),
		})
	}

	emitOwnMember = (convPK: string, memberPK: string) => {
		this.emitStreamEvent({
			type: beapi.messenger.StreamEvent.Type.TypeMemberUpdated,
			payload: beapi.messenger.StreamEvent.MemberUpdated.encode({
				member: {
					publicKey: memberPK,
					conversationPublicKey: convPK,
					displayName: this.account.displayName,
					isMe: true,
				},
			}).finish(),
		})
	}
}

const boolDiff = (a: boolean, b: boolean) => {
	if (a === b) {
		return 0
	}
	if (!a && b) {
		return 1
	}
	// a && !b
	return -1
}

const firstCaptureGroup = (match: RegExpMatchArray | null) =>
	match && match.length >= 2 ? match[1] : ''
