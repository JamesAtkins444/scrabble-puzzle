const boardSize = 8;

let dictionary = new Set();

let board = [];
let originalBoard = [];

let playerPlacedTiles = {};
let playerTiles = [];

let bonusSquares = {};

/* ==================================================
SCRABBLE VALUES
================================================== */

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
Z: 10,
"": 0
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
Z: 1,
"": 2
};

/* ==================================================
BONUS SETTINGS
================================================== */

const bonusTypes = [
"double-letter",
"triple-letter",
"double-word",
"triple-word"
];

const bonusLabels = {
"double-letter": "2x L",
"triple-letter": "3x L",
"double-word": "2x W",
"triple-word": "3x W"
};

const bonusWeights = {
"double-letter": 40,
"triple-letter": 25,
"double-word": 20,
"triple-word": 15
};

const maxBonusCounts = {
"double-letter": 3,
"triple-letter": 3,
"double-word": 2,
"triple-word": 2
};

/* ==================================================
DOM
================================================== */

const boardElement =
document.getElementById("board");

const wordListElement =
document.getElementById("wordList");

const generateButton =
document.getElementById("generateButton");

const tileRackElement =
document.getElementById("tileRack");

const tileMessageElement =
document.getElementById("tileMessage");

/* ==================================================
LOAD DICTIONARY
================================================== */

async function loadDictionary() {

```
try {

    const response =
        await fetch("dictionary.txt");

    if (!response.ok) {
        throw new Error(
            "Could not load dictionary.txt"
        );
    }

    const text =
        await response.text();

    dictionary =
        new Set(
            text
                .split(/\r?\n/)
                .map(word =>
                    word
                        .trim()
                        .toUpperCase()
                )
                .filter(word =>
                    /^[A-Z]+$/.test(word)
                )
        );

    if (dictionary.size === 0) {
        throw new Error(
            "Dictionary is empty."
        );
    }

    generateBoard();

} catch (error) {

    console.error(error);

    boardElement.innerHTML = `
        <div style="
            grid-column: 1 / -1;
            grid-row: 1 / -1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            color: #b33b3b;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        ">
            Could not load dictionary.txt.
            Make sure dictionary.txt is in the
            same folder as index.html.
        </div>
    `;
}
```

}

/* ==================================================
BASIC BOARD HELPERS
================================================== */

function createEmptyBoard() {

```
return Array.from(
    { length: boardSize },
    () =>
        Array(boardSize).fill("")
);
```

}

function isInsideBoard(row, col) {

```
return (
    row >= 0 &&
    row < boardSize &&
    col >= 0 &&
    col < boardSize
);
```

}

function getPosition(
row,
col,
direction,
index
) {

```
if (
    direction ===
    "horizontal"
) {

    return {
        row,
        col: col + index
    };
}

return {
    row: row + index,
    col
};
```

}

function getRandomItem(array) {

```
if (!array.length) {
    return null;
}

return array[
    Math.floor(
        Math.random() *
        array.length
    )
];
```

}

/* ==================================================
WORD HELPERS
================================================== */

function getAllWordsFromDictionaryByLength(
min,
max
) {

```
return Array.from(dictionary)
    .filter(
        word =>
            word.length >= min &&
            word.length <= max
    );
```

}

function getHorizontalWord(row, col) {

```
if (!board[row][col]) {
    return "";
}

let startCol = col;

while (
    startCol > 0 &&
    board[row][startCol - 1]
) {
    startCol--;
}

let word = "";

while (
    startCol < boardSize &&
    board[row][startCol]
) {

    word +=
        board[row][startCol];

    startCol++;
}

return word;
```

}

function getVerticalWord(row, col) {

```
if (!board[row][col]) {
    return "";
}

let startRow = row;

while (
    startRow > 0 &&
    board[startRow - 1][col]
) {
    startRow--;
}

let word = "";

while (
    startRow < boardSize &&
    board[startRow][col]
) {

    word +=
        board[startRow][col];

    startRow++;
}

return word;
```

}

/* ==================================================
GET ALL BOARD WORDS
================================================== */

function getAllBoardWordsWithPositions(
currentBoard
) {

```
const words = [];


/* HORIZONTAL */

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
            !currentBoard[row][col]
        ) {

            col++;
            continue;
        }

        const startCol =
            col;

        let word = "";

        while (
            col < boardSize &&
            currentBoard[row][col]
        ) {

            word +=
                currentBoard[row][col];

            col++;
        }

        if (
            word.length >= 2
        ) {

            words.push({
                word,
                row,
                col: startCol,
                direction:
                    "horizontal"
            });
        }
    }
}


/* VERTICAL */

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
            !currentBoard[row][col]
        ) {

            row++;
            continue;
        }

        const startRow =
            row;

        let word = "";

        while (
            row < boardSize &&
            currentBoard[row][col]
        ) {

            word +=
                currentBoard[row][col];

            row++;
        }

        if (
            word.length >= 2
        ) {

            words.push({
                word,
                row: startRow,
                col,
                direction:
                    "vertical"
            });
        }
    }
}

return words;
```

}

/* ==================================================
CAN PLACE PUZZLE WORD
================================================== */

function canPlaceWord(
testBoard,
word,
row,
col,
direction,
requireOverlap = false
) {

```
let hasOverlap = false;

for (
    let i = 0;
    i < word.length;
    i++
) {

    const position =
        getPosition(
            row,
            col,
            direction,
            i
        );

    if (
        !isInsideBoard(
            position.row,
            position.col
        )
    ) {

        return false;
    }

    const existing =
        testBoard[
            position.row
        ][
            position.col
        ];

    if (existing) {

        if (
            existing !== word[i]
        ) {

            return false;
        }

        hasOverlap = true;
    }
}

if (
    requireOverlap &&
    !hasOverlap
) {

    return false;
}

return true;
```

}

/* ==================================================
CHECK PUZZLE PLACEMENT
================================================== */

function placementCreatesValidWords(
testBoard,
word,
row,
col,
direction
) {

```
const temporaryBoard =
    testBoard.map(
        r => [...r]
    );

for (
    let i = 0;
    i < word.length;
    i++
) {

    const position =
        getPosition(
            row,
            col,
            direction,
            i
        );

    temporaryBoard[
        position.row
    ][
        position.col
    ] = word[i];
}

const allWords =
    getAllBoardWordsWithPositions(
        temporaryBoard
    );

for (
    const wordData of allWords
) {

    if (
        !dictionary.has(
            wordData.word
        )
    ) {

        return false;
    }
}

return true;
```

}

/* ==================================================
PLACE WORD
================================================== */

function placeWord(
targetBoard,
word,
row,
col,
direction
) {

```
for (
    let i = 0;
    i < word.length;
    i++
) {

    const position =
        getPosition(
            row,
            col,
            direction,
            i
        );

    targetBoard[
        position.row
    ][
        position.col
    ] = word[i];
}
```

}

/* ==================================================
GENERATE PUZZLE
================================================== */

function generateBoard() {

```
board =
    createEmptyBoard();

originalBoard =
    createEmptyBoard();

playerPlacedTiles = {};

playerTiles = [];

bonusSquares = {};


const startingWords =
    getAllWordsFromDictionaryByLength(
        5,
        6
    );

if (
    startingWords.length === 0
) {

    showError(
        "No 5–6 letter words were found in dictionary.txt."
    );

    return;
}


const startingWord =
    getRandomItem(
        startingWords
    );


let placedStartingWord =
    false;


for (
    let attempt = 0;
    attempt < 500;
    attempt++
) {

    const direction =
        Math.random() < 0.5
            ? "horizontal"
            : "vertical";


    const row =
        Math.floor(
            Math.random() *
            boardSize
        );


    const col =
        Math.floor(
            Math.random() *
            boardSize
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

        placeWord(
            board,
            startingWord,
            row,
            col,
            direction
        );

        placedStartingWord =
            true;

        break;
    }
}


if (!placedStartingWord) {

    generateBoard();

    return;
}


/* --------------------------------
   ADD 2–4 CROSSING WORDS
-------------------------------- */

const additionalWordCount =
    2 +
    Math.floor(
        Math.random() * 3
    );


const additionalWords =
    getAllWordsFromDictionaryByLength(
        3,
        5
    );


let wordsAdded = 0;


for (
    let attempt = 0;
    attempt < 2000 &&
    wordsAdded <
        additionalWordCount;
    attempt++
) {

    const word =
        getRandomItem(
            additionalWords
        );

    if (!word) {
        continue;
    }


    const existingWords =
        getAllBoardWordsWithPositions(
            board
        );


    if (
        existingWords.length === 0
    ) {
        continue;
    }


    const existingWord =
        getRandomItem(
            existingWords
        );


    const direction =
        existingWord.direction ===
        "horizontal"
            ? "vertical"
            : "horizontal";


    const crossingIndex =
        Math.floor(
            Math.random() *
            existingWord.word.length
        );


    const crossingPosition =
        getPosition(
            existingWord.row,
            existingWord.col,
            existingWord.direction,
            crossingIndex
        );


    const matchingIndexes = [];


    for (
        let i = 0;
        i < word.length;
        i++
    ) {

        if (
            word[i] ===
            existingWord.word[
                crossingIndex
            ]
        ) {

            matchingIndexes.push(i);
        }
    }


    if (
        matchingIndexes.length === 0
    ) {

        continue;
    }


    const wordIndex =
        getRandomItem(
            matchingIndexes
        );


    let newRow;
    let newCol;


    if (
        direction ===
        "horizontal"
    ) {

        newRow =
            crossingPosition.row;

        newCol =
            crossingPosition.col -
            wordIndex;

    } else {

        newRow =
            crossingPosition.row -
            wordIndex;

        newCol =
            crossingPosition.col;
    }


    if (
        !canPlaceWord(
            board,
            word,
            newRow,
            newCol,
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
            newRow,
            newCol,
            direction
        )
    ) {

        continue;
    }


    placeWord(
        board,
        word,
        newRow,
        newCol,
        direction
    );


    wordsAdded++;
}


/*
   If we failed to create enough
   connected words, try again.
*/

if (
    wordsAdded <
    additionalWordCount
) {

    generateBoard();

    return;
}


/* --------------------------------
   SAVE PUZZLE
-------------------------------- */

originalBoard =
    board.map(
        row => [...row]
    );


/* --------------------------------
   BONUSES MUST COME AFTER WORDS
-------------------------------- */

generateBonusSquares();


/* --------------------------------
   DISPLAY
-------------------------------- */

displayBoard();

displayWords();

generatePlayerTiles();

calculateAndDisplayHighestScore();
```

}

/* ==================================================
BONUS SQUARES
================================================== */

function getBonusSquare(
row,
col
) {

```
return (
    bonusSquares[
        `${row},${col}`
    ] || null
);
```

}

function generateBonusSquares() {

```
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
            !board[row][col]
        ) {

            emptyCells.push({
                row,
                col
            });
        }
    }
}


const targetCount =
    4 +
    Math.floor(
        Math.random() * 3
    );


const selectedCells = [];


for (
    let attempt = 0;
    attempt < 1000 &&
    selectedCells.length <
        targetCount;
    attempt++
) {

    if (
        emptyCells.length === 0
    ) {
        break;
    }


    const candidate =
        getRandomItem(
            emptyCells
        );


    const tooClose =
        selectedCells.some(
            cell => {

                const distance =
                    Math.abs(
                        cell.row -
                        candidate.row
                    ) +
                    Math.abs(
                        cell.col -
                        candidate.col
                    );

                return distance < 2;
            }
        );


    if (tooClose) {
        continue;
    }


    const type =
        getWeightedBonusType();


    if (!type) {
        continue;
    }


    selectedCells.push({
        row:
            candidate.row,

        col:
            candidate.col,

        type
    });
}


/* FALLBACK */

if (
    selectedCells.length <
    targetCount
) {

    for (
        const candidate
        of emptyCells
    ) {

        if (
            selectedCells.some(
                cell =>
                    cell.row ===
                        candidate.row &&
                    cell.col ===
                        candidate.col
            )
        ) {

            continue;
        }


        const type =
            getWeightedBonusType();


        if (!type) {
            continue;
        }


        selectedCells.push({
            row:
                candidate.row,

            col:
                candidate.col,

            type
        });


        if (
            selectedCells.length >=
            targetCount
        ) {

            break;
        }
    }
}


selectedCells.forEach(
    cell => {

        bonusSquares[
            `${cell.row},${cell.col}`
        ] = cell.type;
    }
);
```

}

function getWeightedBonusType() {

```
const counts = {};


bonusTypes.forEach(
    type => {
        counts[type] =
            Object.values(
                bonusSquares
            ).filter(
                value =>
                    value === type
            ).length;
    }
);


const availableTypes =
    bonusTypes.filter(
        type =>
            counts[type] <
            maxBonusCounts[type]
    );


if (
    availableTypes.length === 0
) {

    return null;
}


let totalWeight = 0;


availableTypes.forEach(
    type => {

        totalWeight +=
            bonusWeights[type];
    }
);


let random =
    Math.random() *
    totalWeight;


for (
    const type of
    availableTypes
) {

    random -=
        bonusWeights[type];


    if (
        random <= 0
    ) {

        return type;
    }
}


return (
    availableTypes[
        availableTypes.length - 1
    ]
);
```

}

/* ==================================================
SCORE A WORD
================================================== */

function calculateWordScoreAtPosition(
word,
row,
col,
direction,
newlyPlacedKeys = null
) {

```
let score = 0;

let wordMultiplier = 1;


for (
    let i = 0;
    i < word.length;
    i++
) {

    const position =
        getPosition(
            row,
            col,
            direction,
            i
        );


    const letter =
        word[i];


    let letterScore =
        letterValues[letter] ||
        0;


    /*
       IMPORTANT:

       Bonus squares only apply
       to tiles placed during
       this move.

       Existing puzzle letters
       do NOT get the bonus again.
    */

    const key =
        `${position.row},${position.col}`;


    const isNewTile =
        !newlyPlacedKeys ||
        newlyPlacedKeys.has(key);


    if (isNewTile) {

        const bonus =
            getBonusSquare(
                position.row,
                position.col
            );


        if (
            bonus ===
            "double-letter"
        ) {

            letterScore *= 2;
        }


        if (
            bonus ===
            "triple-letter"
        ) {

            letterScore *= 3;
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


    score +=
        letterScore;
}


return (
    score *
    wordMultiplier
);
```

}

/* ==================================================
PLAYER TILE HELPERS
================================================== */

function getPlayerPlacedTile(
row,
col
) {

```
return (
    playerPlacedTiles[
        `${row},${col}`
    ]
);
```

}

/* ==================================================
PLAYER TILE STATUS
================================================== */

function getPlayerTileStatuses() {

```
const statuses = {};


const playerKeys =
    Object.keys(
        playerPlacedTiles
    );


const connected =
    new Set();


const queue = [];


/*
   Find player tiles touching
   original puzzle tiles.
*/

for (
    const key of playerKeys
) {

    const [
        row,
        col
    ] =
        key
            .split(",")
            .map(Number);


    const neighbours = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1]
    ];


    let touchesOriginal =
        false;


    for (
        const [
            r,
            c
        ] of neighbours
    ) {

        if (
            isInsideBoard(
                r,
                c
            ) &&
            originalBoard[r][c]
        ) {

            touchesOriginal =
                true;

            break;
        }
    }


    if (
        touchesOriginal
    ) {

        connected.add(key);

        queue.push(key);
    }
}


/*
   Spread connection through
   other player tiles.
*/

while (
    queue.length > 0
) {

    const key =
        queue.shift();


    const [
        row,
        col
    ] =
        key
            .split(",")
            .map(Number);


    const neighbours = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1]
    ];


    for (
        const [
            r,
            c
        ] of neighbours
    ) {

        if (
            !isInsideBoard(
                r,
                c
            )
        ) {

            continue;
        }


        const neighbourKey =
            `${r},${c}`;


        if (
            playerPlacedTiles[
                neighbourKey
            ] &&
            !connected.has(
                neighbourKey
            )
        ) {

            connected.add(
                neighbourKey
            );

            queue.push(
                neighbourKey
            );
        }
    }
}


/*
   Determine validity.
*/

for (
    const key of playerKeys
) {

    const [
        row,
        col
    ] =
        key
            .split(",")
            .map(Number);


    if (
        !connected.has(key)
    ) {

        const neighbours = [
            [row - 1, col],
            [row + 1, col],
            [row, col - 1],
            [row, col + 1]
        ];


        const touchesAnotherPlayer =
            neighbours.some(
                ([r, c]) =>
                    isInsideBoard(
                        r,
                        c
                    ) &&
                    playerPlacedTiles[
                        `${r},${c}`
                    ]
            );


        statuses[key] =
            touchesAnotherPlayer
                ? "invalid"
                : "isolated";


        continue;
    }


    const horizontalWord =
        getHorizontalWord(
            row,
            col
        );


    const verticalWord =
        getVerticalWord(
            row,
            col
        );


    let valid = true;

    let hasWord = false;


    if (
        horizontalWord.length >= 2
    ) {

        hasWord = true;


        if (
            !dictionary.has(
                horizontalWord
            )
        ) {

            valid = false;
        }
    }


    if (
        verticalWord.length >= 2
    ) {

        hasWord = true;


        if (
            !dictionary.has(
                verticalWord
            )
        ) {

            valid = false;
        }
    }


    statuses[key] =
        valid && hasWord
            ? "valid"
            : "invalid";
}


return statuses;
```

}

/* ==================================================
PLAYER SCORING WORDS
================================================== */

function isScoringWordValid(
wordData,
statuses
) {

```
let containsPlayerTile =
    false;


for (
    let i = 0;
    i < wordData.word.length;
    i++
) {

    const position =
        getPosition(
            wordData.row,
            wordData.col,
            wordData.direction,
            i
        );


    const key =
        `${position.row},${position.col}`;


    const playerTile =
        getPlayerPlacedTile(
            position.row,
            position.col
        );


    if (playerTile) {

        containsPlayerTile =
            true;


        if (
            statuses[key] !==
            "valid"
        ) {

            return false;
        }
    }
}


return containsPlayerTile;
```

}

function getPlayerScoringWords() {

```
const allWords =
    getAllBoardWordsWithPositions(
        board
    );


const statuses =
    getPlayerTileStatuses();


return allWords.filter(
    wordData =>
        isScoringWordValid(
            wordData,
            statuses
        )
);
```

}

/* ==================================================
7 TILE BONUS
================================================== */

function getSevenTileBonus() {

```
const placedKeys =
    Object.keys(
        playerPlacedTiles
    );


if (
    placedKeys.length !== 7
) {

    return {
        points: 0,
        type: null
    };
}


const statuses =
    getPlayerTileStatuses();


const allSevenValid =
    placedKeys.every(
        key =>
            statuses[key] ===
            "valid"
    );


if (!allSevenValid) {

    return {
        points: 0,
        type: null
    };
}


const scoringWords =
    getPlayerScoringWords();


const hasSevenTileWord =
    scoringWords.some(
        wordData => {

            let count = 0;


            for (
                let i = 0;
                i < wordData.word.length;
                i++
            ) {

                const position =
                    getPosition(
                        wordData.row,
                        wordData.col,
                        wordData.direction,
                        i
                    );


                if (
                    getPlayerPlacedTile(
                        position.row,
                        position.col
                    )
                ) {

                    count++;
                }
            }


            return count === 7;
        }
    );


if (
    hasSevenTileWord
) {

    return {
        points: 100,
        type: "seven-word"
    };
}


return {
    points: 50,
    type: "seven-tiles"
};
```

}

/* ==================================================
PLAYER SCORE
================================================== */

function calculatePlayerScore() {

```
const scoringWords =
    getPlayerScoringWords();


let total = 0;


scoringWords.forEach(
    wordData => {

        total +=
            calculateWordScoreAtPosition(
                wordData.word,
                wordData.row,
                wordData.col,
                wordData.direction
            );
    }
);


total +=
    getSevenTileBonus().points;


return total;
```

}

/* ==================================================
SCORE DISPLAY
================================================== */

function updateScore() {

```
const scoreElement =
    document.getElementById(
        "scoreValue"
    );


if (!scoreElement) {
    return;
}


const score =
    calculatePlayerScore();


scoreElement.textContent =
    score;


const bonusElement =
    document.getElementById(
        "scoreBonus"
    );


if (!bonusElement) {
    return;
}


const bonus =
    getSevenTileBonus();


if (
    bonus.type ===
    "seven-word"
) {

    bonusElement.textContent =
        "+100 7-tile word bonus";

} else if (
    bonus.type ===
    "seven-tiles"
) {

    bonusElement.textContent =
        "+50 7-tile bonus";

} else {

    bonusElement.textContent =
        "";
}
```

}

/* ==================================================
DISPLAY BOARD
================================================== */

function displayBoard() {

```
boardElement.innerHTML = "";


const statuses =
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


        const bonus =
            getBonusSquare(
                row,
                col
            );


        if (bonus) {

            cell.classList.add(
                bonus
            );
        }


        const letter =
            board[row][col];


        const playerTile =
            getPlayerPlacedTile(
                row,
                col
            );


        if (letter) {

            cell.textContent =
                letter;


            if (playerTile) {

                const status =
                    statuses[
                        `${row},${col}`
                    ];


                cell.classList.add(
                    `player-${status}`
                );


                cell.addEventListener(
                    "click",
                    () =>
                        removePlayerTile(
                            row,
                            col
                        )
                );


                if (bonus) {

                    const badge =
                        document.createElement(
                            "span"
                        );


                    badge.className =
                        "bonus-badge";


                    badge.textContent =
                        bonusLabels[
                            bonus
                        ];


                    cell.appendChild(
                        badge
                    );
                }

            } else {

                cell.classList.add(
                    "original-tile"
                );
            }

        } else {

            if (bonus) {

                const label =
                    document.createElement(
                        "span"
                    );


                label.className =
                    "bonus-label";


                label.textContent =
                    bonusLabels[
                        bonus
                    ];


                cell.appendChild(
                    label
                );
            }


            cell.addEventListener(
                "click",
                () =>
                    placePlayerTile(
                        row,
                        col
                    )
            );
        }


        boardElement.appendChild(
            cell
        );
    }
}
```

}

/* ==================================================
PLACE PLAYER TILE
================================================== */

function placePlayerTile(
row,
col
) {

```
if (
    board[row][col]
) {

    return;
}


if (
    playerTiles.length === 0
) {

    return;
}


const selectedTile =
    document.querySelector(
        ".rack-tile.selected"
    );


if (!selectedTile) {

    if (tileMessageElement) {
        tileMessageElement.textContent =
            "Select a tile first.";
    }

    return;
}


const index =
    Number(
        selectedTile.dataset.index
    );


const tile =
    playerTiles[index];


if (!tile) {
    return;
}


board[row][col] =
    tile.letter;


playerPlacedTiles[
    `${row},${col}`
] = {

    letter:
        tile.letter,

    value:
        tile.value,

    rackIndex:
        index
};


playerTiles.splice(
    index,
    1
);


displayRack();

displayBoard();

displayWords();

updateScore();
```

}

/* ==================================================
REMOVE PLAYER TILE
================================================== */

function removePlayerTile(
row,
col
) {

```
const key =
    `${row},${col}`;


const tile =
    playerPlacedTiles[key];


if (!tile) {
    return;
}


board[row][col] =
    "";


playerTiles.push({
    letter:
        tile.letter,

    value:
        tile.value
});


delete playerPlacedTiles[
    key
];


displayRack();

displayBoard();

displayWords();

updateScore();
```

}

/* ==================================================
GENERATE PLAYER TILES
================================================== */

function generatePlayerTiles() {

```
playerTiles = [];


const tileBag = [];


Object.entries(
    letterDistribution
).forEach(
    ([letter, count]) => {

        for (
            let i = 0;
            i < count;
            i++
        ) {

            tileBag.push(
                letter
            );
        }
    }
);


for (
    let i = 0;
    i < 7;
    i++
) {

    if (
        tileBag.length === 0
    ) {
        break;
    }


    const randomIndex =
        Math.floor(
            Math.random() *
            tileBag.length
        );


    const letter =
        tileBag.splice(
            randomIndex,
            1
        )[0];


    playerTiles.push({

        letter,

        value:
            letterValues[
                letter
            ] || 0
    });
}


displayRack();

updateScore();

calculateAndDisplayHighestScore();
```

}

/* ==================================================
DISPLAY RACK
================================================== */

function displayRack() {

```
tileRackElement.innerHTML = "";


playerTiles.forEach(
    (tile, index) => {

        const tileElement =
            document.createElement(
                "div"
            );


        tileElement.className =
            "rack-tile";


        tileElement.dataset.index =
            index;


        tileElement.innerHTML = `
            <span class="tile-letter">
                ${
                    tile.letter === ""
                        ? "★"
                        : tile.letter
                }
            </span>

            <span class="tile-value">
                ${tile.value}
            </span>
        `;


        tileElement.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".rack-tile"
                    )
                    .forEach(
                        tile =>
                            tile.classList.remove(
                                "selected"
                            )
                    );


                tileElement.classList.add(
                    "selected"
                );
            }
        );


        tileRackElement.appendChild(
            tileElement
        );
    }
);
```

}

/* ==================================================
DISPLAY SCORING WORDS
================================================== */

function displayWords() {

```
wordListElement.innerHTML = "";


const scoringWords =
    getPlayerScoringWords();


if (
    scoringWords.length === 0
) {

    updateScore();

    return;
}


scoringWords.forEach(
    wordData => {

        const score =
            calculateWordScoreAtPosition(
                wordData.word,
                wordData.row,
                wordData.col,
                wordData.direction
            );


        const pill =
            document.createElement(
                "div"
            );


        pill.className =
            "word-pill";


        pill.innerHTML = `
            <span class="word-pill-word">
                ${wordData.word}
            </span>

            <span class="word-pill-score">
                ${score}
            </span>
        `;


        wordListElement.appendChild(
            pill
        );
    }
);


updateScore();
```

}

/* ==================================================
HIGHEST POSSIBLE SCORE
================================================== */

/*
This section searches the dictionary for the
highest-scoring word that can be made from
the player's current seven tiles.

It considers:

* Existing puzzle letters
* Player's seven tiles
* Letter bonuses
* Word bonuses
* Cross words
* Dictionary validity
* 7-tile bonus
  */

function getRackLetterCounts() {

```
const counts = {};


for (
    const tile of playerTiles
) {

    const letter =
        tile.letter;


    if (
        !counts[letter]
    ) {

        counts[letter] = 0;
    }


    counts[letter]++;
}


return counts;
```

}

function canWordUseRack(
word,
requiredLetters
) {

```
const counts =
    getRackLetterCounts();


let blanks =
    counts[""] || 0;


for (
    const letter of
    requiredLetters
) {

    if (
        counts[letter] &&
        counts[letter] > 0
    ) {

        counts[letter]--;

    } else if (
        blanks > 0
    ) {

        blanks--;

    } else {

        return false;
    }
}


return true;
```

}

/*
Return the letters that must be supplied
by the player's rack for a particular
word placement.
*/

function getRequiredRackLetters(
word,
row,
col,
direction
) {

```
const required = [];


for (
    let i = 0;
    i < word.length;
    i++
) {

    const position =
        getPosition(
            row,
            col,
            direction,
            i
        );


    const existing =
        board[
            position.row
        ][
            position.col
        ];


    if (!existing) {

        required.push(
            word[i]
        );

    } else if (
        existing !== word[i]
    ) {

        return null;
    }
}


return required;
```

}

/*
Check whether placing this word creates
valid words in every direction.

The main word must be in the dictionary.

Every perpendicular word of 2+ letters
must also be in the dictionary.
*/

function isValidBestMove(
word,
row,
col,
direction
) {

```
const required =
    getRequiredRackLetters(
        word,
        row,
        col,
        direction
    );


if (!required) {
    return false;
}


if (
    required.length === 0
) {

    return false;
}


if (
    !canWordUseRack(
        word,
        required
    )
) {

    return false;
}


const temporaryBoard =
    board.map(
        r => [...r]
    );


const newKeys =
    new Set();


for (
    let i = 0;
    i < word.length;
    i++
) {

    const position =
        getPosition(
            row,
            col,
            direction,
            i
        );


    if (
        temporaryBoard[
            position.row
        ][
            position.col
        ]
    ) {

        if (
            temporaryBoard[
                position.row
            ][
                position.col
            ] !==
            word[i]
        ) {

            return false;
        }

    } else {

        temporaryBoard[
            position.row
        ][
            position.col
        ] =
            word[i];


        newKeys.add(
            `${position.row},${position.col}`
        );
    }
}


/*
   The move must connect to the
   existing puzzle.
*/

let connectsToBoard = false;


for (
    const key of newKeys
) {

    const [
        r,
        c
    ] =
        key
            .split(",")
            .map(Number);


    const neighbours = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1]
    ];


    for (
        const [
            nr,
            nc
        ] of neighbours
    ) {

        if (
            isInsideBoard(
                nr,
                nc
            ) &&
            board[nr][nc]
        ) {

            connectsToBoard =
                true;

            break;
        }
    }


    if (connectsToBoard) {
        break;
    }
}


if (!connectsToBoard) {
    return false;
}


/*
   Check every word created by
   the move.
*/

const allWords =
    getAllBoardWordsWithPositions(
        temporaryBoard
    );


for (
    const wordData of allWords
) {

    /*
       Only words containing at least
       one newly placed tile are relevant.
    */

    let containsNewTile =
        false;


    for (
        let i = 0;
        i < wordData.word.length;
        i++
    ) {

        const position =
            getPosition(
                wordData.row,
                wordData.col,
                wordData.direction,
                i
            );


        const key =
            `${position.row},${position.col}`;


        if (
            newKeys.has(key)
        ) {

            containsNewTile =
                true;

            break;
        }
    }


    if (!containsNewTile) {
        continue;
    }


    if (
        !dictionary.has(
            wordData.word
        )
    ) {

        return false;
    }
}


return true;
```

}

/*
Calculate the complete score of a move.

We score every newly created/changed word
and only apply bonus squares to newly placed
tiles.
*/

function calculateBestMoveScore(
word,
row,
col,
direction
) {

```
const temporaryBoard =
    board.map(
        r => [...r]
    );


const newKeys =
    new Set();


for (
    let i = 0;
    i < word.length;
    i++
) {

    const position =
        getPosition(
            row,
            col,
            direction,
            i
        );


    if (
        !temporaryBoard[
            position.row
        ][
            position.col
        ]
    ) {

        temporaryBoard[
            position.row
        ][
            position.col
        ] =
            word[i];


        newKeys.add(
            `${position.row},${position.col}`
        );
    }
}


const allWords =
    getAllBoardWordsWithPositions(
        temporaryBoard
    );


let total = 0;

const scoringWords = [];


for (
    const wordData of allWords
) {

    let containsNewTile =
        false;


    for (
        let i = 0;
        i < wordData.word.length;
        i++
    ) {

        const position =
            getPosition(
                wordData.row,
                wordData.col,
                wordData.direction,
                i
            );


        const key =
            `${position.row},${position.col}`;


        if (
            newKeys.has(key)
        ) {

            containsNewTile =
                true;

            break;
        }
    }


    if (!containsNewTile) {
        continue;
    }


    const score =
        calculateWordScoreAtPosition(
            wordData.word,
            wordData.row,
            wordData.col,
            wordData.direction,
            newKeys
        );


    total += score;


    scoringWords.push({
        ...wordData,
        score
    });
}


/*
   Seven tile bonus.

   If the move uses all seven rack tiles:

   - one word containing all seven = +100
   - otherwise = +50
*/

if (
    newKeys.size ===
    playerTiles.length &&
    playerTiles.length === 7
) {

    const mainWordUsesSeven =
        scoringWords.some(
            wordData => {

                let count = 0;


                for (
                    let i = 0;
                    i < wordData.word.length;
                    i++
                ) {

                    const position =
                        getPosition(
                            wordData.row,
                            wordData.col,
                            wordData.direction,
                            i
                        );


                    if (
                        newKeys.has(
                            `${position.row},${position.col}`
                        )
                    ) {

                        count++;
                    }
                }


                return count === 7;
            }
        );


    if (
        mainWordUsesSeven
    ) {

        total += 100;

    } else {

        total += 50;
    }
}


return {
    score: total,
    scoringWords
};
```

}

/*
Find the highest possible move.

We only search words up to 8 letters because
the board is 8x8.

The search also checks the player's rack.
*/

function findHighestPossibleScore() {

```
if (
    playerTiles.length === 0
) {

    return null;
}


const dictionaryWords =
    Array.from(dictionary)
        .filter(
            word =>
                word.length >= 2 &&
                word.length <= boardSize
        );


let bestMove = null;


/*
   Try every dictionary word.
*/

for (
    const word of
    dictionaryWords
) {

    /*
       A word cannot use more tiles
       than the player has.
    */

    if (
        word.length >
        boardSize
    ) {

        continue;
    }


    /*
       Horizontal placements
    */

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
                col + word.length >
                boardSize
            ) {

                continue;
            }


            if (
                !isValidBestMove(
                    word,
                    row,
                    col,
                    "horizontal"
                )
            ) {

                continue;
            }


            const result =
                calculateBestMoveScore(
                    word,
                    row,
                    col,
                    "horizontal"
                );


            if (
                !bestMove ||
                result.score >
                    bestMove.score
            ) {

                bestMove = {

                    word,

                    score:
                        result.score,

                    row,

                    col,

                    direction:
                        "horizontal"
                };
            }
        }
    }


    /*
       Vertical placements
    */

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
                row + word.length >
                boardSize
            ) {

                continue;
            }


            if (
                !isValidBestMove(
                    word,
                    row,
                    col,
                    "vertical"
                )
            ) {

                continue;
            }


            const result =
                calculateBestMoveScore(
                    word,
                    row,
                    col,
                    "vertical"
                );


            if (
                !bestMove ||
                result.score >
                    bestMove.score
            ) {

                bestMove = {

                    word,

                    score:
                        result.score,

                    row,

                    col,

                    direction:
                        "vertical"
                };
            }
        }
    }
}


return bestMove;
```

}

/*
Display the answer at the bottom.
*/

function calculateAndDisplayHighestScore() {

```
const wordElement =
    document.getElementById(
        "bestScoreWord"
    );


const scoreElement =
    document.getElementById(
        "bestScoreValue"
    );


if (
    !wordElement ||
    !scoreElement
) {

    return;
}


wordElement.textContent =
    "Calculating…";


scoreElement.textContent =
    "";


/*
   Use setTimeout so the board can render
   before the dictionary search happens.
*/

setTimeout(
    () => {

        const bestMove =
            findHighestPossibleScore();


        if (!bestMove) {

            wordElement.textContent =
                "No valid move";

            scoreElement.textContent =
                "0";

            return;
        }


        wordElement.textContent =
            bestMove.word;


        scoreElement.textContent =
            `${bestMove.score} points`;
    },
    20
);
```

}

/* ==================================================
ERROR DISPLAY
================================================== */

function showError(message) {

```
boardElement.innerHTML = `
    <div style="
        grid-column: 1 / -1;
        grid-row: 1 / -1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        color: #b33b3b;
        padding: 20px;
        text-align: center;
        font-size: 14px;
    ">
        ${message}
    </div>
`;
```

}

/* ==================================================
BUTTON
================================================== */

if (generateButton) {

```
generateButton.addEventListener(
    "click",
    () => {

        generateBoard();
    }
);
```

}

/* ==================================================
START
================================================== */

loadDictionary();
