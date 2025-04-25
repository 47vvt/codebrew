import { loadPyodideAndPackages } from "./pyodide-loader"

let pyodide: any = null

export async function runPython(code: string): Promise<string> {
  if (!pyodide) {
    pyodide = await loadPyodideAndPackages()
  }

  let output = ""

  pyodide.setStdout({
    batched: (text: string) => {
      output += text
    },
  })

  try {
    await pyodide.runPythonAsync(code)
    return output
  } catch (err) {
    return `Error: ${err}`
  }
}
