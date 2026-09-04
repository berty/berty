import { Buffer } from 'buffer'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'

import beapi from '@berty/api'
import { useConversationsDict, useMessengerClient } from '@berty/hooks'
import { resetRoutes } from '@berty/navigation'
import { base64ToURLBase64 } from '@berty/utils/convert/base64'

import AddThisContact from './components/AddThisContact'
import InvalidScan from './components/InvalidScan'
import { ManageGroupInvitation } from './components/ManageGroupInvitation'

interface ManageDeepLinkContentProps {
	type: 'link' | 'qr'
	link: string
}

export const ManageDeepLinkContent = (props: ManageDeepLinkContentProps) => {
	const messengerClient = useMessengerClient()
	const conversations = useConversationsDict()


	const [reply, setReply] = useState<beapi.messenger.ParseDeepLink.Reply | null | undefined>(null)
	const [error, setError] = useState<unknown>(null)

	useEffect(() => {
		let canceled = false
		messengerClient
			?.parseDeepLink({ link: props.link })
			.then(result => {
				if (!canceled) {
					setReply(result)
				}
			})
			.catch(err => {
				// A malformed or unsupported link rejects here. Without this the
				// rejection went unhandled and the screen spun forever.
				console.warn('failed to parse deep link', err)
				if (!canceled) {
					setError(err)
				}
			})
		return () => {
			canceled = true
		}
	}, [messengerClient, props.link])

	// Navigate from an effect, not render, to avoid "update a component while rendering".
	useEffect(() => {
		if (reply?.link?.kind !== beapi.messenger.BertyLink.Kind.MessageV1Kind) {
			return
		}
		const conv = conversations[reply?.link?.bertyMessageRef?.groupPk as string]
		if (conv?.publicKey) {
			resetRoutes([
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
			])
		}
	}, [reply, conversations])

	if (error) {
		return <InvalidScan type={props.type} error={error} />
	}
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
		// Navigation is handled by the effect above; show a spinner meanwhile.
		return <ActivityIndicator size='large' />
	}
	return null
}
