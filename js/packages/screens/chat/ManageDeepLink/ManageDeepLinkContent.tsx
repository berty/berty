import { CommonActions } from '@react-navigation/native'
import { Buffer } from 'buffer'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'

import beapi from '@berty/api'
import { useConversationsDict, useMessengerClient } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import { base64ToURLBase64 } from '@berty/utils/convert/base64'

import AddThisContact from './components/AddThisContact'
import { ManageGroupInvitation } from './components/ManageGroupInvitation'

interface ManageDeepLinkContentProps {
	type: 'link' | 'qr'
	link: string
}

export const ManageDeepLinkContent = (props: ManageDeepLinkContentProps) => {
	const messengerClient = useMessengerClient()
	const conversations = useConversationsDict()

	const { dispatch } = useNavigation()

	const [reply, setReply] = useState<beapi.messenger.ParseDeepLink.Reply | null | undefined>(null)

	useEffect(() => {
		async function parseDeepLink() {
			const result = await messengerClient?.parseDeepLink({ link: props.link })
			console.log('result', result)
			setReply(result)
		}
		parseDeepLink()
	}, [messengerClient, props.link])

	if (reply === null) {
		return <ActivityIndicator size='large' />
	}
	if (reply?.link?.kind === beapi.messenger.BertyLink.Kind.GroupV1Kind) {
		return (
			<ManageGroupInvitation
				link={props.link}
				displayName={reply.link.bertyGroup?.displayName || ''}
				publicKey={base64ToURLBase64(
					Buffer.from(reply.link.bertyGroup?.group?.publicKey || new Uint8Array()).toString(
						'base64',
					),
				)}
				type={props.type}
				isPassword={false}
			/>
		)
	}
	if (reply?.link?.kind === beapi.messenger.BertyLink.Kind.ContactInviteV1Kind) {
		return (
			<AddThisContact
				link={props.link}
				type={props.type}
				displayName={reply.link.bertyId?.displayName || ''}
				publicKey={base64ToURLBase64(
					Buffer.from(reply.link.bertyId?.accountPk || new Uint8Array()).toString('base64'),
				)}
				isPassword={false}
			/>
		)
	}
	if (reply?.link?.kind === beapi.messenger.BertyLink.Kind.MessageV1Kind) {
		const conv = conversations[reply?.link?.bertyMessageRef?.groupPk as string]
		if (conv?.publicKey) {
			dispatch(
				CommonActions.reset({
					routes: [
						{ name: 'Chat.Home' },
						{
							name:
								conv?.type === beapi.messenger.Conversation.Type.MultiMemberType
									? 'Chat.MultiMember'
									: 'Chat.OneToOne',
							params: {
								convId: conv?.publicKey,
							},
						},
					],
				}),
			)
		}
	}
	return null
}
