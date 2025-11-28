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

  selectShip(ship) {
    if (this.placeShips.has(ship.name)) {
      this.showAttackFeedback('Ship already placed!', '✅');
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
          this.placeShip(x, y);
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
        if (shipX === x && shipY === y) {
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
      this.showAttackFeedback('Please select a ship first!', '❌');
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
      this.showAttackFeedback(`${this.currentShip.name} placed!`, '✅');
      this.renderBoards();

      if (this.placeShips.size === 5) {
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start Game';
        this.gameStatus.textContent = 'All ships placed! Click "Start Game" to begin.';
        this.gameStatus.className = 'game-status victory';
      }

      const nextShip = Array.from(document.querySelectorAll('.ship-item'))
        .find(item => !this.placeShips.has(item.dataset.name));

      if (nextShip) {
        this.selectShip({
          name: nextShip.dataset.name,
          length: parseInt(nextShip.dataset.length)
        });
      } else {
        this.currentShip = null;
      } 
    } catch(error) {
      this.showAttackFeedback('Invalid placement! Try different coordinates.', '❌');
    }
  }

  randomizeShips() {
    this.game.players.human.gameboard.ships = [];
    this.game.players.human.gameboard.shipPositions = new Map();
    this.game.players.human.gameboard.allCoordinates = new Set();
    this.placeShips.clear();

    const ships = [
      { name: 'Carrier', length: 5 },
      { name: 'Battleship', length: 4 },
      { name: 'Cruiser', length: 3 },
      { name: 'Submarine', length: 3 },
      { name: 'Destroyer', length: 2 }
    ];

    let successfulPlacements = 0;

    ships.forEach(ship => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 500;

      while (!placed && attempts < maxAttempts) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';

        try {
          this.game.players.human.gameboard.placeShip(ship.length, [x, y], direction);
          this.placeShips.add(ship.name);
          placed = true;
          successfulPlacements++;
        } catch (error) {
          attempts++;
          if (attempts === maxAttempts) {
            console.error('Failed to place', ship.name, 'after', maxAttempts, 'attempts');
          }
        }
      }
    });

    this.renderPlayerBoard();

    if (successfulPlacements === 5) {
      this.startBtn.disabled = false;
      this.startBtn.textContent = 'Start Game';
      this.gameStatus.textContent = 'Ships randomly placed! Click "Start Game" to begin.';
      this.gameStatus.className = 'game-status victory';
      this.showAttackFeedback('All ships placed successfully!', '🎉');
    } else {
      this.startBtn.disabled = true;
      this.gameStatus.textContent = `Only ${successfulPlacements}/5 ships placed. Try again.`;
      this.showAttackFeedback(`Could only place ${successfulPlacements}/5 ships. Try again.`, '⚠️');
    }
  }

  attackComputer(x, y) {
    if (this.game.gameOver) {
      this.showGameOver(this.game.winner);
      return;
    }

    if (this.game.currentPlayer !== 'human') {
      this.showAttackFeedback('Not your turn!', '⏳');
      return;
    }

    const result = this.game.humanAttack([x, y]);

    if (result.error) {
      this.showAttackFeedback(result.error, '❌');
      return;
    }

    if (result.hit) {
      this.showAttackFeedback('Direct Hit', '💥');
      this.gameStatus.textContent = '💥 Hit! Take another shot! 💥';
      this.turnIndicator.textContent = '🎯 Your Turn (Extra)';

      const ship = this.getShipCoordinate(x, y, 'computer');
      if (ship && ship.isSunk()) {
        this.showAttackFeedback('Enemy Ship Sunk!', '⚰️');
      }
    } else {
      this.showAttackFeedback('Splash! Missed...', '🌊');
      this.gameStatus.textContent = '🌊 Miss! Computer\'s turn... 🌊';
    }

    this.renderBoards();

    if (result.gameOver) {
      this.showGameOver(result.winner) 
    } else if (result.turnSwitched) {
      this.updateGameStatus();
    }
  }

  updateGameStatus() {
    const currentPlayer = this.game.currentPlayer;

    if (currentPlayer === 'human') {
      this.turnIndicator.textContent = 'Your Turn';
      this.turnIndicator.className = 'turn-indicator human';
      this.gameStatus.textContent = 'Your turn - Attack enemy waters!';
      this.gameStatus.className = 'game-status battle';
    } else {
      this.turnIndicator.textContent = 'Computer\'s Turn';
      this.turnIndicator.className = 'turn-indicator computer';
      this.gameStatus.textContent = 'Computer is thinking...';
      this.gameStatus.className = 'game-status battle';
    }

    if (currentPlayer === 'computer' && !this.game.gameOver) {
      setTimeout(() => {
        const result = this.game.computerAttack();
        this.renderBoards();

        if (result && result.hit) {
          this.showAttackFeedback('Enemy hit your ship!', '💢');
          this.turnIndicator.textContent = 'Computer\'s Turn (Extra)';
          this.gameStatus.textContent = '💢 Computer hit your ship! 💢';

          const ship = this.getShipCoordinate(result.attack[0], result.attack[1], 'human');
          if (ship && ship.isSunk()) {
            this.showAttackFeedback('Your Ship Sunk!', '💀');
          }
        } else if (result) {
          this.showAttackFeedback('Enemy missed!', '✅');
        }

        if (result && result.gameOver) {
          this.showGameOver(result.winner);
        } else if (result && result.turnSwitched) {
          this.turnIndicator.textContent = '🎯 Your Turn';
          this.gameStatus.textContent = 'Enemy missed! Your turn.';
        } else if (result && result.hit) {
          setTimeout(() => this.updateGameStatus(), 1000);
        }
      }, 1500);
    }
  }

  showAttackFeedback(message, emoji) {
    const feedback = document.createElement('div');
    feedback.className = 'attack-feedback';
    feedback.textContent = `${emoji} ${message} ${emoji}`;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 2000);
  }

  updateShipStatus() {
    this.updatePlayerShipStatus();
    this.updateComputerShipStatus();
  }

  updatePlayerShipStatus() {
    this.playerShipStatus.innerHTML = '<h4>🎯 Your Fleet</h4>';
    const playerShips = this.game.players.human.gameboard.ships;
    const playerSunkShips = playerShips.filter(ship => ship.isSunk()).length;

    const statusItem = document.createElement('div');
    statusItem.className = 'ship-status-item';

    if (playerSunkShips === playerShips.length) {
      statusItem.innerHTML = `💀 All Ships Sunk! ${playerSunkShips}/${playerShips.length}`;
    } else {
      statusItem.innerHTML = `🚢 Ships: ${playerSunkShips}/${playerShips.length} sunk`;
    }
    this.playerShipStatus.appendChild(statusItem);
  }

  updateComputerShipStatus() {
    this.computerShipStatus.innerHTML = '<h4>🎯 Enemy Fleet</h4>';
    const computerShips = this.game.players.computer.gameboard.ships;
    const computerSunkShips = computerShips.filter(ship => ship.isSunk()).length;

    const statusItem = document.createElement('div');
    statusItem.className = 'ship-status-item';

    if (computerSunkShips === computerShips.length) {
      statusItem.innerHTML = `🎉 All Enemy Ships Sunk! ${computerSunkShips}/${computerShips.length}`;
    } else {
      statusItem.innerHTML = `🚢 Enemy: ${computerSunkShips}/${computerShips.length} sunk`;
    }
    this.computerShipStatus.appendChild(statusItem);
  }

  startGame() {
    if (this.placeShips.size < 5) {
      this.gameStatus.textContent = 'Place all 5 ships before starting!';
      this.gameStatus.className = 'game-status defeat';
      console.log('Not all ships placed:', this.placeShips.size);
      this.showAttackFeedback(`Place all 5 ships! (${this.placeShips.size}/5)`, '❌');
      return;
    }

    try {
      this.game.initializeComputerShips();
      this.gameStatus.textContent = '🎮 Game started! Attack enemy waters.';
      this.gameStatus.className = 'game-status battle';
      this.startBtn.disabled = true;
      this.renderBoards();
      this.updateGameStatus();
      this.showAttackFeedback('Game Started!', '🎮');
    } catch (error) {
      this.gameStatus.textContent = '❌ Error starting game!';
      this.showAttackFeedback('Error starting game!', '❌');
    }
    this.debugShipPlacement();
  }

  resetGame() {
    this.game = new (this.game.constructor)();
    this.currentShip = null;
    this.currentDirection = 'horizontal';
    this.placeShips.clear();

    if (this.modal) this.modal.classList.remove('show');
    if (this.startBtn) {
      this.startBtn.disabled = true;
      this.startBtn.textContent = 'Start Game';
    }
    if (this.rotateBtn) this.rotateBtn.textContent = 'Rotate Ship ';

    this.createShipList();
    this.renderBoards();

    if (this.gameStatus) {
      this.gameStatus.textContent = 'Place your ships to start';
      this.gameStatus.className = 'game-status placement';
    }
    if (this.turnIndicator) {
      this.turnIndicator.textContent = 'Your Turn';
      this.turnIndicator.className = 'turn-indicator human';
    }

    this.showAttackFeedback('Game Reset!', '🔄');
  }

  showGameOver(winner) {
    if (winner === 'human') {
      document.body.classList.add('victory-celebration');
      this.showAttackFeedback('VICTORY! All enemy ships destroyed!', '🎉');
    } else if (winner === 'computer') {
      this.showAttackFeedback('DEFEAT! Your fleet has been destroyed!', '💥');
    } else {
      this.showAttackFeedback('TIE GAME! Mutual destruction!', '🤝');
    }

    setTimeout(() => {
      if (winner === 'tie') {
        this.modalTitle.textContent = 'Game Over - Tie!';
        this.modalTitle.className = 'tie';
        this.modalMessage.textContent = '🤝 All ships sunk! It\'s a tie game! 🤝';
      } else {
        this.modalTitle.textContent = winner === 'human' ? 'Victory! 🎉' : 'Defeat! 💥';
        this.modalTitle.className = winner === 'human' ? 'victory' : 'defeat';
        this.modalMessage.textContent = winner === 'human' 
            ? '🎉 Congratulations! You sunk all enemy ships! 🎉'
            : '💥 The computer sunk all your ships. Better luck next time! 💥';
      }
      this.modal.classList.add('show');
    }, 2000);
  }

  debugShipPlacement() {
    this.game.players.computer.gameboard.ships.forEach((ship, index) => {
      const coords = this.game.players.computer.gameboard.getShipCoordinates(ship);
      console.log(`Computer ship ${index + 1}:`, coords);
    });
  }
}