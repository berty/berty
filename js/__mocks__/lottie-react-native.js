import React from 'react'
import { SHA3 } from 'sha3'

// This mocks is to reduce snapshots size and make them more readable

const LottieViewMock = 'LottieViewMock'
LottieViewMock.ReactComponent = 'LottieViewMock'

const Wrapper = ({ source, ...props }) => {
	const hash = new SHA3(256)
	hash.update(JSON.stringify(source))
	return <LottieViewMock {...props} sourceHash={hash.digest('base64')} />
}

module.exports = Wrapper
