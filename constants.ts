
import { LevelConfig, EnemyType } from './types';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PLAYER_SETTINGS = {
  RADIUS: 20,
  MAX_SPEED: 4,
  ACCELERATION: 0.1,
  FRICTION: 0.98,
  ROTATION_SPEED: 0.07,
  MAX_SHIELD: 100,
  MAX_HULL: 50,
  FIRE_RATE: 200, // ms
  PROJECTILE_SPEED: 8,
  PROJECTILE_DAMAGE: 10,
  PROJECTILE_RADIUS: 4
};

export const ENEMY_SETTINGS: { [key in EnemyType]: any } = {
  [EnemyType.FIGHTER]: {
    RADIUS: 18,
    MAX_SPEED: 2.5,
    MAX_SHIELD: 20,
    MAX_HULL: 20,
    FIRE_RATE: 1000,
    PROJECTILE_SPEED: 6,
    PROJECTILE_DAMAGE: 5,
    PROJECTILE_RADIUS: 3,
  },
  [EnemyType.INTERCEPTOR]: {
    RADIUS: 15,
    MAX_SPEED: 3.5,
    MAX_SHIELD: 10,
    MAX_HULL: 15,
    FIRE_RATE: 700,
    PROJECTILE_SPEED: 7,
    PROJECTILE_DAMAGE: 4,
    PROJECTILE_RADIUS: 3,
  },
  [EnemyType.BOMBER]: {
    RADIUS: 25,
    MAX_SPEED: 1.8,
    MAX_SHIELD: 40,
    MAX_HULL: 40,
    FIRE_RATE: 1500,
    PROJECTILE_SPEED: 5,
    PROJECTILE_DAMAGE: 15,
    PROJECTILE_RADIUS: 5,
  },
  [EnemyType.CAPITAL]: {
    RADIUS: 100,
    MAX_SPEED: 0.5,
    MAX_SHIELD: 500,
    MAX_HULL: 250,
    FIRE_RATE: 2000,
    PROJECTILE_SPEED: 8,
    PROJECTILE_DAMAGE: 25,
    PROJECTILE_RADIUS: 8,
  }
};


export const LEVELS: LevelConfig[] = [
  { enemies: [{ type: EnemyType.FIGHTER, count: 3 }] },
  { enemies: [{ type: EnemyType.FIGHTER, count: 4 }, { type: EnemyType.INTERCEPTOR, count: 2 }] },
  { enemies: [{ type: EnemyType.BOMBER, count: 2 }, { type: EnemyType.FIGHTER, count: 5 }] },
  { enemies: [{ type: EnemyType.INTERCEPTOR, count: 6 }, { type: EnemyType.BOMBER, count: 2 }] },
  { enemies: [{ type: EnemyType.CAPITAL, count: 1 }, { type: EnemyType.FIGHTER, count: 6 }] },
];

export const CONTROLS = {
    THRUST: 'w',
    STRAFE_LEFT: 'a',
    STRAFE_RIGHT: 'd',
    BRAKE: 's',
    FIRE: ' '
};
