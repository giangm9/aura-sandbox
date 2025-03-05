import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { readdirSync } from "fs"

// TODO fix this
const folderSlash = "\\"

const files = readdirSync("src/entries", { recursive: true })
  .map((item) => {
    return item.toString().replaceAll(folderSlash, "/")
  })
  .filter((item) => item)
  .filter((item) => {
    if (!item.includes(".")) return true

    return item.endsWith(".tsx")
  })

export default defineConfig({
  plugins: [react()],
  define: {
    ENTRY_MAP: JSON.stringify(files),
  },
})
