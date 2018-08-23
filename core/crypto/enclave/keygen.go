package enclave

// Not exported outside the package. Caller only interact using ID
type keyPair struct {
	privKey  interface{}
	pubKey   interface{}
	keyType  KeyType
	keyStore KeyStore
}

/*
// NewKeyPair generate software or enclave key pair according to the parameters
func NewKeyPair(options KeyOpts) (keyID string, err error) {
	useSoftware := options.Store == Software

	// Check if type and store parameters are correct
	if options.Store != Enclave && options.Store != Software {
		return "", errors.New("wrong KeyOpts.Store parameter")
	} else if options.Type != RSA2048 && options.Type != ECC256 {
		return "", errors.New("wrong KeyOpts.Type parameter")
	}

	// Try to generate enclave key pair if requested
	if options.Store == Enclave {
		keyID, err = newKeyPairEnclave(options)
		if err != nil {
			zap.L().Warn("failed to use hardware enclave", zap.Error(err))
			useSoftware = options.StoreFallback
		}
	}

	// Try to generate software key pair if requested or
	// if enclave generation failed and fallback is allowed
	if useSoftware {
		keyID, err = newKeyPairSoftware(options)
	}

	return
}

// Generate software key pair using the function corresponding to the key type (ECC or RSA)
func newKeyPairSoftware(options KeyOpts) (keyID string, err error) {
	if options.Type == RSA2048 {
		keyID, err = newKeyPairSoftwareRSA(options)
		if err != nil && options.TypeFallback {
			zap.L().Debug("fallback to ECC-256 key pair generation", zap.Error(err))
			keyID, err = newKeyPairSoftwareECC(options)
		}
	} else {
		keyID, err = newKeyPairSoftwareECC(options)
		if err != nil && options.TypeFallback {
			zap.L().Debug("fallback to RSA-2048 key pair generation", zap.Error(err))
			keyID, err = newKeyPairSoftwareRSA(options)
		}
	}

	return
}


// Generate a random ECC-256 key pair then return the corresponding ID
func newKeyPairSoftwareECC(options KeyOpts) (keyID string, err error) {
	return "", errors.New("ECC-256 key generation not implemented yet")
}
*/
