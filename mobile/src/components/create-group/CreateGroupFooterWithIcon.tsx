import React from 'react'

import { SecondaryButtonIconRight } from '@berty/components'

import { CreateGroupFooterPriv } from './CreateGroupFooter.priv'

interface CreateGroupFooterWithIconProps {
	title: string
	icon: string
	action: () => void
	testID?: string
}

export const CreateGroupFooterWithIcon = ({
	title,
	icon,
	action,
	testID,
}: CreateGroupFooterWithIconProps) => {
	return (
		<CreateGroupFooterPriv>
			<SecondaryButtonIconRight testID={testID} name={icon} onPress={action}>
				{title}
			</SecondaryButtonIconRight>
		</CreateGroupFooterPriv>
	)
}
