import * as api from '@berty-tech/api'
import { DemoServiceClient } from '../orbitdb'
import { bridge } from '../bridge'
// import { ReactNativeTransport } from '../grpc-web-react-native-transport'
import { WebsocketTransport } from '../grpc-web-websocket-transport'
import { Buffer } from 'buffer'
import { GoBridge } from '../orbitdb/native'
import { IProtocolServiceHandler } from './handler.gen'
import AsyncStorage from '@react-native-community/async-storage'

const useExternalBridge = false // set to false to test integrated bridge in dev

console.log('useExternalBridge = ', useExternalBridge)
console.log('__DEV__ =', __DEV__)

type PersistedData = {
	accountPk: string
	devicePk: string
	accountGroupPk: string
	rdvLogtoken?: string
	lastRdvLogCid?: string
	lastAccountGroupCid?: string
	contactGroups: { [key: string]: string } // map with key=fakeContactPk, value=fakeGroupPk
}

type InitData = PersistedData & {
	client: DemoServiceClient
}

const STORAGE_KEY = 'ProtocolServiceHandler'

const logToken = async (client: DemoServiceClient): Promise<string> =>
	new Promise((resolve: (token: string) => void, reject: (err: Error) => void) =>
		client.logToken({}, (error, response) =>
			error || response == null || response?.logToken == null
				? reject(error || new Error('GRPC ProtocolServiceHandler: response is undefined'))
				: resolve(response.logToken as string),
		),
	)

const createPkHack = async (client: DemoServiceClient): Promise<string> =>
	(await Promise.all([logToken(client), logToken(client)])).join(':')

export class ProtocolServiceHandler implements IProtocolServiceHandler {
	client: DemoServiceClient
	accountPk: string
	devicePk: string
	accountGroupPk: string
	rdvLogtoken?: string
	contactGroups: { [key: string]: string } // map with key=fakeContactPk, value=fakeGroupPk
	lastRdvLogCid?: string
	lastAccountGroupCid?: string

	persist = async () => {
		const data: PersistedData = {
			accountPk: this.accountPk,
			accountGroupPk: this.accountGroupPk,
			devicePk: this.devicePk,
			contactGroups: this.contactGroups,
			rdvLogtoken: this.rdvLogtoken,
			lastRdvLogCid: this.lastRdvLogCid,
			lastAccountGroupCid: this.lastAccountGroupCid,
		}
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
	}

	constructor(initData: InitData) {
		this.client = initData.client
		this.accountPk = initData.accountPk
		this.devicePk = initData.devicePk
		this.accountGroupPk = initData.accountGroupPk
		this.contactGroups = initData.contactGroups
		this.rdvLogtoken = initData.rdvLogtoken
		this.lastRdvLogCid = initData.lastRdvLogCid
		this.lastAccountGroupCid = initData.lastAccountGroupCid

		this.client.logStream(
			{
				logToken: this.getMetadataLogToken(this.accountGroupPk),
				options: this.lastAccountGroupCid ? { GT: this.lastAccountGroupCid } : null,
			},
			async (error, response) => {
				if (error) {
					console.error(error)
					return
				}
				if (!response) {
					return
				}
				if (response.cid) {
					this.lastAccountGroupCid = response.cid
				}
				await this.persist()
				if (!response.value) {
					return
				}
				const groupMetadataEvent = api.berty.types.GroupMetadataEvent.decode(response.value)
				if (!groupMetadataEvent.metadata) {
					return
				}
				const type = groupMetadataEvent.metadata.eventType
				switch (type) {
					case api.berty.types.EventType.EventTypeAccountGroupJoined:
						const { group } = api.berty.types.AccountGroupJoined.decode(groupMetadataEvent.event)
						if (!(group && group.publicKey)) {
							break
						}
						const groupPkStr = Buffer.from(group.publicKey).toString('utf-8')
						if (!groupPkStr) {
							break
						}
						await this.addEventToMetadataLog({
							groupPk: groupPkStr,
							type: 'GroupMemberDeviceAdded',
							dataType: 'GroupAddMemberDevice',
							data: {
								memberPk: Buffer.from(this.accountPk, 'utf-8'),
								devicePk: this.devicePkBytes,
							},
						})
						break
				}
			},
		)
	}

	_logToken = () => logToken(this.client)

	_createPkHack = () => createPkHack(this.client)

	setRdvLogToken = async (newLogToken?: string) => {
		this.rdvLogtoken = newLogToken
		delete this.lastRdvLogCid
		await this.persist()
	}

	setLastRdvLogCid = async (newCid: string) => {
		this.lastRdvLogCid = newCid
		await this.persist()
	}

	setContactGroup = async (key: string, value: string) => {
		this.contactGroups[key] = value
		await this.persist()
	}

	InstanceExportData: (
		request: api.berty.types.InstanceExportData.IRequest,
		callback: (error: Error | null, response?: api.berty.types.InstanceExportData.IReply) => void,
	) => void = (request, callback) => {}

	InstanceGetConfiguration: (
		request: api.berty.types.InstanceGetConfiguration.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.InstanceGetConfiguration.IReply,
		) => void,
	) => void = async (request, callback) => {
		callback(null, {
			accountPk: new Buffer(this.accountPk),
			devicePk: new Buffer(this.devicePk),
			accountGroupPk: new Buffer(this.accountGroupPk),
		})
	}

	ContactRequestReference: (
		request: api.berty.types.ContactRequestReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.ContactRequestReference.IReply,
		) => void,
	) => void = async (request, callback) => {
		if (!this.rdvLogtoken) {
			callback(null, { reference: null })
		} else {
			callback(null, { reference: this.referenceBytes })
		}
	}

	ContactRequestDisable: (
		request: api.berty.types.ContactRequestDisable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.ContactRequestDisable.IReply,
		) => void,
	) => void = async (request, callback) => {
		await this.setRdvLogToken(undefined)
		callback(null, {})
	}

	get accountMetadataLogToken() {
		const [value] = this.accountGroupPk?.split(':')
		return value
	}

	get devicePkBytes() {
		return Buffer.from(this.devicePk, 'utf-8')
	}

	get referenceBytes() {
		if (!this.rdvLogtoken) {
			throw new Error('handler.ts: referenceBytes: Undefined rdvLogtoken')
		}
		return Buffer.from(this.accountPk + '__' + this.rdvLogtoken, 'utf-8')
	}

	getMetadataLogToken = (groupPk: string): string => {
		const [value] = groupPk.split(':')
		return value
	}

	getMessageLogToken = (groupPk: string): string => {
		const [, value] = groupPk.split(':')
		return value
	}

	addEventToMessageLog = ({ groupPk, data }: { groupPk: string; data: Uint8Array }) => {
		const { client } = this
		return new Promise((resolve, reject) => {
			try {
				client.logAdd(
					{
						logToken: this.getMessageLogToken(groupPk),
						data: api.berty.types.GroupMessageEvent.encode({
							eventContext: {},
							headers: { devicePk: this.devicePkBytes },
							message: data,
						}).finish(),
					},
					(error, response) => {
						if (error) {
							reject(error)
						} else {
							resolve(response)
						}
					},
				)
			} catch (e) {
				console.error(e)
				reject(e)
			}
		})
	}

	addEventToMetadataLog = ({
		groupPk,
		type,
		dataType,
		data,
	}:
		| {
				groupPk: string
				type: string
				dataType: string
				data: { [key: string]: any }
		  }
		| {
				groupPk: string
				type: string
				data: Uint8Array
				dataType?: string
		  }) => {
		const { client } = this
		return new Promise((resolve, reject) => {
			try {
				client.logAdd(
					{
						logToken: this.getMetadataLogToken(groupPk),
						data: api.berty.types.GroupMetadataEvent.encode({
							eventContext: { groupPk: Buffer.from(groupPk, 'utf-8') },
							metadata: {
								// TODO: fix api.berty.types.EventType type
								eventType: ((api.berty.types.EventType as unknown) as { [key: string]: number })[
									'EventType' + type
								],
							},
							event:
								type === 'GroupMetadataPayloadSent'
									? data
									: (api.berty.types as { [key: string]: any })[dataType as string]
											.encode(data)
											.finish(),
						}).finish(),
					},
					(error, response) => {
						if (error) {
							reject(error)
						} else {
							resolve(response)
						}
					},
				)
			} catch (e) {
				console.error(e)
				reject(e)
			}
		})
	}

	ContactRequestEnable: (
		request: api.berty.types.ContactRequestEnable.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactRequestEnable.IReply) => void,
	) => void = async (_, callback) => {
		if (!this.client) {
			throw new Error('handler.ts: ContactRequestEnable: missing client')
		}
		if (!this.rdvLogtoken) {
			await this.setRdvLogToken(await this._logToken())
		}
		callback(null, { reference: this.referenceBytes })
		this.client.logStream(
			{
				logToken: this.rdvLogtoken,
				options: this.lastRdvLogCid ? { GT: this.lastRdvLogCid } : undefined,
			},
			async (error, response) => {
				if (error || !response || !response.value) {
					console.error(
						'handler.ts: ContactRequestEnable: logStream error:',
						error,
						'With response',
						response,
					)
					return
				}
				if (response.cid) {
					await this.setLastRdvLogCid(response.cid)
				}
				const val = new Buffer(response.value).toString('utf-8')
				const parts = val.split(' ')
				const [type, ...remParts] = parts
				if (type === 'CONTACT_REQUEST_FROM') {
					const [requesterAccountPk, fakeGroupPk, ...metadataParts] = remParts
					await this.setContactGroup(requesterAccountPk, fakeGroupPk)
					this.addEventToMetadataLog({
						groupPk: this.accountGroupPk,
						type: 'AccountContactRequestIncomingReceived',
						dataType: 'AccountContactRequestReceived',
						data: {
							devicePk: this.devicePkBytes,
							contactPk: Buffer.from(requesterAccountPk, 'utf-8'),
							contactMetadata: Buffer.from(metadataParts.join(' '), 'utf-8'),
						},
					})
				}
			},
		)
	}

	ContactRequestResetReference: (
		request: api.berty.types.ContactRequestResetReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.ContactRequestResetReference.IReply,
		) => void,
	) => void = async (_, callback) => {
		await this.setRdvLogToken(await this._logToken())
		callback(null, { reference: this.referenceBytes })
	}
	ContactRequestSend: (
		request: api.berty.types.ContactRequestSend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactRequestSend.IReply) => void,
	) => void = async (request, callback) => {
		console.log('handler.ts:363: contactRequestSend called')
		try {
			const { client } = this
			if (!request.reference) {
				throw new Error('handler.ts: ContactRequestSend: missing reference in request')
			}
			const refStr = new Buffer(request.reference).toString('utf-8')
			const [otherUserPk, otherUserRdvLogToken] = refStr.split('__')
			const metadataStr =
				request.contactMetadata && new Buffer(request.contactMetadata).toString('utf-8')
			const ownId = this.accountPk
			const otherUserPkBytes = Buffer.from(otherUserPk, 'utf-8')
			const fakeGroupPk = await this._createPkHack()
			await this.addEventToMetadataLog({
				groupPk: this.accountGroupPk,
				type: 'AccountContactRequestOutgoingEnqueued',
				dataType: 'AccountContactRequestEnqueued',
				data: {
					devicePk: this.devicePkBytes,
					contactPk: otherUserPkBytes,
					groupPk: Buffer.from(fakeGroupPk, 'utf-8'),
					contactMetadata: request.contactMetadata,
				},
			})
			const group: api.berty.types.IGroup = {
				groupType: api.berty.types.GroupType.GroupTypeContact,
				publicKey: Buffer.from(fakeGroupPk, 'utf-8'),
			}
			await this.addEventToMetadataLog({
				groupPk: this.accountGroupPk,
				type: 'AccountGroupJoined',
				dataType: 'AccountGroupJoined',
				data: {
					devicePk: this.devicePkBytes,
					group,
				},
			})
			const dataStr = ['CONTACT_REQUEST_FROM', ownId, fakeGroupPk, metadataStr].join(' ')
			const logData = Buffer.from(dataStr, 'utf-8')
			await new Promise((resolve, reject) => {
				client.logAdd({ logToken: otherUserRdvLogToken, data: logData }, (error, response) => {
					return error || response == null
						? reject(error || new Error('GRPC ProtocolServiceHandler: response is undefined'))
						: resolve()
				})
			})
			await this.addEventToMetadataLog({
				groupPk: this.accountGroupPk,
				type: 'AccountContactRequestOutgoingSent',
				dataType: 'AccountContactRequestSent',
				data: {
					devicePk: this.devicePkBytes,
					contactPk: otherUserPkBytes,
				},
			})

			callback(null, {})
		} catch (e) {
			callback(e, {})
		}
	}
	ContactRequestAccept: (
		request: api.berty.types.ContactRequestAccept.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactRequestAccept.IReply) => void,
	) => void = async (request, callback) => {
		try {
			if (!request.contactPk) {
				throw new Error('Invalid contactPk')
			}
			const contactPkStr = new Buffer(request.contactPk).toString('utf-8')
			const fakeGroupPk = this.contactGroups[contactPkStr]
			if (!fakeGroupPk) {
				throw new Error(`Unknown group for contact "${contactPkStr}"`)
			}
			await this.addEventToMetadataLog({
				groupPk: this.accountGroupPk,
				type: 'AccountContactRequestIncomingAccepted',
				dataType: 'AccountContactRequestAccepted',
				data: {
					devicePk: this.devicePkBytes,
					contactPk: request.contactPk,
					groupPk: Buffer.from(fakeGroupPk, 'utf-8'),
				},
			})
			const group: api.berty.types.IGroup = {
				groupType: api.berty.types.GroupType.GroupTypeContact,
				publicKey: Buffer.from(fakeGroupPk, 'utf-8'),
			}
			await this.addEventToMetadataLog({
				groupPk: this.accountGroupPk,
				type: 'AccountGroupJoined',
				dataType: 'AccountGroupJoined',
				data: {
					devicePk: this.devicePkBytes,
					group,
				},
			})
			callback(null, {})
		} catch (e) {
			callback(e, {})
		}
	}
	ContactRequestDiscard: (
		request: api.berty.types.ContactRequestDiscard.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.ContactRequestDiscard.IReply,
		) => void,
	) => void = async (request, callback) => {
		await this.addEventToMetadataLog({
			groupPk: this.accountGroupPk,
			type: 'AccountContactRequestIncomingDiscarded',
			dataType: 'AccountContactRequestDiscarded',
			data: {
				devicePk: this.devicePkBytes,
				contactPk: request.contactPk,
			},
		})
		callback(null, {})
	}
	ContactBlock: (
		request: api.berty.types.ContactBlock.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactBlock.IReply) => void,
	) => void = (request, callback) => {}
	ContactUnblock: (
		request: api.berty.types.ContactUnblock.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactUnblock.IReply) => void,
	) => void = (request, callback) => {}
	ContactAliasKeySend: (
		request: api.berty.types.ContactAliasKeySend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactAliasKeySend.IReply) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupCreate: (
		request: api.berty.types.MultiMemberGroupCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupCreate.IReply,
		) => void,
	) => void = async (request, callback) => {
		try {
			const fakePk = await this._createPkHack()
			callback(null, { groupPk: Buffer.from(fakePk, 'utf-8') })
		} catch (e) {
			callback(e)
		}
	}
	MultiMemberGroupJoin: (
		request: api.berty.types.MultiMemberGroupJoin.IRequest,
		callback: (error: Error | null, response?: api.berty.types.MultiMemberGroupJoin.IReply) => void,
	) => void = async (request, callback) => {
		try {
			const { group } = request
			if (!group) {
				throw new Error('Invalid group')
			}
			await this.addEventToMetadataLog({
				groupPk: this.accountGroupPk,
				type: 'AccountGroupJoined',
				dataType: 'AccountGroupJoined',
				data: {
					devicePk: this.devicePkBytes,
					group,
				},
			})
			callback(null, {})
		} catch (e) {
			callback(e)
		}
	}
	MultiMemberGroupLeave: (
		request: api.berty.types.MultiMemberGroupLeave.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupLeave.IReply,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupAliasResolverDisclose: (
		request: api.berty.types.MultiMemberGroupAliasResolverDisclose.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupAliasResolverDisclose.IReply,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupAdminRoleGrant: (
		request: api.berty.types.MultiMemberGroupAdminRoleGrant.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupAdminRoleGrant.IReply,
		) => void,
	) => void = (request, callback) => {}
	MultiMemberGroupInvitationCreate: (
		request: api.berty.types.MultiMemberGroupInvitationCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupInvitationCreate.IReply,
		) => void,
	) => void = (request, callback) => {}
	AppMetadataSend: (
		request: api.berty.types.AppMetadataSend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.AppMetadataSend.IReply) => void,
	) => void = async (request, callback) => {
		const { groupPk, payload } = request
		try {
			await this.addEventToMetadataLog({
				groupPk: new Buffer(groupPk as Uint8Array).toString(),
				type: 'GroupMetadataPayloadSent',
				data: payload as Uint8Array,
			})
			callback(null, {})
		} catch (error) {
			callback(error)
		}
	}
	AppMessageSend: (
		request: api.berty.types.AppMessageSend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.AppMessageSend.IReply) => void,
	) => void = async (request, callback) => {
		const { groupPk, payload } = request
		try {
			if (!groupPk) {
				throw new Error('Invalid groupPk')
			}
			if (!payload) {
				throw new Error('Invalid payload')
			}
			await this.addEventToMessageLog({
				groupPk: new Buffer(groupPk as Uint8Array).toString(),
				data: payload as Uint8Array,
			})
			callback(null, {})
		} catch (error) {
			callback(error)
		}
	}

	GroupMetadataSubscribe: (
		request: api.berty.types.GroupMetadataSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.types.IGroupMetadataEvent) => void,
	) => void = (request, callback) => {
		if (request.groupPk == null) {
			callback(new Error('GRPC ProtocolServiceHandler: groupPk not defined'))
			return
		}
		const tokens = new Buffer(request.groupPk).toString('utf8').split(':')
		if (tokens.length < 2) {
			callback(new Error('GRPC ProtocolServiceHandler: groupPk corrupted'))
			return
		}
		this.client.logStream(
			{
				logToken: tokens[0],
				options: request.since && { GT: new Buffer(request.since).toString('utf-8') },
			},
			(error, response) => {
				if (error || response == null || response.cid == null || response.value == null) {
					callback(error)
					return
				}
				const message = api.berty.types.GroupMetadataEvent.decode(response.value)
				if (message == null || message.eventContext == null) {
					callback(new Error('GRPC ProtocolServiceHandler: log event corrupted'))
					return
				}
				message.eventContext.id = Buffer.from(response.cid, 'utf-8')
				message.eventContext.groupPk = request.groupPk
				callback(null, message)
			},
		)
	}

	GroupMessageSubscribe: (
		request: api.berty.types.GroupMessageSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.types.IGroupMessageEvent) => void,
	) => void = (request, callback) => {
		if (request.groupPk == null) {
			callback(new Error('GRPC ProtocolServiceHandler: groupPk not defined'))
			return
		}
		const tokens = new Buffer(request.groupPk).toString('utf8').split(':')
		if (tokens.length < 2) {
			callback(new Error('GRPC ProtocolServiceHandler: groupPk corrupted'))
			return
		}
		this.client.logStream(
			{
				logToken: tokens[1],
				options: request.since && { GT: new Buffer(request.since).toString('utf-8') },
			},
			(error, response) => {
				if (error || response == null || response.cid == null || response.value == null) {
					callback(error)
					return
				}
				const message = api.berty.types.GroupMessageEvent.decode(response.value)
				if (message == null || message.eventContext == null) {
					callback(new Error('GRPC ProtocolServiceHandler: log event corrupted'))
					return
				}
				message.eventContext.id = Buffer.from(response.cid, 'utf8')
				message.eventContext.groupPk = request.groupPk
				callback(null, message)
			},
		)
	}
}

export const protocolServiceHandlerFactory = async (persist?: boolean) => {
	let brdg
	if (useExternalBridge) {
		brdg = bridge({
			host: 'http://192.168.1.36:1337',
			transport: WebsocketTransport(),
		})
	} else {
		console.warn('running integrated bridge')
		await GoBridge.startDemo({
			swarmListeners: ['/ip4/0.0.0.0/tcp/0', '/ip6/0.0.0.0/tcp/0'],
			grpcListeners: ['/ip4/127.0.0.1/tcp/0/grpcws'],
			logLevel: 'debug',
			persistance: false,
		})
		const addr = await GoBridge.getDemoAddr()
		console.warn(`http://${addr}`)
		brdg = bridge({
			host: `http://${addr}`,
			transport: WebsocketTransport(),
		})
	}
	const client = new DemoServiceClient(brdg)

	if (!persist) {
		await AsyncStorage.removeItem(STORAGE_KEY)
	}
	const persisted = await AsyncStorage.getItem(STORAGE_KEY)
	if (!persisted) {
		const instance = new ProtocolServiceHandler({
			client,
			accountPk: await createPkHack(client),
			accountGroupPk: await createPkHack(client),
			devicePk: await createPkHack(client),
			contactGroups: {},
		})
		await instance.persist()
		return instance
	}
	return new ProtocolServiceHandler({
		client,
		...JSON.parse(persisted),
	})
}
