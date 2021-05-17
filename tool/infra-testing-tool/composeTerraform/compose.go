package composeTerraform

import (
	"bytes"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"reflect"
	"text/template"
)

const (
	ErrNoTemplatesForComponent = "no templates found for component"
)

type HCLComponent interface {
	Validate() (HCLComponent, error)
	GetTemplates() []string
	GetType() string
}

type HCLShell interface {
	Validate() (HCLShell, error)
}

func ToHCL(comp HCLComponent) (s string, err error) {

	// Validate
	comp, err  = comp.Validate()
	if err != nil {
		return s, err
	}

	// convert struct to map[string]interface{}
	v := reflect.ValueOf(comp)
	values := make(map[string]interface{}, v.NumField())
	for i := 0; i < v.NumField(); i++ {
		if v.Field(i).CanInterface() {
			values[v.Type().Field(i).Name] = v.Field(i).Interface()
		}
	}

	templates := comp.GetTemplates()
	if len(templates) < 1 {
		return s, errors.New(ErrNoTemplatesForComponent)
	}

	for _, temp := range templates {
		t := template.Must(template.New("").Parse(temp))
		buf := &bytes.Buffer{}
		err = t.Execute(buf, values)
		if err != nil {
			return s, err
		}

		s += buf.String()
	}

	return s, err
}

func GenerateName(prefix string) string {
	return fmt.Sprintf("%s-%s", prefix, uuid.NewString())
}

func ParseShell(s HCLShell) {
}
