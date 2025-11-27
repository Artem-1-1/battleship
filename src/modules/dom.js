export default class DOM {
  constructor(game) {
    this.game = game;
    this.initializeElements();
    this.setupEventListeners();
    this.currentShip = null;
    this.currentDirection = 'horizontal';
    this.placeShips = new Set();

    this.createShipList();
    this.renderBoards();
  }

  initializeElements() {
    this.playerBoard = document.getElementById('playerBoard');
    this.computerBoard = document.getElementById('computerBoard');

    this.turnIndicator = document.getElementById('turnIndicator');
    this.gameStatus = document.getElementById('gameStatus');
    this.shipList = document.getElementById('shipList');
    this.playerShipStatus = document.getElementById('playerShipStatus');
    this.computerShipStatus = document.getElementById('computerShipStatus');

    this.rotateBtn = document.getElementById('rotateBtn');
    this.randomBtn = document.getElementById('randomBtn');
    this.startBtn = document.getElementById('startBtn');
    this.resetBtn = document.getElementById('resetBtn');

    this.modal = document.getElementById('gameOverModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalMessage = document.getElementById('modalMessage');
    this.playAgainBtn = document.getElementById('playAgainBtn');
  }

  setupEventListeners() {
    this.rotateBtn.addEventListener('click', () => this.rotateShip());
    this.randomBtn.addEventListener('click', () => this.randomizeShips());
    this.startBtn.addEventListener('click', () => this.startGame());
    this.resetBtn.addEventListener('click', () => this.resetGame());
    this.playAgainBtn.addEventListener('click', () => this.resetGame());
  }

  createShipList() {
    const ships = [
      { name: 'Carrier', length: 5 },
      { name: 'Battleship', length: 4 },
      { name: 'Cruiser', length: 3 },
      { name: 'Submarine', length: 3 },
      { name: 'Destroyer', length: 2 }
    ];

    this.shipList.innerHTML = '';
    ships.forEach(ship => {
      const shipItem = document.createElement('div');
      shipItem.className = 'ship-item';
      shipItem.dataset.length = ship.length;
      shipItem.dataset.name = ship.name;

      const shipPreview = document.createElement('div');
      shipPreview.className = 'ship-preview';

      for (let i = 0;i < ship.length; i++) {
        const segment = document.createElement('div');
        segment.className = 'ship-segment';
        shipPreview.appendChild(segment);
      }

      const shipName = document.createElement('span');
      shipName.textContent = ship.name;

      shipItem.appendChild(shipPreview);
      shipItem.appendChild(shipName);

      shipItem.addEventListener('click', () => {
        this.selectShip(ship);
      });
      this.shipList.appendChild(shipItem);
    })
  }

  selectShip() {
    if (this.placeShips.has(ship.name)) {
      this.showFeedback('Ship already placed!');
      return;
    }

    document.querySelectorAll('.ship-item').forEach(item => {
      item.classList.remove('placing');
    });

    this.currentShip = ship;
    const shipElement = document.querySelector(`[data-name="${ship.name}"]`);
    if (shipElement) {
      shipElement.classList.add('placing');
    }
    
    this.gameStatus.textContent = `Placing ${ship.name} - Click on your board to place`;
    this.gameStatus.className = 'game-status placement';
  }

  rotateShip() {
    this.currentDirection = this.currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
    this.gameStatus.textContent = `Ship direction: ${this.currentDirection}`;
    this.rotateBtn.textContent = `Rotate Ship - ${this.currentDirection}`
  }

  renderBoards() {
    this.renderPlayerBoard();
    this.renderComputerBoard();
    this.updateShipStatus();
  }

  renderPlayerBoard() {
    this.playerBoard.innerHTML = '';

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.x = x;
        cell.dataset.y = y;

        const hasShip = this.checkIfCellHasShip(x, y, 'human');
        if (hasShip) {
          cell.classList.add('ship');
        }

        const wasAttacked = this.checkIfCellAttacked(x, y, 'human');
        if (wasAttacked) {
          cell.classList.add(hasShip ? 'hit': 'miss');

          if(hasShip) {
            const ship = this.getShipCoordinate(x, y, 'human');
            if (ship && ship.isSunk()) {
              cell.classList.add('sunk');
            }
          }
        }

        cell.addEventListener('click', (e) => {
          this.placeShips(x, y);
        });
        this.playerBoard.appendChild(cell);
      }
    }
  }

  renderComputerBoard() {
    this.computerBoard.innerHTML = '';

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.x = x;
        cell.dataset.y = y;

        const wasAttacked = this.checkIfCellAttacked(x, y, 'computer');
        if (wasAttacked) {
          const hasShip = this.checkIfCellHasShip(x, y, 'computer');
          cell.classList.add(hasShip ? 'hit' : 'miss');

          if (hasShip) {
            const ship = this.getShipCoordinate(x, y, 'computer');
            if (ship && ship.isSunk()) {
              cell.classList.add('sunk')
            }
          }
        }
        cell.addEventListener('click', (e) => {
          if (!this.game.gameOver && this.game.currentPlayer === 'human') {
            this.attackComputer(x, y);
          } else {
            console.log('⏳ Click ignored - Game over:', this.game.gameOver, 'Current player:', this.game.currentPlayer);
          }
        });
        this.computerBoard.appendChild(cell);
      }
    }
    console.log('Computer board rendered with', this.computerBoard.children.length, 'cells');
  }

  checkIfCellHasShip(x, y, player) {
    const gameboard = this.game.players[player].gameboard;
    if (!gameboard.shipPositions) return false;

    for (const [ship, coordinates] of gameboard.shipPositions) {
      for (const [shipX, shipY] of coordinates) {
        if (shipX === x && shipY === y) {
          return true;
        }
      }
    }
    return false;
  }

  getShipCoordinate(x, y, player) {
    const gameboard = this.game.players[player].gameboard;
    if (!gameboard.shipPositions) return null;
    
    for (const [ship, coordinates] of gameboard.shipPositions) {
      for (const [shipX, shipY] of coordinates) {
        if (shipX === x && shipY === shipY) {
          return ship;
        }
      }
    }
    return null;
  }

  checkIfCellAttacked(x, y, player) {
    const enemyType = player === 'human' ? 'computer' : 'human';
    const enemyPlayer = this.game.players[enemyType];
    return enemyPlayer.previousAttacks.has(`${x},${y}`);
  }

  placeShip(x, y) {
    if (!this.currentShip) {
      this.showAttackFeedback('Please select a ship first!');
      return;
    }

    if (this.placeShips.has(this.currentShip.name)) {
      return;
    }

    try {
      this.game.players.human.gameboard.placeShip(
        this.currentShip.length,
        [x, y],
        this.currentDirection
      );

      this.placeShips.add(this.currentShip.name);
      this.showAttackFeedback(`${this.currentShip.name} placed!`);
      this.renderBoards;

      if (this.placeShips.size === 5) {
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start Game';
        this.gameStatus.textContent = 'All ships placed! Click "Start Game" to begin.';
        this.gameStatus.className = 'game-status victory';
      }

      const nextShip = Array.from(document.querySelectorAll('.ship-item'))
        .find(item => !this.placedShips.has(item.dataset.name));

      if (nextShip) {
        this.selectShip({
          name: nextShip.dataset.name,
          length: parseInt(nextShip.dataset.length)
        });
      } else {
        this.currentShip = null;
      } 
    } catch(error) {
      this.showAttackFeedback('Invalid placement! Try different coordinates.');
    }
  }

}