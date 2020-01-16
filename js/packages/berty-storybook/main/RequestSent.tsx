import React from 'react'
import { StyleSheet } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { colors, useStyles } from '@berty-tech/styles'
import { RequestProps } from '../shared-props/User'
import { Request } from '../shared-components/Request'

//
// ContactRequest => Accept/Refuse
//

const useStylesRequestSent = () => {
	const [{ border, padding, margin, background }] = useStyles()
	return {
		firstRequestButton: [
			border.color.light.grey,
			border.big,
			border.radius.scale(6),
			padding.top.tiny,
			margin.right.small,
		],
		secondRequestButton: [
			border.radius.scale(6),
			padding.vertical.small,
			margin.left.small,
			background.light.green,
		],
	}
}

export const RequestSent: React.FC<RequestProps> = ({ user }) => {
	const _styles = useStylesRequestSent()
	const [{ flex, background, color }] = useStyles()

	return (
		<Layout style={[flex.tiny, background.light.green]}>
			<Request
				user={user}
				markAsVerified={false}
				buttons={[
					{
						style: _styles.firstRequestButton,
						title: 'REFUSE',
						titleColor: color.grey,
						icon: 'close-outline',
						iconColor: color.grey,
					},
					{
						style: _styles.secondRequestButton,
						title: 'RESEND',
						titleColor: color.green,
						icon: 'paper-plane-outline',
						iconColor: color.green,
					},
				]}
			/>
		</Layout>
	)
}
