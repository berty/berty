package parser

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
)

func (p *Parser) saveSessionFile(s *Session) error {
	content, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return err
	}
	content = append(content, '\n')

	path := filepath.Join(p.sessionPath, fmt.Sprintf("%s.json", s.ID))

	return ioutil.WriteFile(path, content, 0644)
}

func (p *Parser) restoreSessionFile(sessionID string) (*Session, error) {
	s := &Session{}
	path := filepath.Join(p.sessionPath, fmt.Sprintf("%s.json", sessionID))
	content, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	if err = json.Unmarshal(content, &s); err != nil {
		return nil, err
	}

	return s, nil
}

func (p *Parser) deleteSessionFile(sessionID string) error {
	path := filepath.Join(p.sessionPath, fmt.Sprintf("%s.json", sessionID))
	return os.Remove(path)
}

type SessionsIndex struct {
	Index []string `json:"index"`
}

func (p *Parser) saveSessionsIndexFile() error {
	index := &SessionsIndex{}
	for pair := p.sessions.Oldest(); pair != nil; pair = pair.Next() {
		index.Index = append(index.Index, pair.Key.(string))
	}

	content, err := json.MarshalIndent(index, "", "  ")
	if err != nil {
		return err
	}
	content = append(content, '\n')

	path := filepath.Join(p.sessionPath, "sessions.json")

	return ioutil.WriteFile(path, content, 0644)
}

func (p *Parser) restoreSessionsIndexFile() ([]string, error) {
	path := filepath.Join(p.sessionPath, "sessions.json")
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil, nil
	}

	content, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	index := &SessionsIndex{}
	if err = json.Unmarshal(content, index); err != nil {
		return nil, err
	}

	return index.Index, nil
}
