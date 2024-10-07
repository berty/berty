package bertyvcissuer

import (
	"encoding/base64"
	"fmt"

	weshnet_vc "berty.tech/weshnet/v2/pkg/bertyvcissuer"
)

func makeAuthenticateURL(serverBaseRoot, flowCtxStr string) string {
	return fmt.Sprintf("%s%s?%s=%s", serverBaseRoot, weshnet_vc.PathAuthenticate, weshnet_vc.ParamContext, flowCtxStr)
}

func makeProofURL(serverBaseRoot, flowCtxStr string) string {
	return fmt.Sprintf("%s%s?%s=%s", serverBaseRoot, weshnet_vc.PathProof, weshnet_vc.ParamContext, flowCtxStr)
}

func makeRedirectSuccessURI(redirectURI, state string, credentials []byte) string {
	return fmt.Sprintf("%s%s?%s=%s&%s=%s", redirectURI, weshnet_vc.PathProof, weshnet_vc.ParamState, state, weshnet_vc.ParamCredentials, base64.URLEncoding.EncodeToString(credentials))
}
