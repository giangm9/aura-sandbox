import { atom, useAtom } from "jotai"

export type BaseItem<T = string, V = unknown> = {
  name: string
  id: string
  folder: string
  order: number
  type: T
  value: V
}
export type NumberItem = BaseItem<"number", number> & {}

export type SliderItem = BaseItem<"slider", number> & {
  min: number
  max: number
  step: number
}
export type FolderItem = BaseItem<"folder", string> & {
  open: boolean
}

export type PanelItem = NumberItem | SliderItem | FolderItem

export const itemList = atom([] as PanelItem[])
export function useItemList() {
  return useAtom(itemList)
}

export function useItem<T extends PanelItem>(id: string, defaultValue: T) {
  const [list, setList] = useAtom(itemList)
  const item = list.find((item) => item.id === id) as T

  const update = (value: Partial<T>) => {
    setList((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          return { ...item, ...value }
        }
        return item
      })
    })
  }

  if (!item) {
    setList((prev) => {
      return [...prev, { ...defaultValue, id }]
    })
  }
  return [item, update] as const
}

export const getItemAtom = atom((get) => {
  return <T extends PanelItem>(id: string) => {
    const list = get(itemList)
    return list.find((item) => item.id === id) as T
  }
})

export const setItemAtom = atom(
  null,
  (get, set, id: string, value: Partial<PanelItem>) => {
    const list = get(itemList)
    const updatedList = list.map((item) => {
      if (item.id === id) {
        return { ...item, ...value } as PanelItem
      }
      return item as PanelItem
    })

    set(itemList, updatedList)
  }
)
