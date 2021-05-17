package configParse

var groups = make(map[string]Group)

type Group struct {
	Name string `yaml:"name"`
}

func (n Node) ParseGroups() {
	for _, group := range n.Groups {
		groups[group.Name] = group
	}
}
