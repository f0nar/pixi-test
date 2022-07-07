import * as pixi from "pixi.js";
import { ControlledGameUnit } from "./ControlledGameUnit";
import { IGameObject } from "./interfaces/IGameObject";
import { IGameUnit, isUnit } from "./interfaces/IGameUnit";

export
const enum StopMode {
    WIN = 'YOU WON',
    PAUSE = 'PAUSE',
    LOSE = 'YOU LOSE',
}

const TextColors = {
    [StopMode.WIN]: '0x00ff00',
    [StopMode.PAUSE]: '0x0000ff',
    [StopMode.LOSE]: '0xff0000',
}

export
class Game {

    protected _gameObjects = new Array<IGameObject>();
    protected _gameUnits = new Array<IGameUnit>();
    protected _message?: pixi.Text;

    get world() {
        return this._app.stage;
    }

    get view() {
        return this._app.screen;
    }

    constructor(
        protected _app: pixi.Application,
        protected _document: HTMLElement,
    ) {
        this._document.appendChild(this._app.view);
        this.loop = this.loop.bind(this);
        this._app.ticker.add(this.loop);
        this._app.screen
    }

    addChild(...gameObjects: IGameObject[]) {
        for (const gameObject of gameObjects) {
            this._gameObjects.push(gameObject);
            if (isUnit(gameObject)) {
                this._gameUnits.push(gameObject);
                this.world.addChild(gameObject.graphic.node);
            }
        }  
    }

    removeChild(...gameObjects: IGameObject[]) {
        for (const gameObject of gameObjects) {
            pop(this._gameObjects, this._gameObjects.indexOf(gameObject));
            if (isUnit(gameObject)) {
                pop(this._gameUnits, this._gameUnits.indexOf(gameObject));
                this.world.removeChild(gameObject.graphic.node);
            }
        }
    }

    run() {
        if (this._message) {
            this.world.removeChild(this._message);
            this._message = undefined;
        }
        this._app.ticker.add(this.loop);
    }

    stop(mode: StopMode) {
        this._app.ticker.remove(this.loop);
        const messageStyle = new pixi.TextStyle({
            fontFamily: 'Arial',
            dropShadow: true,
            dropShadowAlpha: 0.8,
            dropShadowAngle: 2.1,
            dropShadowBlur: 4,
            dropShadowColor: '0x111111',
            dropShadowDistance: 10,
            fill: [TextColors[mode]],
            stroke: '0xf0f0f0',
            fontSize: 60,
            fontWeight: 'lighter',
            lineJoin: 'round',
            strokeThickness: 12,
        });
        this._message = new pixi.Text(mode, messageStyle);
        this._message.x = (this.view.width - this._message.getBounds().width) / 2;
        this._message.y = (this.view.height - this._message.getBounds().height) / 2;
        this.world.addChild(this._message);
    }

    protected loop(dt: number) {
        const gameObjectsArray = Array.from(this._gameObjects);
        const controlledGameUnits = new Array<ControlledGameUnit>();
        gameObjectsArray.forEach(gameObject => {
            gameObject.update(dt, gameObjectsArray);
            if (gameObject instanceof ControlledGameUnit) {
                controlledGameUnits.push(gameObject);
            }
        });
        for (const controlledGameUnit of controlledGameUnits) {
            for (const gameUnit of this._gameUnits) {
                if (controlledGameUnit !== gameUnit && controlledGameUnit.isCovering(gameUnit)) {
                    controlledGameUnit.absorb(gameUnit);
                    this.removeChild(gameUnit);
                }
            }
        }
    }

}

const pop = <T>(array: Array<T> | pixi.Container, index: number) => {
    Array.isArray(array) ?
        index >= 0 && index < array.length && array.splice(index, 1) :
        index >= 0 && index < array.children.length && array.removeChildAt(index);
};

