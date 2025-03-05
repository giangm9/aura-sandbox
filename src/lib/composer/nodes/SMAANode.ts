import { Texture } from "three";
import { WebGLNode } from "../WebGLComposer";

export class SMAANode extends WebGLNode {
  inpslots = {
    color: this.createInput(null as Texture | null),
  };

  outslots = {
    color: this.createOutput<Texture>(),
  };

  initialize(): void {}

  execute(): void {
    throw new Error("Method not implemented.");
  }
}
