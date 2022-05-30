package bertyvcissuer

import "berty.tech/berty/v2/go/pkg/verifiablecredstypes"

func CodeGeneratorZero(_ *verifiablecredstypes.StateCode) (string, error) {
	return "000000", nil
}
