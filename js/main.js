const WINNER_LINES = [
  [1,2,3],
  [4,5,6],
  [7,8,9],
  [1,4,7],
  [2,5,8],
  [3,6,9],
  [1,5,9],
  [3,5,7]
]

const STATE = {
  user: '',
  comp: '',
  steps: []
}

function getRandomElement(arr) {
  if (arr.length === 0) {
      throw new Error("Массив не должен быть пустым");
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function crossElement() {
  const crossContainer = document.createElement('div');
  const div_1 = document.createElement('div');
  const div_2 = document.createElement('div');
  crossContainer.classList.add('cross');
  crossContainer.setAttribute('data-type', 'cross');
  crossContainer.append(div_1, div_2);

  return crossContainer;
}

function zeroElement() {
  const zeroContainer = document.createElement('div');
  const circle = document.createElement('div');
  zeroContainer.classList.add('zero');
  zeroContainer.setAttribute('data-type', 'zero')
  zeroContainer.append(circle);
  
  return zeroContainer;
}

function updateCell(cell, elem) {
  if (elem == 'cross') {
    cell.append(crossElement());
  } else {
    cell.append(zeroElement());
  }
}

function choiceUserElement(state, winnerLines) {
  const choiceCrossBtn = document.getElementById('choiceCross');
  const choiceZeroBtn = document.getElementById('choiceZero');

  choiceCrossBtn.addEventListener('click', () => {
    state.user = 'cross';
    state.comp = 'zero';
    if (!choiceCrossBtn.classList.contains('active')) {
      choiceCrossBtn.classList.add('active');
      choiceZeroBtn.disabled = true;
    }
    startApp(state, winnerLines);
  });

  choiceZeroBtn.addEventListener('click', () => {
    state.user = 'zero';
    state.comp = 'cross';
    if (!choiceZeroBtn.classList.contains('active')) {
      choiceZeroBtn.classList.add('active')
      choiceCrossBtn.disabled = true;
    }
    startApp(state, winnerLines);
  });
}

function clearFirstElement(hSteps) {
  if (hSteps.length == 8) {
    const index = Object.values(hSteps[0])[0];
    const cell = document.querySelector(`[data-index="${index}"]`);

    cell.innerHTML = '';
    hSteps.shift();
  }
}

function victory(winLines, currentSteps) {
  return winLines.some(winLine => 
    winLine.every(item => currentSteps.includes(item))
  );
}

function restart() {
  modal.querySelector('button').addEventListener('click', () => {
    location.reload()
  })
}

function winnerModal(who) {
  const modal = document.getElementById('modal');

  if (who == 'cross') {
    modal.querySelector('h3').textContent = 'Выиграли крестики';
    modal.querySelector('h3').classList.add('win-cross-header');
    modal.querySelector('button').classList.add('win-cross-btn');  
  } else {
    modal.querySelector('h3').textContent = 'Выиграли нолики';
    modal.querySelector('h3').classList.add('win-zero-header');
    modal.querySelector('button').classList.add('win-zero-btn');
  }

  modal.classList.remove('none');
  document.body.style.overflow = 'hidden';
  restart();
}

function getIndexElementForComputer(winLines, userSteps) {
  const result = winLines.reduce((maxMatchArray, currentArray) => {
    const matchCount = currentArray.filter(item => userSteps.includes(item)).length;
    const currentMaxCount = maxMatchArray.length > 0 
        ? maxMatchArray[0].filter(item => userSteps.includes(item)).length 
        : 0;
    return matchCount > currentMaxCount ? [currentArray] : maxMatchArray;
  }, []);
  
  const indexCell = result.length != 0 ? result[0].filter((elem) => !userSteps.includes(elem)) : [];

  if (indexCell.length > 1 || indexCell.length == 0) {
    return -1;
  } else {
    return indexCell[0];
  }
}

function createHandler(state, cells, winnerLines) {
  let userSteps = state.steps.filter((elem) => elem[state.user]).map((elem) => elem[state.user]);
  const compSteps = state.steps.filter((elem) => elem[state.comp]).map((elem) => elem[state.comp]);
  const winnerLinesUser = winnerLines.filter((elem) => (
    elem.some((elem) => userSteps.includes(elem)) &&
    !elem.some((elem) => compSteps.includes(elem))
  ));

  return function handleClick(e) {
    updateCell(e.target, state.user);
    state.steps.push({ [state.user]: Number(e.target.dataset.index) });
    cells.forEach((elem) => {
      elem.removeEventListener('click', handleClick);
    });
    userSteps = state.steps.filter((elem) => elem[state.user]).map((elem) => elem[state.user])
    if (victory(winnerLinesUser, userSteps)) {
      winnerModal(state.user);
    } else {
      clearFirstElement(state.steps);
      setTimeout(() => computerAction(state, winnerLines), 500);
    }
  }
}

function userAction(state, winnerLines) {
  const cells = document.querySelectorAll('.cell:empty');
  const handler = createHandler(state, cells, winnerLines)

  cells.forEach((elem) => {
    elem.addEventListener('click', handler)
  });
}

function computerAction(state, winnerLines) {
  const cells = document.querySelectorAll('.cell:empty');
  const userSteps = state.steps.filter((elem) => elem[state.user]).map((elem) => elem[state.user]);
  let compSteps = state.steps.filter((elem) => elem[state.comp]).map((elem) => elem[state.comp]);
  const winnerLinesUser = winnerLines.filter((elem) => (
    elem.some((elem) => userSteps.includes(elem)) &&
    !elem.some((elem) => compSteps.includes(elem))
  ));
  const winnerLinesComp = winnerLines.filter((elem) => (
    elem.some((elem) => compSteps.includes(elem)) &&
    !elem.some((elem) => userSteps.includes(elem))
  ));

  let cellIndex = 0;
  let cell = null;
  
  if (state.steps.length == 0) {
    updateCell(cells[4], state.comp);
    state.steps.push({ [state.comp]: Number(cells[4].dataset.index) });
  } 
  else if (state.steps.length == 1) {
    if (state.steps[0][state.user] == 5) {
      cellIndex = getRandomElement([1, 3, 7, 9])
      cell = document.querySelector(`[data-index="${cellIndex}"]`);
      updateCell(cell, state.comp);
      state.steps.push({ [state.comp]: cellIndex });
    } else {
      cell = document.querySelector(`[data-index="${5}"]`);
      updateCell(cell, state.comp);
      state.steps.push({ [state.comp]: 5 });
    }
  }
  else {
    const priorityStep = getIndexElementForComputer(winnerLinesUser, userSteps);
    const winnerStep = getIndexElementForComputer(winnerLinesComp, compSteps);

    if (priorityStep != -1 && winnerStep == -1) {
      cell = document.querySelector(`[data-index="${priorityStep}"]`);
      updateCell(cell, state.comp);
      state.steps.push({ [state.comp]: priorityStep });
    } else {
      cellIndex = winnerStep != -1 ? winnerStep : getRandomElement(Array.from(cells).map((elem) => Number(elem.dataset.index)));
      cell = document.querySelector(`[data-index="${cellIndex}"]`);
      updateCell(cell, state.comp);
      state.steps.push({ [state.comp]: cellIndex });
    }
  }

  compSteps = state.steps.filter((elem) => elem[state.comp]).map((elem) => elem[state.comp])
  if (victory(winnerLinesComp, compSteps)) {
    winnerModal(state.comp);
  } else {
    clearFirstElement(state.steps);
    userAction(state, winnerLines);
  }
}

function startApp(state, winnerLines) {
  if (state.user == 'cross') {
    userAction(state, winnerLines);
  } else {
    computerAction(state, winnerLines);
  }
}

choiceUserElement(STATE, WINNER_LINES);