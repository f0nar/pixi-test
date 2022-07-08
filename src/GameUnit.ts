import * as pixi from 'pixi.js';
import { Circle } from './Circle';
import { IGameObject } from './interfaces/IGameObject';
import { IGameUnit } from './interfaces/IGameUnit';

export 
class GameUnit
    extends pixi.utils.EventEmitter
    implements IGameUnit {

    private _speed = 1;

    IGameUnit = true;

    get speed(): number {
        return this._speed;
    }

    set speed(speed: number) {
        if (speed < 0) throw new Error('Incorrect game object speed.');
        this._speed = speed;
    }

    get graphic(): Circle {
        return this._unit;
    }

    constructor(
        protected _unit: Circle,
    ) {
        super();
    }

    update(dt: number, other: Array<IGameObject>): void { };

    isCovering(overlaped: IGameUnit): boolean {
        const centerDistance = this.graphic.node.position.subtract(overlaped.graphic.node.position).magnitude();
        return this.graphic.radius >= overlaped.graphic.radius + centerDistance;
    }

}
