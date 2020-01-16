import React from 'react'
import { SafeAreaView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { RequestProps } from '../shared-props/User'
import { Request } from '../shared-components/Request'

//
// Scan Request
//

export const ScanRequest: React.FC<RequestProps> = ({ user }) => {
	const [{ flex, background }] = useStyles()

	return (
		<Layout style={[background.red, flex.tiny]}>
			<SafeAreaView style={[flex.tiny]}>
				<Request user={user} />
			</SafeAreaView>
		</Layout>
	)
}
