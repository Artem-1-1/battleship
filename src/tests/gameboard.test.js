import Gameboard from '../modules/gameboard.js'
import Ship from '../modules/ship.js';

describe('Gameboard', () => {
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard();
  });

  test('creates an empty gameboard', () => {
    expect(gameboard.ships).toEqual([]);
    expect(gameboard.missedAttacks).toEqual([]);
  });

  test('places a ship horizontally at specific coordinates', () => {
    const ship = gameboard.placeShip(3, [2, 3], 'horizontal');
    expect(ship).toBeInstanceOf(Ship);
    expect(ship.length).toBe(3);
    expect(gameboard.ships).toContain(ship);
  });

  test('places a ship vertically at specific coordinates', () => {
    const ship = gameboard.placeShip(3, [2, 3], 'vertical');
    expect(ship).toBeInstanceOf(Ship);
    expect(ship.length).toBe(3);
  });

  test('tracks ship coordinates correctly for horizontal placement', () => {
    const ship = gameboard.placeShip(3, [2, 3], 'horizontal');
    
    // Should track all coordinates the ship occupies
    const expectedCoordinates = [[2, 3], [2, 4], [2, 5]];
    expect(gameboard.getShipCoordinates(ship)).toEqual(expectedCoordinates);
  });
  
  test('tracks ship coordinates correctly for vertical placement', () => {
    const ship = gameboard.placeShip(3, [2, 3], 'vertical');
    
    const expectedCoordinates = [[2, 3], [3, 3], [4, 3]];
    expect(gameboard.getShipCoordinates(ship)).toEqual(expectedCoordinates);
  });

  test('receiveAttack records missed shots', () => {
    gameboard.placeShip(3, [2, 3], 'horizontal');
    gameboard.receiveAttack([5, 5]);
    
    expect(gameboard.missedAttacks).toContainEqual([5, 5]);
    expect(gameboard.missedAttacks.length).toBe(1);
  });
  
  test('receiveAttack does not record hit shots as missed', () => {
    gameboard.placeShip(3, [2, 3], 'horizontal');
    gameboard.receiveAttack([2, 3]);
    
    expect(gameboard.missedAttacks).not.toContainEqual([2, 3]);
  });

  test('allShipsSunk returns false when not all ships are sunk', () => {
    gameboard.placeShip(2, [0, 0], 'horizontal');
    gameboard.placeShip(3, [3, 3], 'vertical');
    
    expect(gameboard.allShipsSunk()).toBe(false);
  });
  
  test('allShipsSunk returns true when all ships are sunk', () => {
    const ship1 = gameboard.placeShip(2, [0, 0], 'horizontal');
    const ship2 = gameboard.placeShip(1, [3, 3], 'horizontal');
    
    // Sink all ships
    gameboard.receiveAttack([0, 0]);
    gameboard.receiveAttack([0, 1]);
    gameboard.receiveAttack([3, 3]);
    
    expect(gameboard.allShipsSunk()).toBe(true);
  });
});