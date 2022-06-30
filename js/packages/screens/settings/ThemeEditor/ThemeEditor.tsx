import { Layout } from '@ui-kitten/components'
import { cacheDirectory, readAsStringAsync, writeAsStringAsync } from 'expo-file-system'
import { shareAsync } from 'expo-sharing'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, StatusBar, View } from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import { withInAppNotification } from 'react-native-in-app-notification'
import { useDispatch, useSelector } from 'react-redux'

import { TextualDropdown } from '@berty/components'
import { FloatingMenuItemWithIcon } from '@berty/components'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import {
	deleteAddedThemes,
	importTheme,
	randomizeTheme,
	selectCurrentTheme,
	selectThemeCollectionAsItem,
	selectThemeSelected,
	setTheme,
} from '@berty/redux/reducers/theme.reducer'

import { ThemeColorName } from './components/ThemeColorName'

const openThemeColorFile = async () => {
	try {
		return await DocumentPicker.pickSingle({
			type: Platform.OS === 'android' ? 'application/json' : 'public.json',
		})
	} catch (err: any) {
		if (DocumentPicker.isCancel(err)) {
			// ignore
		} else {
			console.warn(err)
		}
	}
}

const shareColorTheme = async (themeJSON: string, themeName: string): Promise<void> => {
	const outFile = `${cacheDirectory}${themeName}.json`
	await writeAsStringAsync(outFile, themeJSON)
	await shareAsync(outFile, {
		UTI: 'public.json',
		dialogTitle: `Berty ${themeName} theme`,
		mimeType: 'application/json',
	})
}

const BodyFileThemeEditor: React.FC<{}> = withInAppNotification(({ showNotification }: any) => {
	const colors = useThemeColor()
	const { t } = useTranslation()
	const selectedTheme = useSelector(selectThemeSelected)
	const dispatch = useDispatch()

	return (
		<View>
			<FloatingMenuItemWithIcon
				iconName='color-palette-outline'
				onPress={async () => {
					try {
						const document = await openThemeColorFile()
						if (!document) {
							return
						}
						const themeColors = JSON.parse(await readAsStringAsync(document.uri))
						const themeName = document.name.split('.')[0]
						dispatch(importTheme({ themeName, colors: themeColors }))
					} catch (err) {
						showNotification({
							title: t('settings.theme-editor.bad-format-title'),
							message: t('settings.theme-editor.bad-format-desc'),
							additionalProps: { type: 'message' },
						})
					}
				}}
			>
				{t('settings.theme-editor.import')}
			</FloatingMenuItemWithIcon>
			<FloatingMenuItemWithIcon
				iconName='color-palette-outline'
				onPress={async () => {
					await shareColorTheme(JSON.stringify(colors), selectedTheme)
				}}
			>
				{t('settings.theme-editor.share')}
			</FloatingMenuItemWithIcon>
			<FloatingMenuItemWithIcon
				iconName='color-palette-outline'
				onPress={() => dispatch(deleteAddedThemes())}
			>
				{t('settings.theme-editor.delete')}
			</FloatingMenuItemWithIcon>
		</View>
	)
})

const BodyThemeEditor: React.FC<{ openModal: () => void }> = ({ openModal }) => {
	const { padding, margin } = useStyles()
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const items = useSelector(selectThemeCollectionAsItem)
	const currentTheme = useSelector(selectCurrentTheme)

	return (
		<View style={[padding.medium, { flex: 1 }]}>
			<FloatingMenuItemWithIcon
				onPress={() => dispatch(randomizeTheme())}
				iconName='color-palette-outline'
			>
				{t('settings.theme-editor.randomize')}
			</FloatingMenuItemWithIcon>
			<FloatingMenuItemWithIcon onPress={openModal} iconName='color-palette-outline'>
				{t('settings.theme-editor.save')}
			</FloatingMenuItemWithIcon>
			<View style={[margin.top.medium]}>
				<TextualDropdown
					items={items}
					placeholder={currentTheme}
					onChangeItem={item => dispatch(setTheme({ themeName: item.label }))}
				/>
			</View>
			<BodyFileThemeEditor />
		</View>
	)
}

export const ThemeEditor: ScreenFC<'Settings.ThemeEditor'> = () => {
	const [isModal, setIsModal] = React.useState<boolean>(false)
	const colors = useThemeColor()

	return (
		<Layout style={{ backgroundColor: colors['main-background'], flex: 1 }}>
			<StatusBar
				backgroundColor={colors['alt-secondary-background-header']}
				barStyle='light-content'
			/>
			<ScrollView bounces={false}>
				<BodyThemeEditor openModal={() => setIsModal(true)} />
			</ScrollView>
			{isModal && <ThemeColorName closeModal={() => setIsModal(false)} />}
		</Layout>
	)
}
