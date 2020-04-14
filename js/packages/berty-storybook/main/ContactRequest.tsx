import React, { useContext, useEffect } from 'react'
import { Request } from '../shared-components/Request'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { useStyles } from '@berty-tech/styles'

//
// ContactRequest => Accept/Refuse
//

const useStylesContactRequest = () => {
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
			background.light.blue,
		],
	}
}

export const ContactRequest: React.FC<ScreenProps.Main.ContactRequest> = ({
	route: { params },
}) => {
	const _styles = useStylesContactRequest()
	const [{ color }] = useStyles()
	const { goBack } = useNavigation()
	return (
		<Request
			user={params}
			markAsVerified={false}
			blurAmount={10}
			buttons={[
				{
					action: () => {
						params.decline({ id: params.id })
						goBack()
					},
					style: _styles.firstRequestButton,
					title: 'REFUSE',
					titleColor: color.grey,
					icon: 'close-outline',
					iconColor: color.grey,
				},
				{
					action: () => {
						params.accept({ id: params.id })
						goBack()
					},
					style: _styles.secondRequestButton,
					title: 'ACCEPT',
					titleColor: color.blue,
					icon: 'checkmark-outline',
					iconColor: color.blue,
				},
			]}
		/>
	)
}
