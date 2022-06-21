package bertyvcissuer

import (
	"encoding/base64"
	"fmt"
)

const (
	PathChallenge    = "/challenge"
	PathAuthenticate = "/authenticate"
	PathProof        = "/proof"

	ParamBertyID      = "berty_id"
	ParamState        = "state"
	ParamRedirectURI  = "redirect_uri"
	ParamChallenge    = "challenge"
	ParamChallengeSig = "challenge_sig"
	ParamCode         = "code"
	ParamContext      = "context"
	ParamCredentials  = "credentials"
	ParamIdentifier   = "identifier"
)

func makeAuthenticateURL(serverBaseRoot, flowCtxStr string) string {
	return fmt.Sprintf("%s%s?%s=%s", serverBaseRoot, PathAuthenticate, ParamContext, flowCtxStr)
}

func makeProofURL(serverBaseRoot, flowCtxStr string) string {
	return fmt.Sprintf("%s%s?%s=%s", serverBaseRoot, PathProof, ParamContext, flowCtxStr)
}

func makeRedirectSuccessURI(redirectURI, state string, credentials []byte) string {
	return fmt.Sprintf("%s%s?%s=%s&%s=%s", redirectURI, PathProof, ParamState, state, ParamCredentials, base64.URLEncoding.EncodeToString(credentials))
}
