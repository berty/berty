import { Icon } from '@ui-kitten/components'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, TextInput, View } from 'react-native'
import { RESULTS } from 'react-native-permissions'

import beapi from '@berty-tech/api'
import { useNavigation } from '@berty-tech/navigation'
import rnutil from '@berty-tech/rnutil'
import {
	GlobalPersistentOptionsKeys,
	storageSet,
	useMessengerContext,
	useThemeColor,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import { useAccount } from '@berty-tech/react-redux'

import SwiperCard from './SwiperCard'

export const CreateAccountBox: React.FC<{
	defaultName: string
	newConfig?: beapi.account.INetworkConfig | null
	setIsFinished?: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ defaultName, newConfig, setIsFinished }) => {
	const ctx = useMessengerContext()
	const [name, setName] = React.useState(defaultName || '')
	const [{ text, padding, margin, border }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const [isPressed, setIsPressed] = useState(false)
	const { navigate } = useNavigation()
	const account = useAccount()

	const handlePersistentOptions = React.useCallback(async () => {
		setIsPressed(true)
		await ctx.createNewAccount(newConfig ? newConfig : undefined)
		if (setIsFinished) {
			setIsFinished(true)
		}
	}, [ctx, setIsFinished, newConfig])

	const onPress = React.useCallback(async () => {
		const displayName = name || `anon#${account.publicKey?.substring(0, 4)}`
		await storageSet(GlobalPersistentOptionsKeys.DisplayName, displayName)

		handlePersistentOptions()
			.then(() => {})
			.catch(err => {
				console.log(err)
			})
	}, [name, account.publicKey, handlePersistentOptions])

	return (
		<View>
			{!isPressed ? (
				<SwiperCard
					title={t('onboarding.create-account.title')}
					button={{
						text: t('onboarding.create-account.button'),
						onPress: async () => {
							const status = await rnutil.checkPermissions('notification', navigate)
							if (status === RESULTS.DENIED || status === RESULTS.BLOCKED) {
								await rnutil.checkPermissions('notification', navigate, {
									navigateToPermScreenOnProblem: true,
									onComplete: async () => onPress(),
								})
							} else {
								await onPress()
							}
						},
					}}
				>
					<View
						style={[
							margin.top.medium,
							padding.medium,
							border.radius.small,
							text.bold.small,
							{
								backgroundColor: colors['input-background'],
								fontFamily: 'Open Sans',
								color: colors['main-text'],
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
							fill={colors['main-text']}
						/>
						<TextInput
							autoCapitalize='none'
							autoCorrect={false}
							value={name}
							onChangeText={setName}
							placeholder={t('onboarding.create-account.placeholder')}
							placeholderTextColor={`${colors['main-text']}70`}
							style={[
								text.size.medium,
								{ flex: 1, fontFamily: 'Open Sans', color: colors['main-text'] },
							]}
						/>
					</View>
				</SwiperCard>
			) : (
				<SwiperCard title='Creating...'>
					<ActivityIndicator
						size='large'
						style={[margin.top.medium]}
						color={colors['secondary-text']}
					/>
				</SwiperCard>
			)}
		</View>
	)
}
