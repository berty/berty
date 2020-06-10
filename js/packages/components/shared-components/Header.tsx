import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles, defaultStylesDeclaration } from '@berty-tech/styles'
import { SafeAreaView } from 'react-native-safe-area-context'

//
// Header Settings
//

// Type
type HeaderSettingsProps = {
	title?: string
	children?: React.ReactNode
	bgColor?: string
	undo?: () => void
	undoIcon?: string
	undoIconSize?: number
	undoIconColor?: string
	undoIconPack?: string
	desc?: string | null
	descFontSize?: number
	descColor?: string
	action?: React.Dispatch<any>
	actionValue?: boolean
	actionIcon?: string
	actionIconSize?: number
	actionIconColor?: string
}

export const HeaderSettings: React.FC<HeaderSettingsProps> = ({
	title = null,
	children = null,
	bgColor = defaultStylesDeclaration.colors.default.blue,
	undo,
	undoIcon = 'arrow-back-outline',
	undoIconPack,
	undoIconSize = 25,
	undoIconColor = 'white',
	desc = null,
	descFontSize = 10,
	descColor = 'white',
	action = null,
	actionValue = null,
	actionIcon = 'swap',
	actionIconSize = 25,
	actionIconColor = 'white',
}) => {
	const [{ border, flex, padding, row, text }] = useStyles()
	return (
		<SafeAreaView style={[flex.tiny, border.radius.bottom.scale(20), { backgroundColor: bgColor }]}>
			<View style={[padding.horizontal.medium, padding.top.tiny, padding.bottom.medium]}>
				<View style={[row.fill, flex.tiny, { justifyContent: 'center' }]}>
					{undo ? (
						<TouchableOpacity style={[flex.tiny, row.item.justify]} onPress={undo}>
							<Icon
								name={undoIcon}
								pack={undoIconPack}
								width={undoIconSize}
								height={undoIconSize}
								fill={undoIconColor}
							/>
						</TouchableOpacity>
					) : (
						<View style={[flex.tiny, row.item.justify]} />
					)}
					{title && (
						<View style={[flex.big, row.item.justify]}>
							<Text
								style={[
									text.align.center,
									text.color.white,
									text.bold.medium,
									padding.top.medium,
									text.size.scale(25),
								]}
							>
								{title}
							</Text>
						</View>
					)}
					{action && actionIcon ? (
						<View style={[flex.tiny, row.item.justify]}>
							<TouchableOpacity
								style={row.item.bottom}
								onPress={() => action && action(!actionValue)}
							>
								<Icon
									name={actionIcon}
									width={actionIconSize}
									height={actionIconSize}
									fill={actionIconColor}
								/>
							</TouchableOpacity>
						</View>
					) : (
						<View style={[flex.tiny, row.item.justify]} />
					)}
				</View>
				{desc && (
					<Text
						style={[
							text.align.center,
							padding.horizontal.big,
							padding.top.small,
							{ fontSize: descFontSize, color: descColor },
						]}
					>
						{desc}
					</Text>
				)}
				{children}
			</View>
		</SafeAreaView>
	)
}

//
// Header Info Settings
//

// Type
type HeaderInfoSettingsProps = {
	children: React.ReactNode
}

export const HeaderInfoSettings: React.FC<HeaderInfoSettingsProps> = ({ children }) => {
	const [{ margin, border, padding }] = useStyles()
	return (
		<View
			style={[
				margin.horizontal.medium,
				border.radius.medium,
				padding.medium,
				margin.top.medium,
				{ backgroundColor: 'rgba(206,210,255,0.3)' },
			]}
		>
			<View style={{ justifyContent: 'center' }}>{children}</View>
		</View>
	)
}

export default HeaderSettings
