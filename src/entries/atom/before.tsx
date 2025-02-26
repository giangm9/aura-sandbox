import { atom, createStore } from "jotai/vanilla"

const lorem = atom("lorem")
const store = createStore()

store.sub(lorem, () => {
  console.log("changed", store.get(lorem))
})

store.set(lorem, "ipsum")
