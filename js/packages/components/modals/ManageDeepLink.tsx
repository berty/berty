import React from 'react'
import { StyleSheet, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Buffer } from 'buffer'

import { useStyles } from '@berty-tech/styles'
import { ScreenProps } from '@berty-tech/navigation'
import messengerMethodsHooks from '@berty-tech/store/methods'
import beapi from '@berty-tech/api'

import { ManageGroupInvitation } from './ManageGroupInvitation'
import AddThisContact from './AddThisContact'
import { base64ToURLBase64 } from '../utils'
import BlurView from '../shared-components/BlurView'
import InvalidScan from './InvalidScan'

export const ManageDeepLink: React.FC<ScreenProps.Modals.ManageDeepLink> = ({
	route: { params },
}) => {
	const { t } = useTranslation()
	const { reply: pdlReply, error, call, done, called } = messengerMethodsHooks.useParseDeepLink()
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
		let title
		if (dataType === 'link') {
			title = t('modals.manage-deep-link.invalid-link')
		} else if (dataType === 'qr') {
			title = t('modals.manage-deep-link.invalid-qr')
		} else {
			title = t('modals.manage-deep-link.error')
		}
		content = <InvalidScan title={title} error={error.toString()} />
	} else if (pdlReply?.link?.kind === beapi.messenger.BertyLink.Kind.GroupV1Kind) {
		content = (
			<ManageGroupInvitation
				link={params.value}
				displayName={pdlReply.link.bertyGroup?.displayName || ''}
				publicKey={base64ToURLBase64(
					new Buffer(pdlReply.link.bertyGroup?.group?.publicKey || new Uint8Array()).toString(
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
					new Buffer(pdlReply.link.bertyId?.accountPk || new Uint8Array()).toString('base64'),
				)}
				isPassword={false}
			/>
		)
	} else if (pdlReply?.link?.kind === beapi.messenger.BertyLink.Kind.EncryptedV1Kind) {
		console.log('enc', pdlReply?.link?.encrypted)
		if (pdlReply?.link?.encrypted?.kind === beapi.messenger.BertyLink.Kind.ContactInviteV1Kind) {
			content = (
				<AddThisContact
					link={params.value}
					type={params.type}
					displayName={pdlReply.link.bertyId?.displayName || ''}
					publicKey={base64ToURLBase64(
						new Buffer(pdlReply.link.bertyId?.accountPk || new Uint8Array()).toString('base64'),
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
						new Buffer(pdlReply.link.bertyGroup?.group?.publicKey || new Uint8Array()).toString(
							'base64',
						),
					)}
					type={params.type}
					isPassword={true}
				/>
			)
		}
	}
	return (
		<>
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			<SafeAreaView style={[border.shadow.huge]}>{content}</SafeAreaView>
		</>
	)
}
