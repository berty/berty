import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { DividerItem } from '@berty/components/items'
import { AccordionAdd } from '@berty/components/modals/AccordionAdd.modal'
import { AccordionEdit } from '@berty/components/modals/AccordionEdit.modal'
import { useModal } from '@berty/contexts/modal.context'
import { useAppDispatch, useAppSelector } from '@berty/hooks'
import {
	addToRendezvous,
	modifyFromRendezvous,
	removeFromRendezvous,
	selectRendezvous,
	toggleFromRendezvous,
} from '@berty/redux/reducers/networkConfig.reducer'

import { AddButtonPriv } from '../AddButton.priv'
import { MenuToggleWithEditPriv } from '../MenuToggleWithEdit.priv'

export const RendezvousItemsPriv = () => {
	const dispatch = useAppDispatch()
	const { hide, show } = useModal()
	const { t } = useTranslation()
	const rendezvous = useAppSelector(selectRendezvous)

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
								? () =>
										show(
											<AccordionEdit
												title={t('onboarding.custom-mode.settings.modals.edit.title.rdvp')}
												onEdit={data => {
													dispatch(modifyFromRendezvous({ url, changes: data }))
													hide()
												}}
												onDelete={() => {
													dispatch(removeFromRendezvous(url))
													hide()
												}}
												defaultAlias={alias}
												defaultUrl={url}
												alreadyExistingUrls={rendezvous
													.map(({ url }) => url)
													.filter((url): url is string => url !== undefined)}
												alreadyExistingAliases={rendezvous
													.map(({ alias }) => alias)
													.filter((alias): alias is string => alias !== undefined)}
											/>,
										)
								: undefined
						}
					>
						{alias}
					</MenuToggleWithEditPriv>
				</View>
			))}
			<DividerItem />
			<AddButtonPriv
				onPress={() =>
					show(
						<AccordionAdd
							title={t('onboarding.custom-mode.settings.modals.add.title.rdvp')}
							onSubmit={data => {
								dispatch(addToRendezvous(data))
								hide()
							}}
							alreadyExistingAliases={rendezvous
								.map(({ alias }) => alias)
								.filter((alias): alias is string => alias !== undefined)}
							alreadyExistingUrls={rendezvous
								.map(({ url }) => url)
								.filter((url): url is string => url !== undefined)}
						/>,
					)
				}
			/>
		</>
	)
}
