import { Icon } from '@ui-kitten/components'
import React from 'react'
import { View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

const useStylesDeleteAccount = () => {
	const { width, height, border, text, padding, margin } = useStyles()
	const colors = useThemeColor()

	return {
		header: [width(120), height(120), border.radius.scale(60)],
		dismissButton: [
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			{ borderColor: colors['secondary-text'] },
		],
		deleteButton: [
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			{ borderColor: colors['secondary-background-header'] },
		],
		dismissText: [text.size.scale(17)],
	}
}

export const DeleteAccountHeader: React.FC<{ title: string }> = ({ title }) => {
	const _styles = useStylesDeleteAccount()
	const { margin, text, border, row, column } = useStyles()
	const colors = useThemeColor()

	return (
		<View>
			<View
				style={[
					border.shadow.medium,
					margin.bottom.medium,
					row.item.justify,
					column.justify,
					_styles.header,
					{ backgroundColor: colors['main-background'], shadowColor: colors.shadow },
				]}
			>
				<Icon
					name='alert-circle-outline'
					width={100}
					height={100}
					fill={colors['secondary-background-header']}
					style={[row.item.justify]}
				/>
			</View>
			<View>
				<UnifiedText
					style={[
						text.bold,
						text.size.huge,
						text.align.center,
						{ color: colors['secondary-background-header'] },
					]}
				>
					{title}
				</UnifiedText>
			</View>
		</View>
	)
}
