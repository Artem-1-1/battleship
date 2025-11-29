import Player from '../modules/player.js';
import Gameboard from '../modules/gameboard.js';

describe('Player', () => {
  test('creates a human player with a gameboard', () => {
    const player = new Player('human');
    expect(player.type).toBe('human');
    expect(player.gameboard).toBeInstanceOf(Gameboard);
  });

  test('creates a computer player with a gameboard', () => {
    const player = new Player('computer');
    expect(player.type).toBe('computer');
    expect(player.gameboard).toBeInstanceOf(Gameboard);
  });

  test('computer can make random legal attacks', () => {
    const player = new Player('computer');
    const enemyGameboard = new Gameboard();
    
    const attack = player.makeRandomAttack();
    
    // Attack should be valid coordinates
    expect(attack).toHaveLength(2);
    expect(attack[0]).toBeGreaterThanOrEqual(0);
    expect(attack[0]).toBeLessThan(10);
    expect(attack[1]).toBeGreaterThanOrEqual(0);
    expect(attack[1]).toBeLessThan(10);
  });
  
  test('computer does not repeat attacks', () => {
    const player = new Player('computer');
    const enemyGameboard = new Gameboard();
    
    const attacks = new Set();
    
    // Make multiple attacks (should all be unique)
    for (let i = 0; i < 10; i++) {
      const attack = player.makeRandomAttack();
      const attackKey = `${attack[0]},${attack[1]}`;
      
      // If this attack was already made, fail the test
      if (attacks.has(attackKey)) {
        fail(`Duplicate attack: ${attack}`);
      }
      
      attacks.add(attackKey);
    }
  });
});