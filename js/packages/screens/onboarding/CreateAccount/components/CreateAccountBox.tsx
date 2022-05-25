import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { LargeInput } from '@berty/components'
import SwiperCard from '@berty/components/onboarding/SwiperCard'
import { useStyles } from '@berty/contexts/styles'
import { useAccount } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import { storageSet } from '@berty/utils/accounts/accountClient'
import { GlobalPersistentOptionsKeys } from '@berty/utils/persistent-options/types'

export const CreateAccountBox: React.FC<{
	defaultName: string
}> = ({ defaultName }) => {
	const [name, setName] = React.useState(defaultName || '')
	const { margin } = useStyles()
	const { t } = useTranslation()
	const { navigate } = useNavigation()
	const account = useAccount()

	return (
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
			}}
		>
			<View style={[margin.top.medium]}>
				<LargeInput
					// autoCapitalize='none'
					// autoCorrect={false}
					value={name}
					onChange={setName}
					placeholder={t('onboarding.create-account.placeholder')}
					iconName='person-outline'
				/>
			</View>
		</SwiperCard>
	)
}
