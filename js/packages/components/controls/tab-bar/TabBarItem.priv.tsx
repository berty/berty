import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { TabBarItemProps } from './interfaces'

export const TabBarItemPriv: React.FC<TabBarItemProps> = ({
	name,
	icon,
	iconPack,
	iconTransform,
	setEnable,
	enable = false,
	buttonDisabled = false,
}) => {
	const { flex, text, padding, opacity, border } = useStyles()
	const colors = useThemeColor()
	const selectedColor = enable ? colors['background-header'] : colors['main-text']
	const selectedOpacity = enable ? undefined : opacity(0.2)

	return (
		<TouchableOpacity
			onPress={() => setEnable(name)}
			accessibilityLabel={name}
			style={[flex.tiny, padding.bottom.tiny]}
			disabled={buttonDisabled}
		>
			<View style={[selectedOpacity, styles.content]}>
				<View style={styles.iconWrapper}>
					<Icon
						fill={selectedColor}
						name={icon}
						pack={iconPack}
						style={{ transform: iconTransform }}
						width={25}
						height={25}
					/>
				</View>
				<UnifiedText
					style={[text.bold, text.align.center, text.size.small, { color: selectedColor }]}
				>
					{name}
				</UnifiedText>
			</View>
			<View
				style={[
					styles.placeholder,
					border.big,
					border.radius.scale(2),
					{ borderColor: selectedColor },
					selectedOpacity,
				]}
			/>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	content: {
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	iconWrapper: {
		height: 25,
	},
	placeholder: {
		width: '95%',
		position: 'absolute',
		bottom: 0,
		left: '2.5%',
	},
})
