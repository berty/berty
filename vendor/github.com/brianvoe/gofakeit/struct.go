package gofakeit

import (
	"reflect"
)

// Struct fills in exported elements of a struct with random data
// based on the value of `fake` tag of exported elements.
// Use `fake:"skip"` to explicitly skip an element.
// All built-in types are supported, with templating support
// for string types.
func Struct(v interface{}) {
	r(reflect.TypeOf(v), reflect.ValueOf(v), "")
}

func r(t reflect.Type, v reflect.Value, template string) {
	switch t.Kind() {
	case reflect.Ptr:
		elemT := t.Elem()
		if v.IsNil() {
			nv := reflect.New(elemT)
			r(elemT, nv.Elem(), template)
			v.Set(nv)
		} else {
			r(elemT, v.Elem(), template)
		}
	case reflect.Struct:
		n := t.NumField()
		for i := 0; i < n; i++ {
			elementT := t.Field(i)
			elementV := v.Field(i)
			fake := true
			t, ok := elementT.Tag.Lookup("fake")
			if ok && t == "skip" {
				fake = false
			}
			if fake && elementV.CanSet() {
				r(elementT.Type, elementV, t)
			}
		}
	case reflect.String:
		if template != "" {
			r := Generate(template)
			v.SetString(r)
		} else {
			v.SetString(Generate("???????????????????"))
			// we don't have a String(len int) string function!!
		}
	case reflect.Int:
		v.SetInt(int64(Int64()))
	case reflect.Int8:
		v.SetInt(int64(Int8()))
	case reflect.Int16:
		v.SetInt(int64(Int16()))
	case reflect.Int32:
		v.SetInt(int64(Int32()))
	case reflect.Int64:
		v.SetInt(int64(Int64()))
	case reflect.Float64:
		v.SetFloat(Float64())
	case reflect.Float32:
		v.SetFloat(float64(Float32()))
	case reflect.Bool:
		v.SetBool(Bool())
	}
}
