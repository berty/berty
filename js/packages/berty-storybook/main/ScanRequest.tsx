import React from 'react'
import { SafeAreaView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { Request } from '../shared-components/Request'
import { ScreenProps } from '@berty-tech/berty-navigation'

//
// Scan Request
//

export const ScanRequest: React.FC<ScreenProps.Main.ScanRequest> = ({ route: { params } }) => {
	const [{ flex, background }] = useStyles()

	return (
		<Layout style={[background.red, flex.tiny]}>
			<SafeAreaView style={[flex.tiny]}>
				<Request user={params} accept={(_) => {}} decline={(_) => {}} />
			</SafeAreaView>
		</Layout>
	)
}
