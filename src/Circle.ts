import * as pixi from 'pixi.js';

export
class Circle {

    get radius() {
        return this._radius;
    }

    set radius(radius) {
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
        this._updateCircle().position.set(x, y);
    }

    private _updateCircle() {
        this._graphics
            .clear()
            .beginFill(this._color)
            .drawCircle(0, 0, this._radius)
            .endFill()
            .zIndex = this.radius;
        return this._graphics;
    }

}
