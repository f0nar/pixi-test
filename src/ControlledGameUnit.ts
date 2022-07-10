import * as pixi from 'pixi.js';
import { Circle } from "./Circle";
import { Game, GAME_EVENTS } from './Game';
import { GameUnit } from "./GameUnit";
import { IGameObject } from './interfaces/IGameObject';
import { IGameUnit } from './interfaces/IGameUnit';

export
const enum ControlledGameUnitEvents {
    ABSORBING = 'ABSORBING',
    ABSORBED = 'ABSORBED',
}

export
interface DirectionControllerT {

    getDirection(caller: ControlledGameUnit, dt: number, other: Array<IGameObject>): pixi.Point;

};

export
class ControlledGameUnit extends GameUnit {

    constructor(
        unit: Circle,
        protected _controller: DirectionControllerT,
    ) {
        super(unit);
    }

    update(dt: number, other: Array<IGameObject>): void {
        const direction = this._controller.getDirection(this, dt, other);
        this.graphic.node.position.add(direction.multiplyScalar(this.speed), this.graphic.node.position);
    }
    
    absorb(absorbedUnit: IGameUnit): void {
        const radius = Number(Math.sqrt(absorbedUnit.graphic.radius).toPrecision());
        this.graphic.radius += radius;
        this.speed = Math.sqrt(this.graphic.radius / 10);
        this.emit(ControlledGameUnitEvents.ABSORBING, absorbedUnit);
        absorbedUnit.emit(ControlledGameUnitEvents.ABSORBED, this);
    }

}

export
class DistanceController implements DirectionControllerT {

    getDirection(caller: ControlledGameUnit, dt: number, other: IGameUnit[]): pixi.Point {
        const totalDirection = new pixi.Point(0, 0);
        if (!Array.isArray(other)) { return totalDirection };
        const unitsData =
            other
                .filter((unit) => unit.IGameUnit && unit.graphic.radius !== caller.graphic.radius)
                .map((unit) => {
                    const direction = unit.graphic.node.position.subtract(caller.graphic.node.position);
                    return { radius: unit.graphic.radius, direction, distance: direction.magnitude() }; })
                .sort((d1, d2) => d1.distance - d2.distance);
        if (!unitsData.length) { return totalDirection; }
        const maxDistance = unitsData[unitsData.length - 1].distance;
        for (const unitData of unitsData) {
            const distanceWeight = 100 * (1 - (unitData.distance - 1) / maxDistance);
            const sizeWeight = caller.graphic.radius - unitData.radius;
            unitData.direction
                .normalize()
                .multiplyScalar(sizeWeight * Math.pow(distanceWeight, 6))
                .add(totalDirection, totalDirection)
        }
        if (totalDirection.x === totalDirection.y && totalDirection.y === 0) {
            totalDirection.set(unitsData[0].direction.x, unitsData[0].direction.y)
        }

        return totalDirection.normalize(totalDirection);
    }
    
}

export
class MouseController implements DirectionControllerT {

    protected _target?: pixi.Point;

    constructor(
        protected _game: Game,
    ) {
        this._updateTarget = this._updateTarget.bind(this);
        this._game.on(GAME_EVENTS.MOUSE_MOVE, this._updateTarget);
    }

    getDirection(caller: GameUnit, dt: number, other: GameUnit[]): pixi.Point {
        if (!this._target) return new pixi.Point(0, 0);
        return this._target.subtract(caller.graphic.node.position).normalize();
    }

    protected _updateTarget(event: pixi.InteractionEvent): void {
        const eventPosition = event?.data?.global;
        const hypotheticalPosition = eventPosition && new pixi.Point(eventPosition.x, eventPosition.y);
        this._target = hypotheticalPosition && this._game.view.contains(hypotheticalPosition.x, hypotheticalPosition.y) ?
            this._target = hypotheticalPosition :
            undefined;
        
    }
    
};
