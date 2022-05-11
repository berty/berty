package iac

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

// ToHCL converts the component to an HCL compatible string
// https://github.com/hashicorp/hcl
func ToHCL(comp Component) (_ Component, s string, err error) {

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
		return comp, s, err
	}

	s += buf.String()

	return comp, s, err
}

// GenerateName generates a name based off a UUID
func GenerateName(prefix string) string {
	return fmt.Sprintf("%s-%s", prefix, uuid.NewString()[:8])
}
