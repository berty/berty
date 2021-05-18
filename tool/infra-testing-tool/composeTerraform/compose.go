package composeTerraform

import (
	"bytes"
	"fmt"
	"github.com/google/uuid"
	"reflect"
	"text/template"
)

type Component interface {
	// Validate needs to return HCLComponent as you can't implement on a pointer receiver
	Validate() (Component, error)
	GetTemplate() string
	GetType() string
}

type HCLShell interface {
	Validate() (HCLShell, error)
}

func ToHCL(comp Component) (s string, err error) {

	// Validate
	comp, err = comp.Validate()
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

	t := template.Must(template.New("").Parse(comp.GetTemplate()))
	buf := &bytes.Buffer{}
	err = t.Execute(buf, values)
	if err != nil {
		return s, err
	}

	s += buf.String()

	return s, err
}

func GenerateName(prefix string) string {
	return fmt.Sprintf("%s-%s", prefix, uuid.NewString())
}
