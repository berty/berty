package templates

import (
	_ "embed"
	"html/template"
)

//go:embed identifier_input.go.tmpl
var templateIdentifierInputRaw string

//go:embed confirmation_input.go.tmpl
var templateConfirmationInputRaw string

//go:embed redirect.html.tmpl
var templateRedirectRaw string

// pls linter stop reordering things
var (
	TemplateIdentifierInput   = template.Must(template.New("identifierInput").Parse(templateIdentifierInputRaw))
	TemplateConfirmationInput = template.Must(template.New("confirmationInput").Parse(templateConfirmationInputRaw))
	TemplateRedirect          = template.Must(template.New("redirectTemplate").Parse(templateRedirectRaw))
)

type TemplateParamsConfirmation struct {
	Context          string
	Code             string
	CodeLabel        string
	CodePlaceholder  string
	CodeSubmitButton string
	PageTitle        string
	FormErrors       []string
}

type TemplateParamsIdentifier struct {
	Context                string
	PageTitle              string
	Identifier             string
	IdentifierLabel        string
	IdentifierPlaceholder  string
	IdentifierSubmitButton string
	FormErrors             []string
}

type TemplateParamsRedirect struct {
	URI string
}
