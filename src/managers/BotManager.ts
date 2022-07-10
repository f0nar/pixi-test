import * as pixi from 'pixi.js';
import { Circle } from '../graphics/Circle';
import { ControlledGameUnit, DistanceController, ControlledGameUnitEvents } from '../units/ControlledGameUnit';
import { GameContext } from '../game/GameContext';
import { IGameObject } from '../interfaces/IGameObject';
import { randomInt } from '../utils/utils';

export
const enum BotManagerEvents {
    LAST_BOT_ABSORBED = 'LAST_BOT_ABSORBED',
}

export
class BotManager 
    extends pixi.utils.EventEmitter
    implements IGameObject {

    protected _botsNumber = 0;

    constructor(
        protected _game: GameContext,
        protected _botRadius: number,
    ) {
        super();
    }

    update(dt: number, other: IGameObject[]): void { }

    addBots(botsNumberToCreate = Number(randomInt(2, 4).toFixed())): void {
        const halfBotRadius = this._botRadius / 2;
        const onBotAbsorbing = () => {
            if (this._botsNumber !== 0 && --this._botsNumber === 0) {
                this.emit(BotManagerEvents.LAST_BOT_ABSORBED)
            }
        };
        for (let i = 0; i < botsNumberToCreate; ++i) {
            const x = randomInt(halfBotRadius, this._game.view.width - halfBotRadius);
            const y = randomInt(halfBotRadius, this._game.view.height - halfBotRadius);
            const bot = new ControlledGameUnit(new Circle(x, y, this._botRadius, 0x0000ff), new DistanceController());
            bot.once(ControlledGameUnitEvents.ABSORBED, onBotAbsorbing);
            this._game.addChild(bot);
        }
        this._botsNumber += botsNumberToCreate;
    }

}

