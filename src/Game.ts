import * as pixi from "pixi.js";
import { ControlledGameUnit } from "./ControlledGameUnit";
import { IGameObject } from "./interfaces/IGameObject";
import { IGameUnit, isUnit } from "./interfaces/IGameUnit";
import { Graphics } from "pixi.js";

export
const enum StopMode {
    WIN = 'YOU WIN',
    PAUSE = 'PAUSE',
    LOSE = 'YOU LOSE',
}

const TextColors = {
    [StopMode.WIN]: '0x00ff00',
    [StopMode.PAUSE]: '0x0000ff',
    [StopMode.LOSE]: '0xff0000',
}

const TextStyle: Partial<pixi.ITextStyle> = {
    fontFamily: 'Arial',
    dropShadow: true,
    dropShadowAlpha: 0.8,
    dropShadowAngle: 2.1,
    dropShadowBlur: 4,
    dropShadowColor: '0x111111',
    dropShadowDistance: 10,
    fill: [TextColors[StopMode.WIN]],
    stroke: '0xf0f0f0',
    fontSize: 60,
    fontWeight: 'lighter',
    lineJoin: 'round',
    strokeThickness: 12,
};

export
class Game {

    protected _gameObjects = new Array<IGameObject>();
    protected _gameUnits = new Array<IGameUnit>();
    protected _curtain = new pixi.Graphics();
    protected _curtainMessage: pixi.Text;

    get world(): pixi.Container  {
        return this._app.stage;
    }

    get view(): pixi.Rectangle {
        return this._app.screen;
    }

    constructor(
        protected _app: pixi.Application,
        protected _document: HTMLElement,
    ) {
        
        pixi.filters.BlurFilter
        this._document.appendChild(this._app.view);
        this._loop = this._loop.bind(this);
        this._curtain = new Graphics();
        this._curtainMessage = new pixi.Text(StopMode.WIN, new pixi.TextStyle(TextStyle));
        this._curtainMessage.x = (this.view.width - this._curtainMessage.getBounds().width) / 2;
        this._curtainMessage.y = (this.view.height - this._curtainMessage.getBounds().height) / 2;
    }

    addChild(...gameObjects: IGameObject[]): void {
        for (const gameObject of gameObjects) {
            this._gameObjects.push(gameObject);
            if (isUnit(gameObject)) {
                this._gameUnits.push(gameObject);
                this.world.addChild(gameObject.graphic.node);
            }
        }  
    }

    removeChild(...gameObjects: IGameObject[]): void {
        for (const gameObject of gameObjects) {
            pop(this._gameObjects, this._gameObjects.indexOf(gameObject));
            if (isUnit(gameObject)) {
                pop(this._gameUnits, this._gameUnits.indexOf(gameObject));
                this.world.removeChild(gameObject.graphic.node);
            }
        }
    }

    run(): void {
        this._curtain.clear();
        this.world.removeChild(this._curtain);
        this._app.ticker.add(this._loop);
    }

    stop(mode: StopMode): void {
        this._app.ticker.remove(this._loop);
        this._curtain
            .lineStyle(10, Number(TextColors[mode]), 1)
            .beginFill(0xf0f0f0, 0.5)
            .drawRect(0, 0, this.view.width, this.view.height)
            .endFill();
        this._curtainMessage.text = mode;
        this._curtainMessage.style.fill = [TextColors[mode]];
        this._curtain.addChild(this._curtainMessage);
        this.world.addChild(this._curtain);
    }

    protected _loop(dt: number): void {
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

const pop = <T>(array: Array<T>, index: number) => index >= 0 && index < array.length && array.splice(index, 1);

