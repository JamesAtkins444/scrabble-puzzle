const BOARD_SIZE = 7;

const STARTING_WORD_MIN_LENGTH = 5;
const STARTING_WORD_MAX_LENGTH = 6;

const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 5;

const PLAYER_TILE_COUNT = 7;

const MIN_BONUS_SQUARES = 4;
const MAX_BONUS_SQUARES = 6;

const BONUS_TYPES = {
    DOUBLE_LETTER: {
        label: "2x L",
        className: "double-letter",
        weight: 40,
        max: 3
    },
    TRIPLE_LETTER: {
        label: "3x L",
        className: "triple-letter",
        weight: 25,
        max: 3
    },
    DOUBLE_WORD: {
        label: "2x W",
        className: "double-word",
        weight: 20,
        max: 2
    },
    TRIPLE_WORD: {
        label: "3x W",
        className: "triple-word",
        weight: 15,
        max: 2
    }
};

const SCRABBLE_TILES = {
    A: { value: 1, count: 9 },
    B: { value: 3, count: 2 },
    C: { value: 3, count: 2 },
    D: { value: 2, count: 4 },
    E: { value: 1, count: 12 },
    F: { value: 4, count: 2 },
    G: { value: 2, count: 3 },
    H: { value: 4, count: 2 },
    I: { value: 1, count: 9 },
    J: { value: 8, count: 1 },
    K: { value: 5, count: 1 },
    L: { value: 1, count: 4 },
    M: { value: 3, count: 2 },
    N: { value: 1, count: 6 },
    O: { value: 1, count: 8 },
    P: { value: 3, count: 2 },
    Q: { value: 10, count: 1 },
    R: { value: 1, count: 6 },
    S: { value: 1, count: 4 },
    T: { value: 1, count: 6 },
    U: { value: 1, count: 4 },
    V: { value: 4, count: 2 },
    W: { value: 4, count: 2 },
    X: { value: 8, count: 1 },
    Y: { value: 4, count: 2 },
    Z: { value: 10, count: 1 },
    BLANK: { value: 0, count: 2 }
};

let board = [];
let placedWords = [];
let dictionary = [];
let dictionarySet = new Set();

let playerTiles = [];
let playerPlacedTiles = {};
let selectedTileIndex = null;

let bonusSquares = {};

let targetWordCount = 3;

const boardElement = document.getElementById("board");
const generateButton = document.getElementById("generateButton");
const wordCountElement = document.getElementById("wordCount");
const wordListElement = document.getElementById("wordList");
const tileRackElement = document.getElementById("tileRack");
const newTilesButton = document.getElementById("newTilesButton");
const tileMessageElement = document.getElementById("tileMessage");


// ============================================================
// BASIC HELPERS
// ============================================================

function getLetterValue(letter) {
    if (!letter) return 0;

    const upper = letter.toUpperCase();

    if (SCRABBLE_TILES[upper]) {
        return SCRABBLE_TILES[upper].value;
    }

    return 0;
}


function createEmptyBoard() {
    board = Array.from(
        { length: BOARD_SIZE },
        () => Array(BOARD_SIZE).fill(null)
    );

    bonusSquares = {};
}


function isInsideBoard(row, col) {
    return (
        row >= 0 &&
        row < BOARD_SIZE &&
        col >= 0 &&
        col < BOARD_SIZE
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


function getPlayerPlacedTile(row, col) {
    return playerPlacedTiles[`${row},${col}`] || null;
}


// ============================================================
// BONUS SQUARES
// ============================================================

function getBonusSquare(row, col) {
    return bonusSquares[`${row},${col}`] || null;
}


function getWeightedBonusType() {
    const availableTypes = [];

    Object.keys(BONUS_TYPES).forEach(type => {
        const config = BONUS_TYPES[type];

        const currentCount = Object.values(bonusSquares)
            .filter(bonus => bonus.type === type)
            .length;

        if (currentCount < config.max) {
            for (let i = 0; i < config.weight; i++) {
                availableTypes.push(type);
            }
        }
    });

    if (availableTypes.length === 0) {
        return null;
    }

    return availableTypes[
        Math.floor(Math.random() * availableTypes.length)
    ];
}


function bonusIsTooClose(row, col) {
    return Object.keys(bonusSquares).some(key => {
        const [otherRow, otherCol] = key.split(",").map(Number);

        const distance =
            Math.abs(row - otherRow) +
            Math.abs(col - otherCol);

        return distance < 2;
    });
}


function generateBonusSquares() {
    bonusSquares = {};

    const availableCells = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (!board[row][col]) {
                availableCells.push({ row, col });
            }
        }
    }

    const desiredCount =
        MIN_BONUS_SQUARES +
        Math.floor(
            Math.random() *
            (MAX_BONUS_SQUARES - MIN_BONUS_SQUARES + 1)
        );

    let attempts = 0;

    while (
        Object.keys(bonusSquares).length < desiredCount &&
        attempts < 1000 &&
        availableCells.length > 0
    ) {
        attempts++;

        const cell =
            availableCells[
                Math.floor(Math.random() * availableCells.length)
            ];

        const key = `${cell.row},${cell.col}`;

        if (bonusSquares[key]) {
            continue;
        }

        if (bonusIsTooClose(cell.row, cell.col)) {
            continue;
        }

        const type = getWeightedBonusType();

        if (!type) {
            break;
        }

        bonusSquares[key] = {
            type,
            label: BONUS_TYPES[type].label,
            className: BONUS_TYPES[type].className
        };
    }

    // Fallback if the spacing rule made it impossible to reach
    // the desired number of bonus squares.
    if (Object.keys(bonusSquares).length < desiredCount) {
        const remainingCells = availableCells.filter(cell => {
            const key = `${cell.row},${cell.col}`;
            return !bonusSquares[key];
        });

        shuffle(remainingCells);

        for (const cell of remainingCells) {
            if (Object.keys(bonusSquares).length >= desiredCount) {
                break;
            }

            const key = `${cell.row},${cell.col}`;

            const type = getWeightedBonusType();

            if (!type) {
                break;
            }

            bonusSquares[key] = {
                type,
                label: BONUS_TYPES[type].label,
                className: BONUS_TYPES[type].className
            };
        }
    }
}


function calculateWordScoreAtPosition(word, row, col, direction) {
    let score = 0;
    let wordMultiplier = 1;

    for (let i = 0; i < word.length; i++) {
        const position = getPosition(
            row,
            col,
            direction,
            i
        );

        const letter = word[i];

        let letterValue = getLetterValue(letter);
        let letterMultiplier = 1;

        const bonus = getBonusSquare(
            position.row,
            position.col
        );

        if (bonus) {
            if (bonus.type === "DOUBLE_LETTER") {
                letterMultiplier = 2;
            }

            if (bonus.type === "TRIPLE_LETTER") {
                letterMultiplier = 3;
            }

            if (bonus.type === "DOUBLE_WORD") {
                wordMultiplier *= 2;
            }

            if (bonus.type === "TRIPLE_WORD") {
                wordMultiplier *= 3;
            }
        }

        score += letterValue * letterMultiplier;
    }

    return score * wordMultiplier;
}


// ============================================================
// BOARD DISPLAY
// ============================================================

function displayBoard() {
    boardElement.innerHTML = "";

    const statuses = getPlayerTileStatuses();

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {

            const cell = document.createElement("div");
            cell.className = "cell";

            const bonus = getBonusSquare(row, col);

            if (bonus) {
                cell.classList.add(bonus.className);
            }

            const letter = board[row][col];

            if (letter) {
                const tile = document.createElement("div");
                tile.className = "board-tile";

                const playerTile =
                    getPlayerPlacedTile(row, col);

                if (playerTile) {
                    const key = `${row},${col}`;
                    const status = statuses[key];

                    tile.classList.add("player-tile");

                    if (status === "valid") {
                        tile.classList.add("valid");
                    }

                    if (status === "invalid") {
                        tile.classList.add("invalid");
                    }

                    if (status === "isolated") {
                        tile.classList.add("isolated");
                    }

                    tile.addEventListener("click", event => {
                        event.stopPropagation();

                        const tileKey = `${row},${col}`;

                        if (
                            playerPlacedTiles[tileKey]
                        ) {
                            returnPlayerTileToRack(
                                row,
                                col
                            );
                        }
                    });
                } else {
                    tile.classList.add("locked-tile");
                }

                tile.textContent = letter;

                const value = document.createElement("span");
                value.className = "tile-value";
                value.textContent = getLetterValue(letter);

                tile.appendChild(value);
                cell.appendChild(tile);

                if (playerTile && bonus) {
                    const badge = document.createElement("span");
                    badge.className = "bonus-badge";
                    badge.textContent = bonus.label;
                    cell.appendChild(badge);
                }

            } else if (bonus) {
                const bonusLabel =
                    document.createElement("div");

                bonusLabel.className = "bonus-label";
                bonusLabel.textContent = bonus.label;

                cell.appendChild(bonusLabel);
            }

            cell.addEventListener("click", () => {
                handleBoardClick(row, col);
            });

            boardElement.appendChild(cell);
        }
    }
}


// ============================================================
// PLAYER TILE STATUS
// ============================================================

function getNeighbours(row, col) {
    const neighbours = [];

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    directions.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;

        if (isInsideBoard(newRow, newCol)) {
            neighbours.push({
                row: newRow,
                col: newCol
            });
        }
    });

    return neighbours;
}


function isTileIsolated(row, col) {
    const neighbours = getNeighbours(row, col);

    return !neighbours.some(
        position => board[position.row][position.col]
    );
}


function getPlayerTileStatuses() {
    const statuses = {};

    const originalTiles = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (
                board[row][col] &&
                !getPlayerPlacedTile(row, col)
            ) {
                originalTiles.push({
                    row,
                    col
                });
            }
        }
    }

    const connected = new Set();
    const queue = [...originalTiles];

    originalTiles.forEach(position => {
        connected.add(
            `${position.row},${position.col}`
        );
    });

    while (queue.length > 0) {
        const current = queue.shift();

        const neighbours =
            getNeighbours(
                current.row,
                current.col
            );

        neighbours.forEach(neighbour => {
            if (
                board[neighbour.row][neighbour.col]
            ) {
                const key =
                    `${neighbour.row},${neighbour.col}`;

                if (!connected.has(key)) {
                    connected.add(key);

                    queue.push(neighbour);
                }
            }
        });
    }

    Object.keys(playerPlacedTiles).forEach(key => {
        const [row, col] = key
            .split(",")
            .map(Number);

        if (!connected.has(key)) {
            if (isTileIsolated(row, col)) {
                statuses[key] = "isolated";
            } else {
                statuses[key] = "invalid";
            }

            return;
        }

        const words =
            getWordsTouchingTile(
                row,
                col
            );

        if (words.length === 0) {
            statuses[key] = "invalid";
            return;
        }

        const allValid =
            words.every(
                wordData =>
                    dictionarySet.has(
                        wordData.word.toLowerCase()
                    )
            );

        statuses[key] =
            allValid
                ? "valid"
                : "invalid";
    });

    return statuses;
}


// ============================================================
// WORD FINDING
// ============================================================

function readWord(
    testBoard,
    row,
    col,
    direction
) {
    let startRow = row;
    let startCol = col;

    if (direction === "horizontal") {
        while (
            startCol > 0 &&
            testBoard[startRow][startCol - 1]
        ) {
            startCol--;
        }
    } else {
        while (
            startRow > 0 &&
            testBoard[startRow - 1][startCol]
        ) {
            startRow--;
        }
    }

    let word = "";
    let currentRow = startRow;
    let currentCol = startCol;

    while (
        isInsideBoard(
            currentRow,
            currentCol
        ) &&
        testBoard[currentRow][currentCol]
    ) {
        word +=
            testBoard[currentRow][currentCol];

        if (direction === "horizontal") {
            currentCol++;
        } else {
            currentRow++;
        }
    }

    return {
        word,
        row: startRow,
        col: startCol,
        direction
    };
}


function getAllBoardWordsWithPositions(
    testBoard
) {
    const words = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
        let col = 0;

        while (col < BOARD_SIZE) {
            if (testBoard[row][col]) {
                const wordData =
                    readWord(
                        testBoard,
                        row,
                        col,
                        "horizontal"
                    );

                if (
                    wordData.word.length >= 2
                ) {
                    if (
                        !words.some(
                            existing =>
                                existing.word ===
                                    wordData.word &&
                                existing.row ===
                                    wordData.row &&
                                existing.col ===
                                    wordData.col &&
                                existing.direction ===
                                    wordData.direction
                        )
                    ) {
                        words.push(wordData);
                    }
                }

                col =
                    wordData.col +
                    wordData.word.length;
            } else {
                col++;
            }
        }
    }

    for (let col = 0; col < BOARD_SIZE; col++) {
        let row = 0;

        while (row < BOARD_SIZE) {
            if (testBoard[row][col]) {
                const wordData =
                    readWord(
                        testBoard,
                        row,
                        col,
                        "vertical"
                    );

                if (
                    wordData.word.length >= 2
                ) {
                    if (
                        !words.some(
                            existing =>
                                existing.word ===
                                    wordData.word &&
                                existing.row ===
                                    wordData.row &&
                                existing.col ===
                                    wordData.col &&
                                existing.direction ===
                                    wordData.direction
                        )
                    ) {
                        words.push(wordData);
                    }
                }

                row =
                    wordData.row +
                    wordData.word.length;
            } else {
                row++;
            }
        }
    }

    return words;
}


function getAllBoardWords(testBoard) {
    return getAllBoardWordsWithPositions(
        testBoard
    );
}


function getWordsTouchingTile(row, col) {
    const words = [];

    const horizontal =
        readWord(
            board,
            row,
            col,
            "horizontal"
        );

    const vertical =
        readWord(
            board,
            row,
            col,
            "vertical"
        );

    if (horizontal.word.length >= 2) {
        words.push(horizontal);
    }

    if (vertical.word.length >= 2) {
        words.push(vertical);
    }

    return words;
}


// ============================================================
// PLAYER SCORING
// ============================================================

function wordContainsPlayerTile(wordData) {
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
            return true;
        }
    }

    return false;
}


function getPlayerScoringWords() {
    const allWords =
        getAllBoardWordsWithPositions(
            board
        );

    return allWords.filter(
        wordData =>
            wordContainsPlayerTile(
                wordData
            )
    );
}


function calculatePlayerScore() {
    const scoringWords =
        getPlayerScoringWords();

    return scoringWords.reduce(
        (total, wordData) => {
            return (
                total +
                calculateWordScoreAtPosition(
                    wordData.word,
                    wordData.row,
                    wordData.col,
                    wordData.direction
                )
            );
        },
        0
    );
}


// ============================================================
// SCORE DISPLAY
// ============================================================

function ensureScoreElement() {
    let scoreBox =
        document.getElementById(
            "scoreBox"
        );

    if (!scoreBox) {
        scoreBox =
            document.createElement("div");

        scoreBox.id = "scoreBox";
        scoreBox.className =
            "score-box";

        scoreBox.innerHTML = `
            <span class="score-label">Score</span>
            <span id="scoreValue">0</span>
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

    scoreElement.textContent =
        calculatePlayerScore();
}


// ============================================================
// WORD LIST DISPLAY
// ============================================================

function displayWords() {
    const scoringWords =
        getPlayerScoringWords();

    wordCountElement.textContent =
        `${scoringWords.length} scoring word${
            scoringWords.length === 1
                ? ""
                : "s"
        }`;

    wordListElement.innerHTML = "";

    if (scoringWords.length === 0) {
        const emptyMessage =
            document.createElement("div");

        emptyMessage.className =
            "empty-word-list";

        emptyMessage.textContent =
            "No scoring words yet.";

        wordListElement.appendChild(
            emptyMessage
        );
    }

    scoringWords.forEach(wordData => {
        const item =
            document.createElement("div");

        item.className =
            "word-list-item";

        const score =
            calculateWordScoreAtPosition(
                wordData.word,
                wordData.row,
                wordData.col,
                wordData.direction
            );

        item.innerHTML = `
            <span>${wordData.word.toUpperCase()}</span>
            <span class="word-score">${score}</span>
        `;

        wordListElement.appendChild(item);
    });

    updateScore();
}


// ============================================================
// PLAYER TILE RACK
// ============================================================

function displayPlayerTiles() {
    tileRackElement.innerHTML = "";

    playerTiles.forEach(
        (tile, index) => {
            const tileElement =
                document.createElement("button");

            tileElement.className =
                "rack-tile";

            if (
                selectedTileIndex === index
            ) {
                tileElement.classList.add(
                    "selected"
                );
            }

            tileElement.type = "button";

            tileElement.innerHTML = `
                <span class="rack-letter">
                    ${tile.letter}
                </span>
                <span class="rack-value">
                    ${tile.value}
                </span>
            `;

            tileElement.addEventListener(
                "click",
                () => {
                    selectPlayerTile(index);
                }
            );

            tileRackElement.appendChild(
                tileElement
            );
        }
    );
}


function createRandomTile() {
    const availableTiles = [];

    Object.keys(SCRABBLE_TILES).forEach(
        letter => {
            const config =
                SCRABBLE_TILES[letter];

            for (
                let i = 0;
                i < config.count;
                i++
            ) {
                availableTiles.push(letter);
            }
        }
    );

    const letter =
        availableTiles[
            Math.floor(
                Math.random() *
                availableTiles.length
            )
        ];

    return {
        letter:
            letter === "BLANK"
                ? ""
                : letter,
        value:
            letter === "BLANK"
                ? 0
                : SCRABBLE_TILES[
                    letter
                ].value
    };
}


function generatePlayerTiles() {
    playerTiles = [];
    playerPlacedTiles = {};
    selectedTileIndex = null;

    for (
        let i = 0;
        i < PLAYER_TILE_COUNT;
        i++
    ) {
        playerTiles.push(
            createRandomTile()
        );
    }

    displayPlayerTiles();
    displayBoard();
    displayWords();
}


function selectPlayerTile(index) {
    if (
        index < 0 ||
        index >= playerTiles.length
    ) {
        return;
    }

    selectedTileIndex =
        selectedTileIndex === index
            ? null
            : index;

    displayPlayerTiles();
}


function returnPlayerTileToRack(
    row,
    col
) {
    const key = `${row},${col}`;

    const placedTile =
        playerPlacedTiles[key];

    if (!placedTile) {
        return;
    }

    playerTiles.push({
        letter: placedTile.letter,
        value: placedTile.value
    });

    delete playerPlacedTiles[key];

    board[row][col] = null;

    showTileMessage("");

    displayPlayerTiles();
    displayBoard();
    displayWords();
}


// ============================================================
// TILE MESSAGES
// ============================================================

function showTileMessage(message) {
    if (!tileMessageElement) {
        return;
    }

    tileMessageElement.textContent =
        message;
}


// ============================================================
// BOARD CLICKING
// ============================================================

function handleBoardClick(row, col) {
    if (board[row][col]) {
        return;
    }

    if (
        selectedTileIndex === null
    ) {
        showTileMessage(
            "Select a tile first."
        );

        return;
    }

    const tile =
        playerTiles[selectedTileIndex];

    if (!tile) {
        return;
    }

    board[row][col] =
        tile.letter;

    playerPlacedTiles[
        `${row},${col}`
    ] = {
        letter: tile.letter,
        value: tile.value
    };

    playerTiles.splice(
        selectedTileIndex,
        1
    );

    selectedTileIndex = null;

    showTileMessage("");

    displayPlayerTiles();
    displayBoard();
    displayWords();
}


// ============================================================
// BOARD VALIDATION
// ============================================================

function isBoardValid(testBoard) {
    const words =
        getAllBoardWordsWithPositions(
            testBoard
        );

    for (const wordData of words) {
        if (
            wordData.word.length >= 2 &&
            !dictionarySet.has(
                wordData.word.toLowerCase()
            )
        ) {
            return false;
        }
    }

    return true;
}


// ============================================================
// WORD PLACEMENT / GENERATION
// ============================================================

function getExistingLetters(
    word,
    row,
    col,
    direction
) {
    let matchingLetters = 0;

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
            return -1;
        }

        const existing =
            board[
                position.row
            ][
                position.col
            ];

        if (existing) {
            if (
                existing !== word[i]
            ) {
                return -1;
            }

            matchingLetters++;
        }
    }

    return matchingLetters;
}


function isCellInWord(
    row,
    col,
    wordRow,
    wordCol,
    word,
    direction
) {
    for (
        let i = 0;
        i < word.length;
        i++
    ) {
        const position =
            getPosition(
                wordRow,
                wordCol,
                direction,
                i
            );

        if (
            position.row === row &&
            position.col === col
        ) {
            return true;
        }
    }

    return false;
}


function getExistingWordDirection(
    row,
    col
) {
    const horizontal =
        readWord(
            board,
            row,
            col,
            "horizontal"
        );

    const vertical =
        readWord(
            board,
            row,
            col,
            "vertical"
        );

    if (
        horizontal.word.length >= 2
    ) {
        return "horizontal";
    }

    if (
        vertical.word.length >= 2
    ) {
        return "vertical";
    }

    return null;
}


function tryPlaceWord(
    word,
    row,
    col,
    direction
) {
    const existingLetters =
        getExistingLetters(
            word,
            row,
            col,
            direction
        );

    if (existingLetters <= 0) {
        return false;
    }

    const cells = [];

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

        cells.push(position);
    }

    // Check that the word is crossing
    // an existing word rather than simply
    // running alongside it.
    for (const position of cells) {
        const existing =
            board[
                position.row
            ][
                position.col
            ];

        if (existing) {
            const existingDirection =
                getExistingWordDirection(
                    position.row,
                    position.col
                );

            if (
                existingDirection ===
                direction
            ) {
                return false;
            }
        }
    }

    const testBoard =
        board.map(row =>
            [...row]
        );

    cells.forEach(
        (position, index) => {
            if (
                !testBoard[
                    position.row
                ][
                    position.col
                ]
            ) {
                testBoard[
                    position.row
                ][
                    position.col
                ] = word[index];
            }
        }
    );

    if (
        !isBoardValid(testBoard)
    ) {
        return false;
    }

    board = testBoard;

    placedWords.push({
        word,
        row,
        col,
        direction
    });

    return true;
}


function findCrossingWord() {
    if (
        placedWords.length === 0
    ) {
        return null;
    }

    const shuffledWords =
        shuffle([
            ...dictionary
        ]);

    for (const word of shuffledWords) {
        if (
            word.length <
                MIN_WORD_LENGTH ||
            word.length >
                MAX_WORD_LENGTH
        ) {
            continue;
        }

        for (
            let row = 0;
            row < BOARD_SIZE;
            row++
        ) {
            for (
                let col = 0;
                col < BOARD_SIZE;
                col++
            ) {
                for (
                    const direction of [
                        "horizontal",
                        "vertical"
                    ]
                ) {
                    if (
                        tryPlaceWord(
                            word.toUpperCase(),
                            row,
                            col,
                            direction
                        )
                    ) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}


function getStartingWord() {
    const candidates =
        dictionary.filter(word =>
            word.length >=
                STARTING_WORD_MIN_LENGTH &&
            word.length <=
                STARTING_WORD_MAX_LENGTH
        );

    if (
        candidates.length === 0
    ) {
        return null;
    }

    return candidates[
        Math.floor(
            Math.random() *
            candidates.length
        )
    ].toUpperCase();
}


function placeFirstWord(word) {
    const directions = [
        "horizontal",
        "vertical"
    ];

    const shuffledDirections =
        shuffle([
            ...directions
        ]);

    for (
        const direction
        of shuffledDirections
    ) {
        const maxRow =
            direction === "horizontal"
                ? BOARD_SIZE - 1
                : BOARD_SIZE - word.length;

        const maxCol =
            direction === "horizontal"
                ? BOARD_SIZE - word.length
                : BOARD_SIZE - 1;

        if (
            maxRow < 0 ||
            maxCol < 0
        ) {
            continue;
        }

        const row =
            Math.floor(
                Math.random() *
                (maxRow + 1)
            );

        const col =
            Math.floor(
                Math.random() *
                (maxCol + 1)
            );

        let valid = true;

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
                board[
                    position.row
                ][
                    position.col
                ]
            ) {
                valid = false;
                break;
            }
        }

        if (!valid) {
            continue;
        }

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

            board[
                position.row
            ][
                position.col
            ] = word[i];
        }

        placedWords.push({
            word,
            row,
            col,
            direction
        });

        return true;
    }

    return false;
}


// ============================================================
// RANDOM HELPERS
// ============================================================

function shuffle(array) {
    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }

    return array;
}


// ============================================================
// BOARD GENERATION
// ============================================================

function generateBoard() {
    createEmptyBoard();

    placedWords = [];
    playerPlacedTiles = {};
    playerTiles = [];
    selectedTileIndex = null;

    targetWordCount =
        3 +
        Math.floor(
            Math.random() * 3
        );

    const startingWord =
        getStartingWord();

    if (!startingWord) {
        alert(
            "Could not find a suitable starting word in the dictionary."
        );

        return;
    }

    if (
        !placeFirstWord(
            startingWord
        )
    ) {
        alert(
            "Could not place the starting word."
        );

        return;
    }

    let failures = 0;

    while (
        placedWords.length <
            targetWordCount &&
        failures < 10
    ) {
        const before =
            placedWords.length;

        findCrossingWord();

        if (
            placedWords.length ===
            before
        ) {
            failures++;
        } else {
            failures = 0;
        }
    }

    // IMPORTANT:
    // Bonuses are generated only after
    // all puzzle words have been placed.
    generateBonusSquares();

    displayBoard();
    displayWords();
    generatePlayerTiles();
}


function loadDictionary() {
    fetch("dictionary.txt")
        .then(response => {
            if (!response.ok) {
                throw new Error(
                    "Could not load dictionary.txt"
                );
            }

            return response.text();
        })
        .then(text => {
            dictionary =
                text
                    .split(/\r?\n/)
                    .map(word =>
                        word.trim().toLowerCase()
                    )
                    .filter(
                        word =>
                            word.length >= 2
                    );

            dictionary =
                [...new Set(dictionary)];

            dictionarySet =
                new Set(dictionary);

            generateBoard();
        })
        .catch(error => {
            console.error(error);

            alert(
                "Could not load dictionary.txt. Make sure it is in the same folder as index.html."
            );
        });
}


// ============================================================
// BUTTONS
// ============================================================

if (generateButton) {
    generateButton.addEventListener(
        "click",
        generateBoard
    );
}


if (newTilesButton) {
    newTilesButton.addEventListener(
        "click",
        generatePlayerTiles
    );
}


// ============================================================
// START
// ============================================================

loadDictionary();
