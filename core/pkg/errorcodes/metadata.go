package errorcodes

func (m *Metadata) IsEmpty() bool {
	return m.Code == 0 &&
		len(m.ExtendedCodes) == 0 &&
		len(m.Placeholders) == 0 &&
		m.Parent == nil
}

func (m *Metadata) Extensions() map[string]interface{} {
	ext := map[string]interface{}{
		"code": m.Code,
		// "message":       m.Message,
		"placeholders":  m.Placeholders,
		"extendedCodes": m.ExtendedCodes,
	}
	if m.Parent != nil {
		ext["parent"] = m.Parent.Extensions()
	}
	return ext
}
