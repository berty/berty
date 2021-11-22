import React from 'react'
import { ActivityIndicator, Platform, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Buffer } from 'buffer'
import { BlurView } from '@react-native-community/blur'

import { useStyles } from '@berty-tech/styles'
import { ScreenFC } from '@berty-tech/navigation'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { useThemeColor, useMessengerContext } from '@berty-tech/store'
import beapi from '@berty-tech/api'
import { useNavigation } from '@berty-tech/navigation'

import { ManageGroupInvitation } from './ManageGroupInvitation'
import AddThisContact from './AddThisContact'
import { base64ToURLBase64 } from '../utils'
import InvalidScan from './InvalidScan'

export const ManageDeepLink: ScreenFC<'Modals.ManageDeepLink'> = ({ route: { params } }) => {
	const { reply: pdlReply, error, call, done, called } = messengerMethodsHooks.useParseDeepLink()
	const ctx = useMessengerContext()
	const colors = useThemeColor()
	const navigation = useNavigation()

	React.useEffect(() => {
		if (!called) {
			call({ link: params.value })
		}
	}, [params.value, call, called])
	const [{ border }] = useStyles()
	const dataType = params.type || 'link'
	let content
	if (!done) {
		content = <ActivityIndicator size='large' />
	} else if (error) {
		content = <InvalidScan error={error} type={dataType} />
	} else if (pdlReply?.link?.kind === beapi.messenger.BertyLink.Kind.GroupV1Kind) {
		content = (
			<ManageGroupInvitation
				link={params.value}
				displayName={pdlReply.link.bertyGroup?.displayName || ''}
				publicKey={base64ToURLBase64(
					Buffer.from(pdlReply.link.bertyGroup?.group?.publicKey || new Uint8Array()).toString(
						'base64',
					),
				)}
				type={params.type}
				isPassword={false}
			/>
		)
	} else if (pdlReply?.link?.kind === beapi.messenger.BertyLink.Kind.ContactInviteV1Kind) {
		content = (
			<AddThisContact
				link={params.value}
				type={params.type}
				displayName={pdlReply.link.bertyId?.displayName || ''}
				publicKey={base64ToURLBase64(
					Buffer.from(pdlReply.link.bertyId?.accountPk || new Uint8Array()).toString('base64'),
				)}
				isPassword={false}
			/>
		)
	} else if (pdlReply?.link?.kind === beapi.messenger.BertyLink.Kind.EncryptedV1Kind) {
		if (pdlReply?.link?.encrypted?.kind === beapi.messenger.BertyLink.Kind.ContactInviteV1Kind) {
			content = (
				<AddThisContact
					link={params.value}
					type={params.type}
					displayName={pdlReply.link.bertyId?.displayName || ''}
					publicKey={base64ToURLBase64(
						Buffer.from(pdlReply.link.bertyId?.accountPk || new Uint8Array()).toString('base64'),
					)}
					isPassword={true}
				/>
			)
		} else if (pdlReply?.link?.encrypted?.kind === beapi.messenger.BertyLink.Kind.GroupV1Kind) {
			content = (
				<ManageGroupInvitation
					link={params.value}
					displayName={pdlReply.link.bertyGroup?.displayName || ''}
					publicKey={base64ToURLBase64(
						Buffer.from(pdlReply.link.bertyGroup?.group?.publicKey || new Uint8Array()).toString(
							'base64',
						),
					)}
					type={params.type}
					isPassword={true}
				/>
			)
		}
	} else if (pdlReply?.link?.encrypted?.kind === beapi.messenger.BertyLink.Kind.MessageV1Kind) {
		const conv = ctx.conversations[pdlReply?.link?.bertyMessageRef?.groupPk as string]
		if (conv?.publicKey) {
			navigation.navigate(
				conv?.type === beapi.messenger.Conversation.Type.MultiMemberType
					? 'Chat.Group'
					: 'Chat.OneToOne',
				{ convId: conv?.publicKey },
			)
		}
	}
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
