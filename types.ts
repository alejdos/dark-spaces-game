
export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  rotation: number;
}

export interface Ship extends GameObject {
  maxShield: number;
  shield: number;
  maxHull: number;
  hull: number;
  isDestroyed: boolean;
}

export interface Player extends Ship {}

export enum EnemyType {
    FIGHTER = 'Fighter',
    INTERCEPTOR = 'Interceptor',
    BOMBER = 'Bomber',
    CAPITAL = 'Capital Ship'
}

export interface Enemy extends Ship {
  type: EnemyType;
  fireRate: number;
  lastFired: number;
}

export interface Projectile extends GameObject {
  damage: number;
  isPlayerProjectile: boolean;
}

export interface Explosion extends GameObject {
    life: number;
    maxLife: number;
}


export enum GameStatus {
  MENU,
  BRIEFING,
  PLAYING,
  MISSION_COMPLETE,
  GAME_OVER,
  GAME_WON
}

export interface LevelConfig {
    enemies: { type: EnemyType, count: number }[];
}
