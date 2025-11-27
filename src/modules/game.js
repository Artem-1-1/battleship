import Player from "./player.js";

export default class Game {
  constructor() {
    this.players = {
      human: new Player('human'),
      computer: new Player('computer')
    };
    this.currentPlayer = 'human';
    this.gameOver = false;
    this.winner = null;

    this.initializeComputerShips();
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === 'human' ? 'computer' : 'human';
  }

  humanAttack([x, y]) {
    if (this.gameOver) {
      return { error: 'Game is over'  }
    }

    if (this.currentPlayer !== 'human') {
      return { error: 'Not your turn'};
    }

    try {
      this.players.human.makeAttack([x, y]);

      if (typeof this.players.computer.gameboard.receiveAttack !== 'function') {
        throw new Error('Computer gameboard missing receiveAttack method');
      }

      const hit = this.players.computer.gameboard.receiveAttack([x, y]);
      this.checkGameOver();

      if (!hit && !this.gameOver) {
        this.switchTurn();
        return {
          hit,
          gameOver: this.gameOver,
          winner: this.winner,
          turnSwitched: true
        };
      }

      return {
        hit,
        gameOver: this.gameOver,
        winner: this.winner,
        turnSwitched: false 
      };
    } catch(error) {
      return { error: error.message };
    }
  }

  computerAttack() {
    if (this.gameOver || this.currentPlayer !== 'computer') {
      return null;
    }

    const attack = this.players.computer.makeRandomAttack();

    if (!attack) {
      this.checkGameOver();
      if (!this.gameOver) {
        this.switchTurn;
      }
      return { error: 'No valid attacks remaining' };
    }
    
    const hit = this.players.human.gameboard.receiveAttack(attack);

    this.checkGameOver();

    if (!hit && !this.gameOver) {
      this.switchTurn();
    }

    return {
      attack, 
      hit, 
      gameOver: this.gameOver,
      winner: this.winner,
      turnSwitched: !hit
    };
  }

  checkGameOver() {
    const humanAllSunk = this.players.human.gameboard.allShipsSunk();
    const computerAllSunk = this.players.computer.gameboard.allShipsSunk();

    if (humanAllSunk) {
      this.gameOver = true;
      this.winner = 'computer';
    } else if (computerAllSunk) {
      this.gameOver = true;
      this.winner = 'human';
    }

    const humanAttacks = this.players.human.previousAttacks.size;
    const computerAttacks = this.players.computer.previousAttacks.size;
    const totalPossibleAttacks = 100;

    if (humanAttacks >= totalPossibleAttacks || computerAttacks >= totalPossibleAttacks) {
      this.gameOver = true;
      const humanShipsRemaining = this.players.human.gameboard.ships.filter(ship => !ship.isSunk()).length;
      const computerShipsRemaining = this.players.computer.gameboard.ships.filter(ship => !ship.isSunk()).length;

      if (humanShipsRemaining > computerShipsRemaining) {
        this.winner = 'human';
      } else if (computerShipsRemaining > humanShipsRemaining) {
        this.winner = 'computer';
      } else {
        this.winner = 'tie';
      }
    }
  }

  initializeComputerShips() {
    this.players.computer.gameboard.ships = [];
    this.players.computer.gameboard.shipPositions = new Map();
    this.players.computer.gameboard.allCoordinates = new Set();

    const ships = [
      { length: 5, name: 'Carrier' },
      { length: 4, name: 'Battleship' },
      { length: 3, name: 'Cruiser' },
      { length: 3, name: 'Submarine' },
      { length: 2, name: 'Destroyer' }
  ];

  ships.forEach(ship => {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 500;

    while (!placed && attempts < maxAttempts) {
      const x = Math.floor(Math.random() * 10);
      const y = Math.floor(Math.random() * 10);
      const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';

      try {
        this.players.computer.gameboard.placeShip(ship.length, [x, y], direction);
        placed = true;
      } catch(error) {
        attempts++;
        if (attempts === maxAttempts) {
          console.error(`Computer failed to place ${ship.name} after ${maxAttempts} attempts`);
        }
      }
    }
  })
  console.log('Computer ships initialized:', this.players.computer.gameboard.ships.length);
  }

  initializeShips() {
    if (this.players.human.gameboard.ships.length === 0) {
      const humanShips = [
        { length: 5, coordinates: [0, 5], direction: 'horizontal' },
        { length: 4, coordinates: [2, 5], direction: 'horizontal' },
        { length: 3, coordinates: [4, 5], direction: 'horizontal' },
        { length: 3, coordinates: [6, 5], direction: 'horizontal' },
        { length: 2, coordinates: [8, 5], direction: 'horizontal' }
      ];

      humanShips.forEach(ship => {
        this.players.human.gameboard.placeShip(ship.length, ship.coordinates, ship.direction);
      });
      console.log('Default human ships initialized:', this.players.human.gameboard.ships.length);
    } else {
      console.log('Human ships already placed:', this.players.human.gameboard.ships.length);
    }
  }
}