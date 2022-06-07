import { multiaddr } from 'multiaddr'
import React, { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

import { PrimaryButton } from '../buttons'
import { LargeInput } from '../index'
import { UnifiedText } from '../shared-components/UnifiedText'

export const AccordionAdd: FC<{
	title: string
	alreadyExistingAliases?: string[]
	alreadyExistingUrls?: string[]
	onSubmit: (data: { alias: string; url: string }) => void
}> = ({ title, onSubmit, alreadyExistingAliases, alreadyExistingUrls }) => {
	const { margin, text, padding } = useStyles()
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
				<UnifiedText style={[margin.medium, margin.bottom.big, text.align.center]}>
					{title}
				</UnifiedText>
			) : null}
			<View style={[margin.horizontal.medium, margin.bottom.medium]}>
				<LargeInput
					value={alias}
					onChangeText={setAlias}
					placeholder={t('onboarding.custom-mode.settings.modals.alias')}
				/>
				{aliasAlreadyExists() && (
					<View style={[padding.top.small, padding.horizontal.small]}>
						<UnifiedText style={[text.color.red, text.size.small]}>
							{t('onboarding.custom-mode.settings.modals.errors.alias-already-exists')}
						</UnifiedText>
					</View>
				)}
			</View>

			<View style={[margin.horizontal.medium, margin.bottom.medium]}>
				<LargeInput
					value={url}
					onChangeText={setUrl}
					placeholder={t('onboarding.custom-mode.settings.modals.multiaddress')}
					multiline
				/>
				{!!getUrlError(t) && (
					<View style={[padding.top.small, padding.horizontal.small]}>
						<UnifiedText style={[text.color.red, text.size.small]}>{getUrlError(t)}</UnifiedText>
					</View>
				)}
			</View>

			<View style={[margin.horizontal.huge]}>
				<PrimaryButton
					onPress={() => onSubmit({ url, alias })}
					disabled={
						!url.length ||
						!alias.length ||
						aliasAlreadyExists() ||
						urlAlreadyExists() ||
						!!getUrlError(t)
					}
				>
					{t('onboarding.custom-mode.settings.modals.buttons.add')}
				</PrimaryButton>
			</View>
		</View>
	)
}
