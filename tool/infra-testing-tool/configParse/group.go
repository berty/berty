package configParse

type Group struct {
	Name string `yaml:"name"`
}

func (c Node) parseGroups() {
	for _, group := range c.Groups {
		groups[group.Name] = group
	}
}
