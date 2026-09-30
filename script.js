let boardSize = 7;
let dictionary = new Set();
let board = [];
let originalBoard = [];
let playerPlacedTiles = {};
let playerTiles = [];
let bonusSquares = {};

const letterValues = {
A: 1,
B: 3,
C: 3,
D: 2,
E: 1,
F: 4,
G: 2,
H: 4,
I: 1,
J: 8,
K: 5,
L: 1,
M: 3,
N: 1,
O: 1,
P: 3,
Q: 10,
R: 1,
S: 1,
T: 1,
U: 1,
V: 4,
W: 4,
X: 8,
Y: 4,
Z: 10
};

const letterDistribution = {
A: 9,
B: 2,
C: 2,
D: 4,
E: 12,
F: 2,
G: 3,
H: 2,
I: 9,
J: 1,
K: 1,
L: 4,
M: 2,
N: 6,
O: 8,
P: 2,
Q: 1,
R: 6,
S: 4,
T: 6,
U: 4,
V: 2,
W: 2,
X: 1,
Y: 2,
Z: 1
};

let selectedRackTile = null;
let puzzleWords = [];
let score = 0;
let startingRackValueTotal = 0;
let isGenerating = false;

let generatorSettings = {
gridSize: 8,
wordCount: 4,
initialWordLength: 5
};

const boardElement =
document.getElementById("board");

const tileRackElement =
document.getElementById("tileRack");

const tileMessageElement =
document.getElementById("tileMessage");

const wordListElement =
document.getElementById("wordList");

const scoreValueElement =
document.getElementById("scoreValue");

const scoreBonusElement =
document.getElementById("scoreBonus");

const generateButton =
document.getElementById("generateButton");

const newTilesButton =
document.getElementById("newTilesButton");

const wordCountElement =
document.getElementById("wordCount");

const gridSizeInput =
document.getElementById(
"gridSizeInput"
);

const wordCountInput =
document.getElementById(
"wordCountInput"
);

const initialWordLengthInput =
document.getElementById(
"initialWordLengthInput"
);

const generatorMessageElement =
document.getElementById(
"generatorMessage"
);


/* ==================================================
HIDDEN SCORE PANEL
================================================== */

function replacePuzzleGeneratorUI() {

const inputs = [
gridSizeInput,
wordCountInput,
initialWordLengthInput
].filter(Boolean);

if (inputs.length === 0) {
return;
}

const existing =
document.getElementById("hiddenScoreBreakdown");

if (existing) {
return;
}

let panel = inputs[0].parentElement;

while (panel && panel.parentElement) {

const containsAll =
inputs.every(input => panel.contains(input));

const text =
(panel.textContent || "").toLowerCase();

if (containsAll && (
text.includes("puzzle generator") ||
text.includes("grid size") ||
text.includes("initial word length")
)) {
break;
}

panel = panel.parentElement;
}

if (
!panel ||
panel === document.body ||
panel === document.documentElement
) {
return;
}

if (
panel.contains(boardElement) ||
panel.contains(tileRackElement)
) {
return;
}

const replacement =
document.createElement("div");

replacement.id =
"hiddenScoreBreakdown";

replacement.innerHTML = `
<div class="hidden-score-title">Hidden Score</div>
<div class="hidden-score-row"><span>2x Letter tiles</span><strong id="hiddenDoubleLetterCount">0</strong></div>
<div class="hidden-score-row"><span>2xLscore</span><strong id="hiddenDoubleLetterScore">0</strong></div>
<div class="hidden-score-row"><span>3x Letter tiles</span><strong id="hiddenTripleLetterCount">0</strong></div>
<div class="hidden-score-row"><span>3xLscore</span><strong id="hiddenTripleLetterScore">0</strong></div>
<div class="hidden-score-row"><span>2x Word tiles</span><strong id="hiddenDoubleWordCount">0</strong></div>
<div class="hidden-score-row"><span>2xWscore</span><strong id="hiddenDoubleWordScore">0</strong></div>
<div class="hidden-score-row"><span>3x Word tiles</span><strong id="hiddenTripleWordCount">0</strong></div>
<div class="hidden-score-row"><span>3xWscore</span><strong id="hiddenTripleWordScore">0</strong></div>
<div class="hidden-score-row"><span>Original rack value</span><strong id="hiddenRackValue">0</strong></div>
<div class="hidden-score-row"><span>RackValueAvg</span><strong id="hiddenRackValueAvg">0</strong></div>
<div class="hidden-score-row"><span>+50 bonus</span><strong>50</strong></div>
<div class="hidden-score-total"><span>Hidden Score</span><strong id="hiddenBreakdownTotal">0</strong></div>
`;

replacement.style.marginBottom =
"16px";

replacement.style.padding =
"14px 16px";

replacement.style.borderRadius =
"10px";

replacement.style.background =
"#fff";

replacement.style.boxSizing =
"border-box";

const style =
document.createElement("style");

style.textContent = `
#hiddenScoreBreakdown {
width: 100%;
max-width: 500px;
margin-left: auto;
margin-right: auto;
}

#hiddenScoreBreakdown .hidden-score-title {
font-size: 15px;
font-weight: 800;
text-align: center;
margin-bottom: 10px;
}

#hiddenScoreBreakdown .hidden-score-row {
display: flex;
justify-content: space-between;
gap: 20px;
line-height: 1.45;
}

#hiddenScoreBreakdown .hidden-score-row strong {
min-width: 40px;
text-align: right;
}

#hiddenScoreBreakdown .hidden-score-total {
display: flex;
justify-content: space-between;
margin-top: 9px;
padding-top: 9px;
border-top: 1px solid rgba(0,0,0,.15);
font-weight: 800;
}
`;

document.head.appendChild(style);

panel.replaceWith(replacement);
}


function randomInt(min, max) {

return Math.floor(
Math.random() *
(max - min + 1)
) + min;
}


function shuffle(array) {

const result = [...array];

for (
let i = result.length - 1;
i > 0;
i--
) {

const j =
Math.floor(
Math.random() *
(i + 1)
);

[
result[i],
result[j]
] = [
result[j],
result[i]
];
}

return result;
}


function keyForCell(row, col) {

return `${row},${col}`;
}


function isInsideBoard(row, col) {

return (
row >= 0 &&
row < boardSize &&
col >= 0 &&
col < boardSize
);
}


function cloneBoard(source) {

return source.map(
row => [...row]
);
}


function getGeneratorSettings() {

let gridSize =
parseInt(
gridSizeInput?.value,
10
);

let wordCount =
parseInt(
wordCountInput?.value,
10
);

let initialWordLength =
parseInt(
initialWordLengthInput?.value,
10
);

if (
Number.isNaN(gridSize)
) {
gridSize = 7;
}

if (
Number.isNaN(wordCount)
) {
wordCount = 3;
}

if (
Number.isNaN(initialWordLength)
) {
initialWordLength = 6;
}

gridSize =
Math.max(
5,
Math.min(
12,
gridSize
)
);

wordCount =
Math.max(
1,
Math.min(
8,
wordCount
)
);

initialWordLength =
Math.max(
3,
Math.min(
gridSize,
initialWordLength
)
);

if (gridSizeInput) {
gridSizeInput.value =
gridSize;
}

if (wordCountInput) {
wordCountInput.value =
wordCount;
}

if (initialWordLengthInput) {
initialWordLengthInput.value =
initialWordLength;
}

generatorSettings = {
gridSize,
wordCount,
initialWordLength
};

return generatorSettings;
}


async function loadDictionary() {

try {

const response =
await fetch(
"dictionary.txt"
);

if (!response.ok) {

throw new Error(
`Dictionary request failed: ${response.status}`
);
}

const text =
await response.text();

dictionary =
new Set(
text
.split(/\r?\n/)
.map(
word =>
word
.trim()
.toUpperCase()
)
.filter(
word =>
/^[A-Z]+$/.test(
word
)
)
);

console.log(
`Loaded ${dictionary.size} dictionary words.`
);

} catch (error) {

console.error(
"Could not load dictionary:",
error
);

dictionary =
new Set();
}
}


function createEmptyBoard() {

return Array.from(
{
length: boardSize
},
() =>
Array(
boardSize
).fill("")
);
}


function getWordLength(word) {

return word.length;
}


function getWordCells(
word,
row,
col,
direction
) {

const cells = [];

const deltaRow =
direction === "horizontal"
? 0
: 1;

const deltaCol =
direction === "horizontal"
? 1
: 0;

for (
let i = 0;
i < word.length;
i++
) {

cells.push({

row:
row +
deltaRow * i,

col:
col +
deltaCol * i,

letter:
word[i]

});
}

return cells;
}


function getRandomWord(
minLength,
maxLength
) {

const candidates =
Array.from(dictionary)
.filter(
word =>
word.length >=
minLength &&
word.length <=
maxLength
);

if (
candidates.length === 0
) {
return null;
}

return candidates[
randomInt(
0,
candidates.length - 1
)
];
}


function canPlaceWord(
targetBoard,
word,
row,
col,
direction,
requireOverlap = false
) {

const cells =
getWordCells(
word,
row,
col,
direction
);

let overlapCount = 0;

for (
const cell of cells
) {

if (
!isInsideBoard(
cell.row,
cell.col
)
) {
return false;
}

const existing =
targetBoard[
cell.row
][
cell.col
];

if (
existing !== ""
) {

if (
existing !==
cell.letter
) {
return false;
}

overlapCount++;
}
}

if (
requireOverlap &&
overlapCount === 0
) {
return false;
}

return true;
}


function placeWordOnBoard(
targetBoard,
word,
row,
col,
direction
) {

const cells =
getWordCells(
word,
row,
col,
direction
);

for (
const cell of cells
) {

targetBoard[
cell.row
][
cell.col
] =
cell.letter;
}
}


function getWordAt(
targetBoard,
row,
col,
direction
) {

let startRow = row;
let startCol = col;

const deltaRow =
direction === "horizontal"
? 0
: 1;

const deltaCol =
direction === "horizontal"
? 1
: 0;

while (
isInsideBoard(
startRow -
deltaRow,
startCol -
deltaCol
) &&
targetBoard[
startRow -
deltaRow
][
startCol -
deltaCol
] !== ""
) {

startRow -=
deltaRow;

startCol -=
deltaCol;
}

let word = "";

let currentRow =
startRow;

let currentCol =
startCol;

while (
isInsideBoard(
currentRow,
currentCol
) &&
targetBoard[
currentRow
][
currentCol
] !== ""
) {

word +=
targetBoard[
currentRow
][
currentCol
];

currentRow +=
deltaRow;

currentCol +=
deltaCol;
}

return word;
}


function getAllWords(
targetBoard
) {

const words = [];

for (
let row = 0;
row < boardSize;
row++
) {

let col = 0;

while (
col < boardSize
) {

if (
targetBoard[
row
][
col
] === ""
) {

col++;

continue;
}

const startCol =
col;

let word = "";

while (
col < boardSize &&
targetBoard[
row
][
col
] !== ""
) {

word +=
targetBoard[
row
][
col
];

col++;
}

if (
word.length >= 2
) {

words.push({

word,

row,

col:
startCol,

direction:
"horizontal"

});
}
}
}

for (
let col = 0;
col < boardSize;
col++
) {

let row = 0;

while (
row < boardSize
) {

if (
targetBoard[
row
][
col
] === ""
) {

row++;

continue;
}

const startRow =
row;

let word = "";

while (
row < boardSize &&
targetBoard[
row
][
col
] !== ""
) {

word +=
targetBoard[
row
][
col
];

row++;
}

if (
word.length >= 2
) {

words.push({

word,

row:
startRow,

col,

direction:
"vertical"

});
}
}
}

return words;
}


function allWordsAreValid(
targetBoard
) {

const words =
getAllWords(
targetBoard
);

return words.every(
item =>
dictionary.has(
item.word
)
);
}


function placementCreatesValidWords(
targetBoard,
word,
row,
col,
direction
) {

const testBoard =
cloneBoard(
targetBoard
);

placeWordOnBoard(
testBoard,
word,
row,
col,
direction
);

return allWordsAreValid(
testBoard
);
}


function generateBoard() {

const settings =
getGeneratorSettings();

boardSize =
settings.gridSize;

playerPlacedTiles = {};

playerTiles =
drawRandomTiles(7);

startingRackValueTotal =
playerTiles.reduce(
(total, letter) =>
total +
(letterValues[letter] ?? 0),
0
);

selectedRackTile = null;

score = 0;

board =
createEmptyBoard();

originalBoard =
createEmptyBoard();

puzzleWords = [];

const startingWord =
getRandomWord(
settings.initialWordLength,
settings.initialWordLength
);

if (!startingWord) {

console.error(
"Could not find a starting word of the requested length."
);

if (
generatorMessageElement
) {

generatorMessageElement.textContent =
`No dictionary word found with exactly ${settings.initialWordLength} letters.`;
}

return;
}

if (
generatorMessageElement
) {

generatorMessageElement.textContent =
"";
}

const directions = [
"horizontal",
"vertical"
];

let placed = false;

for (
let attempt = 0;
attempt < 500 &&
!placed;
attempt++
) {

const direction =
directions[
randomInt(
0,
directions.length - 1
)
];

const row =
randomInt(
0,
boardSize - 1
);

const col =
randomInt(
0,
boardSize - 1
);

if (
canPlaceWord(
board,
startingWord,
row,
col,
direction
)
) {

placeWordOnBoard(
board,
startingWord,
row,
col,
direction
);

puzzleWords.push({

word:
startingWord,

row,

col,

direction

});

placed = true;
}
}

if (!placed) {

console.error(
"Could not place starting word."
);

return;
}

const targetWordCount =
settings.wordCount;

let attempts = 0;

while (
puzzleWords.length <
targetWordCount &&
attempts < 1000
) {

attempts++;

const word =
getRandomWord(
3,
Math.min(
5,
boardSize
)
);

if (!word) {
continue;
}

const referenceWord =
puzzleWords[
randomInt(
0,
puzzleWords.length - 1
)
];

const direction =
referenceWord.direction ===
"horizontal"
? "vertical"
: "horizontal";

const existingCells = [];

for (
let r = 0;
r < boardSize;
r++
) {

for (
let c = 0;
c < boardSize;
c++
) {

if (
board[r][c] !== ""
) {

existingCells.push({

row: r,

col: c

});
}
}
}
}

const shuffledCells =
shuffle(
existingCells
);

let wordPlaced = false;

for (
const crossingCell
of shuffledCells
) {

if (
wordPlaced
) {
break;
}

const letters =
[...word];

for (
let letterIndex = 0;
letterIndex <
letters.length;
letterIndex++
) {

const startRow =
direction ===
"horizontal"
? crossingCell.row
: crossingCell.row -
letterIndex;

const startCol =
direction ===
"horizontal"
? crossingCell.col -
letterIndex
: crossingCell.col;

if (
!canPlaceWord(
board,
word,
startRow,
startCol,
direction,
true
)
) {
continue;
}

if (
!placementCreatesValidWords(
board,
word,
startRow,
startCol,
direction
)
) {
continue;
}

placeWordOnBoard(
board,
word,
startRow,
startCol,
direction
);

puzzleWords.push({

word,

row:
startRow,

col:
startCol,

direction

});

wordPlaced = true;

break;
}
}
}

if (
puzzleWords.length <
targetWordCount
) {

console.warn(
"Could not generate the requested number of words. Retrying..."
);

generateBoard();

return;
}

originalBoard =
cloneBoard(
board
);

bonusSquares = {};

generateBonusSquares();

displayBoard();

displayTileRack();

calculatePlayerScore();

updateWordCount();
}


const bonusTypes = [
"double-letter",
"triple-letter",
"double-word",
"triple-word"
];


const bonusWeights = {

"double-letter": 40,

"triple-letter": 25,

"double-word": 20,

"triple-word": 15

};


const bonusMaximums = {

"double-letter": 3,

"triple-letter": 3,

"double-word": 2,

"triple-word": 2

};


function getWeightedBonusType() {

const availableTypes =
bonusTypes.filter(
type => {

const count =
Object.values(
bonusSquares
).filter(
value =>
value ===
type
).length;

return (
count <
bonusMaximums[type]
);
}
);

if (
availableTypes.length === 0
) {

return null;
}

let totalWeight = 0;

for (
const type
of availableTypes
) {

totalWeight +=
bonusWeights[type];
}

let random =
Math.random() *
totalWeight;

for (
const type
of availableTypes
) {

random -=
bonusWeights[type];

if (
random <= 0
) {

return type;
}
}

return availableTypes[
availableTypes.length - 1
];
}


function generateBonusSquares() {

bonusSquares = {};

const emptyCells = [];

for (
let row = 0;
row < boardSize;
row++
) {

for (
let col = 0;
col < boardSize;
col++
) {

if (
board[row][col] === ""
) {

emptyCells.push({

row,

col

});
}
}
}

const desiredCount =
randomInt(
4,
6
);

const selected = [];

const shuffled =
shuffle(
emptyCells
);

for (
const cell
of shuffled
) {

if (
selected.length >=
desiredCount
) {
break;
}

const tooClose =
selected.some(
other =>
Math.abs(
other.row -
cell.row
) +
Math.abs(
other.col -
cell.col
) < 2
);

if (!tooClose) {

selected.push(
cell
);
}
}

if (
selected.length <
desiredCount
) {

for (
const cell
of shuffled
) {

if (
selected.length >=
desiredCount
) {
break;
}

const alreadySelected =
selected.some(
other =>
other.row ===
cell.row &&
other.col ===
cell.col
);

if (
!alreadySelected
) {

selected.push(
cell
);
}
}
}

for (
const cell
of selected
) {

const type =
getWeightedBonusType();

if (!type) {
break;
}

bonusSquares[
keyForCell(
cell.row,
cell.col
)
] =
type;
}
}


function getBonusSquare(
row,
col
) {

return (
bonusSquares[
keyForCell(
row,
col
)
] ||
null
);
}


function displayBoard() {

if (!boardElement) {
return;
}

boardElement.innerHTML =
"";

boardElement.style.gridTemplateColumns =
`repeat(${boardSize}, 1fr)`;

boardElement.style.gridTemplateRows =
`repeat(${boardSize}, 1fr)`;

const tileStatuses =
getPlayerTileStatuses();

for (
let row = 0;
row < boardSize;
row++
) {

for (
let col = 0;
col < boardSize;
col++
) {

const cell =
document.createElement(
"div"
);

cell.className =
"cell";

cell.dataset.row =
row;

cell.dataset.col =
col;

const key =
keyForCell(
row,
col
);

const bonus =
getBonusSquare(
row,
col
);

if (bonus) {

cell.classList.add(
bonus
);

const bonusBadge =
document.createElement(
"span"
);

bonusBadge.className =
"bonus-badge";

if (
bonus ===
"double-letter"
) {

bonusBadge.textContent =
"2x L";
}

if (
bonus ===
"triple-letter"
) {

bonusBadge.textContent =
"3x L";
}

if (
bonus ===
"double-word"
) {

bonusBadge.textContent =
"2x W";
}

if (
bonus ===
"triple-word"
) {

bonusBadge.textContent =
"3x W";
}

cell.appendChild(
bonusBadge
);
}

const letter =
board[row][col];

if (
letter !== ""
) {

const boardTile =
document.createElement(
"div"
);

boardTile.className =
"board-tile";

if (
originalBoard[
row
][
col
] !== ""
) {

boardTile.classList.add(
"original-tile"
);

} else if (
playerPlacedTiles[
key
]
) {

const status =
tileStatuses[
key
];

if (
status ===
"valid"
) {

boardTile.classList.add(
"player-valid"
);

} else if (
status ===
"isolated"
) {

boardTile.classList.add(
"player-isolated"
);

} else {

boardTile.classList.add(
"player-invalid"
);
}
}

const letterElement =
document.createElement(
"span"
);

letterElement.className =
"tile-letter";

letterElement.textContent =
letter;

boardTile.appendChild(
letterElement
);

const valueElement =
document.createElement(
"span"
);

valueElement.className =
"tile-value";

valueElement.textContent =
letterValues[
letter
] ?? 0;

boardTile.appendChild(
valueElement
);

cell.appendChild(
boardTile
);
}

cell.addEventListener(
"click",
() =>
handleBoardClick(
row,
col
)
);

boardElement.appendChild(
cell
);
}
}
}


function createTileBag() {

const bag = [];

for (
const letter
in letterDistribution
) {

for (
let i = 0;
i <
letterDistribution[
letter
];
i++
) {

bag.push(
letter
);
}
}

return bag;
}


function drawRandomTiles(count = 7) {

const vowels = [
"A", "A", "A", "A",
"E", "E", "E", "E", "E", "E", "E",
"I", "I", "I",
"O", "O", "O", "O",
"U", "U"
];

const consonants = [
"B", "B",
"C", "C",
"D", "D", "D", "D",
"F", "F",
"G", "G", "G",
"H", "H",
"J",
"K",
"L", "L", "L", "L",
"M", "M",
"N", "N", "N", "N", "N", "N",
"P", "P",
"Q",
"R", "R", "R", "R", "R", "R",
"S", "S", "S", "S",
"T", "T", "T", "T", "T", "T",
"V", "V",
"W", "W",
"X",
"Y", "Y",
"Z"
];

const tiles = [];

for (let i = 0; i < 3; i++) {

const index =
Math.floor(
Math.random() *
vowels.length
);

tiles.push(
vowels[index]
);

vowels.splice(
index,
1
);
}

for (let i = 0; i < 4; i++) {

const index =
Math.floor(
Math.random() *
consonants.length
);

tiles.push(
consonants[index]
);

consonants.splice(
index,
1
);
}

for (
let i = tiles.length - 1;
i > 0;
i--
) {

const j =
Math.floor(
Math.random() *
(i + 1)
);

[
tiles[i],
tiles[j]
] = [
tiles[j],
tiles[i]
];
}

return tiles;
}


function displayTileRack() {

if (!tileRackElement) {
return;
}

tileRackElement.innerHTML =
"";

playerTiles.forEach(
(
letter,
index
) => {

const tile =
document.createElement(
"div"
);

tile.className =
"rack-tile";

if (
selectedRackTile ===
index
) {

tile.classList.add(
"selected"
);
}

const letterElement =
document.createElement(
"span"
);

letterElement.className =
"tile-letter";

letterElement.textContent =
letter;

tile.appendChild(
letterElement
);

const valueElement =
document.createElement(
"span"
);

valueElement.className =
"tile-value";

valueElement.textContent =
letterValues[
letter
] ?? 0;

tile.appendChild(
valueElement
);

tile.addEventListener(
"click",
() => {

selectedRackTile =
selectedRackTile ===
index
? null
: index;

displayTileRack();
}
);

tileRackElement.appendChild(
tile
);
}
);
}


function handleBoardClick(
row,
col
) {

const key =
keyForCell(
row,
col
);

if (
playerPlacedTiles[key]
) {

const tile =
playerPlacedTiles[key];

playerTiles.push(
tile.letter
);

delete playerPlacedTiles[
key
];

board[row][col] =
"";

displayTileRack();

displayBoard();

calculatePlayerScore();

return;
}

if (
originalBoard[row][col] !== ""
) {
return;
}

if (
selectedRackTile ===
null
) {

if (
tileMessageElement
) {

tileMessageElement.textContent =
"Select a tile first.";
}

return;
}

const tile =
playerTiles[
selectedRackTile
];

if (
tile === undefined
) {
return;
}

board[row][col] =
tile;

playerPlacedTiles[key] = {

letter: tile,

row,

col

};

playerTiles.splice(
selectedRackTile,
1
);

selectedRackTile =
null;

displayTileRack();

displayBoard();

calculatePlayerScore();
}


function getPlayerTileStatuses() {

const statuses = {};

const playerKeys =
Object.keys(
playerPlacedTiles
);

const connected =
new Set();

const queue = [];

for (
let row = 0;
row < boardSize;
row++
) {

for (
let col = 0;
col < boardSize;
col++
) {

if (
originalBoard[
row
][
col
] !== ""
) {

const key =
keyForCell(
row,
col
);

connected.add(
key
);

queue.push({

row,

col

});
}
}
}
}

while (
queue.length > 0
) {

const current =
queue.shift();

const neighbors = [

{
row:
current.row - 1,
col:
current.col
},

{
row:
current.row + 1,
col:
current.col
},

{
row:
current.row,
col:
current.col - 1
},

{
row:
current.row,
col:
current.col + 1
}

];

for (
const neighbor
of neighbors
) {

if (
!isInsideBoard(
neighbor.row,
neighbor.col
)
) {
continue;
}

const neighborKey =
keyForCell(
neighbor.row,
neighbor.col
);

if (
connected.has(
neighborKey
)
) {
continue;
}

const occupied =
board[
neighbor.row
][
neighbor.col
] !== "";

if (!occupied) {
continue;
}

connected.add(
neighborKey
);

queue.push(
neighbor
);
}
}

const words =
getAllWords(
board
);

for (
const key
of playerKeys
) {

statuses[key] =
"invalid";
}

for (
const key
of playerKeys
) {

if (
!connected.has(
key
)
) {

let touchesAnotherPlayer =
false;

const tile =
playerPlacedTiles[
key
];

const neighbors = [

{
row:
tile.row - 1,
col:
tile.col
},

{
row:
tile.row + 1,
col:
tile.col
},

{
row:
tile.row,
col:
tile.col - 1
},

{
row:
tile.row,
col:
tile.col + 1
}

];

for (
const neighbor
of neighbors
) {

const neighborKey =
keyForCell(
neighbor.row,
neighbor.col
);

if (
playerPlacedTiles[
neighborKey
]
) {

touchesAnotherPlayer =
true;

break;
}
}

if (
!touchesAnotherPlayer
) {

statuses[key] =
"isolated";
}

continue;
}
}

for (
const key
of playerKeys
) {

if (
!connected.has(
key
)
) {
continue;
}

const tile =
playerPlacedTiles[
key
];

const horizontalWord =
getWordAt(
board,
tile.row,
tile.col,
"horizontal"
);

const verticalWord =
getWordAt(
board,
tile.row,
tile.col,
"vertical"
);

const horizontalValid =
horizontalWord.length >= 2 &&
dictionary.has(
horizontalWord
);

const verticalValid =
verticalWord.length >= 2 &&
dictionary.has(
verticalWord
);

if (
horizontalValid ||
verticalValid
) {

let valid = true;

for (
const wordInfo
of words
) {

const wordCells =
getWordCells(
wordInfo.word,
wordInfo.row,
wordInfo.col,
wordInfo.direction
);

const containsTile =
wordCells.some(
cell =>
cell.row ===
tile.row &&
cell.col ===
tile.col
);

if (
containsTile &&
!dictionary.has(
wordInfo.word
)
) {

valid = false;

break;
}
}

if (valid) {

statuses[key] =
"valid";
}
}
}

return statuses;
}


function calculateWordScoreAtPosition(
word,
row,
col,
direction,
newlyPlacedKeys = null
) {

let total = 0;

let wordMultiplier = 1;

const cells =
getWordCells(
word,
row,
col,
direction
);

for (
const cell
of cells
) {

const key =
keyForCell(
cell.row,
cell.col
);

const letter =
board[
cell.row
][
cell.col
];

const value =
letterValues[
letter
] ?? 0;

const isNew =
!newlyPlacedKeys ||
newlyPlacedKeys.has(
key
);

let letterMultiplier =
1;

if (isNew) {

const bonus =
getBonusSquare(
cell.row,
cell.col
);

if (
bonus ===
"double-letter"
) {

letterMultiplier =
2;
}

if (
bonus ===
"triple-letter"
) {

letterMultiplier =
3;
}

if (
bonus ===
"double-word"
) {

wordMultiplier *= 2;
}

if (
bonus ===
"triple-word"
) {

wordMultiplier *= 3;
}
}

total +=
value *
letterMultiplier;
}

return (
total *
wordMultiplier
);
}


function getPlayerScoringWords() {

const statuses =
getPlayerTileStatuses();

const scoringWords = [];

const words =
getAllWords(
board
);

for (
const wordInfo
of words
) {

const cells =
getWordCells(
wordInfo.word,
wordInfo.row,
wordInfo.col,
wordInfo.direction
);

const playerCells =
cells.filter(
cell =>
playerPlacedTiles[
keyForCell(
cell.row,
cell.col
)
]
);

if (
playerCells.length === 0
) {
continue;
}

const allPlayerTilesValid =
playerCells.every(
cell =>
statuses[
keyForCell(
cell.row,
cell.col
)
] ===
"valid"
);

if (
!allPlayerTilesValid
) {
continue;
}

const newlyPlacedKeys =
new Set(
playerCells.map(
cell =>
keyForCell(
cell.row,
cell.col
)
)
);

const wordScore =
calculateWordScoreAtPosition(
wordInfo.word,
wordInfo.row,
wordInfo.col,
wordInfo.direction,
newlyPlacedKeys
);

scoringWords.push({

word:
wordInfo.word,

score:
wordScore,

row:
wordInfo.row,

col:
wordInfo.col,

direction:
wordInfo.direction

});
}

return scoringWords;
}


function calculatePlayerScore() {

const scoringWords =
getPlayerScoringWords();

score =
scoringWords.reduce(
(
total,
item
) =>
total +
item.score,
0
);

let bonus = 0;

let bonusText = "";

if (
playerTiles.length === 0 &&
Object.keys(
playerPlacedTiles
).length === 7
) {

const statuses =
getPlayerTileStatuses();

const allValid =
Object.keys(
playerPlacedTiles
).every(
key =>
statuses[key] ===
"valid"
);

if (allValid) {

const playerKeys =
new Set(
Object.keys(
playerPlacedTiles
)
);

const hasSingleWordUsingAll =
scoringWords.some(
wordInfo => {

const cells =
getWordCells(
wordInfo.word,
wordInfo.row,
wordInfo.col,
wordInfo.direction
);

const containsAll =
playerKeys.size ===
cells.filter(
cell =>
playerPlacedTiles[
keyForCell(
cell.row,
cell.col
)
]
).length;

return containsAll;
}
);

if (
hasSingleWordUsingAll
) {

bonus = 100;

bonusText =
"+100 7-tile word bonus";

} else {

bonus = 50;

bonusText =
"+50 7-tile bonus";
}

score +=
bonus;
}
}

updateScoreDisplay(
score,
bonusText
);

displayScoringWords(
scoringWords
);

return score;
}


function getHiddenScoreDetails() {

const doubleLetterCount =
Object.values(bonusSquares).filter(
type =>
type === "double-letter"
).length;

const tripleLetterCount =
Object.values(bonusSquares).filter(
type =>
type === "triple-letter"
).length;

const doubleWordCount =
Object.values(bonusSquares).filter(
type =>
type === "double-word"
).length;

const tripleWordCount =
Object.values(bonusSquares).filter(
type =>
type === "triple-word"
).length;

const rackValueAvg =
Math.round(
startingRackValueTotal / 7
);

const doubleLetterScore =
2 *
rackValueAvg *
doubleLetterCount;

const tripleLetterScore =
3 *
rackValueAvg *
tripleLetterCount;

const doubleWordScore =
5 *
doubleWordCount;

const tripleWordScore =
10 *
doubleWordCount;

const hiddenScore =
tripleWordScore +
doubleWordScore +
doubleLetterScore +
tripleLetterScore +
startingRackValueTotal +
50;

return {

doubleLetterCount,

tripleLetterCount,

doubleWordCount,

tripleWordCount,

rackValueAvg,

doubleLetterScore,

tripleLetterScore,

doubleWordScore,

tripleWordScore,

startingRackValueTotal,

hiddenScore

};
}


function calculateHiddenScore() {

return getHiddenScoreDetails().hiddenScore;
}
function updateHiddenScoreDisplay() {

    const doubleLetterCount =
        Object.values(bonusSquares).filter(
            type =>
                type === "double-letter"
        ).length;

    const tripleLetterCount =
        Object.values(bonusSquares).filter(
            type =>
                type === "triple-letter"
        ).length;

    const doubleWordCount =
        Object.values(bonusSquares).filter(
            type =>
                type === "double-word"
        ).length;

    /*
     * The existing Hidden Score formula:
     *
     * RackValueAvg =
     *     original rack total / 7
     *
     * 2xLscore =
     *     2 × RackValueAvg × 2x Letter tiles
     *
     * 3xLscore =
     *     3 × RackValueAvg × 3x Letter tiles
     *
     * 2xWscore =
     *     5 × 2x Word tiles
     *
     * 3xWscore =
     *     10 × 2x Word tiles
     */

    const rackValueAvg =
        Math.round(
            startingRackValueTotal / 7
        );

    const doubleLetterScore =
        2 *
        rackValueAvg *
        doubleLetterCount;

    const tripleLetterScore =
        3 *
        rackValueAvg *
        tripleLetterCount;

    const doubleWordScore =
        5 *
        doubleWordCount;

    const tripleWordScore =
        10 *
        doubleWordCount;

    const hiddenScore =
        tripleWordScore +
        doubleWordScore +
        doubleLetterScore +
        tripleLetterScore +
        startingRackValueTotal +
        50;


    const doubleLetterElement =
        document.getElementById(
            "hiddenDoubleLetterCount"
        );

    const doubleLetterScoreElement =
        document.getElementById(
            "hiddenDoubleLetterScore"
        );

    const tripleLetterElement =
        document.getElementById(
            "hiddenTripleLetterCount"
        );

    const tripleLetterScoreElement =
        document.getElementById(
            "hiddenTripleLetterScore"
        );

    const doubleWordElement =
        document.getElementById(
            "hiddenDoubleWordCount"
        );

    const doubleWordScoreElement =
        document.getElementById(
            "hiddenDoubleWordScore"
        );

    const tripleWordElement =
        document.getElementById(
            "hiddenTripleWordCount"
        );

    const tripleWordScoreElement =
        document.getElementById(
            "hiddenTripleWordScore"
        );

    const rackValueElement =
        document.getElementById(
            "hiddenRackValue"
        );

    const rackAverageElement =
        document.getElementById(
            "hiddenRackValueAvg"
        );

    const totalElement =
        document.getElementById(
            "hiddenScoreTotal"
        );


    if (doubleLetterElement) {

        doubleLetterElement.textContent =
            doubleLetterCount;
    }

    if (doubleLetterScoreElement) {

        doubleLetterScoreElement.textContent =
            doubleLetterScore;
    }

    if (tripleLetterElement) {

        tripleLetterElement.textContent =
            tripleLetterCount;
    }

    if (tripleLetterScoreElement) {

        tripleLetterScoreElement.textContent =
            tripleLetterScore;
    }

    if (doubleWordElement) {

        doubleWordElement.textContent =
            doubleWordCount;
    }

    if (doubleWordScoreElement) {

        doubleWordScoreElement.textContent =
            doubleWordScore;
    }

    if (tripleWordElement) {

        /*
         * This is displayed because the
         * Hidden Score breakdown contains
         * the number of 3x Word tiles.
         */
        tripleWordElement.textContent =
            Object.values(bonusSquares).filter(
                type =>
                    type === "triple-word"
            ).length;
    }

    if (tripleWordScoreElement) {

        tripleWordScoreElement.textContent =
            tripleWordScore;
    }

    if (rackValueElement) {

        rackValueElement.textContent =
            startingRackValueTotal;
    }

    if (rackAverageElement) {

        rackAverageElement.textContent =
            rackValueAvg;
    }

    if (totalElement) {

        totalElement.textContent =
            hiddenScore;
    }
}

function updateHiddenScoreBreakdown() {

const details =
getHiddenScoreDetails();

const values = {

hiddenDoubleLetterCount:
details.doubleLetterCount,

hiddenDoubleLetterScore:
details.doubleLetterScore,

hiddenTripleLetterCount:
details.tripleLetterCount,

hiddenTripleLetterScore:
details.tripleLetterScore,

hiddenDoubleWordCount:
details.doubleWordCount,

hiddenDoubleWordScore:
details.doubleWordScore,

hiddenTripleWordCount:
details.tripleWordCount,

hiddenTripleWordScore:
details.tripleWordScore,

hiddenRackValue:
details.startingRackValueTotal,

hiddenRackValueAvg:
details.rackValueAvg,

hiddenBreakdownTotal:
details.hiddenScore

};

Object.entries(values).forEach(
([id, value]) => {

const element =
document.getElementById(id);

if (element) {

element.textContent =
value;
}
}
);
}


function updateScoreDisplay(
currentScore,
bonusText = ""
) {

replacePuzzleGeneratorUI();

updateHiddenScoreBreakdown();

if (
scoreValueElement
) {

scoreValueElement.textContent =
currentScore;
}

if (
scoreBonusElement
) {

scoreBonusElement.textContent =
bonusText;
}
}


function displayScoringWords(
scoringWords
) {

if (
!wordListElement
) {
return;
}

wordListElement.innerHTML =
"";

for (
const item
of scoringWords
) {

const pill =
document.createElement(
"div"
);

pill.className =
"word-pill";

const word =
document.createElement(
"span"
);

word.className =
"word-pill-word";

word.textContent =
item.word;

const wordScore =
document.createElement(
"span"
);

wordScore.className =
"word-pill-score";

wordScore.textContent =
`+${item.score}`;

pill.appendChild(
word
);

pill.appendChild(
wordScore
);

wordListElement.appendChild(
pill
);
}
}


if (
generateButton
) {

generateButton.addEventListener(
"click",
() => {

if (
isGenerating
) {
return;
}

isGenerating =
true;

generateButton.disabled =
true;

generateBoard();

setTimeout(
() => {

isGenerating =
false;

generateButton.disabled =
false;

},
100
);
}
);
}


if (
newTilesButton
) {

newTilesButton.addEventListener(
"click",
() => {

playerPlacedTiles =
{};

playerTiles =
drawRandomTiles(
7
);

startingRackValueTotal =
playerTiles.reduce(
(total, letter) =>
total +
(letterValues[letter] ?? 0),
0
);

selectedRackTile =
null;

displayTileRack();

displayBoard();

calculatePlayerScore();
}
);
}


function updateWordCount() {

if (
!wordCountElement
) {
return;
}

wordCountElement.textContent =
`${puzzleWords.length} words`;
}


async function initialise() {

replacePuzzleGeneratorUI();

getGeneratorSettings();

await loadDictionary();

if (
dictionary.size === 0
) {

if (
tileMessageElement
) {

tileMessageElement.textContent =
"Could not load dictionary.txt";
}

return;
}

generateBoard();
}


initialise();
