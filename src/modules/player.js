import Gameboard from "./gameboard.js";

export default class Player {
  constructor(type) {
    this.type = type;
    this.gameboard = new Gameboard;
    this.previousAttacks = new Set();
  }

  makeRandomAttack() {
    if (this.previousAttacks.size >= 100) {
      return null;
    }
    let x, y, attackKey;
    let attempts = 0;
    const maxAttempts = 200;

    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      attackKey = `${x},${y}`;
      attempts++;

      if (attempts > maxAttempts) {
        return null;
      }
    } while (this.previousAttacks.has(attackKey));

    this.previousAttacks.add(attackKey);
    return [x, y];
  }

  makeAttack([x, y]) {
    const attackKey = `${x},${y}`;

    if (this.previousAttacks.has(attackKey)) {
      throw new Error(`Already attacked this coordinate: ${x},${y}`);
    }

    this.previousAttacks.add(attackKey)
    return [x, y];
  }

  hasAttacked([x, y]) {
    return this.previousAttacks.has(`${x},${y}`);
  }

  resetAttacks() {
    this.previousAttacks.clear();
  }
}