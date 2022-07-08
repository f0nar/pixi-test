import * as pixi from 'pixi.js'
import '@pixi/math-extras';
import '@pixi/interaction'
import { Circle } from './src/Circle';
import {
    ControlledGameUnit, ControlledGameUnitEvents,
    DistanceController, MouseController
} from './src/ControlledGameUnit';
import { Game, StopMode } from './src/Game';
import { FoodManager } from './src/FoodManager';
import { randomInt } from './src/utils';
import { IGameUnit } from './src/interfaces/IGameUnit';

/**
 * Would be nice to add:
 * * * Docs
 * * * Bot manager
 * * * Parent-child relationship
 * * * Customize appearence
 * * * Restart functionality
 * * * Scores
 * * * Increase probability to win)
 * * * Colission with canvas edges
 * * * Use target point insted of direction in ControlledGameUnit
 */

let botsNumberInGame = 0;

const game =
    new Game(
        new pixi.Application({
            width: 1000,
            height: 1000,
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1,
        }),
        document.getElementById('pixi-output')!,
    );

game.addChild(
    new FoodManager(game),
    ...generateBots(),
    new ControlledGameUnit(new Circle(400, 300, 10, 0xff0000), new MouseController(game))
        .once(ControlledGameUnitEvents.ABSORBED, () => game.stop(StopMode.LOSE)),
);

function generateBots(botsNumberToCreate = Number(randomInt(2, 4).toFixed())) {
    const bots = new Array<IGameUnit>(botsNumberToCreate);
    const botRadius = 10;
    const halfBotRadius = botRadius / 2;
    const onBotAbsorbing = () => --botsNumberInGame === 0 && game.stop(StopMode.WIN);
    for (let i = 0; i < botsNumberToCreate; ++i) {
        const x = randomInt(halfBotRadius, game.view.width - halfBotRadius);
        const y = randomInt(halfBotRadius, game.view.height - halfBotRadius);
        const bot = new ControlledGameUnit(new Circle(x, y, botRadius, 0x0000ff), new DistanceController());
        bot.once(ControlledGameUnitEvents.ABSORBED, onBotAbsorbing);
        bots[i] = bot;
    }
    botsNumberInGame += botsNumberToCreate;

    return bots;
}
