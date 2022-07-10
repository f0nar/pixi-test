import * as pixi from 'pixi.js';
import { IGameObject } from "./IGameObject";

export
const isGraphics = (gameObject: IGameObject): gameObject is IGameGraphics => (gameObject as IGameGraphics).IGameGraphics;

export
interface IGameGraphics extends IGameObject {

    IGameGraphics: boolean;

    get node(): pixi.DisplayObject;

}