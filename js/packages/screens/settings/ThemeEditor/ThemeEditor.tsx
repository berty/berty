import { Layout } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, StatusBar, View } from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import RNFS from 'react-native-fs'
import { withInAppNotification } from 'react-native-in-app-notification'
import Share from 'react-native-share'
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
import { createAndSaveFile, getPath } from '@berty/utils/react-native/file-system'

import { ThemeColorName } from './components/ThemeColorName'

const openThemeColorFile = async () => {
	try {
		return await DocumentPicker.pickSingle({
			type: DocumentPicker.types.allFiles,
		})
	} catch (err: any) {
		if (DocumentPicker.isCancel(err)) {
			// ignore
		} else {
			console.warn(err)
		}
	}
}

const importColorThemeFileFromStorage = async (uri: string): Promise<string> => {
	const file = Platform.OS === 'android' ? await getPath(uri) : uri
	const theme = await RNFS.readFile(file.replace(/^file:\/\//, ''), 'utf8')
	return theme
}

const shareColorTheme = async (fileName: string) => {
	const outFile = RNFS.TemporaryDirectoryPath + `/${fileName}` + '.json'
	await Share.open({
		title: 'Berty theme',
		url: `file://${outFile}`,
		type: '*/*',
	})
}

const exportColorThemeToFile = async (themeColor: any, fileName: string): Promise<void> => {
	const outFile = RNFS.TemporaryDirectoryPath + `/${fileName}` + '.json'
	await RNFS.writeFile(outFile, themeColor, 'utf8')
	Platform.OS === 'android'
		? await createAndSaveFile(outFile, fileName, 'json')
		: await shareColorTheme(fileName)
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
						const themeColors = JSON.parse(await importColorThemeFileFromStorage(document.uri))
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
					await exportColorThemeToFile(JSON.stringify(colors), selectedTheme)
					if (Platform.OS === 'android') {
						showNotification({
							title: t('settings.theme-editor.notification-file-saved.title'),
							message: t('settings.theme-editor.notification-file-saved.desc'),
							additionalProps: { type: 'message' },
						})
					}
				}}
			>
				{Platform.OS === 'android'
					? t('settings.theme-editor.export')
					: t('settings.theme-editor.share')}
			</FloatingMenuItemWithIcon>
			{Platform.OS === 'android' && (
				<FloatingMenuItemWithIcon
					iconName='color-palette-outline'
					onPress={async () => shareColorTheme(selectedTheme)}
				>
					{t('settings.theme-editor.share')}
				</FloatingMenuItemWithIcon>
			)}
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
