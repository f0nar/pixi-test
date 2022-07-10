import * as pixi from "pixi.js";
import { ControlledGameUnit } from "../units/ControlledGameUnit";
import { isGraphics } from "../interfaces/IGameGraphics";
import { IGameObject } from "../interfaces/IGameObject";
import { IGameUnit, isUnit } from "../interfaces/IGameUnit";

export
const enum GameEvents {
    MOUSE_MOVE = 'MOUSE_MOVE',
}

const pop = <T>(array: Array<T>, index: number) => index >= 0 && index < array.length && array.splice(index, 1);

class GameLayer {
    objects = new Array<IGameObject>();
    units = new Array<IGameUnit>();
    pixiContainer = new pixi.Container();
};

export
class GameContext extends pixi.utils.EventEmitter {

    protected _mainLayer = new GameLayer();
    protected _overlayLayer = new GameLayer();

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
        this._app.stage.on('pointermove', (ev: pixi.InteractionEvent) => this.emit(GameEvents.MOUSE_MOVE, ev));
        this._app.stage.addChild(this._mainLayer.pixiContainer, this._overlayLayer.pixiContainer);
    }

    run(): void {
        this._app.ticker.add(this._loop);
    }

    stop(): void {
        this._app.ticker.remove(this._loop);
    }

    addChild(...gameObjects: IGameObject[]): void {
        this._addChild(this._mainLayer, gameObjects); 
    }

    removeChild(...gameObjects: IGameObject[]): void {
        this._removeChild(this._mainLayer, gameObjects);
    }

    removeChildren(): void {
        this._removeChildren(this._mainLayer);
    }

    addOverlayChild(...gameObjects: IGameObject[]): void {
        this._addChild(this._overlayLayer, gameObjects); 
    }

    removeOverlayChild(...gameObjects: IGameObject[]): void {
        this._removeChild(this._overlayLayer, gameObjects); 
    }
    
    removeOverlayChildren() {
        this._removeChildren(this._overlayLayer);
    }

    protected _loop(dt: number): void {
        [ this._mainLayer, this._overlayLayer ].forEach((layer) => this._layerLoop(layer, dt));
    }

    protected _addChild(layer: GameLayer, gameObjects: IGameObject[]): void {
        for (const gameObject of gameObjects) {
            layer.objects.push(gameObject);
            if (isGraphics(gameObject)) {
                layer.pixiContainer.addChild(gameObject.node);
            } else if (isUnit(gameObject)) {
                layer.units.push(gameObject);
                this._addChild(layer, [gameObject.graphic]);
            } 
        }  
    }

    protected _removeChild(layer: GameLayer, gameObjects: IGameObject[]): void {
        for (const gameObject of gameObjects) {
            pop(layer.objects, layer.objects.indexOf(gameObject));
            if (isGraphics(gameObject)) {
                layer.pixiContainer.removeChild(gameObject.node);
            } else if (isUnit(gameObject)) {
                pop(layer.units, layer.units.indexOf(gameObject));
                this._removeChild(layer, [gameObject.graphic]);
            }
        }
    }

    protected _removeChildren(layer: GameLayer): void {
        layer.objects.splice(0);
        layer.objects.splice(0);
        layer.pixiContainer.removeChildren();
    }

    protected _layerLoop(layer: GameLayer, dt: number): void {
        const gameObjectsArray = Array.from(layer.objects);
        const controlledGameUnits = new Array<ControlledGameUnit>();
        gameObjectsArray.forEach(gameObject => {
            gameObject.update(dt, gameObjectsArray);
            if (gameObject instanceof ControlledGameUnit) {
                controlledGameUnits.push(gameObject);
            }
        });
        for (const controlledGameUnit of controlledGameUnits) {
            for (const gameUnit of layer.units) {
                if (controlledGameUnit !== gameUnit && controlledGameUnit.isCovering(gameUnit)) {
                    controlledGameUnit.absorb(gameUnit);
                    this._removeChild(layer, [gameUnit]);
                }
            }
        }
    }

}
