import React, { FC, useCallback, useState } from 'react'
import { View } from 'react-native'

import Button from '@berty/components/onboarding/Button'
import { TextInput } from '@berty/components/shared-components/TextInput'
import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { useTranslation } from 'react-i18next'
import { multiaddr } from 'multiaddr'
import { UnifiedText } from '../shared-components/UnifiedText'

export const AccordionEdit: FC<{
	title: string
	onEdit: (data: { url: string; alias: string }) => void
	onDelete: () => void
	defaultAlias: string | null
	defaultUrl: string | null
	alreadyExistingAliases: string[]
	alreadyExistingUrls: string[]
}> = ({
	title,
	onEdit,
	onDelete,
	defaultAlias,
	alreadyExistingAliases,
	alreadyExistingUrls,
	defaultUrl,
}) => {
	const { margin, text } = useStyles()
	const colors = useThemeColor()
	const [alias, setAlias] = useState<string>(defaultAlias || '')
	const [url, setUrl] = useState<string>(defaultUrl || '')
	const { t } = useTranslation()

	const aliasAlreadyExists = useCallback(() => {
		if (alias === defaultAlias) {
			return false
		}
		return !!alreadyExistingAliases?.find(currentAlias => currentAlias === alias)
	}, [alias, alreadyExistingAliases, defaultAlias])

	const urlAlreadyExists = useCallback(() => {
		if (url === defaultUrl) {
			return
		}
		return !!alreadyExistingUrls?.find(currentUrl => currentUrl === url)
	}, [alreadyExistingUrls, defaultUrl, url])

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
			{title ? <UnifiedText style={[margin.medium, text.align.center]}>{title}</UnifiedText> : null}
			<TextInput
				autoCapitalize='none'
				autoCorrect={false}
				value={alias}
				onChangeText={setAlias}
				defaultValue={defaultAlias || ''}
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
				defaultValue={defaultUrl || ''}
				placeholder={t('onboarding.custom-mode.settings.modals.multiaddress')}
				containerStyle={[margin.horizontal.medium, margin.bottom.medium]}
				multiline
				error={getUrlError(t)}
			/>
			<View style={{ flexDirection: 'row' }}>
				<Button
					onPress={onDelete}
					status='secondary'
					style={[margin.bottom.medium, margin.left.medium, margin.right.small, { flex: 1 }]}
				>
					{t('onboarding.custom-mode.settings.modals.buttons.delete')}
				</Button>
				<Button
					onPress={() => onEdit({ url, alias })}
					style={[margin.bottom.medium, margin.right.medium, margin.left.small, { flex: 1 }]}
					disabled={
						!url.length ||
						!alias.length ||
						aliasAlreadyExists() ||
						urlAlreadyExists() ||
						!!getUrlError(t)
					}
				>
					{t('onboarding.custom-mode.settings.modals.buttons.edit')}
				</Button>
			</View>
		</View>
	)
}
