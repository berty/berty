import React from 'react'
import { SafeAreaView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { styles } from '../styles'
import { RequestProps } from '../shared-props/User'
import { Request } from './shared-components/Request'

//
// ContactRequest => Accept/Refuse
//

export const ContactRequest: React.FC<RequestProps> = ({ user }) => (
	<Layout style={[styles.flex, styles.bgBlue]}>
		<SafeAreaView style={[styles.flex]}>
			<Request user={user} />
		</SafeAreaView>
	</Layout>
)
