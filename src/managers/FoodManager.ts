import * as pixi from 'pixi.js';
import { Circle } from '../graphics/Circle';
import { GameUnit } from '../units/GameUnit';
import { IGameObject } from "../interfaces/IGameObject";
import { randomInt } from '../utils/utils';
import { GameContext } from '../game/GameContext';

export
class FoodManager
    extends pixi.utils.EventEmitter
    implements IGameObject {

    protected _updateDt = 150;
    protected _dt = 0;

    constructor(
        protected _game: GameContext,
        protected _foodRadius: number,
    ) {
        super();
        this._game.addChild(this);
    }

    update(dt: number): void {
        this._dt += dt;
        while (this._dt >= this._updateDt) {
            this._dt -= this._updateDt;
            this._updateDt += 5;
            this.addFood(randomInt(2, 5));
        }
    }

    addFood(foodsNumber: number): void {
        const foodRadiusHalf = this._foodRadius / 2;
        const xRange = this._game.view.width;
        const yRange = this._game.view.height;
        for (let i = 0; i < foodsNumber; ++i) {
            const x = randomInt(foodRadiusHalf, xRange - foodRadiusHalf);
            const y = randomInt(foodRadiusHalf, yRange - foodRadiusHalf);
            const food = new GameUnit(new Circle(x, y, this._foodRadius, 0x00ff00));
            this._game.addChild(food);
        }
    }

}
