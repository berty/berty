import React from 'react'
import { StyleSheet } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { styles, colors } from '@berty-tech/styles'
import { RequestProps } from '../shared-props/User'
import { Request } from '../shared-components/Request'

//
// ContactRequest => Accept/Refuse
//

const _requestButtonsStyles = StyleSheet.create({
	firstRequestButton: {
		borderColor: colors.grey,
		borderWidth: 2,
		opacity: 0.5,
		borderRadius: 6,
		paddingTop: 7,
		paddingBottom: 7,
		marginRight: 10,
	},
	secondRequestButton: {
		borderRadius: 6,
		paddingTop: 7,
		paddingBottom: 7,
		marginLeft: 10,
		backgroundColor: colors.lightGreen,
	},
})

export const RequestSent: React.FC<RequestProps> = ({ user }) => (
	<Layout style={[styles.flex, styles.bgLightGreen]}>
		<Request
			user={user}
			markAsVerified={false}
			buttons={[
				{
					style: _requestButtonsStyles.firstRequestButton,
					title: 'REFUSE',
					titleColor: colors.grey,
					icon: 'close-outline',
					iconColor: colors.grey,
				},
				{
					style: _requestButtonsStyles.secondRequestButton,
					title: 'RESEND',
					titleColor: colors.green,
					icon: 'paper-plane-outline',
					iconColor: colors.green,
				},
			]}
		/>
	</Layout>
)
