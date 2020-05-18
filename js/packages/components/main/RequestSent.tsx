import React from 'react'
import { useStyles } from '@berty-tech/styles'
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
			padding.vertical.small,
			border.radius.scale(6),
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

export const RequestSent: React.FC<{ route: any }> = ({ route }) => {
	const _styles = useStylesRequestSent()
	const [{ color }] = useStyles()

	return (
		<Request
			user={route.params.contact}
			markAsVerified={false}
			blurAmount={10}
			blurColor={'cyan'}
			buttons={[
				{
					// TODO: action
					style: _styles.firstRequestButton,
					title: 'REFUSE',
					titleColor: color.grey,
					icon: 'close-outline',
					iconColor: color.grey,
					disabled: true,
				},
				{
					// TODO: action
					style: _styles.secondRequestButton,
					title: 'RESEND',
					titleColor: color.green,
					icon: 'paper-plane-outline',
					iconColor: color.green,
					disabled: true,
				},
			]}
		/>
	)
}
