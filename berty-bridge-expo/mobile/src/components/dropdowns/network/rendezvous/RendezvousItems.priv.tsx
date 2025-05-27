import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { DividerItem } from '@berty/components/items'
import { BottomModal } from '@berty/components/modals'
import { AccordionAdd } from '@berty/components/modals/AccordionAdd.modal'
import { AccordionEdit } from '@berty/components/modals/AccordionEdit.modal'
import { useAppDispatch, useAppSelector } from '@berty/hooks'
import {
	addToRendezvous,
	modifyFromRendezvous,
	removeFromRendezvous,
	selectRendezvous,
	toggleFromRendezvous,
} from '@berty/redux/reducers/networkConfig.reducer'
import * as testIDs from '@berty/utils/testing/testIDs.json'

import { AddButtonPriv } from '../AddButton.priv'
import { MenuToggleWithEditPriv } from '../MenuToggleWithEdit.priv'

export const RendezvousItemsPriv = () => {
	const dispatch = useAppDispatch()
	const { t } = useTranslation()
	const rendezvous = useAppSelector(selectRendezvous)
	const [isVisible, setIsVisible] = useState<boolean>(false)
	const [isEdit, setIsEdit] = useState<{
		alias: string
		url: string
	} | null>(null)

	return (
		<>
			{(rendezvous || []).map(({ alias, url, isEnabled, isEditable }, index) => (
				<View key={`rendezvous-item-${index}`}>
					<DividerItem />
					<MenuToggleWithEditPriv
						isToggleOn={isEnabled}
						onPress={() => dispatch(toggleFromRendezvous(url))}
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
			<AddButtonPriv testID={testIDs['rdvp-button']} onPress={() => setIsVisible(true)} />
			<BottomModal isVisible={isVisible} setIsVisible={setIsVisible}>
				{isEdit ? (
					<AccordionEdit
						title={t('onboarding.custom-mode.settings.modals.edit.title.rdvp')}
						onEdit={data => {
							dispatch(modifyFromRendezvous({ url: isEdit.url, changes: data }))
							setIsVisible(false)
						}}
						onDelete={() => {
							dispatch(removeFromRendezvous(isEdit.url))
							setIsVisible(false)
						}}
						defaultAlias={isEdit.alias}
						defaultUrl={isEdit.url}
						alreadyExistingUrls={rendezvous
							.map(({ url }) => url)
							.filter((url): url is string => url !== undefined)}
						alreadyExistingAliases={rendezvous
							.map(({ alias }) => alias)
							.filter((alias): alias is string => alias !== undefined)}
					/>
				) : (
					<AccordionAdd
						title={t('onboarding.custom-mode.settings.modals.add.title.rdvp')}
						onSubmit={data => {
							dispatch(addToRendezvous(data))
							setIsVisible(false)
						}}
						alreadyExistingAliases={rendezvous
							.map(({ alias }) => alias)
							.filter((alias): alias is string => alias !== undefined)}
						alreadyExistingUrls={rendezvous
							.map(({ url }) => url)
							.filter((url): url is string => url !== undefined)}
					/>
				)}
			</BottomModal>
		</>
	)
}
