const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
context.scale(20, 20);

const arena = createMatrix(10, 20);
const colors = [
  null,
  '#a000f0', // T
  '#0000f0', // J
  '#f0a000', // L
  '#f0f000', // O
  '#00f000', // S
  '#f00000', // Z
  '#00f0f0', // I
];

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameOver = false;

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'T':
      return [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ];
    case 'J':
      return [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0],
      ];
    case 'L':
      return [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0],
      ];
    case 'O':
      return [
        [4, 4],
        [4, 4],
      ];
    case 'S':
      return [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0],
      ];
    case 'Z':
      return [
        [6, 6, 0],
        [0, 6, 6],
        [0, 0, 0],
      ];
    case 'I':
      return [
        [0, 0, 0, 0],
        [7, 7, 7, 7],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
  }
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerReset() {
  const pieces = 'TJLOSZI';
  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x = ((arena[0].length / 2) | 0) -
                 ((player.matrix[0].length / 2) | 0);
  if (collide(arena, player)) {
    gameOver = true;
    document.getElementById('gameOver').classList.add('show');
  }
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += rowCount * 100;
    rowCount *= 2;
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    arenaSweep();
    updateScore();
    playerReset();
  }
  dropCounter = 0;
}

function hardDrop() {
  while (!collide(arena, player)) {
    player.pos.y++;
  }
  player.pos.y--;
  merge(arena, player);
  arenaSweep();
  updateScore();
  playerReset();
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  if (!gameOver) {
    requestAnimationFrame(update);
  }
}

function updateScore() {
  document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    playerMove(-1);
    event.preventDefault();
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
    event.preventDefault();
  } else if (event.key === 'ArrowDown') {
    playerDrop();
    event.preventDefault();
  } else if (event.key === 'ArrowUp') {
    playerRotate(1);
    event.preventDefault();
  } else if (event.code === 'Space') {
    hardDrop();
    event.preventDefault();
  }
});

function bindButton(id, fn) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const handler = e => {
    e.preventDefault();
    fn();
  };
  btn.addEventListener('click', handler);
  btn.addEventListener('touchstart', handler);
}

bindButton('btnLeft', () => playerMove(-1));
bindButton('btnRight', () => playerMove(1));
bindButton('btnRotate', () => playerRotate(1));
bindButton('btnDrop', hardDrop);

playerReset();
updateScore();
update();
