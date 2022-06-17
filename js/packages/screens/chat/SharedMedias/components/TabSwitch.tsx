import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

interface TabSwitchProps {
	activeIndex: number
	setActiveIndex: (index: number) => void
}

export const TabSwitch: React.FC<TabSwitchProps> = ({ activeIndex, setActiveIndex }) => {
	const { t } = useTranslation()
	const colors = useThemeColor()
	const { padding, margin, border, text } = useStyles()

	const tabs = [
		{
			icon: 'image',
			title: t('chat.shared-medias.medias'),
		},
		{
			icon: 'link',
			title: t('chat.shared-medias.links'),
		},
		{
			icon: 'file-text',
			title: t('chat.shared-medias.documents'),
		},
	]

	return (
		<SafeAreaView style={[{ backgroundColor: colors['background-header'] }]}>
			<View style={[styles.container, padding.top.large]}>
				{tabs.map((tab, index) => (
					<TouchableOpacity
						key={tab.icon}
						onPress={() => setActiveIndex(index)}
						style={[
							padding.horizontal.small,
							padding.top.medium,
							padding.bottom.big,
							border.radius.top.small,
							margin.right.small,
							styles.button,
							{
								backgroundColor: activeIndex === index ? colors['main-background'] : '#F7F8FE',
							},
						]}
					>
						<Icon
							height={20}
							width={20}
							fill={colors['background-header']}
							name={tab.icon}
							pack='feather'
						/>
						<UnifiedText
							numberOfLines={1}
							style={[
								margin.left.small,
								text.size.scale(activeIndex === index ? 17 : 16),
								{ color: colors['background-header'] },
							]}
						>
							{tab.title}
						</UnifiedText>
					</TouchableOpacity>
				))}
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'flex-end',
	},
	button: {
		maxWidth: 150,
		flexDirection: 'row',
		alignItems: 'center',
	},
})
