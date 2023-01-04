import React from 'react'
import { View } from 'react-native'

import { SecondaryButtonIconRight } from '@berty/components'
import { useStyles } from '@berty/contexts/styles'

interface CreateGroupFooterWithIconProps {
	title: string
	icon: string
	action: () => void
	testID?: string
	accessibilityLabel?: string
}

export const CreateGroupFooterWithIcon = ({
	title,
	icon,
	action,
	testID,
	accessibilityLabel,
}: CreateGroupFooterWithIconProps) => {
	const { padding, margin } = useStyles()

	return (
		<View
			style={[
				padding.horizontal.huge,
				padding.vertical.large,
				margin.bottom.small,
				{ backgroundColor: '#F2F2F2' },
			]}
		>
			<SecondaryButtonIconRight
				accessibilityLabel={accessibilityLabel}
				testID={testID}
				name={icon}
				onPress={action}
			>
				{title}
			</SecondaryButtonIconRight>
		</View>
	)
}
