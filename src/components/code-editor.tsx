// components/code-editor.tsx
"use client"

import Editor from "@monaco-editor/react"
import { useEffect, useState } from "react"

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  theme?: string
}

export default function CodeEditor({ code, onChange, theme }: CodeEditorProps) {
  const [editorTheme, setEditorTheme] = useState(theme === "dark" ? "vs-dark" : "vs-light")

  // Update editor theme when the app theme changes
  useEffect(() => {
    setEditorTheme(theme === "dark" ? "vs-dark" : "vs-light")
    console.log("Editor theme set to:", theme === "dark" ? "vs-dark" : "vs-light")
  }, [theme])

  return (
    <div className="flex-1 p-4">
      <Editor
        height="100%"
        language="python"
        value={code}
        onChange={(value) => onChange(value ?? "")}
        theme={editorTheme}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  )
}
