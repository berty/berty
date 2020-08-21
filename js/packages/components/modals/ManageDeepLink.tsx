import React from 'react'
import { StyleSheet, ActivityIndicator } from 'react-native'
import BlurView from '../shared-components/BlurView'
import InvalidScan from './InvalidScan'
import { Messenger } from '@berty-tech/hooks'
import { useStyles } from '@berty-tech/styles'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SendContactRequest } from './SendContactRequest'
import { ScreenProps } from '@berty-tech/navigation'
import { ManageGroupInvitation } from './ManageGroupInvitation'
import { bufToStr } from '@berty-tech/store/utils'

export const ManageDeepLink: React.FC<ScreenProps.Modals.ManageDeepLink> = ({
	route: { params },
}) => {
	const account = Messenger.useAccount()
	const client = Messenger.useClient()
	const deepLinkStatus = Messenger.useDeepLinkStatus()
	const [{ border }] = useStyles()
	console.log('params', params)
	console.log('ManageDeepLink render:', JSON.stringify(deepLinkStatus, null, 2))
	const dataType = (!params.link && params.type) || 'link'
	let content
	if (!client || !account?.onboarded) {
		content = (
			<InvalidScan
				title={'App not ready!'}
				error={'Please finish the onboarding before using links or QR codes.'}
			/>
		)
	} else if (
		!deepLinkStatus ||
		(deepLinkStatus.link !== params.value && deepLinkStatus.link !== params.link)
	) {
		content = <ActivityIndicator size='large' />
	} else if (deepLinkStatus.error !== undefined) {
		let title
		if (dataType === 'link') {
			title = 'Invalid link!'
		} else if (dataType === 'qr') {
			title = 'Invalid QR code!'
		} else {
			title = 'Error!'
		}
		content = <InvalidScan title={title} error={deepLinkStatus.error} />
	} else if (deepLinkStatus.kind === 'group') {
		const { bertyGroup } = deepLinkStatus.parsedData || {}
		if (!(bertyGroup?.group?.publicKey && bertyGroup?.displayName)) {
			content = (
				<InvalidScan
					title={'Error joining group!'}
					error='This invitation contains incomplete data. ☹️'
				/>
			)
		} else {
			content = (
				<ManageGroupInvitation
					groupPk={bufToStr(bertyGroup.group.publicKey)}
					displayName={bertyGroup.displayName}
				/>
			)
		}
	} else if (deepLinkStatus.kind === 'contact') {
		content = <SendContactRequest type={dataType} />
	}
	return (
		<>
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			<SafeAreaView style={[border.shadow.huge]}>{content}</SafeAreaView>
		</>
	)
}
