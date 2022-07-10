import * as pixi from 'pixi.js'
import '@pixi/math-extras';
import '@pixi/interaction'
import { Circle } from './src/graphics/Circle';
import { ControlledGameUnit, ControlledGameUnitEvents, MouseController } from './src/units/ControlledGameUnit';
import { GameContext } from './src/game/GameContext';
import { FoodManager } from './src/managers/FoodManager';
import { randomInt } from './src/utils/utils';
import { Button, ButtonEvents } from './src/ui/Button';
import { BotManager, BotManagerEvents } from './src/managers/BotManager';

/**
 * Would be nice to add:
 * * * Docs
 * * * Parent-child relationship
 * * * Customize appearence
 * * * Scores
 * * * Increase probability to win)
 * * * Colission with canvas edges
 * * * Use target point insted of direction in ControlledGameUnit
 */

const constrolledGameUnitRadius = 10;
const halfButtonWidth = 150;
const halfButtonHeight = 40;
const GameConfigs: pixi.IApplicationOptions = {
    width: 1000,
    height: 1000,
    backgroundColor: 0x000000,
    resolution: window.devicePixelRatio || 1,
};

const context = new GameContext(new pixi.Application(GameConfigs), document.getElementById('pixi-output')!);

const playButton = new Button('./textures/play_button.png', './textures/play_button_hovered.png');
playButton.node.position.set(context.view.width / 2 - halfButtonWidth, context.view.height / 2 - halfButtonHeight);
playButton.on(ButtonEvents.CLICK, startGame);

const quitButton = new Button('./textures/quit_button.png', './textures/quit_button_hovered.png');
quitButton.node.position.set(context.view.width / 2 - halfButtonWidth, context.view.height / 2 - halfButtonHeight);
quitButton.on(ButtonEvents.CLICK, toMainMenu);

const player = new ControlledGameUnit(new Circle(400, 300, constrolledGameUnitRadius, 0xff0000), new MouseController(context));
player.on(ControlledGameUnitEvents.ABSORBED, finishGame);

const botManager = new BotManager(context, constrolledGameUnitRadius);
botManager.on(BotManagerEvents.LAST_BOT_ABSORBED, finishGame);

const foodManager = new FoodManager(context, constrolledGameUnitRadius / 2);

context.addOverlayChild(playButton);

function finishGame(): void {
    context.stop();
    context.addOverlayChild(quitButton);
}

function startGame(): void {
    context.removeOverlayChild(playButton);
    context.addChild(foodManager, botManager, player);
    botManager.on(BotManagerEvents.LAST_BOT_ABSORBED, finishGame);
    player.on(ControlledGameUnitEvents.ABSORBED, finishGame);
    player.speed = 1;
    player.graphic.radius = constrolledGameUnitRadius;
    botManager.addBots();
    foodManager.addFood(randomInt(15, 30));
    context.run();
}

function toMainMenu(): void {
    context.removeChildren();
    context.removeOverlayChildren();
    context.addOverlayChild(playButton);
}
