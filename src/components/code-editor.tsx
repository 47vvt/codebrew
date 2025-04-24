import { useEffect, useRef } from "react"

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
}

export default function CodeEditor({ code, onChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" && document.activeElement === editorRef.current) {
        e.preventDefault()

        const textarea = editorRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        // Insert tab at cursor position
        const newValue = textarea.value.substring(0, start) + "  " + textarea.value.substring(end)
        textarea.value = newValue

        // Move cursor after the inserted tab
        textarea.selectionStart = textarea.selectionEnd = start + 2

        // Trigger onChange
        onChange(newValue)
      }
    }

    document.addEventListener("keydown", handleTabKey)
    return () => document.removeEventListener("keydown", handleTabKey)
  }, [onChange])

  return (
    <div className="flex-1 p-4 font-mono">
      <textarea
        ref={editorRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-4 bg-background border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        spellCheck="false"
      />
    </div>
  )
}
