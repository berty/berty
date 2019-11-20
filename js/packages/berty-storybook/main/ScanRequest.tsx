import React from 'react'
import { SafeAreaView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { styles } from '../styles'
import { RequestProps } from '../shared-props/User'
import { Request } from './shared-components/Request'

//
// Scan Request
//

export const ScanRequest: React.FC<RequestProps> = ({ user }) => (
	<Layout style={[styles.flex, styles.bgRed]}>
		<SafeAreaView style={[styles.flex]}>
			<Request user={user} />
		</SafeAreaView>
	</Layout>
)
