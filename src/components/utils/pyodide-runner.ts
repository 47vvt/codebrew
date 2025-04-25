import { loadPyodideAndPackages } from "./pyodide-loader"

let pyodide: any = null

export async function runPython(code: string): Promise<string> {
  if (!pyodide) {
    pyodide = await loadPyodideAndPackages()
  }

  let output = ""

  pyodide.setStdout({
    raw: (text: string | number) => {
      const char = typeof text === 'number' ? String.fromCharCode(text) : text
      output += char;
    }
  })

  try {
    await pyodide.runPythonAsync(code)
    return output
  } catch (err) {
    return `Error: ${err}`
  }
}
