import * as pixi from "pixi.js";
import { ControlledGameUnit } from "./ControlledGameUnit";
import { isGraphics } from "./interfaces/IGameGraphics";
import { IGameObject } from "./interfaces/IGameObject";
import { IGameUnit, isUnit } from "./interfaces/IGameUnit";

export
const enum GAME_EVENTS {
    MOUSE_MOVE = 'MOUSE_MOVE',
}

const pop = <T>(array: Array<T>, index: number) => index >= 0 && index < array.length && array.splice(index, 1);

export
class Game extends pixi.utils.EventEmitter {

    protected _gameObjects = new Array<IGameObject>();
    protected _gameUnits = new Array<IGameUnit>();
    protected _mainGroup = new pixi.Container();
    protected _overlayGroup = new pixi.Container();

    get view(): pixi.Rectangle {
        return this._app.screen;
    }

    constructor(
        protected _app: pixi.Application,
        protected _document: HTMLElement,
    ) {
        super();
        this._document.appendChild(this._app.view);
        this._loop = this._loop.bind(this);

        this._app.stage.interactive = true;
        this._app.stage.on('pointermove', (ev: pixi.InteractionEvent) => this.emit(GAME_EVENTS.MOUSE_MOVE, ev));
        this._app.stage.addChild(this._mainGroup, this._overlayGroup);
    }

    run(): void {
        this._app.ticker.add(this._loop);
    }

    stop(): void {
        this._app.ticker.remove(this._loop);
    }

    addChild(...gameObjects: IGameObject[]): void {
        this._addChild(this._mainGroup, gameObjects); 
    }

    removeChild(...gameObjects: IGameObject[]): void {
        this._removeChild(this._mainGroup, gameObjects);
    }

    addOverlayChild(...gameObjects: IGameObject[]): void {
        this._addChild(this._overlayGroup, gameObjects); 
    }

    removeOverlayChild(...gameObjects: IGameObject[]): void {
        this._removeChild(this._overlayGroup, gameObjects); 
    }

    protected _addChild(container: pixi.Container, gameObjects: IGameObject[]): void {
        for (const gameObject of gameObjects) {
            this._gameObjects.push(gameObject);
            if (isUnit(gameObject)) {
                this._gameUnits.push(gameObject);
                this._addChild(container, [gameObject.graphic]);
            } else if (isGraphics(gameObject)) {
                container.addChild(gameObject.node);
            }
        }  
    }

    protected _removeChild(container: pixi.Container, gameObjects: IGameObject[]): void {
        for (const gameObject of gameObjects) {
            pop(this._gameObjects, this._gameObjects.indexOf(gameObject));
            if (isUnit(gameObject)) {
                pop(this._gameUnits, this._gameUnits.indexOf(gameObject));
                this._removeChild(container, [gameObject.graphic]);
            } else if (isGraphics(gameObject)) {
                container.removeChild(gameObject.node);
            }
        }
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
