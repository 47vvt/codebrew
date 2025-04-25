// components/code-editor.tsx

import Editor from "@monaco-editor/react"

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
}

export default function CodeEditor({ code, onChange }: CodeEditorProps) {
  return (
    <div className="flex-1 p-4">
      <Editor
        height="100%"
        language="python"
        value={code}
        onChange={(value) => onChange(value ?? "")}
        theme="vs-light"
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
