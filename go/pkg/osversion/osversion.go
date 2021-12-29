package osversion

import "fmt"

type version struct {
	major int
	minor int
	patch int
}

type Version interface {
	Major() int
	Minor() int
	Patch() int
	Full() string
}

func (v *version) Major() int { return v.major }
func (v *version) Minor() int { return v.minor }
func (v *version) Patch() int { return v.patch }

func (v *version) Full() string {
	if v.major >= 0 {
		if v.minor >= 0 {
			if v.patch >= 0 {
				return fmt.Sprintf("%d.%d.%d", v.major, v.minor, v.patch)
			}
			return fmt.Sprintf("%d.%d", v.major, v.minor)
		}
		return fmt.Sprintf("%d", v.major)
	}
	return ""
}
