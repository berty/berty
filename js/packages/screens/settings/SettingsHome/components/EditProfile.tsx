import React, { FC } from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { EditMyProfile } from './EditMyProfile'

export const EditProfile: FC = () => {
	const { padding } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				{
					backgroundColor: colors['main-background'],
					borderTopLeftRadius: 30,
					borderTopRightRadius: 30,
				},
				padding.horizontal.big,
			]}
		>
			<EditMyProfile />
		</View>
	)
}
