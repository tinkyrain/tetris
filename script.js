const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 32;
let gmOver = false;

//послед.фигур
var tetrominoSequence = [];

//поле
var playfield = [];

//заполняем фигурами
for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}

//сами фигуры в виде двумерного массива
const tetrominos = {
  'I': [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  'J': [
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  'L': [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],

  //квадрат если ч0
  'O': [
    [1,1],
    [1,1],
  ],
  'S': [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  'Z': [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
  'T': [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ]
};

//цвет для фигур
//рандомный, кста
const colors = {
  'I': '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase(),
  'O': '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase(),
  'T': '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase(),
  'S': '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase(),
  'Z': '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase(),
  'J': '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase(),
  'L': '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase()
};

let count = 0;
// фигура, которая сейчас
let tetromino = getNextTetromino();
//кадры
let rAF = null;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//фигуры, которые будут в игре (их последовательность)
function generateSequence() {
  const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    tetrominoSequence.push(name);
  }
}

//получение фигуры
function getNextTetromino() {
  if (tetrominoSequence.length === 0) {
    generateSequence();
  }
  //отбираем у массива первую фигуру
  const name = tetrominoSequence.pop();
  //создание матрицы
  const matrix = tetrominos[name];
  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  const row = name === 'I' ? -1 : -2;

  param_fig = {
    name: name,
    matrix: matrix,
    row: row,
    col: col
  };

  //return param_fig;
  return param_fig;
}
// поворот фигуры

  function rt(param_fig){
    let newMatrix = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    let N = param_fig.matrix.length;
    //для фигур
    for(let y = 0; y < N; y++){
      for(let x = 0; x < N; x++){
        newMatrix[x][N-y-1] = param_fig.matrix[y][x];
      }
    }
    return newMatrix;
  }
// не вылазила за поле фигура
function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] && (
          //если всё же за полем
          cellCol + col < 0 || cellCol + col >= playfield[0].length || cellRow + row >= playfield.length ||
          // при пересечении с другими фигурами
          playfield[cellRow + row][cellCol + col])
        ) {

        return false;
      }
    }
  }
  return true;
}

// когда фигура окончательна встала на своё место
function placeTetromino() {
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {

        //если за поле, то игра закончена
        if (tetromino.row + row < 0) {
          gameOver();
        }
        // если не за полемы
        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }

  // заполненные ряды очищены
  for (let row = playfield.length - 1; row >= 0; ) {
    // если ряд полон
    if (playfield[row].every(cell => !!cell)) {

      // очищаем его и опускаем всё вниз на одну клетку
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r-1][c];
        }
      }
    }
    else{
      row--;
    }
  }
  //получение следующей фигуры
  tetromino = getNextTetromino();
}

// Сам цикл с игрой.matrix
function loop() {
  //начало анимации
  rAF = requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);

  //отрисовка поля
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        context.fillStyle = colors[name];

        // рисуем всё на один пиксель меньше, чтобы получился эффект «в клетку»
        context.fillRect(col * grid, row * grid, grid-1, grid-1);
      }
    }
  }

  // отрисовка текущей фигуры
  if (tetromino){
    if (++count > 35) {
      tetromino.row++;
      count = 0;

      // при окончании движение
      //проверка можно ли удалить строку
      if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.row--;
        placeTetromino();
      }
    }

    //для того, давать цвет фигуры
    context.fillStyle = colors[tetromino.name];

    // отрисовка фигуры
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {

          // и снова рисуем на один пиксель меньше
          context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
        }
      }
    }
  }
}

// следим за нажатиями на клавиши
document.addEventListener('keydown', function(e) {

  // стрелки влево и вправо
  if (e.which === 37 || e.which === 39) {
    const col = e.which === 37
      // если влево, то уменьшаем индекс в столбце, если вправо — увеличиваем
      ? tetromino.col - 1
      : tetromino.col + 1;

    // если так ходить можно, то запоминаем текущее положение
    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
      tetromino.col = col;
    }
  }

  //кнопка для поворота
  if (e.which === 32) {
    // выполняем поворот
    let matrix = rt(param_fig);
    //если так сделать можно, то запоминаем
    if (isValidMove(matrix, tetromino.row, tetromino.col)) {
      tetromino.matrix = matrix;
    }
  }

  // ускорение падения фигуры
  if(e.which === 40) {
    const row = tetromino.row + 1;
    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
      tetromino.row = row - 1;
      placeTetromino();

      return;
    }
    tetromino.row = row;
  }
});

function gameOver(){
  cancelAnimationFrame(rAF);
  gmOver = true;

  context.fillStyle = 'white';
  context.font = '36px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('Ты проиграл', canvas.width / 2, canvas.height / 2);
}

//Старт
rAF = requestAnimationFrame(loop);
