import React from 'react'

import { ActionCard } from './cards/ActionCard'
import { ModalPriv } from './Modal.priv'

interface ActionModalWithAvatarProps {
	onClose: () => void
	onConfirm: () => void
	title: string
	description: string
	confirmText: string
	cancelText?: string
}

export const ActionModalWithAvatar: React.FC<ActionModalWithAvatarProps> = props => {
	return (
		<ModalPriv onClose={props.onClose}>
			<ActionCard {...props} withAvatar>
				{props.children}
			</ActionCard>
		</ModalPriv>
	)
}
