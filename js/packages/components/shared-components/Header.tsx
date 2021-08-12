import React from 'react'
import { View, TouchableOpacity, Insets } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'

const largeHitSlop: Insets = {
	top: 20,
	right: 20,
	bottom: 20,
	left: 20,
}

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
	undoIconHitSlop?: Insets
	desc?: string | null
	descFontSize?: number
	descColor?: string
	action?: React.Dispatch<any>
	actionValue?: boolean
	actionIcon?: string
	actionIconSize?: number
	actionIconColor?: string
	actionIconHitSlop?: Insets
}

export const HeaderSettings: React.FC<HeaderSettingsProps> = ({
	title = null,
	children = null,
	bgColor,
	undo,
	undoIcon = 'arrow-back-outline',
	undoIconPack,
	undoIconSize = 25,
	undoIconColor,
	undoIconHitSlop = largeHitSlop,
	desc = null,
	descFontSize = 10,
	descColor,
	action = null,
	actionValue = null,
	actionIcon = 'swap',
	actionIconSize = 30,
	actionIconColor,
	actionIconHitSlop = largeHitSlop,
}) => {
	const [{ border, flex, padding, row, text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	if (!bgColor) {
		bgColor = colors['background-header']
	}
	if (!undoIconColor) {
		undoIconColor = colors['reverted-main-text']
	}
	if (!descColor) {
		descColor = colors['reverted-main-text']
	}
	if (!actionIconColor) {
		actionIconColor = colors['reverted-main-text']
	}

	return (
		<SafeAreaView style={[flex.tiny, border.radius.bottom.scale(20), { backgroundColor: bgColor }]}>
			<View style={[padding.horizontal.medium, padding.top.medium, padding.bottom.medium]}>
				<View style={[row.fill, flex.tiny, { justifyContent: 'center', alignItems: 'center' }]}>
					{undo ? (
						<TouchableOpacity
							style={[flex.tiny, { justifyContent: 'center' }]}
							onPress={undo}
							hitSlop={undoIconHitSlop}
						>
							<Icon
								name={undoIcon}
								pack={undoIconPack}
								width={undoIconSize * scaleSize}
								height={undoIconSize * scaleSize}
								fill={undoIconColor}
							/>
						</TouchableOpacity>
					) : (
						<View style={[flex.tiny]} />
					)}
					{title ? (
						<View style={[flex.big, row.item.justify]}>
							<Text
								style={[
									text.align.center,
									text.bold.medium,
									text.size.scale(25),
									{ color: colors['reverted-main-text'] },
								]}
							>
								{title}
							</Text>
						</View>
					) : (
						<View style={[flex.big]} />
					)}
					{action && actionIcon ? (
						<View style={[flex.tiny, row.item.justify]}>
							<TouchableOpacity
								style={row.item.bottom}
								onPress={() => action && action(!actionValue)}
								hitSlop={actionIconHitSlop}
							>
								<Icon
									name={actionIcon}
									width={actionIconSize * scaleSize}
									height={actionIconSize * scaleSize}
									fill={actionIconColor}
								/>
							</TouchableOpacity>
						</View>
					) : (
						<View style={[flex.tiny, row.item.justify]} />
					)}
				</View>
				{desc?.length ? (
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
				) : null}
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
	const colors = useThemeColor()

	return (
		<View
			style={[
				margin.horizontal.medium,
				border.radius.medium,
				padding.medium,
				margin.top.medium,
				{ backgroundColor: `${colors['background-header']}40` },
			]}
		>
			<View style={{ justifyContent: 'center' }}>{children}</View>
		</View>
	)
}

export default HeaderSettings
