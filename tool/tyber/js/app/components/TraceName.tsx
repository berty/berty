
import React, { useMemo } from "react";
import { ColorValue } from "react-native";
import { Text } from "@ui-kitten/components";

const wellKnownTraceNamePrefixes: { [key: string]: string | { color?: ColorValue, replacement?: string, suffix?: string } } = {
    "Received Account": {
        color: "green",
        replacement: "🤵 Received",
        suffix: " Account"
    },
    "Updating account": "🤵 Updating account",
    "Received": {
        color: "green",
        replacement: "⬇️ Received"
    },
    "Sending": {
        color: "red",
        replacement: "⏫ Sending"
    },
    "Interact": "✋ Interact",
    "Initializing": "🏠 Initializing",
    "Closing": "🚽 Closing",
    "Subscribing": "📜 Subscribing",
    "Requesting contact": {
        color: "red",
        replacement: "🙋 Requesting",
        suffix: " contact"
    },
    "Responding to contact request": {
        color: "green",
        replacement: "🙋 Responding",
        suffix: " to contact request"
    }
}


const isUpperCase = (s: string) => {
    if (s.length <= 0) {
        return false
    }
    return s[0] === s[0].toUpperCase()
}

const EvenOddText: React.FC<{ value: string, eva?: any }> = ({ value, eva }) => {
    const theme = eva?.theme || {}
    return useMemo(() => {
        const evenOddColor = (index: number) => {
            const even = index % 2 === 0
            return even ? theme["text-basic-color"] : theme["text-disabled-color"]
        }

        // FIXME: handle numbers, special symbols and all cap words
        let parts = []
        let first = true
        let wordIndex = 0
        for (const word of value.split(" ")) {
            if (first) {
                first = false
            } else {
                parts.push(" ")
            }
            if (word.length > 2 && isUpperCase(word)) {
                let subwordStart = 0
                let subwordIndex = 0
                for (let i = 1; i < word.length; i++) {
                    if (isUpperCase(word[i]) && !isUpperCase(word[i - 1])) {
                        const subwordLen = (i - subwordStart)
                        parts.push(<Text style={{ color: evenOddColor(subwordIndex), }}>{word.substr(subwordStart, subwordLen)}</Text>)
                        subwordStart = i
                        subwordIndex++
                    }
                }
                parts.push(<Text style={{ color: evenOddColor(subwordIndex), }}>{word.substr(subwordStart)}</Text>)
            } else {
                parts.push(word)
            }
            wordIndex++
        }
        return <Text>{parts.map((part, index) => <Text key={index}>{part}</Text>)}</Text>
    }, [value, theme])
}

const TraceName: React.FC<{ traceName: string, eva?: any }> = ({ eva, traceName }) => {
    return useMemo(() => {
        for (const [key, value] of Object.entries(wellKnownTraceNamePrefixes)) {
            if (traceName.startsWith(key)) {
                const remains = traceName.substr(key.length)
                if (typeof value == "string") {
                    return <EvenOddText eva={eva} value={value + remains} />
                } else if (typeof value == "object") {
                    const suffix = value.suffix || ""
                    if (!value.color) {
                        return <EvenOddText eva={eva} value={value.replacement || key + remains + suffix} />
                    }
                    return <><Text style={{ color: value.color }}>{value.replacement || key}</Text><EvenOddText eva={eva} value={suffix + remains} /></>
                }
            }
        }
        return <EvenOddText eva={eva} value={traceName} />
    }, [traceName, eva])
}

export default TraceName