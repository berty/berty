import Long from 'long'
import { RESULTS } from 'react-native-permissions'

import beapi from '@berty/api'
import { WelshMessengerServiceClient } from '@berty/grpc-bridge/welsh-clients.gen'
import { AppDispatch } from '@berty/redux/store'
import rnutil from '@berty/utils/react-native'
import { PermissionType } from '@berty/utils/react-native/permissions'
import { playSound } from '@berty/utils/sound/sounds'

export enum MicPermStatus {
	UNDEFINED = 0,
	GRANTED = 1,
	NEWLY_GRANTED = 2,
	DENIED = 3,
}

export const voiceMemoBitrate = 32000
export const voiceMemoSampleRate = 22050
export const voiceMemoFormat = 'aac'

export const acquireMicPerm = async (navigate: any): Promise<MicPermStatus> => {
	const permissionStatus = await rnutil.checkPermissions(PermissionType.audio, {
		navigate,
		navigateToPermScreenOnProblem: true,
	})
	if (permissionStatus === RESULTS.GRANTED) {
		return MicPermStatus.GRANTED
	}

	return MicPermStatus.UNDEFINED
}

export const sendMessage = async (
	client: WelshMessengerServiceClient,
	convPk: string,
	dispatch: AppDispatch,
	opts: {
		body?: string
		medias?: beapi.messenger.IMedia[]
	},
) => {
	try {
		const buf = beapi.messenger.AppMessage.UserMessage.encode({ body: opts.body || '' }).finish()
		const reply = await client.interact({
			conversationPublicKey: convPk,
			type: beapi.messenger.AppMessage.Type.TypeUserMessage,
			payload: buf,
			mediaCids: opts.medias?.filter(media => media.cid).map(media => media.cid) as string[],
		})
		const optimisticInteraction: beapi.messenger.IInteraction = {
			cid: reply.cid,
			conversationPublicKey: convPk,
			isMine: true,
			type: beapi.messenger.AppMessage.Type.TypeUserMessage,
			payload: buf,
			medias: opts.medias,
			sentDate: Long.fromNumber(Date.now()).toString() as unknown as Long,
		}
		dispatch({
			type: 'messenger/InteractionUpdated',
			payload: { interaction: optimisticInteraction },
		})
		playSound('messageSent')
	} catch (e) {
		console.warn('error sending message:', e)
	}
}

interface Attachment extends beapi.messenger.IMedia {
	uri?: string
}

export const attachMedias = async (client: WelshMessengerServiceClient, res: Attachment[]) =>
	(
		await Promise.all(
			res.map(async doc => {
				const stream = await client?.mediaPrepare({})
				console.log(
					'sending:',
					beapi.messenger.AudioPreview.decode(
						beapi.messenger.MediaMetadata.decode(doc.metadataBytes!).items[0].payload!,
					),
				)
				await stream.emit({
					info: {
						filename: doc.filename,
						mimeType: doc.mimeType,
						displayName: doc.displayName || doc.filename || 'document',
						metadataBytes: doc.metadataBytes,
					},
					uri: doc.uri,
				})
				const reply = await stream.stopAndRecv()
				const optimisticMedia: beapi.messenger.IMedia = {
					cid: reply?.cid,
					filename: doc.filename,
					mimeType: doc.mimeType,
					displayName: doc.displayName || doc.filename || 'document',
					metadataBytes: doc.metadataBytes,
				}
				return optimisticMedia
			}),
		)
	).filter(media => !!media?.cid)

export const audioMessageDisplayName = (startDate: Date): string =>
	`audiorec_${startDate.getFullYear()}:${startDate.getMonth()}:${startDate.getDate()}:${startDate.getHours()}:${startDate.getMinutes()}:${startDate.getSeconds()}`
