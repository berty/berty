import React from 'react'
import { Translation } from 'react-i18next'

import { servicesAuthViaDefault, useAccountServices } from '@berty-tech/store/services'
import { useMsgrContext } from '@berty-tech/store/hooks'

import SwiperCard from './SwiperCard'

const ServicesAuth: React.FC<{ next: () => void }> = ({ next }) => {
	const ctx = useMsgrContext()
	const accountServices = useAccountServices() || []

	React.useEffect(() => {
		if (accountServices.length > 0) {
			next()
		}
	}, [next, accountServices.length])

	return (
		<Translation>
			{(t) => (
				<SwiperCard
					header={'Authenticate to services'}
					label={t('onboarding.notifications.recommended')}
					title={t('Services')}
					description={'This will automatically replicate your conversations on a server'}
					button={
						accountServices.length > 0
							? undefined
							: {
									text: 'Use Berty operated services',
									onPress: async () => {
										await servicesAuthViaDefault(ctx)
									},
							  }
					}
					skip={{
						text: t('onboarding.notifications.skip'),
						onPress: next,
					}}
				/>
			)}
		</Translation>
	)
}

export default ServicesAuth
