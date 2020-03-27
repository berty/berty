package banner

import (
	"fmt"
	"strings"
)

const (
	startLine    = 2
	stopLine     = 5
	startColumn  = 26
	stopColumn   = 72
	totalLines   = stopLine - startLine + 1
	totalColumns = stopColumn - startColumn + 1
)

const Banner = `
          /\
     /\  / /\  ______
    / /\/ /  \/  |   \
   | |  \/   | ()|    |
    \ \      |   |____|
     \ \      \____/ __           __
      \/       /    / /  ___ ____/ /___ __
      /     __/    / _ \/ -_) __/ __/ // /
     /_____/      /____/\__/_/  \__/\__ /
    /__/                           /___/
`

// Say returns an ascii-art representation of the Berty bird saying something
func Say(message string) string {
	ml := strings.Split(wordwrap(message, stopColumn-startColumn), "\n")
	// append empty line at the top for short quotes
	if len(ml) > totalLines {
		line := ml[totalLines-1]
		if len(line) >= totalColumns-6 {
			line = line[:totalColumns-6]
		}
		ml[totalLines-1] = line + " [...]"
	}
	for i := 0; i < (totalLines-len(ml))/2; i++ {
		ml = append([]string{""}, ml...)
	}

	bl := strings.Split(Banner, "\n")
	output := []string{}
	j := 0
	for i := 0; i < len(bl); i++ {
		if i >= startLine && i <= stopLine {
			left := bl[i]
			if missing := startColumn - len(bl[i]); missing > 0 {
				left += strings.Repeat(" ", missing)
			}
			right := ""
			if j < len(ml) {
				right = ml[j]
				j++
				if missing := totalColumns - len(right); missing/2 > 1 {
					right = strings.Repeat(" ", missing/2) + right
				}
			}
			line := fmt.Sprintf("%s%s", left, right)
			output = append(output, strings.TrimRight(line, " "))
		} else {
			output = append(output, bl[i])
		}
	}
	return strings.Join(output, "\n") + "\n"
}

// OfTheDay returns the ascii-art representation of the Berty bird saying the quote of the day
func OfTheDay() string {
	q := QOTD()
	return Say(q.String())
}

func wordwrap(text string, lineWidth int) string {
	words := strings.Fields(strings.TrimSpace(text))
	if len(words) == 0 {
		return text
	}
	wrapped := words[0]
	spaceLeft := lineWidth - len(wrapped)
	for _, word := range words[1:] {
		if len(word)+1 > spaceLeft {
			wrapped += "\n" + word
			spaceLeft = lineWidth - len(word)
		} else {
			wrapped += " " + word
			spaceLeft -= 1 + len(word)
		}
	}

	return wrapped
}
