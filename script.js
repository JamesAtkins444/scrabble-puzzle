const boardSize = 7;

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

const boardElement = document.getElementById("board");
const wordListElement = document.getElementById("wordList");
const generateButton = document.getElementById("generateButton");
const newTilesButton = document.getElementById("newTilesButton");
const tileRackElement = document.getElementById("tileRack");


// --------------------------------------------------
// LOAD DICTIONARY
// --------------------------------------------------

async function loadDictionary() {
    const response = await fetch("dictionary.txt");
    const text = await response.text();

    dictionary = new Set(
        text
            .split(/\r?\n/)
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length > 0)
    );

    generateBoard();
}


// --------------------------------------------------
// BASIC BOARD HELPERS
// --------------------------------------------------

function createEmptyBoard() {
    return Array.from(
        { length: boardSize },
        () => Array(boardSize).fill("")
    );
}

function isInsideBoard(row, col) {
    return (
        row >= 0 &&
        row < boardSize &&
        col >= 0 &&
        col < boardSize
    );
}

function getPosition(row, col, direction, index) {
    if (direction === "horizontal") {
        return {
            row,
            col: col + index
        };
    }

    return {
        row: row + index,
        col
    };
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}


// --------------------------------------------------
// WORD HELPERS
// --------------------------------------------------

function getAllWordsFromDictionaryByLength(min, max) {
    return Array.from(dictionary).filter(
        word =>
            word.length >= min &&
            word.length <= max
    );
}

function getWordAtPosition(
    testBoard,
    row,
    col,
    direction,
    length
) {
    let word = "";

    for (let i = 0; i < length; i++) {
        const position =
            getPosition(
                row,
                col,
                direction,
                i
            );

        if (!isInsideBoard(position.row, position.col)) {
            return null;
        }

        word += testBoard[position.row][position.col];
    }

    return word;
}

function getHorizontalWord(row, col) {
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
        word += board[row][startCol];
        startCol++;
    }

    return word;
}

function getVerticalWord(row, col) {
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
        word += board[startRow][col];
        startRow++;
    }

    return word;
}


// --------------------------------------------------
// BOARD WORD EXTRACTION
// --------------------------------------------------

function getAllBoardWordsWithPositions(currentBoard) {
    const words = [];

    // Horizontal
    for (let row = 0; row < boardSize; row++) {
        let col = 0;

        while (col < boardSize) {
            if (!currentBoard[row][col]) {
                col++;
                continue;
            }

            const startCol = col;
            let word = "";

            while (
                col < boardSize &&
                currentBoard[row][col]
            ) {
                word += currentBoard[row][col];
                col++;
            }

            if (word.length >= 2) {
                words.push({
                    word,
                    row,
                    col: startCol,
                    direction: "horizontal"
                });
            }
        }
    }

    // Vertical
    for (let col = 0; col < boardSize; col++) {
        let row = 0;

        while (row < boardSize) {
            if (!currentBoard[row][col]) {
                row++;
                continue;
            }

            const startRow = row;
            let word = "";

            while (
                row < boardSize &&
                currentBoard[row][col]
            ) {
                word += currentBoard[row][col];
                row++;
            }

            if (word.length >= 2) {
                words.push({
                    word,
                    row: startRow,
                    col,
                    direction: "vertical"
                });
            }
        }
    }

    return words;
}


// --------------------------------------------------
// CHECK WHETHER A WORD CAN BE PLACED
// --------------------------------------------------

function canPlaceWord(
    testBoard,
    word,
    row,
    col,
    direction,
    requireOverlap = false
) {
    let hasOverlap = false;

    for (let i = 0; i < word.length; i++) {
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
            testBoard[position.row][position.col];

        if (existing) {
            if (existing !== word[i]) {
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
}


// --------------------------------------------------
// CHECK ALL WORDS CREATED BY A PLACEMENT
// --------------------------------------------------

function placementCreatesValidWords(
    testBoard,
    word,
    row,
    col,
    direction
) {
    const temporaryBoard =
        testBoard.map(r => [...r]);

    for (let i = 0; i < word.length; i++) {
        const position =
            getPosition(
                row,
                col,
                direction,
                i
            );

        temporaryBoard[position.row][position.col] =
            word[i];
    }

    const allWords =
        getAllBoardWordsWithPositions(
            temporaryBoard
        );

    for (const wordData of allWords) {
        if (!dictionary.has(wordData.word)) {
            return false;
        }
    }

    return true;
}


// --------------------------------------------------
// PLACE WORD
// --------------------------------------------------

function placeWord(
    targetBoard,
    word,
    row,
    col,
    direction
) {
    for (let i = 0; i < word.length; i++) {
        const position =
            getPosition(
                row,
                col,
                direction,
                i
            );

        targetBoard[position.row][position.col] =
            word[i];
    }
}


// --------------------------------------------------
// GENERATE PUZZLE
// --------------------------------------------------

function generateBoard() {
    board = createEmptyBoard();
    playerPlacedTiles = {};
    playerTiles = [];

    const startingWords =
        getAllWordsFromDictionaryByLength(5, 6);

    const startingWord =
        getRandomItem(startingWords);

    let placedStartingWord = false;

    for (let attempt = 0; attempt < 500; attempt++) {
        const direction =
            Math.random() < 0.5
                ? "horizontal"
                : "vertical";

        const row =
            Math.floor(Math.random() * boardSize);

        const col =
            Math.floor(Math.random() * boardSize);

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

            placedStartingWord = true;
            break;
        }
    }

    if (!placedStartingWord) {
        return generateBoard();
    }


    // Add 2–4 additional words
    const additionalWordCount =
        2 + Math.floor(Math.random() * 3);

    const additionalWords =
        getAllWordsFromDictionaryByLength(3, 5);

    let wordsAdded = 0;

    for (
        let attempt = 0;
        attempt < 1000 &&
        wordsAdded < additionalWordCount;
        attempt++
    ) {
        const word =
            getRandomItem(additionalWords);

        const existingWords =
            getAllBoardWordsWithPositions(board);

        if (existingWords.length === 0) {
            continue;
        }

        const existingWord =
            getRandomItem(existingWords);

        const direction =
            existingWord.direction === "horizontal"
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

        for (let i = 0; i < word.length; i++) {
            if (
                word[i] ===
                existingWord.word[crossingIndex]
            ) {
                matchingIndexes.push(i);
            }
        }

        if (matchingIndexes.length === 0) {
            continue;
        }

        const wordIndex =
            getRandomItem(matchingIndexes);

        let newRow;
        let newCol;

        if (direction === "horizontal") {
            newRow = crossingPosition.row;
            newCol =
                crossingPosition.col -
                wordIndex;
        } else {
            newRow =
                crossingPosition.row -
                wordIndex;
            newCol = crossingPosition.col;
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

    // Save original puzzle board
    originalBoard =
        board.map(row => [...row]);

    // Generate bonus squares AFTER puzzle generation
    generateBonusSquares();

    displayBoard();
    displayWords();
    generatePlayerTiles();
}


// --------------------------------------------------
// BONUS SQUARES
// --------------------------------------------------

function getBonusSquare(row, col) {
    return bonusSquares[
        `${row},${col}`
    ] || null;
}

function generateBonusSquares() {
    bonusSquares = {};

    const emptyCells = [];

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (!board[row][col]) {
                emptyCells.push({ row, col });
            }
        }
    }

    const targetCount =
        4 + Math.floor(Math.random() * 3);

    const selectedCells = [];

    for (
        let attempt = 0;
        attempt < 500 &&
        selectedCells.length < targetCount;
        attempt++
    ) {
        if (emptyCells.length === 0) {
            break;
        }

        const candidate =
            getRandomItem(emptyCells);

        const tooClose =
            selectedCells.some(cell => {
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
            });

        if (tooClose) {
            continue;
        }

        const type =
            getWeightedBonusType();

        const currentCount =
            selectedCells.filter(
                cell =>
                    cell.type === type
            ).length;

        if (
            currentCount >=
            maxBonusCounts[type]
        ) {
            continue;
        }

        selectedCells.push({
            row: candidate.row,
            col: candidate.col,
            type
        });
    }

    // Fallback if spacing prevented enough squares
    if (selectedCells.length < targetCount) {
        for (const candidate of emptyCells) {
            if (
                selectedCells.some(
                    cell =>
                        cell.row === candidate.row &&
                        cell.col === candidate.col
                )
            ) {
                continue;
            }

            const type =
                getWeightedBonusType();

            const currentCount =
                selectedCells.filter(
                    cell =>
                        cell.type === type
                ).length;

            if (
                currentCount >=
                maxBonusCounts[type]
            ) {
                continue;
            }

            selectedCells.push({
                row: candidate.row,
                col: candidate.col,
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

    selectedCells.forEach(cell => {
        bonusSquares[
            `${cell.row},${cell.col}`
        ] = cell.type;
    });
}

function getWeightedBonusType() {
    const availableTypes =
        bonusTypes.filter(type => {
            const count =
                Object.values(bonusSquares)
                    .filter(
                        value =>
                            value === type
                    ).length;

            return (
                count <
                maxBonusCounts[type]
            );
        });

    if (availableTypes.length === 0) {
        return "double-letter";
    }

    let totalWeight = 0;

    availableTypes.forEach(type => {
        totalWeight += bonusWeights[type];
    });

    let random =
        Math.random() * totalWeight;

    for (const type of availableTypes) {
        random -= bonusWeights[type];

        if (random <= 0) {
            return type;
        }
    }

    return availableTypes[
        availableTypes.length - 1
    ];
}


// --------------------------------------------------
// SCORE A WORD
// --------------------------------------------------

function calculateWordScoreAtPosition(
    word,
    row,
    col,
    direction
) {
    let score = 0;
    let wordMultiplier = 1;

    for (let i = 0; i < word.length; i++) {
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
            letterValues[letter] || 0;

        const bonus =
            getBonusSquare(
                position.row,
                position.col
            );

        if (
            bonus === "double-letter"
        ) {
            letterScore *= 2;
        }

        if (
            bonus === "triple-letter"
        ) {
            letterScore *= 3;
        }

        if (
            bonus === "double-word"
        ) {
            wordMultiplier *= 2;
        }

        if (
            bonus === "triple-word"
        ) {
            wordMultiplier *= 3;
        }

        score += letterScore;
    }

    return score * wordMultiplier;
}


// --------------------------------------------------
// PLAYER TILE HELPERS
// --------------------------------------------------

function getPlayerPlacedTile(row, col) {
    return playerPlacedTiles[
        `${row},${col}`
    ];
}

function getPlayerTileStatuses() {
    const statuses = {};

    const playerKeys =
        Object.keys(playerPlacedTiles);

    // First determine which player tiles are
    // connected to the original puzzle.
    const connected = new Set();

    const queue = [];

    for (const key of playerKeys) {
        const [row, col] =
            key.split(",").map(Number);

        let touchesOriginal = false;

        const neighbours = [
            [row - 1, col],
            [row + 1, col],
            [row, col - 1],
            [row, col + 1]
        ];

        for (const [r, c] of neighbours) {
            if (
                isInsideBoard(r, c) &&
                originalBoard[r][c]
            ) {
                touchesOriginal = true;
                break;
            }
        }

        if (touchesOriginal) {
            connected.add(key);
            queue.push(key);
        }
    }

    // Spread connectivity through other player tiles.
    while (queue.length > 0) {
        const key = queue.shift();

        const [row, col] =
            key.split(",").map(Number);

        const neighbours = [
            [row - 1, col],
            [row + 1, col],
            [row, col - 1],
            [row, col + 1]
        ];

        for (const [r, c] of neighbours) {
            if (!isInsideBoard(r, c)) {
                continue;
            }

            const neighbourKey =
                `${r},${c}`;

            if (
                playerPlacedTiles[neighbourKey] &&
                !connected.has(neighbourKey)
            ) {
                connected.add(neighbourKey);
                queue.push(neighbourKey);
            }
        }
    }

    for (const key of playerKeys) {
        const [row, col] =
            key.split(",").map(Number);

        // Isolated player tile
        if (!connected.has(key)) {
            const neighbours = [
                [row - 1, col],
                [row + 1, col],
                [row, col - 1],
                [row, col + 1]
            ];

            const touchesAnotherPlayerTile =
                neighbours.some(
                    ([r, c]) =>
                        isInsideBoard(r, c) &&
                        playerPlacedTiles[
                            `${r},${c}`
                        ]
                );

            statuses[key] =
                touchesAnotherPlayerTile
                    ? "invalid"
                    : "isolated";

            continue;
        }

        // Connected tiles must create valid words.
        const horizontalWord =
            getHorizontalWord(row, col);

        const verticalWord =
            getVerticalWord(row, col);

        let valid = true;
        let hasWord = false;

        if (horizontalWord.length >= 2) {
            hasWord = true;

            if (
                !dictionary.has(
                    horizontalWord
                )
            ) {
                valid = false;
            }
        }

        if (verticalWord.length >= 2) {
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
}


// --------------------------------------------------
// PLAYER SCORING WORDS
// --------------------------------------------------

function isScoringWordValid(
    wordData,
    statuses
) {
    let containsPlayerTile = false;

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
            containsPlayerTile = true;

            // Every player tile in a scoring word
            // must be green/valid.
            if (
                statuses[key] !== "valid"
            ) {
                return false;
            }
        }
    }

    return containsPlayerTile;
}

function getPlayerScoringWords() {
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
}


// --------------------------------------------------
// 7-TILE SCORING BONUSES
// --------------------------------------------------

function getSevenTileBonus() {
    const placedKeys =
        Object.keys(playerPlacedTiles);

    // The player must have used all 7 rack tiles.
    if (placedKeys.length !== 7) {
        return {
            points: 0,
            type: null
        };
    }

    const statuses =
        getPlayerTileStatuses();

    // All seven tiles must be valid/green.
    const allSevenValid =
        placedKeys.every(
            key =>
                statuses[key] === "valid"
        );

    if (!allSevenValid) {
        return {
            points: 0,
            type: null
        };
    }

    const scoringWords =
        getPlayerScoringWords();

    // Check whether one word contains
    // all seven player tiles.
    const hasSevenTileWord =
        scoringWords.some(wordData => {
            let playerTilesInWord = 0;

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
                    playerTilesInWord++;
                }
            }

            return playerTilesInWord === 7;
        });

    if (hasSevenTileWord) {
        return {
            points: 100,
            type: "seven-word"
        };
    }

    // Otherwise all seven valid tiles have been used,
    // so award the normal 50-point bonus.
    return {
        points: 50,
        type: "seven-tiles"
    };
}


// --------------------------------------------------
// TOTAL PLAYER SCORE
// --------------------------------------------------

function calculatePlayerScore() {
    const scoringWords =
        getPlayerScoringWords();

    let total = 0;

    scoringWords.forEach(wordData => {
        total += calculateWordScoreAtPosition(
            wordData.word,
            wordData.row,
            wordData.col,
            wordData.direction
        );
    });

    const sevenTileBonus =
        getSevenTileBonus();

    total += sevenTileBonus.points;

    return total;
}


// --------------------------------------------------
// SCORE DISPLAY
// --------------------------------------------------

function ensureScoreElement() {
    let scoreBox =
        document.getElementById(
            "scoreBox"
        );

    if (!scoreBox) {
        scoreBox =
            document.createElement("div");

        scoreBox.id = "scoreBox";
        scoreBox.className = "score-box";

        scoreBox.innerHTML = `
            <span class="score-label">
                Score
            </span>

            <span id="scoreValue">
                0
            </span>

            <span
                id="scoreBonus"
                class="score-bonus"
            ></span>
        `;

        if (boardElement.parentNode) {
            boardElement.parentNode.insertBefore(
                scoreBox,
                boardElement
            );
        }
    }

    return document.getElementById(
        "scoreValue"
    );
}

function updateScore() {
    const scoreElement =
        ensureScoreElement();

    if (!scoreElement) {
        return;
    }

    const score =
        calculatePlayerScore();

    const bonus =
        getSevenTileBonus();

    scoreElement.textContent =
        score;

    const bonusElement =
        document.getElementById(
            "scoreBonus"
        );

    if (!bonusElement) {
        return;
    }

    if (
        bonus.type === "seven-word"
    ) {
        bonusElement.textContent =
            "+100 7-tile word bonus";
    } else if (
        bonus.type === "seven-tiles"
    ) {
        bonusElement.textContent =
            "+50 7-tile bonus";
    } else {
        bonusElement.textContent = "";
    }
}


// --------------------------------------------------
// DISPLAY BOARD
// --------------------------------------------------

function displayBoard() {
    boardElement.innerHTML = "";

    const statuses =
        getPlayerTileStatuses();

    for (let row = 0; row < boardSize; row++) {
        for (
            let col = 0;
            col < boardSize;
            col++
        ) {
            const cell =
                document.createElement("div");

            cell.className = "cell";

            const bonus =
                getBonusSquare(
                    row,
                    col
                );

            if (bonus) {
                cell.classList.add(bonus);
            }

            const letter =
                board[row][col];

            const playerTile =
                getPlayerPlacedTile(
                    row,
                    col
                );

            if (letter) {
                cell.textContent = letter;

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
                            bonusLabels[bonus];

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
                        bonusLabels[bonus];

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

            boardElement.appendChild(cell);
        }
    }
}


// --------------------------------------------------
// PLAYER TILE PLACEMENT
// --------------------------------------------------

function placePlayerTile(row, col) {
    if (board[row][col]) {
        return;
    }

    if (playerTiles.length === 0) {
        return;
    }

    const selectedTile =
        document.querySelector(
            ".rack-tile.selected"
        );

    if (!selectedTile) {
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
        letter: tile.letter,
        value: tile.value,
        rackIndex: index
    };

    playerTiles.splice(index, 1);

    displayRack();
    displayBoard();
    displayWords();
    updateScore();
}


// --------------------------------------------------
// REMOVE PLAYER TILE
// --------------------------------------------------

function removePlayerTile(row, col) {
    const key =
        `${row},${col}`;

    const tile =
        playerPlacedTiles[key];

    if (!tile) {
        return;
    }

    board[row][col] = "";

    playerTiles.push({
        letter: tile.letter,
        value: tile.value
    });

    delete playerPlacedTiles[key];

    displayRack();
    displayBoard();
    displayWords();
    updateScore();
}


// --------------------------------------------------
// GENERATE PLAYER TILES
// --------------------------------------------------

function generatePlayerTiles() {
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
                tileBag.push(letter);
            }
        }
    );

    for (
        let i = 0;
        i < 7;
        i++
    ) {
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
                letterValues[letter] || 0
        });
    }

    displayRack();
    updateScore();
}


// --------------------------------------------------
// DISPLAY RACK
// --------------------------------------------------

function displayRack() {
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
                        .forEach(tile =>
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
}


// --------------------------------------------------
// DISPLAY WORDS + SCORE
// --------------------------------------------------

function displayWords() {
    wordListElement.innerHTML = "";

    const scoringWords =
        getPlayerScoringWords();

    if (scoringWords.length === 0) {
        wordListElement.innerHTML =
            "<p>No scoring words yet.</p>";

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

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "word-item";

            item.innerHTML = `
                <span>
                    ${wordData.word}
                </span>

                <strong>
                    ${score}
                </strong>
            `;

            wordListElement.appendChild(
                item
            );
        }
    );

    updateScore();
}


// --------------------------------------------------
// BUTTONS
// --------------------------------------------------

generateButton.addEventListener(
    "click",
    () => {
        generateBoard();
    }
);

newTilesButton.addEventListener(
    "click",
    () => {
        playerPlacedTiles = {};

        board =
            originalBoard.map(
                row => [...row]
            );

        generatePlayerTiles();

        displayBoard();
        displayWords();
        updateScore();
    }
);


// --------------------------------------------------
// START
// --------------------------------------------------

loadDictionary();
