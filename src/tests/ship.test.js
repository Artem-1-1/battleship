import Ship from '../modules/ship.js';

describe('Ship', () => {
  test('creates a ship with correct length', () => {
    const ship = new Ship(3);
    expect(ship.length).toBe(3);
  });

  test('creates a ship with zero hits initially', () => {
    const ship = new Ship(3);
    expect(ship.hits).toBe(0);
  });

  test('creates a ship that is not sunk initially', () => {
    const ship = new Ship(3);
    expect(ship.isSunk()).toBe(false);
  });
});

test('hit method increases hit count', () => {
    const ship = new Ship(3);
    ship.hit();
    expect(ship.hits).toBe(1);
  });
  
  test('multiple hits increase hit count', () => {
    const ship = new Ship(3);
    ship.hit();
    ship.hit();
    expect(ship.hits).toBe(2);
  });

  test('ship is not sunk when hits are less than length', () => {
    const ship = new Ship(3);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(false);
  });
  
  test('ship is sunk when hits equal length', () => {
    const ship = new Ship(3);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
  
  test('ship is sunk when hits exceed length', () => {
    const ship = new Ship(3);
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });