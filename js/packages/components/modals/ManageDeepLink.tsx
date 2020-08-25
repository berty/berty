import React from 'react'
import { StyleSheet, ActivityIndicator } from 'react-native'
import BlurView from '../shared-components/BlurView'
import InvalidScan from './InvalidScan'
import { useStyles } from '@berty-tech/styles'
import { SafeAreaView } from 'react-native-safe-area-context'
import AddThisContact from './AddThisContact'
import { ScreenProps } from '@berty-tech/navigation'
import { ManageGroupInvitation } from './ManageGroupInvitation'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { messenger as messengerpb } from '@berty-tech/api/index.js'

const base64ToURLBase64 = (str: string) => str.replace('+', '-').replace('/', '_').replace('=', '')

export const ManageDeepLink: React.FC<ScreenProps.Modals.ManageDeepLink> = ({
	route: { params },
}) => {
	const { reply: pdlReply, error, refresh, done } = messengerMethodsHooks.useParseDeepLink()
	React.useEffect(() => {
		refresh({ link: params.value })
	}, [params.value, refresh])
	const [{ border }] = useStyles()
	const dataType = params.type || 'link'
	let content
	if (!done) {
		content = <ActivityIndicator size='large' />
	} else if (error) {
		let title
		if (dataType === 'link') {
			title = 'Invalid link!'
		} else if (dataType === 'qr') {
			title = 'Invalid QR code!'
		} else {
			title = 'Error!'
		}
		content = <InvalidScan title={title} error={error.toString()} />
	} else if (pdlReply.kind === messengerpb.ParseDeepLink.Kind.BertyGroup) {
		content = <ManageGroupInvitation />
	} else if (pdlReply.kind === messengerpb.ParseDeepLink.Kind.BertyID) {
		content = (
			<AddThisContact
				link={params.value}
				type={params.type}
				displayName={pdlReply.bertyId.displayName}
				publicKey={base64ToURLBase64(new Buffer(pdlReply.bertyId.accountPk).toString('base64'))}
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
