import * as pixi from 'pixi.js';
import { IGameGraphics } from '../interfaces/IGameGraphics';
import { IGameObject } from '../interfaces/IGameObject';


export
const enum ButtonEvents {
    CLICK = 'CLICK',
    HOVER = 'HOVER',
    LEAVE = 'LEAVE',
}

export
class Button
    extends pixi.utils.EventEmitter
    implements IGameGraphics {

    IGameGraphics = true;

    IGameUnit = true;

    protected _mainButtonTexture: pixi.Texture;
    protected _hoveredButtonTexture: pixi.Texture;
    protected _button: pixi.Sprite;

    get node(): pixi.DisplayObject {
        return this._button;
    }

    constructor(
        protected _mainPath: string,
        protected _hoveredPath?: string,
    ) {
        super();
        this._mainButtonTexture = pixi.Texture.from(this._mainPath);
        this._hoveredButtonTexture = this._hoveredPath ?
            pixi.Texture.from(this._hoveredPath) :
            this._mainButtonTexture;
        this._button = new pixi.Sprite(this._mainButtonTexture);
        this._button.interactive = true;
        this._button.buttonMode = true;

        this._onClick = this._onClick.bind(this);
        this._onHover = this._onHover.bind(this);
        this._onLeave = this._onLeave.bind(this);
        this._button
            .on('pointerdown', this._onClick)
            .on('pointerover', this._onHover)
            .on('pointerout', this._onLeave)
    }

    update(dt: number, other: IGameObject[]): void { }

    protected _onClick(): void {
        this.emit(ButtonEvents.CLICK);
    }

    protected _onHover(): void {
        this._button.texture = this._hoveredButtonTexture;
        this.emit(ButtonEvents.HOVER);
    }
    
    protected _onLeave(): void {
        this._button.texture = this._mainButtonTexture;
        this.emit(ButtonEvents.LEAVE);
    }

}