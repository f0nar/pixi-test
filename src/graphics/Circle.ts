import * as pixi from 'pixi.js';
import { IGameGraphics } from '../interfaces/IGameGraphics';
import { IGameObject } from '../interfaces/IGameObject';

export
class Circle
    extends pixi.utils.EventEmitter
    implements IGameGraphics {

    IGameGraphics = true;

    get radius(): number {
        return this._radius;
    }

    set radius(radius: number) {
        if (radius <= 0) throw new Error('Incorrect circle radius');
        this._radius = radius;
        this._updateCircle();
    }

    get node(): pixi.DisplayObject {
        return this._graphics;
    }

    private _graphics = new pixi.Graphics();

    constructor(
        x: number,
        y: number,
        private _radius: number,
        private _color: number,
    ) {
        super();
        this._updateCircle().position.set(x, y);
    }

    update(dt: number, other: IGameObject[]): void { }

    private _updateCircle(): pixi.DisplayObject {
        this._graphics
            .clear()
            .beginFill(this._color)
            .drawCircle(0, 0, this._radius)
            .endFill()
            .zIndex = this.radius;
        return this._graphics;
    }

}
