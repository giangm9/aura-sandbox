const DEBUG = false
export class Composer {
  nodes: Node[] = []
  execute(node: Node, debugIndent: number = 0) {
    if (node.executed) return
    if (DEBUG)
      console.group(
        "  ".repeat(debugIndent) + `${node.constructor.name}::${node.name}`
      )

    for (const input of node.inputs) {
      if (input.outslot && input.outslot.node) {
        const node = input.outslot.node

        this.execute(node, debugIndent + 1)
        node.executed = true
        input.value = input.outslot.value
      } else {
        if (typeof input.defaultValue === "function") {
          input.value = (input.defaultValue as () => unknown)()
        } else {
          input.value = input.defaultValue
        }
      }
    }

    node.execute()
    if (DEBUG) console.groupEnd()
  }

  freshExecute(node: Node) {
    this.nodes.forEach((n) => (n.executed = false))
    this.execute(node)
  }

  createNode<T extends Node>(node: new () => T): T {
    const n = new node()
    this.nodes.push(n)
    n.composer = this

    n.initialize()

    return n
  }

  removeNode(node: Node) {
    this.nodes = this.nodes.filter((n) => n !== node)
  }

  getNode<T extends Node>(name: string): T | null {
    return this.nodes.find((n) => n.name === name) as T
  }
}

export class InputSlot<T> {
  defaultValue: T | (() => T) | null = null
  value: T | null = null
  outslot: OutputSlot<T> | null = null
  constructor() {}
}

export class OutputSlot<T> {
  value: T | null = null

  constructor(public node: Node) {}
}

export abstract class Node {
  name: string = ""
  composer: Composer | null = null
  executed: boolean = false

  inputs = [] as InputSlot<unknown>[]
  outputs = [] as OutputSlot<unknown>[]

  initialize() {}

  protected createInput<T>(defaultValue: T): InputSlot<T> {
    const slot = new InputSlot<T>()
    slot.defaultValue = defaultValue
    this.inputs.push(slot)

    return slot
  }

  protected createOutput<T>(): OutputSlot<T> {
    const slot = new OutputSlot<T>(this)
    this.outputs.push(slot)
    return slot
  }

  abstract execute(): void
}
