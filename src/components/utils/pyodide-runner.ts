// utils/pyodide-runner.ts

import { loadPyodide } from "pyodide"

let pyodide: any = null

export async function initPyodide() {
  if (!pyodide) {
    pyodide = await loadPyodide()
  }
  return pyodide
}

export async function runPython(code: string): Promise<any> {
  const py = await initPyodide()
  try {
    const result = await py.runPythonAsync(code)
    return result
  } catch (err) {
    console.error("Python Error:", err)
    throw err
  }
}
