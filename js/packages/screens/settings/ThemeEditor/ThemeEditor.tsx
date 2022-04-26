import React from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '@ui-kitten/components'
import { Platform, ScrollView, StatusBar, View } from 'react-native'
import Share from 'react-native-share'
import DocumentPicker from 'react-native-document-picker'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor, createAndSaveFile } from '@berty/store'
import { ScreenFC } from '@berty/navigation'
import RNFS from 'react-native-fs'
import { withInAppNotification } from 'react-native-in-app-notification'

import { ButtonSetting } from '@berty/components/shared-components'
import { DropDownPicker } from '@berty/components/shared-components/DropDownPicker'
import { ThemeColorName } from './components/ThemeColorName'
import { useDispatch, useSelector } from 'react-redux'
import {
	deleteAddedThemes,
	importTheme,
	randomizeTheme,
	selectCurrentTheme,
	selectThemeCollectionAsItem,
	selectThemeSelected,
	setTheme,
} from '@berty/redux/reducers/theme.reducer'
import { getPath } from '@berty/rnutil/getPath'

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
			<ButtonSetting
				name={t('settings.theme-editor.import')}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
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
			/>
			<ButtonSetting
				name={
					Platform.OS === 'android'
						? t('settings.theme-editor.export')
						: t('settings.theme-editor.share')
				}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
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
			/>
			{Platform.OS === 'android' ? (
				<ButtonSetting
					name={t('settings.theme-editor.share')}
					icon='color-palette-outline'
					iconSize={30}
					iconColor={colors['alt-secondary-background-header']}
					actionIcon={null}
					onPress={async () => {
						await shareColorTheme(selectedTheme)
					}}
				/>
			) : null}
			<ButtonSetting
				name={t('settings.theme-editor.delete')}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
				onPress={() => {
					dispatch(deleteAddedThemes())
				}}
			/>
		</View>
	)
})

const BodyThemeEditor: React.FC<{ openModal: () => void }> = ({ openModal }) => {
	const colors = useThemeColor()
	const { padding } = useStyles()
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const items = useSelector(selectThemeCollectionAsItem)
	const currentTheme = useSelector(selectCurrentTheme)

	return (
		<View style={[padding.medium, { flex: 1 }]}>
			<ButtonSetting
				name={t('settings.theme-editor.randomize')}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
				onPress={() => {
					dispatch(randomizeTheme())
				}}
			/>
			<ButtonSetting
				name={t('settings.theme-editor.save')}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
				onPress={() => openModal()}
			/>
			<DropDownPicker
				items={items}
				mode={'themeCollection'}
				defaultValue={currentTheme}
				onChangeItem={async (item: any) => {
					dispatch(setTheme({ themeName: item.label }))
				}}
			/>
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
