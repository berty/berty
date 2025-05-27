import React from 'react'

import { ActionCard } from './cards/ActionCard'
import { ActionButtonsProps, ModalCardProps } from './interfaces'
import { ModalPriv } from './Modal.priv'

export const ActionModal: React.FC<ModalCardProps & ActionButtonsProps> = props => {
	return (
		<ModalPriv onClose={props.onClose}>
			<ActionCard {...props} withLogo>
				{props.children}
			</ActionCard>
		</ModalPriv>
	)
}
