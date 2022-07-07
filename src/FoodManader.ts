import * as pixi from 'pixi.js';
import { Circle } from './Circle';
import { GameUnit } from './GameUnit';
import { IGameObject } from "./interfaces/IGameObject";
import { randomInt } from './utils';
import { Game } from './Game';

export
class FoodManager
    extends pixi.utils.EventEmitter
    implements IGameObject {

    protected _updateDt = 150;
    protected _dt = 0;

    constructor(
        protected _game: Game,
    ) {
        super();
        this._game.addChild(this);
        this.generateFood(randomInt(10, 30));
    }

    update(dt: number): void {
        this._dt += dt;
        while (this._dt >= this._updateDt) {
            this._dt -= this._updateDt;
            this._updateDt += 5;
            this.generateFood(randomInt(2, 5));
        }
    }

    protected generateFood(foodsNumber: number) {
        const foodRadius = 5;
        const foodRadiusHalf = foodRadius / 2;
        const xRange = this._game.view.width;
        const yRange = this._game.view.height;
        for (let i = 0; i < foodsNumber; ++i) {
            const x = randomInt(foodRadiusHalf, xRange - foodRadiusHalf);
            const y = randomInt(foodRadiusHalf, yRange - foodRadiusHalf);
            const food = new GameUnit(new Circle(x, y, foodRadius, 0x00ff00));
            this._game.addChild(food);
        }
    }

}
