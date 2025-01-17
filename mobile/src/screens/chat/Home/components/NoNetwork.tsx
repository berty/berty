import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { HorizontalDuoSmall, PrimaryAltButton, SecondaryAltButton } from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'

interface NoNetworkProps {
	onCancel: () => void
}

export const NoNetwork: React.FC<NoNetworkProps> = props => {
	const { padding, text } = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const { navigate } = useNavigation()

	return (
		<View
			style={[
				padding.vertical.medium,
				padding.horizontal.medium,
				{ backgroundColor: colors['background-header'] },
			]}
		>
			<UnifiedText
				style={[
					text.size.huge,
					text.bold,
					padding.bottom.small,
					{ color: colors['reverted-main-text'] },
				]}
			>
				{t('main.home.no-network.title')}
			</UnifiedText>

			<UnifiedText
				style={[
					text.size.small,
					padding.bottom.medium,
					{ color: colors['reverted-main-text'], marginRight: 120 },
				]}
			>
				{t('main.home.no-network.description')}
			</UnifiedText>

			<HorizontalDuoSmall>
				<SecondaryAltButton onPress={props.onCancel}>
					{t('main.home.no-network.cancel')}
				</SecondaryAltButton>
				<PrimaryAltButton
					onPress={() => {
						props.onCancel()
						navigate('Settings.Network')
					}}
				>
					{t('main.home.no-network.activate')}
				</PrimaryAltButton>
			</HorizontalDuoSmall>
		</View>
	)
}
