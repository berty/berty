import React from 'react'

import { Text, Icon } from '@ui-kitten/components'
import { View, TouchableOpacity, ActivityIndicator } from 'react-native'

import { useThemeColor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'

type FooterCreateGroupProps = {
	title: string
	icon?: string
	action?: any
	loading?: boolean
}

const useStylesCreateGroup = () => {
	const [{ border, text }] = useStyles()
	return {
		footerCreateGroupButton: border.radius.small,
		footerCreateGroupText: text.size.medium,
	}
}

export const FooterCreateGroup: React.FC<FooterCreateGroupProps> = ({
	title,
	icon,
	action,
	loading,
}) => {
	const [{ row, padding, text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const _styles = useStylesCreateGroup()

	return (
		<View style={[padding.horizontal.huge, padding.vertical.large]}>
			<TouchableOpacity
				onPress={() => {
					if (typeof action !== 'function') {
						console.warn('action is not a function:', action)
						return
					}
					action()
				}}
				style={[
					padding.horizontal.medium,
					padding.vertical.small,
					{
						flexDirection: 'row',
						justifyContent: 'center',
						backgroundColor: colors['positive-asset'],
					},
					_styles.footerCreateGroupButton,
				]}
			>
				<View style={[row.item.justify, { flex: 1 }]}>
					{loading ? (
						<ActivityIndicator color={colors['background-header']} />
					) : (
						<Text
							style={[
								text.bold.medium,
								text.align.center,
								_styles.footerCreateGroupText,
								{ color: colors['background-header'] },
							]}
						>
							{title}
						</Text>
					)}
				</View>
				{icon && !loading && (
					<View style={[row.item.justify, { position: 'absolute', right: 70 * scaleSize }]}>
						<Icon
							name='arrow-forward-outline'
							width={25 * scaleSize}
							height={25 * scaleSize}
							fill={colors['background-header']}
						/>
					</View>
				)}
			</TouchableOpacity>
		</View>
	)
}
