// pyodide-loader.ts
export async function loadPyodideAndPackages() {
  // @ts-ignore: Types don't exist for this global
  const pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/",
  })
  return pyodide
}