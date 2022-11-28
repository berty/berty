import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { DividerItem } from '@berty/components/items'
import { BottomModal } from '@berty/components/modals'
import { AccordionAdd } from '@berty/components/modals/AccordionAdd.modal'
import { AccordionEdit } from '@berty/components/modals/AccordionEdit.modal'
import { useAppDispatch, useAppSelector } from '@berty/hooks'
import {
	addToBootstrap,
	modifyFromBootstrap,
	removeFromBootstrap,
	selectBootstrap,
	toggleFromBootstrap,
} from '@berty/redux/reducers/networkConfig.reducer'
import * as testIDs from '@berty/utils/testing/testIDs.json'

import { AddButtonPriv } from '../AddButton.priv'
import { MenuToggleWithEditPriv } from '../MenuToggleWithEdit.priv'

export const BootstrapItemsPriv = () => {
	const dispatch = useAppDispatch()
	const { t } = useTranslation()
	const bootstrap = useAppSelector(selectBootstrap)
	const [isVisible, setIsVisible] = useState<boolean>(false)
	const [isEdit, setIsEdit] = useState<{
		alias: string
		url: string
	} | null>(null)

	return (
		<>
			{(bootstrap || []).map(({ alias, url, isEnabled, isEditable }, index) => (
				<View key={`bootstrap-item-${index}`}>
					<DividerItem />
					<MenuToggleWithEditPriv
						isToggleOn={isEnabled}
						onPress={() => dispatch(toggleFromBootstrap(url))}
						onPressModify={
							isEditable
								? () => {
										setIsVisible(true)
										setIsEdit({ alias: alias || '', url })
								  }
								: undefined
						}
					>
						{alias}
					</MenuToggleWithEditPriv>
				</View>
			))}
			<DividerItem />
			<AddButtonPriv testID={testIDs['bootstrap-button']} onPress={() => setIsVisible(true)} />
			<BottomModal isVisible={isVisible} setIsVisible={setIsVisible}>
				{isEdit ? (
					<AccordionEdit
						title={t('onboarding.custom-mode.settings.modals.edit.title.bootstrap')}
						onEdit={data => {
							dispatch(modifyFromBootstrap({ url: isEdit.url, changes: data }))
							setIsVisible(false)
						}}
						onDelete={() => {
							dispatch(removeFromBootstrap(isEdit.url))
							setIsVisible(false)
						}}
						defaultAlias={isEdit.alias}
						defaultUrl={isEdit.url}
						alreadyExistingUrls={bootstrap
							.map(({ url }) => url)
							.filter((url): url is string => url !== undefined)}
						alreadyExistingAliases={bootstrap
							.map(({ alias }) => alias)
							.filter((alias): alias is string => alias !== undefined)}
					/>
				) : (
					<AccordionAdd
						title={t('onboarding.custom-mode.settings.modals.add.title.bootstrap')}
						onSubmit={data => {
							dispatch(addToBootstrap(data))
							setIsVisible(false)
						}}
						alreadyExistingAliases={bootstrap
							.map(({ alias }) => alias)
							.filter((alias): alias is string => alias !== undefined)}
						alreadyExistingUrls={bootstrap
							.map(({ url }) => url)
							.filter((url): url is string => url !== undefined)}
					/>
				)}
			</BottomModal>
		</>
	)
}
