import React from 'react'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { TextInput, View } from 'react-native'

import { GlobalPersistentOptionsKeys, storageSet, useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { useNavigation } from '@berty/navigation'
import { useAccount } from '@berty/hooks'

import SwiperCard from '@berty/components/onboarding/SwiperCard'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export const CreateAccountBox: React.FC<{
	defaultName: string
}> = ({ defaultName }) => {
	const [name, setName] = React.useState(defaultName || '')
	const { text, padding, margin, border } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const { navigate } = useNavigation()
	const account = useAccount()

	return (
		<View>
			<SwiperCard
				title={t('onboarding.create-account.title')}
				button={{
					text: 'DEFAULT MODE',
					onPress: async () => {
						const displayName = name || `anon#${account.publicKey?.substring(0, 4)}`
						await storageSet(GlobalPersistentOptionsKeys.DisplayName, displayName)
						navigate('Onboarding.DefaultMode')
					},
				}}
				secondButton={{
					text: 'CUSTOM MODE',
					onPress: async () => {
						const displayName = name || `anon#${account.publicKey?.substring(0, 4)}`
						await storageSet(GlobalPersistentOptionsKeys.DisplayName, displayName)
						navigate('Onboarding.CustomMode')
					},
					status: 'secondary',
				}}
			>
				<View
					style={[
						margin.top.medium,
						padding.medium,
						border.radius.small,
						{
							backgroundColor: colors['input-background'],
							flexDirection: 'row',
							alignItems: 'center',
						},
					]}
				>
					<Icon
						style={[margin.right.small]}
						name='person-outline'
						width={30 * scaleSize}
						height={30 * scaleSize}
						fill={`${colors['main-text']}60`}
					/>
					<TextInput
						autoCapitalize='none'
						autoCorrect={false}
						value={name}
						onChangeText={setName}
						placeholder={t('onboarding.create-account.placeholder')}
						placeholderTextColor={`${colors['main-text']}60`}
						style={[
							text.size.medium,
							{ flex: 1, fontFamily: 'Open Sans', color: colors['main-text'] },
						]}
					/>
				</View>
			</SwiperCard>
		</View>
	)
}
