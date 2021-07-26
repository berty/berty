import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'

type FooterCreateGroupProps = {
	title: string
	icon?: string
	action?: any
}

const useStylesCreateGroup = () => {
	const [{ border, text }] = useStyles()
	return {
		footerCreateGroupButton: border.radius.small,
		footerCreateGroupText: text.size.medium,
	}
}

export const FooterCreateGroup: React.FC<FooterCreateGroupProps> = ({ title, icon, action }) => {
	const [{ row, padding, text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const _styles = useStylesCreateGroup()

	return (
		<>
			<View
				style={[
					{
						position: 'absolute',
						bottom: 25 * scaleSize,
						left: 60 * scaleSize,
						right: 60 * scaleSize,
					},
				]}
			>
				<TouchableOpacity onPress={() => action()}>
					<View
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
						<View style={[row.item.justify]}>
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
						</View>
						{icon && (
							<View style={[row.item.justify, padding.left.medium]}>
								<Icon
									name='arrow-forward-outline'
									width={25 * scaleSize}
									height={25 * scaleSize}
									fill={colors['background-header']}
								/>
							</View>
						)}
					</View>
				</TouchableOpacity>
			</View>
		</>
	)
}
