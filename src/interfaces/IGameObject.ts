import * as pixi from "pixi.js";

export
interface IGameObject extends pixi.utils.EventEmitter {

    update(dt: number, other: Array<IGameObject>): void;

}
