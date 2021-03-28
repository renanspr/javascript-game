// Define style variables
const TILE_SIZE = 48;
const HELMET_OFFSET = 12;
const GAME_SIZE = TILE_SIZE * 20;

// Set style variables on root
const root = document.documentElement;
root.style.setProperty('--tile-size', `${TILE_SIZE}px`);
root.style.setProperty('--helmet-offset', `${HELMET_OFFSET}px`);
root.style.setProperty('--game-size', `${GAME_SIZE}px`);

// -----

function createBoard() {
  const boardElement = document.getElementById('board');
  const elements = [];

  // Create div to rendering the element 
  function createElement(options) {
    let { item, top, left } = options;

    const currentElement = { item, currentPosition: { top, left } };
    elements.push(currentElement);

    const htmlElement = document.createElement('div');
    htmlElement.className = item;
    htmlElement.style.top = `${top}px`;
    htmlElement.style.left = `${left}px`;

    boardElement.appendChild(htmlElement);


    // Strafe movement options
    function getNewDirection(buttonPressed, position) {
      switch (buttonPressed) {
        case 'ArrowUp':
        case 'w':
          return { top: position.top - TILE_SIZE, left: position.left};

        case 'ArrowRight':
        case 'd':
          return { top: position.top, left: position.left + TILE_SIZE};

        case 'ArrowDown':
        case 's':
          return { top: position.top + TILE_SIZE, left: position.left};

        case 'ArrowLeft':
        case 'a':
          return { top: position.top, left: position.left - TILE_SIZE};

        default:
          return position;
      }
    }

    function validateMovement (position, conflictItem) {
      return (
        position.left >= 48 && 
        position.left <= 864 &&
        position.top >= 96 &&
        position.top <= 816 &&
        conflictItem?.item !== 'forniture'
      )
    }

    function getMovementConflict(position, elem) {
      const conflictItem = elem.find((currentElement) => {
        return (
          currentElement.currentPosition.top === position.top &&
          currentElement.currentPosition.left === position.left
        )
      });

      return conflictItem; 
    }

    function validadeConflicts(currentElem, conflictItem) {
      function finishGame(message) {
        setTimeout(() => {
          alert(message);
          location.reload();
        }, 25);
      }

      let getSteps = localStorage.getItem("steps");

      if (!conflictItem) {
        if (getSteps == 0) {
          localStorage.setItem("steps", 50);
          finishGame("Você morreu!");
        }
        return;
      }

      if (currentElem.item === 'hero') {
        if (conflictItem.item === 'mini-demon' || conflictItem.item === 'trap') {
          finishGame("Você morreu!");
        }

        if (conflictItem.item === 'chest') {
         finishGame("Você ganhou!");
        }
      }

      if (currentElem.item === 'mini-demon' && conflictItem.item === 'hero') {
        finishGame("Você morreu!");
      }
    }

    // Set new position when move
    function move(buttonPressed) {
      const newPosition =  getNewDirection(buttonPressed, currentElement.currentPosition);
      const conflictItem = getMovementConflict(newPosition, elements);
      const isValidMovement = validateMovement(newPosition, conflictItem);

      // Validating movement
      if (isValidMovement) {
        currentElement.currentPosition = newPosition;
        htmlElement.style.top = `${newPosition.top}px`;
        htmlElement.style.left = `${newPosition.left}px`;
        validadeConflicts(currentElement, conflictItem);
      }
    }

    return {
      move
    }
  }

  // Rendering itens
  function createItem(options) {
    createElement(options);
  }

  // Rendering Hero
  function createHero(options) {
    let steps = 60;

    const hero = createElement({
      item: 'hero',
      top: options.top,
      left: options.left
    });

    let pressDown = false;

    document.addEventListener('keydown', (event) => {
      if(pressDown) {
        return 
      }

      pressDown = true;
      steps = steps - 1;
      localStorage.setItem("steps", steps);
      printSteps();
      hero.move(event.key)
    }, false);

    document.addEventListener('keyup', () => {
      pressDown = false;
    }, false);
  }

  // Rendering Enemy
  function createEnemy(options) {
    const enemy = createElement({
      item: 'mini-demon',
      top: options.top,
      left: options.left
    });

    // Create random direction for enemy 
    setInterval(() => {
      const direction = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
      const randomIndex = Math.floor(Math.random() * direction.length);
      const randomDirection = direction[randomIndex];

      enemy.move(randomDirection);
    }, 1000)
  }

  return {
    createItem,
    createHero,
    createEnemy
  }
}

// Setting dificulties
function changeDifficulty() {
  function quantityOfItems(quantity) {
    for(let i = 0; i < quantity; i++) {
      let positionX = Math.floor(Math.random() * (19 - 5) + 5);
      let positionY = Math.floor(Math.random() * (13 - 2) + 2);

      while (positionY == 4 && positionX == 16) {
          positionX = Math.floor(Math.random() * (19 - 5) + 5);
          positionY = Math.floor(Math.random() * (13 - 2) + 2);
      }
  
      board.createEnemy({ top: TILE_SIZE * positionY, left: TILE_SIZE * positionX });
      board.createItem({ item: 'trap', top: TILE_SIZE * positionY, left: TILE_SIZE * positionX });
    }
  }

  function setDifficulty(difficulty) {
    switch(difficulty) {
      case "1":
        quantityOfItems(10);
        break;
      
      case "2":
        quantityOfItems(25);
        break;
  
      case "3":
        quantityOfItems(50);
        break;

      default:
        quantityOfItems(10);
        break;
      }
    }

  const getDifficulty = localStorage.getItem("difficulty");
  const difficultyElem = document.getElementById("difficulty");

  if (getDifficulty == 1) {
    difficultyElem.innerHTML = "Fácil"
  }

  else if (getDifficulty == 2) {
    difficultyElem.innerHTML = "Médio"
  }

  else if (getDifficulty == 3) {
    difficultyElem.innerHTML = "Difícil"
  } 
  
  else {
    difficultyElem.innerHTML = "Fácil"
  }
  
  setDifficulty(getDifficulty);
}

function setNewDifficulty() {
  let newDifficulty = prompt("Selecione a dificuldade desejada: \n1 = Fácil \n2 = Médio \n3 = Difícil");
  localStorage.setItem("difficulty", newDifficulty);
  location.reload();
}

function printSteps() {
  const stepsElem = document.getElementById("steps");
  let steps = localStorage.getItem("steps");
  stepsElem.innerHTML = steps;
}

// ----------
const board = createBoard();
changeDifficulty();
printSteps();

board.createHero({ top: TILE_SIZE * 16, left: TILE_SIZE * 2 });
board.createItem({ item: 'chest', top: TILE_SIZE * 4, left: TILE_SIZE * 16 });

board.createItem({ item: 'forniture', top: TILE_SIZE * 17, left: TILE_SIZE * 2 });
board.createItem({ item: 'forniture', top: TILE_SIZE * 2, left: TILE_SIZE * 3 });
board.createItem({ item: 'forniture', top: TILE_SIZE * 2, left: TILE_SIZE * 8 });
board.createItem({ item: 'forniture', top: TILE_SIZE * 2, left: TILE_SIZE * 16 });




