import React from 'react'
import { View } from 'react-native'

import { SecondaryButton } from '@berty/components'
import { useStyles } from '@berty/contexts/styles'

type CreateGroupFooterProps = {
	title: string
	action: () => void
	loading: boolean
}

export const CreateGroupFooter = ({ title, action, loading }: CreateGroupFooterProps) => {
	const { padding } = useStyles()

	return (
		<View style={[padding.horizontal.huge, padding.vertical.large]}>
			<SecondaryButton loading={loading} onPress={action}>
				{title}
			</SecondaryButton>
		</View>
	)
}
