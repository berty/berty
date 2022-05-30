import React from 'react'

import { SecondaryButtonIconRight } from '@berty/components'

import { CreateGroupFooterPriv } from './CreateGroupFooter.priv'

interface CreateGroupFooterWithIconProps {
	title: string
	icon: string
	action: () => void
}

export const CreateGroupFooterWithIcon = ({
	title,
	icon,
	action,
}: CreateGroupFooterWithIconProps) => {
	return (
		<CreateGroupFooterPriv>
			<SecondaryButtonIconRight name={icon} onPress={action}>
				{title}
			</SecondaryButtonIconRight>
		</CreateGroupFooterPriv>
	)
}
