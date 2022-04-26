import React from 'react'
import { Platform, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Buffer } from 'buffer'
import { CommonActions } from '@react-navigation/native'

import { useStyles } from '@berty/contexts/styles'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { useThemeColor } from '@berty/store'
import beapi from '@berty/api'
import messengerMethodsHooks from '@berty/store/methods'
import { useConversationsDict } from '@berty/hooks'
import { BlurView } from '@react-native-community/blur'

import { ManageGroupInvitation } from './components/ManageGroupInvitation'
import AddThisContact from './components/AddThisContact'
import { base64ToURLBase64 } from '@berty/components/utils'
import InvalidScan from './components/InvalidScan'

export const ManageDeepLink: ScreenFC<'Chat.ManageDeepLink'> = ({ route: { params } }) => {
	const colors = useThemeColor()
	const { border } = useStyles()
	const { reply: pdlReply, error, call, done, called } = messengerMethodsHooks.useParseDeepLink()
	const [content, setContent] = React.useState<JSX.Element | null>()
	const { dispatch } = useNavigation()
	const conversations = useConversationsDict()

	const { type, value: link } = params

	React.useEffect(() => {
		if (!called) {
			call({ link })
		}
	}, [link, call, called])

	const handleDeepLink = React.useCallback(() => {
		let retContent
		if (!done) {
			retContent = <ActivityIndicator size='large' />
		} else if (error) {
			retContent = <InvalidScan error={error} type={type} />
		} else if (pdlReply?.link?.kind === beapi.messenger.BertyLink.Kind.GroupV1Kind) {
			retContent = (
				<ManageGroupInvitation
					link={link}
					displayName={pdlReply.link.bertyGroup?.displayName || ''}
					publicKey={base64ToURLBase64(
						Buffer.from(pdlReply.link.bertyGroup?.group?.publicKey || new Uint8Array()).toString(
							'base64',
						),
					)}
					type={type}
					isPassword={false}
				/>
			)
		} else if (pdlReply?.link?.kind === beapi.messenger.BertyLink.Kind.ContactInviteV1Kind) {
			retContent = (
				<AddThisContact
					link={link}
					type={type}
					displayName={pdlReply.link.bertyId?.displayName || ''}
					publicKey={base64ToURLBase64(
						Buffer.from(pdlReply.link.bertyId?.accountPk || new Uint8Array()).toString('base64'),
					)}
					isPassword={false}
				/>
			)
		} else if (pdlReply?.link?.kind === beapi.messenger.BertyLink.Kind.EncryptedV1Kind) {
			if (pdlReply?.link?.encrypted?.kind === beapi.messenger.BertyLink.Kind.ContactInviteV1Kind) {
				retContent = (
					<AddThisContact
						link={link}
						type={type}
						displayName={pdlReply.link.bertyId?.displayName || ''}
						publicKey={base64ToURLBase64(
							Buffer.from(pdlReply.link.bertyId?.accountPk || new Uint8Array()).toString('base64'),
						)}
						isPassword={true}
					/>
				)
			} else if (pdlReply?.link?.encrypted?.kind === beapi.messenger.BertyLink.Kind.GroupV1Kind) {
				retContent = (
					<ManageGroupInvitation
						link={link}
						displayName={pdlReply.link.bertyGroup?.displayName || ''}
						publicKey={base64ToURLBase64(
							Buffer.from(pdlReply.link.bertyGroup?.group?.publicKey || new Uint8Array()).toString(
								'base64',
							),
						)}
						type={type}
						isPassword={true}
					/>
				)
			}
		} else if (pdlReply?.link?.kind === beapi.messenger.BertyLink.Kind.MessageV1Kind) {
			const conv = conversations[pdlReply?.link?.bertyMessageRef?.groupPk as string]
			if (conv?.publicKey) {
				dispatch(
					CommonActions.reset({
						routes: [
							{ name: 'Chat.Home' },
							{
								name:
									conv?.type === beapi.messenger.Conversation.Type.MultiMemberType
										? 'Chat.Group'
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
		return retContent || null
	}, [conversations, dispatch, done, error, link, pdlReply, type])

	React.useEffect(() => {
		if (done) {
			setContent(handleDeepLink())
		}
	}, [handleDeepLink, done])

	return (
		<>
			{/*TODO on Android when we can render a BlurView on the first render, re-enable it*/}
			{Platform.OS === 'ios' && <BlurView style={[StyleSheet.absoluteFill]} blurType='light' />}
			<SafeAreaView style={[border.shadow.huge, { shadowColor: colors.shadow }]}>
				{content}
			</SafeAreaView>
		</>
	)
}
