import React from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store/hooks'

import Logo from '@berty/assets/logo/1_berty_picto.svg'

export const useStylesNotification = () => {
	const { flex } = useStyles()
	return {
		touchable: [flex.tiny, flex.direction.row, { paddingHorizontal: 10 }],
		innerTouchable: [flex.direction.row, { padding: 15, flexGrow: 0, flexShrink: 1 }],
		titleAndTextWrapper: [flex.justify.spaceAround, { marginLeft: 15, flexShrink: 1, flexGrow: 0 }],
	}
}

export const NotificationTmpLogo: React.FC<{}> = () => {
	const colors = useThemeColor()

	return (
		<View
			style={{
				alignSelf: 'center',
				alignItems: 'center',
				width: 40,
				height: 40,
				flexGrow: 0,
				flexShrink: 0,
				borderRadius: 30,
				justifyContent: 'center',

				borderWidth: 2,
				borderColor: colors['input-background'],
			}}
		>
			{/*<Icon name='checkmark-outline' fill={color.green} width={15} height={15} />*/}
			<Logo
				width={26}
				height={26}
				style={{ marginLeft: 4 }} // nudge logo to appear centered
			/>
		</View>
	)
}
