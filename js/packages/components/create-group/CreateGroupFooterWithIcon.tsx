import React from 'react'
import { View } from 'react-native'

import { SecondaryButtonIconRight } from '@berty/components'
import { useStyles } from '@berty/contexts/styles'

type CreateGroupFooterWithIconProps = {
	title: string
	icon: string
	action: () => void
}

export const CreateGroupFooterWithIcon = ({
	title,
	icon,
	action,
}: CreateGroupFooterWithIconProps) => {
	const { padding } = useStyles()

	return (
		<View style={[padding.horizontal.huge, padding.vertical.large]}>
			<SecondaryButtonIconRight name={icon} onPress={action}>
				{title}
			</SecondaryButtonIconRight>
		</View>
	)
}
