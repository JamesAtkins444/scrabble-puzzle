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

/* ==================================================
GLOBAL STATE
================================================== */

let selectedRackTile = null;

let puzzleWords = [];

let score = 0;

let isGenerating = false;

/* ==================================================
DOM ELEMENTS
================================================== */

const boardElement = document.getElementById("board");
const tileRackElement = document.getElementById("tileRack");
const tileMessageElement = document.getElementById("tileMessage");
const wordListElement = document.getElementById("wordList");

const scoreValueElement = document.getElementById("scoreValue");
const scoreBonusElement = document.getElementById("scoreBonus");

const generateButton =
    document.getElementById("generateButton");

const newTilesButton =
    document.getElementById("newTilesButton");

const wordCountElement =
    document.getElementById("wordCount");

/* ==================================================
UTILITY
================================================== */

function randomInt(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

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
    return source.map(row => [...row]);
}

/* ==================================================
DICTIONARY
================================================== */

async function loadDictionary() {
    try {
        const response = await fetch("dictionary.txt");

        if (!response.ok) {
            throw new Error(
                `Dictionary request failed: ${response.status}`
            );
        }

        const text = await response.text();

        dictionary = new Set(
            text
                .split(/\r?\n/)
                .map(word => word.trim().toUpperCase())
                .filter(word => /^[A-Z]+$/.test(word))
        );

        console.log(
            `Loaded ${dictionary.size} dictionary words.`
        );

    } catch (error) {
        console.error(
            "Could not load dictionary:",
            error
        );

        dictionary = new Set();
    }
}

/* ==================================================
BOARD CREATION
================================================== */

function createEmptyBoard() {
    return Array.from(
        { length: boardSize },
        () => Array(boardSize).fill("")
    );
}

/* ==================================================
WORD HELPERS
================================================== */

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

    for (let i = 0; i < word.length; i++) {
        cells.push({
            row: row + deltaRow * i,
            col: col + deltaCol * i,
            letter: word[i]
        });
    }

    return cells;
}

function getRandomWord(minLength, maxLength) {
    const candidates = Array.from(dictionary)
        .filter(
            word =>
                word.length >= minLength &&
                word.length <= maxLength
        );

    if (candidates.length === 0) {
        return null;
    }

    return candidates[
        randomInt(0, candidates.length - 1)
    ];
}

/* ==================================================
PLACEMENT VALIDATION
================================================== */

function canPlaceWord(
    targetBoard,
    word,
    row,
    col,
    direction,
    requireOverlap = false
) {
    const cells = getWordCells(
        word,
        row,
        col,
        direction
    );

    let overlapCount = 0;

    for (const cell of cells) {

        if (
            !isInsideBoard(
                cell.row,
                cell.col
            )
        ) {
            return false;
        }

        const existing =
            targetBoard[cell.row][cell.col];

        if (existing !== "") {

            if (existing !== cell.letter) {
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
    const cells = getWordCells(
        word,
        row,
        col,
        direction
    );

    for (const cell of cells) {
        targetBoard[cell.row][cell.col] =
            cell.letter;
    }
}

/* ==================================================
WORD EXTRACTION
================================================== */

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
            startRow - deltaRow,
            startCol - deltaCol
        ) &&
        targetBoard[
            startRow - deltaRow
        ][
            startCol - deltaCol
        ] !== ""
    ) {
        startRow -= deltaRow;
        startCol -= deltaCol;
    }

    let word = "";

    let currentRow = startRow;
    let currentCol = startCol;

    while (
        isInsideBoard(
            currentRow,
            currentCol
        ) &&
        targetBoard[currentRow][currentCol] !== ""
    ) {
        word +=
            targetBoard[currentRow][currentCol];

        currentRow += deltaRow;
        currentCol += deltaCol;
    }

    return word;
}

function getAllWords(targetBoard) {
    const words = [];

    /* Horizontal */

    for (let row = 0; row < boardSize; row++) {

        let col = 0;

        while (col < boardSize) {

            if (
                targetBoard[row][col] === ""
            ) {
                col++;
                continue;
            }

            const startCol = col;

            let word = "";

            while (
                col < boardSize &&
                targetBoard[row][col] !== ""
            ) {
                word +=
                    targetBoard[row][col];

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

    /* Vertical */

    for (let col = 0; col < boardSize; col++) {

        let row = 0;

        while (row < boardSize) {

            if (
                targetBoard[row][col] === ""
            ) {
                row++;
                continue;
            }

            const startRow = row;

            let word = "";

            while (
                row < boardSize &&
                targetBoard[row][col] !== ""
            ) {
                word +=
                    targetBoard[row][col];

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

/* ==================================================
VALID WORD CHECKING
================================================== */

function allWordsAreValid(
    targetBoard
) {
    const words =
        getAllWords(targetBoard);

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
        cloneBoard(targetBoard);

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

/* ==================================================
GENERATE PUZZLE
================================================== */

function generateBoard() {

    board = createEmptyBoard();

    originalBoard =
        createEmptyBoard();

    puzzleWords = [];

    const startingWord =
        getRandomWord(5, 6);

    if (!startingWord) {
        console.error(
            "Could not find starting word."
        );

        return;
    }

    const directions = [
        "horizontal",
        "vertical"
    ];

    let placed = false;

    for (
        let attempt = 0;
        attempt < 200 && !placed;
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
            randomInt(0, boardSize - 1);

        const col =
            randomInt(0, boardSize - 1);

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
                word: startingWord,
                row,
                col,
                direction
            });

            placed = true;
        }
    }

    if (!placed) {
        generateBoard();
        return;
    }

    /* Add 2–4 additional words */

    const additionalWordCount =
        randomInt(2, 4);

    let attempts = 0;

    while (
        puzzleWords.length <
            additionalWordCount + 1 &&
        attempts < 500
    ) {

        attempts++;

        const word =
            getRandomWord(3, 5);

        if (!word) {
            continue;
        }

        const direction =
            puzzleWords[
                randomInt(
                    0,
                    puzzleWords.length - 1
                )
            ].direction ===
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

        const shuffledCells =
            shuffle(existingCells);

        let wordPlaced = false;

        for (
            const crossingCell of shuffledCells
        ) {

            if (wordPlaced) {
                break;
            }

            const letters =
                [...word];

            for (
                let letterIndex = 0;
                letterIndex < letters.length;
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
                    row: startRow,
                    col: startCol,
                    direction
                });

                wordPlaced = true;

                break;
            }
        }
    }

    /*
     * Make sure we actually generated
     * the requested number of words.
     */

    if (
        puzzleWords.length <
        additionalWordCount + 1
    ) {
        generateBoard();
        return;
    }

    originalBoard =
        cloneBoard(board);

    bonusSquares = {};

    generateBonusSquares();

    displayBoard();

    generatePlayerTiles();

    calculatePlayerScore();
}

/* ==================================================
BONUS SQUARES
================================================== */

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
        bonusTypes.filter(type => {

            const count =
                Object.values(
                    bonusSquares
                ).filter(
                    value =>
                        value === type
                ).length;

            return (
                count <
                bonusMaximums[type]
            );
        });

    if (
        availableTypes.length === 0
    ) {
        return null;
    }

    let totalWeight = 0;

    for (
        const type of availableTypes
    ) {
        totalWeight +=
            bonusWeights[type];
    }

    let random =
        Math.random() * totalWeight;

    for (
        const type of availableTypes
    ) {

        random -=
            bonusWeights[type];

        if (random <= 0) {
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
        randomInt(4, 6);

    const selected = [];

    /*
     * Prefer spacing bonuses at least
     * Manhattan distance 2 apart.
     */

    const shuffled =
        shuffle(emptyCells);

    for (
        const cell of shuffled
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
            selected.push(cell);
        }
    }

    /*
     * Fallback if there weren't enough
     * appropriately spaced cells.
     */

    if (
        selected.length <
        desiredCount
    ) {

        for (
            const cell of shuffled
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
                selected.push(cell);
            }
        }
    }

    for (
        const cell of selected
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
        ] = type;
    }
}

function getBonusSquare(
    row,
    col
) {
    return (
        bonusSquares[
            keyForCell(row, col)
        ] || null
    );
}

/* ==================================================
BOARD DISPLAY
================================================== */

function displayBoard() {

    if (!boardElement) {
        return;
    }

    boardElement.innerHTML = "";

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
                document.createElement("div");

            cell.className =
                "cell";

            cell.dataset.row = row;
            cell.dataset.col = col;

            const key =
                keyForCell(
                    row,
                    col
                );

            /*
             * BONUS SQUARE
             */

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

            /*
             * LETTER TILE
             */

            const letter =
                board[row][col];

            if (letter !== "") {

                const boardTile =
                    document.createElement(
                        "div"
                    );

                boardTile.className =
                    "board-tile";

                /*
                 * ORIGINAL PUZZLE TILE
                 */

                if (
                    originalBoard[row][col] !== ""
                ) {

                    boardTile.classList.add(
                        "original-tile"
                    );

                /*
                 * PLAYER TILE
                 */

                } else if (
                    playerPlacedTiles[key]
                ) {

                    const status =
                        tileStatuses[key];

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

                /*
                 * LETTER
                 */

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

                /*
                 * LETTER VALUE
                 */

                const valueElement =
                    document.createElement(
                        "span"
                    );

                valueElement.className =
                    "tile-value";

                valueElement.textContent =
                    letterValues[letter] ??
                    0;

                boardTile.appendChild(
                    valueElement
                );

                cell.appendChild(
                    boardTile
                );
            }

            /*
             * CLICKING THE BOARD
             */

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

/* ==================================================
PLAYER TILE GENERATION
================================================== */

function createTileBag() {

    const bag = [];

    for (
        const letter in letterDistribution
    ) {

        for (
            let i = 0;
            i < letterDistribution[letter];
            i++
        ) {
            bag.push(letter);
        }
    }

    return bag;
}

function drawRandomTiles(count) {

    const bag =
        shuffle(createTileBag());

    const vowels =
        new Set([
            "A",
            "E",
            "I",
            "O",
            "U"
        ]);

    const vowelTiles =
        bag.filter(
            letter =>
                vowels.has(letter)
        );

    const otherTiles =
        bag.filter(
            letter =>
                !vowels.has(letter)
        );

    /*
     * Guarantee at least two vowels.
     */

    const guaranteedVowels =
        shuffle(vowelTiles).slice(
            0,
            Math.min(2, count)
        );

    /*
     * Remove the guaranteed vowels
     * from the remaining pool.
     */

    const remainingVowels =
        [...vowelTiles];

    for (
        const vowel of guaranteedVowels
    ) {

        const index =
            remainingVowels.indexOf(
                vowel
            );

        if (index !== -1) {
            remainingVowels.splice(
                index,
                1
            );
        }
    }

    const remainingPool =
        shuffle([
            ...remainingVowels,
            ...otherTiles
        ]);

    const remainingCount =
        count -
        guaranteedVowels.length;

    const additionalTiles =
        remainingPool.slice(
            0,
            remainingCount
        );

    return shuffle([
        ...guaranteedVowels,
        ...additionalTiles
    ]);
}

/* ==================================================
TILE RACK DISPLAY
================================================== */

function displayTileRack() {

    if (!tileRackElement) {
        return;
    }

    tileRackElement.innerHTML = "";

    playerTiles.forEach(
        (letter, index) => {

            const tile =
                document.createElement("div");

            tile.className =
                "rack-tile";

            if (
                selectedRackTile === index
            ) {

                tile.classList.add(
                    "selected"
                );
            }

            const letterElement =
                document.createElement("span");

            letterElement.className =
                "tile-letter";

         letterElement.textContent =
    letter;

            tile.appendChild(
                letterElement
            );

            const valueElement =
                document.createElement("span");

            valueElement.className =
                "tile-value";

            valueElement.textContent =
                letterValues[letter] ?? 0;

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

/* ==================================================
BOARD CLICKING
================================================== */

function handleBoardClick(
    row,
    col
) {

    const key =
        keyForCell(row, col);

    /*
     * Clicking an existing player tile
     * returns it to the rack.
     */

    if (
        playerPlacedTiles[key]
    ) {

        const tile =
            playerPlacedTiles[key];

        playerTiles.push(
            tile.letter
        );

        delete playerPlacedTiles[key];

        board[row][col] = "";

        displayTileRack();
        displayBoard();

        calculatePlayerScore();

        return;
    }

    /*
     * Original puzzle tiles cannot
     * be changed.
     */

    if (
        originalBoard[row][col] !== ""
    ) {
        return;
    }

    /*
     * Empty board cell.
     */

    if (
        selectedRackTile === null
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

board[row][col] = tile;

    playerPlacedTiles[key] = {
        letter: tile,
        row,
        col
    };

    playerTiles.splice(
        selectedRackTile,
        1
    );

    selectedRackTile = null;

    displayTileRack();
    displayBoard();

    calculatePlayerScore();
}

/* ==================================================
PLAYER TILE STATUS
================================================== */

function getPlayerTileStatuses() {

    const statuses = {};

    const playerKeys =
        Object.keys(
            playerPlacedTiles
        );

    /*
     * First determine which player
     * tiles are connected to the
     * original puzzle.
     */

    const connected = new Set();

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
                originalBoard[row][col] !== ""
            ) {

                const key =
                    keyForCell(row, col);

                connected.add(key);

                queue.push({
                    row,
                    col
                });
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
            const neighbor of neighbors
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

    /*
     * Find words created by the current
     * board.
     */

    const words =
        getAllWords(board);

    /*
     * Every player tile starts as
     * invalid.
     */

    for (
        const key of playerKeys
    ) {
        statuses[key] =
            "invalid";
    }

    /*
     * Connected isolated tiles are
     * invalid unless they participate
     * in a valid word.
     */

    for (
        const key of playerKeys
    ) {

        if (
            !connected.has(key)
        ) {

            let touchesAnotherPlayer =
                false;

            const tile =
                playerPlacedTiles[key];

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
                const neighbor of neighbors
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

    /*
     * A connected player tile is valid
     * only if all words it participates
     * in are valid dictionary words.
     */

    for (
        const key of playerKeys
    ) {

        if (
            !connected.has(key)
        ) {
            continue;
        }

        const tile =
            playerPlacedTiles[key];

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

        /*
         * A player tile must participate
         * in at least one valid 2+ letter
         * word.
         */

        if (
            horizontalValid ||
            verticalValid
        ) {

            /*
             * Also make sure any word
             * created around this tile
             * is valid.
             */

            let valid = true;

            for (
                const wordInfo of words
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

/* ==================================================
SCORING
================================================== */

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
        const cell of cells
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
            newlyPlacedKeys.has(key);

        let letterMultiplier = 1;

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
                letterMultiplier = 2;
            }

            if (
                bonus ===
                "triple-letter"
            ) {
                letterMultiplier = 3;
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
        getAllWords(board);

    for (
        const wordInfo of words
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

        /*
         * A word only scores if it contains
         * at least one player tile.
         */

        if (
            playerCells.length === 0
        ) {
            continue;
        }

        /*
         * Every player tile belonging
         * to this word must be valid.
         */

        const allPlayerTilesValid =
            playerCells.every(
                cell =>
                    statuses[
                        keyForCell(
                            cell.row,
                            cell.col
                        )
                    ] === "valid"
            );

        if (
            !allPlayerTilesValid
        ) {
            continue;
        }

        /*
         * Score only newly placed
         * tiles for premium squares.
         */

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
            word: wordInfo.word,
            score: wordScore,
            row: wordInfo.row,
            col: wordInfo.col,
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
            (total, item) =>
                total + item.score,
            0
        );

    let bonus = 0;
    let bonusText = "";

    /*
     * 7-tile bonus.
     */

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

            score += bonus;
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

function updateScoreDisplay(
    currentScore,
    bonusText = ""
) {

    if (scoreValueElement) {
        scoreValueElement.textContent =
            currentScore;
    }

    if (scoreBonusElement) {
        scoreBonusElement.textContent =
            bonusText;
    }
}

function displayScoringWords(
    scoringWords
) {

    if (!wordListElement) {
        return;
    }

    wordListElement.innerHTML = "";

    for (
        const item of scoringWords
    ) {

        const pill =
            document.createElement("div");

        pill.className =
            "word-pill";

        const word =
            document.createElement("span");

        word.className =
            "word-pill-word";

        word.textContent =
            item.word;

        const wordScore =
            document.createElement("span");

        wordScore.className =
            "word-pill-score";

        wordScore.textContent =
            `+${item.score}`;

        pill.appendChild(word);
        pill.appendChild(wordScore);

        wordListElement.appendChild(
            pill
        );
    }
}

/* ==================================================
NEW PUZZLE BUTTON
================================================== */

if (generateButton) {

    generateButton.addEventListener(
        "click",
        () => {

            if (isGenerating) {
                return;
            }

            isGenerating = true;

            generateButton.disabled =
                true;

            generateBoard();

            setTimeout(() => {

                isGenerating = false;

                generateButton.disabled =
                    false;

            }, 100);
        }
    );
}

/* ==================================================
NEW TILES BUTTON
================================================== */

if (newTilesButton) {

    newTilesButton.addEventListener(
        "click",
        () => {

            playerPlacedTiles = {};

            playerTiles =
                drawRandomTiles(7);

            selectedRackTile = null;

            displayTileRack();
            displayBoard();

            calculatePlayerScore();
        }
    );
}

/* ==================================================
WORD COUNT
================================================== */

function updateWordCount() {

    if (!wordCountElement) {
        return;
    }

    wordCountElement.textContent =
        `${puzzleWords.length} words`;
}

/* ==================================================
INITIALISE
================================================== */

async function initialise() {

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

    updateWordCount();
}

initialise();
