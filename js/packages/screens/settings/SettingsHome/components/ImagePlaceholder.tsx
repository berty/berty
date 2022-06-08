import { Icon } from '@ui-kitten/components'
import React from 'react'
import { View } from 'react-native'

import { AccountAvatar } from '@berty/components/avatars'
import { useThemeColor } from '@berty/store'

export const ImagePlaceholder = () => {
	const colors = useThemeColor()

	return (
		<>
			<AccountAvatar size={90} isEditable />
			<View style={{ top: -61, right: -30, elevation: 6 }}>
				<Icon
					name='camera-outline'
					pack='custom'
					width={30}
					height={30}
					fill={colors['background-header']}
				/>
			</View>
		</>
	)
}
