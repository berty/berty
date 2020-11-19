import React from 'react'
import { StyleSheet, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import BlurView from '../shared-components/BlurView'
import InvalidScan from './InvalidScan'
import { useStyles } from '@berty-tech/styles'
import { SafeAreaView } from 'react-native-safe-area-context'
import AddThisContact from './AddThisContact'
import { ScreenProps } from '@berty-tech/navigation'
import { ManageGroupInvitation } from './ManageGroupInvitation'
import messengerMethodsHooks from '@berty-tech/store/methods'
import beapi from '@berty-tech/api'
import { Buffer } from 'buffer'

const base64ToURLBase64 = (str: string) =>
	str.replace(/\+/, '-').replace(/\//, '_').replace(/\=/, '')

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
	} else if (pdlReply.link.kind === beapi.messenger.ParseDeepLink.Kind.GroupV1Kind) {
		content = (
			<ManageGroupInvitation
				link={params.value}
				displayName={pdlReply.link.bertyGroup.displayName}
				publicKey={base64ToURLBase64(
					new Buffer(pdlReply.link.bertyGroup.group.publicKey).toString('base64'),
				)}
				type={params.type}
			/>
		)
	} else if (pdlReply.link.kind === beapi.messenger.ParseDeepLink.Kind.ContactInviteV1Kind) {
		content = (
			<AddThisContact
				link={params.value}
				type={params.type}
				displayName={pdlReply.link.bertyId.displayName}
				publicKey={base64ToURLBase64(
					new Buffer(pdlReply.link.bertyId.accountPk).toString('base64'),
				)}
			/>
		)
	}
	return (
		<>
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			<SafeAreaView style={[border.shadow.huge]}>{content}</SafeAreaView>
		</>
	)
}
