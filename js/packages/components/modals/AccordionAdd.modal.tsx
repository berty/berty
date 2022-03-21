import React, { FC, useCallback, useState } from 'react'

import { Text } from '@ui-kitten/components'
import { multiaddr } from 'multiaddr'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import Button from '@berty-tech/components/onboarding/Button'
import { TextInput } from '@berty-tech/components/shared-components/TextInput'
import { useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'

export const AccordionAdd: FC<{
	title: string
	alreadyExistingAliases?: string[]
	alreadyExistingUrls?: string[]
	onSubmit: (data: { alias: string; url: string }) => void
}> = ({ title, onSubmit, alreadyExistingAliases, alreadyExistingUrls }) => {
	const [{ margin, text }] = useStyles()
	const colors = useThemeColor()
	const [alias, setAlias] = useState<string>('')
	const [url, setUrl] = useState<string>('')
	const { t } = useTranslation()

	const aliasAlreadyExists = useCallback(() => {
		return !!alreadyExistingAliases?.find(currentAlias => currentAlias === alias)
	}, [alias, alreadyExistingAliases])

	const urlAlreadyExists = useCallback(() => {
		return !!alreadyExistingUrls?.find(currentUrl => currentUrl === url)
	}, [alreadyExistingUrls, url])

	const checkUrlIsMultiaddr = useCallback((): boolean => {
		if (url.length < 2) {
			return false
		}
		try {
			multiaddr(url)
			return true
		} catch (e) {
			return false
		}
	}, [url])

	const getUrlError = (t: any) => {
		if (urlAlreadyExists()) {
			return t('onboarding.custom-mode.settings.modals.errors.multiaddr-alread-exists')
		}
		if (!checkUrlIsMultiaddr()) {
			return t('onboarding.custom-mode.settings.modals.errors.multiaddr-bad-format')
		}
		if (!url.includes('p2p/')) {
			return t('onboarding.custom-mode.settings.modals.errors.multiaddr-p2p')
		}
		return null
	}

	return (
		<View style={{ backgroundColor: colors['main-background'] }}>
			{title ? (
				<Text
					style={[
						margin.medium,
						margin.bottom.big,
						text.align.center,
						{ color: colors['main-text'] },
					]}
				>
					{title}
				</Text>
			) : null}
			<TextInput
				autoCapitalize='none'
				autoCorrect={false}
				value={alias}
				onChangeText={setAlias}
				placeholder={t('onboarding.custom-mode.settings.modals.alias')}
				containerStyle={[margin.horizontal.medium, margin.bottom.medium]}
				error={
					aliasAlreadyExists()
						? t('onboarding.custom-mode.settings.modals.errors.alias-already-exists')
						: null
				}
			/>
			<TextInput
				autoCapitalize='none'
				autoCorrect={false}
				value={url}
				onChangeText={setUrl}
				placeholder={t('onboarding.custom-mode.settings.modals.multiaddress')}
				containerStyle={[margin.horizontal.medium, margin.bottom.medium]}
				multiline
				error={getUrlError(t)}
			/>
			<View style={{ flexDirection: 'row' }}>
				<Button
					onPress={() => onSubmit({ url, alias })}
					style={[margin.bottom.medium, margin.horizontal.medium, { flex: 1 }]}
					disabled={
						!url.length ||
						!alias.length ||
						aliasAlreadyExists() ||
						urlAlreadyExists() ||
						!!getUrlError(t)
					}
				>
					{t('onboarding.custom-mode.settings.modals.buttons.add')}
				</Button>
			</View>
		</View>
	)
}
