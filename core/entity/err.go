package entity

func (e *Err) Error() string {
	return e.ErrMsg
}
