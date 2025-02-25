import { createAura, DevPanel, ProjectLoader } from "aura"

const aura = createAura()
aura.add(DevPanel)
aura.initialize()

const loader = aura.get(ProjectLoader)
loader.load("public/json/entry.json")
