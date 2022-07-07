import { Circle } from "../Circle";
import { IGameObject } from "./IGameObject";

export
const isUnit = (gameObject: IGameObject): gameObject is IGameUnit => (gameObject as IGameUnit).IGameUnit;

export
interface IGameUnit extends IGameObject {

    IGameUnit: boolean;

    get graphic(): Circle;

    get speed(): number;

    set speed(speed: number);

}