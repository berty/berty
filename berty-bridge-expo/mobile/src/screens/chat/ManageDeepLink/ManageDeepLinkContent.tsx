import { CommonActions } from '@react-navigation/native'
import { Buffer } from 'buffer'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'

import beapi from '@berty/api'
import { useConversationsDict, useMessengerClient } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
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

	const { dispatch } = useNavigation()

	// Keyed by link so a result parsed for a previous link is never shown for the current one.
	const [parsed, setParsed] = useState<{
		link: string
		reply?: beapi.messenger.ParseDeepLink.Reply
		error?: unknown
	} | null>(null)
	const current = parsed?.link === props.link ? parsed : null
	const reply = current?.reply ?? null
	const error = current?.error

	useEffect(() => {
		if (!messengerClient) {
			return
		}
		const link = props.link
		messengerClient
			.parseDeepLink({ link })
			.then(result => setParsed({ link, reply: result }))
			.catch(err => {
				console.warn('failed to parse deep link:', err)
				setParsed({ link, error: err ?? new Error('failed to parse deep link') })
			})
	}, [messengerClient, props.link])

	// Navigate from an effect, not render, to avoid "update a component while rendering".
	useEffect(() => {
		if (reply?.link?.kind !== beapi.messenger.BertyLink.Kind.MessageV1Kind) {
			return
		}
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
	}, [reply, conversations, dispatch])

	// This screen is a transparent modal: anything that renders nothing (or spins forever) leaves
	// an invisible layer swallowing every touch, so failures must render a dismissable error.
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
	return <InvalidScan type={props.type} error={new Error('unsupported link kind')} />
}
