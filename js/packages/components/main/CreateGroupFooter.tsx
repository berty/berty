import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import LinearGradient from 'react-native-linear-gradient'

import { useStyles } from '@berty-tech/styles'

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
	const [{ absolute, background, row, padding, color, text }, { scaleSize }] = useStyles()
	const _styles = useStylesCreateGroup()

	return (
		<>
			<LinearGradient
				style={[
					absolute.bottom,
					{ alignItems: 'center', justifyContent: 'center', height: '15%', width: '100%' },
				]}
				colors={['#ffffff00', '#ffffff80', '#ffffffc0', '#ffffffff']}
			/>
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
							background.light.blue,
							padding.horizontal.medium,
							padding.vertical.small,
							{
								flexDirection: 'row',
								justifyContent: 'center',
							},
							_styles.footerCreateGroupButton,
						]}
					>
						<View style={[row.item.justify]}>
							<Text
								style={[
									text.bold.medium,
									text.color.blue,
									text.align.center,
									_styles.footerCreateGroupText,
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
									fill={color.blue}
								/>
							</View>
						)}
					</View>
				</TouchableOpacity>
			</View>
		</>
	)
}
