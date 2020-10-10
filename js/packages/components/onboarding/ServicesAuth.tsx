import React from 'react'
import { Translation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'

import { servicesAuthViaDefault, useAccountServices } from '@berty-tech/store/services'
import { useMsgrContext } from '@berty-tech/store/hooks'

import SwiperCard from './SwiperCard'
import OnboardingWrapper from './OnboardingWrapper'

const ServicesAuthBody: React.FC<{ next: () => void }> = ({ next }) => {
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
					label='Recommended'
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

export const ServicesAuth: React.FC<{}> = () => {
	const { navigate } = useNavigation()

	return (
		<OnboardingWrapper>
			<ServicesAuthBody next={() => navigate('Onboarding.SetupFinished')} />
		</OnboardingWrapper>
	)
}

export default ServicesAuth
