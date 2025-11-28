import Ship from "./ship.js";

export default class Gameboard {
  constructor() {
    this.ships = [];
    this.missedAttacks = [];
    this.shipPositions = new Map();
    this.allCoordinates = new Set();
  }

  placeShip(length, [startX, startY], direction) {
    if (startX < 0 || startX > 9 || startY < 0 || startY > 9) {
      throw new Error('Ship placement out of bounds');
    }

    const coordinates = [];
    const occupiedCheck = [];

    for (let i = 0; i < length; i++) {
      let x, y;
      if (direction === 'horizontal') {
        x = startX;
        y = startY + i;
      } else {
        x = startX + i;
        y = startY;
      }

      if (x > 9 || y > 9) {
        throw new Error('Ship placement out of bounds');
      }

      coordinates.push([x, y]);

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const checkX = x + dx;
          const checkY = y + dy;
          if (checkX >= 0 && checkX <= 9 && checkY >= 0 && checkY <= 9) {
            occupiedCheck.push(`${checkX},${checkY}`)
          }
        }
      }
    }

    for (const coord of occupiedCheck) {
      if (this.allCoordinates.has(coord)) {
        throw new Error('Ships must have at least 1 cell spacing between them');
      }
    }

    const ship = new Ship(length);
    this.ships.push(ship);
    this.shipPositions.set(ship, coordinates);

    coordinates.forEach(([x, y]) => {
      this.allCoordinates.add(`${x},${y}`);
    });

    return ship;
  }

  receiveAttack([x, y]) {
    for (const [ship, coordinates] of this.shipPositions) {
      for (const [shipX, shipY] of coordinates) {
        if (shipX === x && shipY === y) {
          ship.hit();
          return true;
        }
      }
    }
    this.missedAttacks.push([x, y]);
    return false;
  }

  allShipsSunk() {
    return this.ships.length > 0 && this.ships.every(ship => ship.isSunk());
  }

  getShipCoordinates(ship) {
    return this.shipPositions.get(ship) || [];
  }
}