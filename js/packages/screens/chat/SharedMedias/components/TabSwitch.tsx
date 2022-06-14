import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, TouchableOpacity, View } from 'react-native'

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
			icon: {
				name: 'image',
				pack: 'feather',
			},
			title: t('chat.shared-medias.medias'),
		},
		{
			icon: {
				name: 'link',
				pack: 'feather',
			},
			title: t('chat.shared-medias.links'),
		},
		{
			icon: {
				name: 'file-text',
				pack: 'feather',
			},
			title: t('chat.shared-medias.documents'),
		},
	]

	return (
		<SafeAreaView style={[{ backgroundColor: colors['background-header'] }]}>
			<View style={[{ flexDirection: 'row', alignItems: 'flex-end' }, padding.top.large]}>
				{tabs.map((tab, index) => (
					<TouchableOpacity
						key={index}
						onPress={() => setActiveIndex(index)}
						style={[
							padding.horizontal.small,
							padding.top.medium,
							padding.bottom.big,
							border.radius.top.small,
							margin.right.small,
							{
								maxWidth: 150,
								flexDirection: 'row',
								alignItems: 'center',
								backgroundColor: activeIndex === index ? colors['main-background'] : '#F7F8FE',
							},
						]}
					>
						<Icon height={20} width={20} fill={colors['background-header']} {...tab.icon} />
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

			<View
				style={{
					position: 'absolute',
					right: -50,
					bottom: -30,
					zIndex: -1,
				}}
			>
				<Icon
					height={200}
					width={200}
					fill={colors['background-header']}
					name={tabs[activeIndex].icon.name}
					pack='feather'
				/>
			</View>
		</SafeAreaView>
	)
}
