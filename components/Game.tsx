import React, { useRef, useEffect, useCallback, useReducer } from 'react';
import { LevelConfig, Player, Enemy, Projectile, Vector2D, EnemyType, Explosion } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SETTINGS, ENEMY_SETTINGS, CONTROLS } from '../constants';
import HUD from './HUD';

interface GameProps {
  levelConfig: LevelConfig;
  onMissionEnd: (win: boolean) => void;
}

interface GameState {
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  explosions: Explosion[];
  keys: { [key: string]: boolean };
  lastPlayerFireTime: number;
  message: string | null;
  messageTimeout: number;
  gameStarted: boolean;
  mousePos: Vector2D;
}

type GameAction =
  | { type: 'TICK'; payload: { timestamp: number } }
  | { type: 'KEY_DOWN'; payload: string }
  | { type: 'KEY_UP'; payload: string }
  | { type: 'MOUSE_MOVE'; payload: Vector2D }
  | { type: 'RESET'; payload: { levelConfig: LevelConfig } };

const initialState: GameState = {
  player: {} as Player,
  enemies: [],
  projectiles: [],
  explosions: [],
  keys: {},
  lastPlayerFireTime: 0,
  message: null,
  messageTimeout: 0,
  gameStarted: false,
  mousePos: { x: GAME_WIDTH / 2, y: 0 },
};

// Helper function for deep cloning
const clone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'KEY_DOWN':
      return { ...state, keys: { ...state.keys, [action.payload.toLowerCase()]: true } };
    case 'KEY_UP':
      return { ...state, keys: { ...state.keys, [action.payload.toLowerCase()]: false } };
    case 'MOUSE_MOVE':
        return { ...state, mousePos: action.payload };
    case 'RESET':
        const newPlayer: Player = {
            id: 'player',
            position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 },
            velocity: { x: 0, y: 0 },
            radius: PLAYER_SETTINGS.RADIUS,
            rotation: -Math.PI / 2,
            maxShield: PLAYER_SETTINGS.MAX_SHIELD,
            shield: PLAYER_SETTINGS.MAX_SHIELD,
            maxHull: PLAYER_SETTINGS.MAX_HULL,
            hull: PLAYER_SETTINGS.MAX_HULL,
            isDestroyed: false,
        };
        const newEnemies: Enemy[] = [];
        action.payload.levelConfig.enemies.forEach(group => {
            for(let i=0; i<group.count; i++){
                const settings = ENEMY_SETTINGS[group.type];
                newEnemies.push({
                    id: `enemy_${group.type}_${i}_${Date.now()}`,
                    type: group.type,
                    position: { x: Math.random() * (GAME_WIDTH - 100) + 50, y: Math.random() * 200 + 50 },
                    velocity: { x: (Math.random() - 0.5) * 2, y: Math.random() * 1 + 0.5 },
                    radius: settings.RADIUS,
                    rotation: Math.PI / 2,
                    maxShield: settings.MAX_SHIELD,
                    shield: settings.MAX_SHIELD,
                    maxHull: settings.MAX_HULL,
                    hull: settings.MAX_HULL,
                    fireRate: settings.FIRE_RATE,
                    lastFired: 0,
                    isDestroyed: false,
                });
            }
        });
        return { ...initialState, player: newPlayer, enemies: newEnemies, message: 'MISSION START', messageTimeout: Date.now() + 3000, gameStarted: true, mousePos: state.mousePos };

    case 'TICK':
        {
        if (!state.gameStarted || !state.player.id) {
            return state; // CRITICAL FIX: Do not run logic until the game is initialized
        }
        const { timestamp } = action.payload;
        // Create copies to avoid direct mutation
        let player = clone(state.player);
        let enemies = clone(state.enemies);
        let projectiles = clone(state.projectiles);
        let explosions = state.explosions.map(e => ({...e}));
        let lastPlayerFireTime = state.lastPlayerFireTime;
        
        // --- Player Logic ---
        const dx = state.mousePos.x - player.position.x;
        const dy = state.mousePos.y - player.position.y;
        player.rotation = Math.atan2(dy, dx);
        
        const targetVelocity = { x: 0, y: 0 };
        if (state.keys[CONTROLS.THRUST]) targetVelocity.y -= PLAYER_SETTINGS.ACCELERATION;
        if (state.keys[CONTROLS.BRAKE]) targetVelocity.y += PLAYER_SETTINGS.ACCELERATION;
        if (state.keys[CONTROLS.STRAFE_LEFT]) targetVelocity.x -= PLAYER_SETTINGS.ACCELERATION;
        if (state.keys[CONTROLS.STRAFE_RIGHT]) targetVelocity.x += PLAYER_SETTINGS.ACCELERATION;
        
        player.velocity.x += Math.cos(player.rotation) * targetVelocity.y + Math.cos(player.rotation + Math.PI/2) * targetVelocity.x;
        player.velocity.y += Math.sin(player.rotation) * targetVelocity.y + Math.sin(player.rotation + Math.PI/2) * targetVelocity.x;

        const speed = Math.sqrt(player.velocity.x**2 + player.velocity.y**2);
        if (speed > PLAYER_SETTINGS.MAX_SPEED) {
            player.velocity.x = (player.velocity.x / speed) * PLAYER_SETTINGS.MAX_SPEED;
            player.velocity.y = (player.velocity.y / speed) * PLAYER_SETTINGS.MAX_SPEED;
        }

        player.velocity.x *= PLAYER_SETTINGS.FRICTION;
        player.velocity.y *= PLAYER_SETTINGS.FRICTION;
        player.position.x += player.velocity.x;
        player.position.y += player.velocity.y;
        
        player.position.x = Math.max(player.radius, Math.min(GAME_WIDTH - player.radius, player.position.x));
        player.position.y = Math.max(player.radius, Math.min(GAME_HEIGHT - player.radius, player.position.y));

        if (state.keys[CONTROLS.FIRE] && timestamp > lastPlayerFireTime + PLAYER_SETTINGS.FIRE_RATE) {
            projectiles.push({
                id: `p_${timestamp}`,
                position: { ...player.position },
                velocity: { x: Math.cos(player.rotation) * PLAYER_SETTINGS.PROJECTILE_SPEED, y: Math.sin(player.rotation) * PLAYER_SETTINGS.PROJECTILE_SPEED },
                radius: PLAYER_SETTINGS.PROJECTILE_RADIUS,
                rotation: player.rotation,
                damage: PLAYER_SETTINGS.PROJECTILE_DAMAGE,
                isPlayerProjectile: true,
            });
            lastPlayerFireTime = timestamp;
        }

        // --- Enemy Logic ---
        enemies.forEach(enemy => {
            const dx_e = player.position.x - enemy.position.x;
            const dy_e = player.position.y - enemy.position.y;
            const distance = Math.sqrt(dx_e*dx_e + dy_e*dy_e);
            enemy.rotation = Math.atan2(dy_e, dx_e);
            
            if(distance > 200) {
                 enemy.velocity.x = (dx_e / distance) * ENEMY_SETTINGS[enemy.type].MAX_SPEED;
                 enemy.velocity.y = (dy_e / distance) * ENEMY_SETTINGS[enemy.type].MAX_SPEED;
            } else {
                enemy.velocity.x = Math.cos(enemy.rotation + Math.PI/2) * ENEMY_SETTINGS[enemy.type].MAX_SPEED * 0.5;
                enemy.velocity.y = Math.sin(enemy.rotation + Math.PI/2) * ENEMY_SETTINGS[enemy.type].MAX_SPEED * 0.5;
            }

            enemy.position.x += enemy.velocity.x;
            enemy.position.y += enemy.velocity.y;

            if (timestamp > enemy.lastFired + enemy.fireRate && distance < 500) {
                const settings = ENEMY_SETTINGS[enemy.type];
                projectiles.push({
                    id: `e_${enemy.id}_${timestamp}`,
                    position: { ...enemy.position },
                    velocity: { x: Math.cos(enemy.rotation) * settings.PROJECTILE_SPEED, y: Math.sin(enemy.rotation) * settings.PROJECTILE_SPEED },
                    radius: settings.PROJECTILE_RADIUS,
                    rotation: enemy.rotation,
                    damage: settings.PROJECTILE_DAMAGE,
                    isPlayerProjectile: false,
                });
                enemy.lastFired = timestamp;
            }
        });

        // --- Projectile & Collision Logic ---
        projectiles.forEach(p => {
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
        });

        const newExplosions: Explosion[] = [];
        projectiles.forEach(p => {
            if (p.position.x < -1000) return; // Already hit something

            if (p.isPlayerProjectile) {
                enemies.forEach(e => {
                    const dx_c = p.position.x - e.position.x;
                    const dy_c = p.position.y - e.position.y;
                    if (Math.sqrt(dx_c*dx_c+dy_c*dy_c) < p.radius + e.radius) {
                        p.position.x = -1000;
                        if (e.shield > 0) e.shield = Math.max(0, e.shield - p.damage);
                        else e.hull = Math.max(0, e.hull - p.damage);
                        if(e.hull <= 0) e.isDestroyed = true;
                    }
                });
            } else {
                const dx_c = p.position.x - player.position.x;
                const dy_c = p.position.y - player.position.y;
                if (Math.sqrt(dx_c*dx_c+dy_c*dy_c) < p.radius + player.radius) {
                    p.position.x = -1000;
                    if (player.shield > 0) player.shield = Math.max(0, player.shield - p.damage);
                    else player.hull = Math.max(0, player.hull - p.damage);
                    if(player.hull <= 0) player.isDestroyed = true;
                }
            }
        });
        
        enemies.filter(e => e.isDestroyed).forEach(e => {
            newExplosions.push({
                id: `exp_${e.id}`,
                position: e.position,
                radius: e.radius,
                life: 30, maxLife: 30, velocity: {x:0, y:0}, rotation: 0
            });
        });

        // --- Cleanup & State Update ---
        const nextProjectiles = projectiles.filter(p => p.position.x > -1000 && p.position.x < GAME_WIDTH + 100 && p.position.y > -100 && p.position.y < GAME_HEIGHT + 100);
        const nextEnemies = enemies.filter(e => !e.isDestroyed);
        const nextExplosions = explosions.map(e => ({...e, life: e.life - 1})).filter(e => e.life > 0).concat(newExplosions);
        
        let nextMessage = state.message;
        if(state.message && timestamp > state.messageTimeout) {
            nextMessage = null;
        }

        return { ...state, player, enemies: nextEnemies, projectiles: nextProjectiles, explosions: nextExplosions, lastPlayerFireTime, message: nextMessage };
      }
    default:
      return state;
  }
};

const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
    if (player.isDestroyed) return;
    
    ctx.save();
    ctx.translate(player.position.x, player.position.y);
    ctx.rotate(player.rotation);
    ctx.beginPath();
    ctx.moveTo(player.radius, 0);
    ctx.lineTo(-player.radius / 2, -player.radius * 0.8);
    ctx.lineTo(-player.radius / 2, player.radius * 0.8);
    ctx.closePath();
    ctx.fillStyle = '#0ff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
};

const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    ctx.save();
    ctx.translate(enemy.position.x, enemy.position.y);
    ctx.rotate(enemy.rotation);
    ctx.beginPath();
    
    const settings = ENEMY_SETTINGS[enemy.type];
    const r = settings.RADIUS;

    switch(enemy.type){
        case EnemyType.FIGHTER:
            ctx.moveTo(r, 0);
            ctx.lineTo(-r, -r/2);
            ctx.lineTo(-r, r/2);
            break;
        case EnemyType.INTERCEPTOR:
            ctx.moveTo(r, 0);
            ctx.lineTo(-r/2, -r);
            ctx.lineTo(-r, 0);
            ctx.lineTo(-r/2, r);
            break;
        case EnemyType.BOMBER:
             ctx.moveTo(-r, -r/2);
             ctx.lineTo(r, -r/2);
             ctx.lineTo(r, r/2);
             ctx.lineTo(-r, r/2);
             break;
        case EnemyType.CAPITAL:
            ctx.moveTo(r, 0);
            ctx.lineTo(r / 2, -r / 1.5);
            ctx.lineTo(-r, -r / 3);
            ctx.lineTo(-r, r / 3);
            ctx.lineTo(r / 2, r / 1.5);
            break;
    }

    ctx.closePath();
    ctx.fillStyle = '#f00';
    ctx.strokeStyle = '#f88';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#f00';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
};

const drawProjectile = (ctx: CanvasRenderingContext2D, projectile: Projectile) => {
    ctx.save();
    ctx.translate(projectile.position.x, projectile.position.y);
    ctx.beginPath();
    ctx.arc(0, 0, projectile.radius, 0, Math.PI * 2);
    ctx.fillStyle = projectile.isPlayerProjectile ? '#0ff' : '#f80';
    ctx.shadowColor = projectile.isPlayerProjectile ? '#0ff' : '#f80';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
};

const drawExplosion = (ctx: CanvasRenderingContext2D, explosion: Explosion) => {
    ctx.save();
    ctx.translate(explosion.position.x, explosion.position.y);
    const progress = explosion.life / explosion.maxLife;
    const radius = explosion.radius * (1.5 - progress);
    const alpha = progress;
    
    ctx.beginPath();
    ctx.arc(0,0, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
    ctx.shadowColor = `rgba(255, 255, 0, ${alpha})`;
    ctx.shadowBlur = 20;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0,0, radius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
    ctx.restore();
}

const Game: React.FC<GameProps> = ({ levelConfig, onMissionEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    dispatch({ type: 'RESET', payload: { levelConfig } });
  }, [levelConfig]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => dispatch({ type: 'KEY_DOWN', payload: e.key }), []);
  const handleKeyUp = useCallback((e: KeyboardEvent) => dispatch({ type: 'KEY_UP', payload: e.key }), []);

  const handleMouseDown = useCallback(() => dispatch({ type: 'KEY_DOWN', payload: CONTROLS.FIRE }), []);
  const handleMouseUp = useCallback(() => dispatch({ type: 'KEY_UP', payload: CONTROLS.FIRE }), []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if(rect){
          const scaleX = GAME_WIDTH / rect.width;
          const scaleY = GAME_HEIGHT / rect.height;
          const mousePos = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
          dispatch({ type: 'MOUSE_MOVE', payload: mousePos });
      }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
  
  useEffect(() => {
    if (!state.gameStarted) return;

    if (state.player.isDestroyed) {
      setTimeout(() => onMissionEnd(false), 1000); // Delay to show explosion
    } else if (state.enemies.length === 0) {
      setTimeout(() => onMissionEnd(true), 500);
    }
  }, [state.gameStarted, state.player.isDestroyed, state.enemies.length, onMissionEnd]);

  // Game Loop for logic updates
  useEffect(() => {
    const loop = (timestamp: number) => {
      dispatch({ type: 'TICK', payload: { timestamp } });
      animationFrameId.current = window.requestAnimationFrame(loop);
    };
    animationFrameId.current = window.requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) {
        window.cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []); // Run only once

  // Drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !state.player.id) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    state.projectiles.forEach(p => drawProjectile(ctx, p));
    state.enemies.forEach(e => drawEnemy(ctx, e));
    drawPlayer(ctx, state.player);
    state.explosions.forEach(e => drawExplosion(ctx,e));

    if (state.message) {
        ctx.font = '48px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.shadowColor = 'rgba(0, 255, 255, 1)';
        ctx.shadowBlur = 10;
        ctx.fillText(state.message, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
        ctx.shadowBlur = 0;
    }
  }, [state]);

  return (
    <div className="relative" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop firing if mouse leaves canvas
      />
      <HUD player={state.player} enemiesLeft={state.enemies.length} />
    </div>
  );
};

export default Game;