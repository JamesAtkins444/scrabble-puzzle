let boardSize = 7;

let dictionary = new Set();
let solverDictionary = new Set();

let board = [];
let originalBoard = [];

let playerPlacedTiles = {};
let playerTiles = [];
// Original rack slot for each tile currently available to the player.
let playerRackPositions = [];
let initialRackTiles = [];
let bestSolution = null;
let answerRevealed = false;

let bonusSquares = {};

// Pointer-drag state for placing rack tiles directly onto the board.
let rackTileDrag = null;
let suppressNextRackTileClick = false;

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
let selectedBoardCell = null;

let puzzleWords = [];

let score = 0;

// Stores the total value of the original rack.
// This remains unchanged when tiles are placed on the board.
let startingRackValueTotal = 0;

// Tracks achievement changes so the share popup can react to first-time milestones.
let previousAchievementStars = 0;
let previousAchievementCrown = false;

// Controls which message is shown in the share popup.
let shareResultsMode = "normal";

let isGenerating = false;


/* ==================================================
PUZZLE GENERATOR SETTINGS
================================================== */

let generatorSettings = {
    gridSize: 7,
    wordCount: 4,
    initialWordLength: 6
};


/* ==================================================
DOM ELEMENTS
================================================== */

const boardElement =
    document.getElementById("board");

const tileRackElement =
    document.getElementById("tileRack");

const revealPuzzleButton =
    document.getElementById("revealPuzzleButton");

const nextPuzzleButton =
    document.getElementById("nextPuzzleButton");

const shuffleRackButton =
    document.getElementById("shuffleRackButton");

const clearBoardButton =
    document.getElementById("clearBoardButton");

const rulesHelpButton =
    document.getElementById("rulesHelpButton");

const rulesDialog =
    document.getElementById("rulesDialog");

const closeRulesButton =
    document.getElementById("closeRulesButton");

const shareResultsButton =
    document.getElementById("shareResultsButton");

const shareResultsDialog =
    document.getElementById("shareResultsDialog");

const closeShareResultsButton =
    document.getElementById("closeShareResultsButton");

const shareResultsSummary =
    document.getElementById("shareResultsSummary");

const copyShareResultsButton =
    document.getElementById("copyShareResultsButton");

const shareResultsStatus =
    document.getElementById("shareResultsStatus");

const bestScoreBoxElement =
    document.getElementById("bestScoreBox");

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

const bestScoreWordElement =
    document.getElementById("bestScoreWord");

const bestScoreValueElement =
    document.getElementById("bestScoreValue");

const revealAnswerButton =
    document.getElementById("revealAnswerButton");

const bestScoreMessageElement =
    document.getElementById("bestScoreMessage");


/* ==================================================
GENERATOR PANEL ELEMENTS
================================================== */

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
UTILITY
================================================== */

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


/* ==================================================
GENERATOR SETTINGS
================================================== */

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


    /* --------------------------------
       DEFAULTS
    -------------------------------- */

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


    /* --------------------------------
       LIMIT VALUES
    -------------------------------- */

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


    /* --------------------------------
       UPDATE INPUTS
    -------------------------------- */

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


/* ==================================================
DICTIONARY
================================================== */

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


/* ==================================================
SOLVER DICTIONARY
================================================== */

async function loadSolverDictionary() {
    try {
        const response = await fetch("solver dictionary.txt");

        if (!response.ok) {
            throw new Error(
                `Solver dictionary request failed: ${response.status}`
            );
        }

        const text = await response.text();

        solverDictionary = new Set(
            text
                .split(/\r?\n/)
                .map(word => word.trim().toUpperCase())
                .filter(word => /^[A-Z]+$/.test(word))
        );

        console.log(
            `Loaded ${solverDictionary.size} solver dictionary words.`
        );
    } catch (error) {
        console.error("Could not load solver dictionary:", error);
        solverDictionary = new Set();
    }
}


/* ==================================================
BOARD CREATION
================================================== */



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
                        maxLength &&
                    !word.endsWith("S")
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


    /* --------------------------------
       HORIZONTAL
    -------------------------------- */

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


    /* --------------------------------
       VERTICAL
    -------------------------------- */

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


/* ==================================================
VALID WORD CHECKING
================================================== */

function allWordsAreValid(
    targetBoard,
    wordSet = dictionary
) {

    const words =
        getAllWords(
            targetBoard
        );

    return words.every(
        item =>
            wordSet.has(
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


/* ==================================================
GENERATE PUZZLE
================================================== */

function generateBoard() {

    /* --------------------------------
       GET CURRENT GENERATOR SETTINGS
    -------------------------------- */

    const settings =
        getGeneratorSettings();

    boardSize =
        settings.gridSize;


    /* --------------------------------
       RESET PLAYER STATE
    -------------------------------- */

    playerPlacedTiles = {};

    playerTiles =
        drawRandomTiles(6);
    playerRackPositions = playerTiles.map((_, index) => index);

    initialRackTiles = [...playerTiles];
    bestSolution = null;
    answerRevealed = false;

    if (revealAnswerButton) {
        revealAnswerButton.textContent = "Reveal Answer";
        revealAnswerButton.disabled = true;
    }
    if (bestScoreWordElement) bestScoreWordElement.textContent = "Finding best move…";
    if (bestScoreValueElement) bestScoreValueElement.textContent = "—";
    if (bestScoreMessageElement) bestScoreMessageElement.textContent = "";

    startingRackValueTotal =
        playerTiles.reduce(
            (total, letter) =>
                total +
                (letterValues[letter] ?? 0),
            0
        );

    selectedRackTile = null;

    score = 0;


    /* --------------------------------
       RESET BOARD
    -------------------------------- */

    board =
        createEmptyBoard();

    originalBoard =
        createEmptyBoard();

    puzzleWords = [];


    /* --------------------------------
       STARTING WORD
    -------------------------------- */

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


    /* --------------------------------
       STARTING WORD PLACEMENT
    -------------------------------- */

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


    /* --------------------------------
       ADD ADDITIONAL WORDS
    -------------------------------- */

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


        /*
         * Choose the opposite direction
         * from a random existing word.
         */

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


        /*
         * Find every occupied cell.
         */

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
            shuffle(
                existingCells
            );

        let wordPlaced = false;


        /* --------------------------------
           TRY CROSSING CELLS
        -------------------------------- */

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


    /* --------------------------------
       MAKE SURE REQUESTED WORD COUNT
       WAS ACTUALLY GENERATED
    -------------------------------- */

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


    /* --------------------------------
       SAVE ORIGINAL PUZZLE
    -------------------------------- */

    originalBoard =
        cloneBoard(
            board
        );


    /* --------------------------------
       BONUS SQUARES
    -------------------------------- */

    bonusSquares = {};

    generateBonusSquares();


    /* --------------------------------
       DISPLAY
    -------------------------------- */

    displayBoard();

    displayTileRack();

    calculatePlayerScore();

    updateWordCount();
    findBestSolution();
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

    "double-letter": 2,

    "triple-letter": 2,

    "double-word": 1,

    "triple-word": 1
};


function getWeightedBonusType(allowedTypes = bonusTypes) {

    const availableTypes =
        allowedTypes.filter(
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
    const occupiedCells = [];
    const placedBonusCells = [];

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
            if (board[row][col] === "") {
                emptyCells.push({ row, col });
            } else {
                occupiedCells.push({ row, col });
            }
        }
    }

    const shuffledCells = shuffle(emptyCells);

    /*
     * Bonus squares must stay clear of pre-filled words:
     * - Triple word: 2-square buffer.
     * - All other bonuses: 1-square buffer.
     *
     * All bonus squares also need a 1-square buffer
     * from every other bonus square, including diagonals.
     */

    function isOutsideWordBuffer(cell, bufferSize) {
        return !occupiedCells.some(
            occupied =>
                Math.max(
                    Math.abs(occupied.row - cell.row),
                    Math.abs(occupied.col - cell.col)
                ) <= bufferSize
        );
    }

    function isOutsideBonusBuffer(cell) {
        return !placedBonusCells.some(
            bonus =>
                Math.max(
                    Math.abs(bonus.row - cell.row),
                    Math.abs(bonus.col - cell.col)
                ) <= 1
        );
    }

    function placeBonus(type, wordBuffer) {
        const candidates = shuffledCells.filter(
            cell =>
                !bonusSquares[keyForCell(cell.row, cell.col)] &&
                isOutsideWordBuffer(cell, wordBuffer) &&
                isOutsideBonusBuffer(cell)
        );

        if (candidates.length === 0) {
            return false;
        }

        const cell = candidates[
            randomInt(0, candidates.length - 1)
        ];

        bonusSquares[keyForCell(cell.row, cell.col)] = type;
        placedBonusCells.push(cell);
        return true;
    }

    // Place the required word bonuses first.
    placeBonus("triple-word", 2);
    placeBonus("double-word", 1);

    // Then add up to two of each letter bonus.
    const letterBonusTypes = shuffle([
        "triple-letter",
        "triple-letter",
        "double-letter",
        "double-letter"
    ]);

    for (const type of letterBonusTypes) {
        placeBonus(type, 1);
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


/* ==================================================
BOARD DISPLAY
================================================== */

function displayBoard() {

    if (!boardElement) {

        return;
    }


    boardElement.innerHTML =
        "";


    /*
     * Dynamically resize the grid.
     */

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

            if (
                selectedBoardCell &&
                selectedBoardCell.row === row &&
                selectedBoardCell.col === col
            ) {
                cell.classList.add("selected-target");
            }


            cell.dataset.row =
                row;

            cell.dataset.col =
                col;


            const key =
                keyForCell(
                    row,
                    col
                );


            /* --------------------------------
               BONUS SQUARE
            -------------------------------- */

            const bonus =
                getBonusSquare(
                    row,
                    col
                );


            if (bonus) {

                cell.classList.add(
                    bonus
                );

                // Keep the premium label visible on empty squares and existing puzzle tiles,
                // but hide it when a player-placed tile occupies the premium square.
                const isPlayerTileOnPremiumSquare =
                    playerPlacedTiles[key];

                if (!isPlayerTileOnPremiumSquare) {
                    const bonusBadge =
                        document.createElement(
                            "span"
                        );

                    bonusBadge.className =
                        "bonus-badge";

                    if (bonus === "double-letter") {
                        bonusBadge.textContent = "2L";
                    }

                    if (bonus === "triple-letter") {
                        bonusBadge.textContent = "3L";
                    }

                    if (bonus === "double-word") {
                        bonusBadge.textContent = "2W";
                    }

                    if (bonus === "triple-word") {
                        bonusBadge.textContent = "3W";
                    }

                    cell.appendChild(
                        bonusBadge
                    );
                }
            }


            /* --------------------------------
               LETTER TILE
            -------------------------------- */

            const letter =
                board[row][col];

            if (letter !== "") {
                cell.classList.add("has-letter");
                cell.classList.remove("bonus-empty");
            } else if (bonus) {
                cell.classList.add("bonus-empty");
                cell.classList.remove("has-letter");
            }


            if (
                letter !== ""
            ) {

                const boardTile =
                    document.createElement(
                        "div"
                    );


                boardTile.className =
                    "board-tile";


                /* --------------------------------
                   ORIGINAL PUZZLE TILE
                -------------------------------- */

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


                /*
                 * PLAYER TILE
                 */

                } else if (
                    playerPlacedTiles[
                        key
                    ]
                ) {

                    const premiumType = getBonusSquare(row, col);
                    if (premiumType) {
                        boardTile.classList.add("player-on-" + premiumType);
                    }

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

                        // The first player tile placed on each generated word is orange.
                        // Later player tiles keep the existing colour-by-position palette.
                        const horizontalWord = getWordAt(board, row, col, "horizontal");
                        const verticalWord = getWordAt(board, row, col, "vertical");
                        let wordDirection = null;
                        let wordStartRow = row;
                        let wordStartCol = col;
                        let colourIndex = 1;

                        if (horizontalWord.length >= 2 && dictionary.has(horizontalWord)) {
                            wordDirection = "horizontal";
                            while (wordStartCol > 0 && board[row][wordStartCol - 1] !== "") wordStartCol--;
                        } else if (verticalWord.length >= 2 && dictionary.has(verticalWord)) {
                            wordDirection = "vertical";
                            while (wordStartRow > 0 && board[wordStartRow - 1][col] !== "") wordStartRow--;
                        }

                        if (wordDirection) {
                            const playerKeysInWord = [];
                            const playerPlacementOrder = Object.keys(playerPlacedTiles);

                            if (wordDirection === "horizontal") {
                                for (let scanCol = wordStartCol; scanCol < boardSize && board[row][scanCol] !== ""; scanCol++) {
                                    const scanKey = keyForCell(row, scanCol);
                                    if (playerPlacedTiles[scanKey]) playerKeysInWord.push(scanKey);
                                }
                                colourIndex = Math.min(col - wordStartCol + 1, 7);
                            } else {
                                for (let scanRow = wordStartRow; scanRow < boardSize && board[scanRow][col] !== ""; scanRow++) {
                                    const scanKey = keyForCell(scanRow, col);
                                    if (playerPlacedTiles[scanKey]) playerKeysInWord.push(scanKey);
                                }
                                colourIndex = Math.min(row - wordStartRow + 1, 7);
                            }

                            const firstPlacedPlayerKey = playerPlacementOrder.find(key => playerKeysInWord.includes(key));
                            if (firstPlacedPlayerKey === key) {
                                colourIndex = 1;
                            }
                        }

                        boardTile.classList.add("player-valid-colour-" + colourIndex);

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


                /* --------------------------------
                   LETTER
                -------------------------------- */

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


                /* --------------------------------
                   LETTER VALUE
                -------------------------------- */

                const valueElement =
                    document.createElement(
                        "span"
                    );


                valueElement.className =
                    "tile-value";


                let displayedTileValue =
                    letterValues[letter] ?? 0;

                // Show letter-square multipliers in the score text on player-placed tiles.
                // Word-square labels and displayed tile values remain unchanged.
                if (playerPlacedTiles[key]) {
                    const premiumMultiplier = {
                        "double-letter": 2,
                        "triple-letter": 3
                    }[getBonusSquare(row, col)] || 1;

                    displayedTileValue *= premiumMultiplier;
                }

                valueElement.textContent =
                    displayedTileValue;


                boardTile.appendChild(
                    valueElement
                );


                cell.appendChild(
                    boardTile
                );
            }


            /* --------------------------------
               CLICKING THE BOARD
            -------------------------------- */

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


function drawRandomTiles(count = 6) {

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

    // Always 3 vowels
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

    // Always 3 consonants
    for (let i = 0; i < 3; i++) {
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

    // Shuffle the 6 tiles so the vowels aren't always at the front
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


/* ==================================================
TILE RACK DISPLAY
================================================== */

function displayTileRack() {

    if (!tileRackElement) {

        return;
    }


    tileRackElement.innerHTML = "";

    // Keep seven fixed rack slots, matching the seven columns of the game board.
    const rackSlots = [];
    for (let slotIndex = 0; slotIndex < 7; slotIndex += 1) {
        const slot = document.createElement("div");
        slot.className = "rack-slot";
        slot.dataset.slotIndex = slotIndex;
        rackSlots.push(slot);
        tileRackElement.appendChild(slot);
    }

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
                "board-tile rack-tile";
            tile.dataset.rackIndex = index;


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


            tile.addEventListener("pointerdown", event => {
                // Only start a drag with the primary mouse button or a touch/pen pointer.
                if (event.pointerType === "mouse" && event.button !== 0) return;
                rackTileDrag = {
                    index,
                    startX: event.clientX,
                    startY: event.clientY,
                    pointerId: event.pointerId,
                    moved: false,
                    target: null,
                    rackTarget: null
                };
                suppressNextRackTileClick = false;

                const onMove = moveEvent => {
                    if (!rackTileDrag || moveEvent.pointerId !== rackTileDrag.pointerId) return;

                    const dx = moveEvent.clientX - rackTileDrag.startX;
                    const dy = moveEvent.clientY - rackTileDrag.startY;
                    if (!rackTileDrag.moved && Math.hypot(dx, dy) < 8) return;

                    rackTileDrag.moved = true;
                    moveEvent.preventDefault();

                    // Create a floating copy once the pointer has moved far enough to count as a drag.
                    if (!rackTileDrag.visual) {
                        const visual = tile.cloneNode(true);
                        visual.classList.remove("selected");
                        visual.classList.add("rack-tile-drag-visual");
                        visual.setAttribute("aria-hidden", "true");
                        document.body.appendChild(visual);
                        // Hide the rack tile while its larger floating copy is being dragged.
                        tile.classList.add("rack-tile-drag-source");
                        rackTileDrag.visual = visual;
                    }

                    const visual = rackTileDrag.visual;
                    visual.style.left = `${moveEvent.clientX - visual.offsetWidth / 2}px`;
                    visual.style.top = `${moveEvent.clientY - visual.offsetHeight / 2}px`;

                    const element = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
                    const cell = element && element.closest ? element.closest(".cell") : null;
                    const rackTile = element && element.closest ? element.closest(".rack-tile") : null;

                    if (rackTileDrag.target && rackTileDrag.target !== cell) {
                        rackTileDrag.target.classList.remove("drag-over");
                    }
                    if (rackTileDrag.rackTarget && rackTileDrag.rackTarget.tile !== rackTile) {
                        rackTileDrag.rackTarget.tile.classList.remove("rack-reorder-target");
                    }

                    const cellRow = cell ? Number(cell.dataset.row) : -1;
                    const cellCol = cell ? Number(cell.dataset.col) : -1;
                    const cellKey = cell ? keyForCell(cellRow, cellCol) : null;
                    const isEmptyCell = cell &&
                        cell.dataset.row !== undefined &&
                        cell.dataset.col !== undefined &&
                        originalBoard[cellRow] &&
                        originalBoard[cellRow][cellCol] === "" &&
                        board[cellRow][cellCol] === "" &&
                        !playerPlacedTiles[cellKey];
                    const isPlayerTileCell = cell &&
                        cell.dataset.row !== undefined &&
                        cell.dataset.col !== undefined &&
                        !!playerPlacedTiles[cellKey];

                    // Rack tiles can be dropped on empty cells or on another player tile to swap them.
                    rackTileDrag.target = (isEmptyCell || isPlayerTileCell) ? cell : null;
                    if (rackTileDrag.target) rackTileDrag.target.classList.add("drag-over");

                    // When released over another rack tile, remember which side it is on.
                    rackTileDrag.rackTarget = null;
                    if (!rackTileDrag.target && rackTile && rackTile !== tile) {
                        const rect = rackTile.getBoundingClientRect();
                        rackTileDrag.rackTarget = {
                            tile: rackTile,
                            index: Number(rackTile.dataset.rackIndex),
                            before: moveEvent.clientX < rect.left + rect.width / 2
                        };
                        rackTile.classList.add("rack-reorder-target");
                    }
                };

                const onUp = upEvent => {
                    if (!rackTileDrag || upEvent.pointerId !== rackTileDrag.pointerId) return;

                    const drag = rackTileDrag;
                    if (drag.target) drag.target.classList.remove("drag-over");
                    if (drag.rackTarget) drag.rackTarget.tile.classList.remove("rack-reorder-target");
                    if (drag.visual) drag.visual.remove();
                    tile.classList.remove("rack-tile-drag-source");

                    document.removeEventListener("pointermove", onMove);
                    document.removeEventListener("pointerup", onUp);
                    document.removeEventListener("pointercancel", onCancel);

                    rackTileDrag = null;

                    if (drag.moved) {
                        suppressNextRackTileClick = true;
                        if (drag.target) {
                            const row = Number(drag.target.dataset.row);
                            const col = Number(drag.target.dataset.col);
                            const key = keyForCell(row, col);

                            if (playerPlacedTiles[key]) {
                                swapRackTileWithBoardTile(drag.index, row, col);
                            } else {
                                selectedBoardCell = null;
                                selectedRackTile = drag.index;
                                handleBoardClick(row, col);
                            }
                        } else if (drag.rackTarget) {
                            // Move the dragged letter to the chosen position in the rack.
                            const fromIndex = drag.index;
                            let toIndex = drag.rackTarget.index;
                            if (!drag.rackTarget.before) toIndex += 1;
                            if (fromIndex < toIndex) toIndex -= 1;
                            toIndex = Math.max(0, Math.min(playerTiles.length - 1, toIndex));
                            if (fromIndex !== toIndex) {
                                // Remember the current slot positions so the tiles can slide
                                // smoothly into their new places after the rack is re-rendered.
                                const oldTileRects = Array.from(
                                    tileRackElement.querySelectorAll(".rack-tile")
                                ).map(rackTile => rackTile.getBoundingClientRect());

                                const [letter] = playerTiles.splice(fromIndex, 1);
                                playerTiles.splice(toIndex, 0, letter);
                                selectedRackTile = null;
                                displayTileRack();

                                const newRackTiles = Array.from(
                                    tileRackElement.querySelectorAll(".rack-tile")
                                );

                                newRackTiles.forEach((rackTile, newIndex) => {
                                    let oldIndex = newIndex;

                                    if (newIndex === toIndex) {
                                        oldIndex = fromIndex;
                                    } else if (fromIndex < toIndex &&
                                               newIndex >= fromIndex &&
                                               newIndex < toIndex) {
                                        oldIndex = newIndex + 1;
                                    } else if (fromIndex > toIndex &&
                                               newIndex > toIndex &&
                                               newIndex <= fromIndex) {
                                        oldIndex = newIndex - 1;
                                    }

                                    const oldRect = oldTileRects[oldIndex];
                                    const newRect = rackTile.getBoundingClientRect();
                                    if (!oldRect) return;

                                    const offsetX = oldRect.left - newRect.left;
                                    const offsetY = oldRect.top - newRect.top;

                                    rackTile.style.transition = "none";
                                    rackTile.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                                });

                                // Allow the starting positions to render before sliding to the
                                // tiles' new positions.
                                requestAnimationFrame(() => {
                                    newRackTiles.forEach(rackTile => {
                                        rackTile.style.transition = "transform 220ms ease-out";
                                        rackTile.style.transform = "";
                                    });
                                });
                            }
                        }
                        // Prevent the synthetic click after a drag from selecting the rack tile.
                        setTimeout(() => { suppressNextRackTileClick = false; }, 0);
                    }
                };

                const onCancel = cancelEvent => {
                    if (!rackTileDrag || cancelEvent.pointerId !== rackTileDrag.pointerId) return;
                    if (rackTileDrag.target) rackTileDrag.target.classList.remove("drag-over");
                    if (rackTileDrag.rackTarget) rackTileDrag.rackTarget.tile.classList.remove("rack-reorder-target");
                    if (rackTileDrag.visual) rackTileDrag.visual.remove();
                    tile.classList.remove("rack-tile-drag-source");
                    rackTileDrag = null;
                    document.removeEventListener("pointermove", onMove);
                    document.removeEventListener("pointerup", onUp);
                    document.removeEventListener("pointercancel", onCancel);
                };

                document.addEventListener("pointermove", onMove, { passive: false });
                document.addEventListener("pointerup", onUp);
                document.addEventListener("pointercancel", onCancel);
            });

            tile.addEventListener(
                "click",
                () => {
                    if (suppressNextRackTileClick) return;
                    // If the player selected a board cell first, place this tile there.
                    if (selectedBoardCell) {
                        selectedRackTile = index;

                        const target = { ...selectedBoardCell };
                        handleBoardClick(target.row, target.col);
                        return;
                    }

                    selectedRackTile =
                        selectedRackTile === index
                            ? null
                            : index;

                    displayTileRack();
                }
            );


            const slotIndex = playerRackPositions[index] ?? index;
            if (rackSlots[slotIndex]) {
                rackSlots[slotIndex].appendChild(tile);
            }
        }
    );
}


/* ==================================================
SWAP A RACK TILE WITH A PLAYER TILE ON THE BOARD
================================================== */

function swapRackTileWithBoardTile(rackIndex, row, col) {
    if (answerRevealed) return;

    const key = keyForCell(row, col);
    const boardTile = playerPlacedTiles[key];
    const incomingLetter = playerTiles[rackIndex];

    if (!boardTile || incomingLetter === undefined) return;

    const incomingRackSlot = playerRackPositions[rackIndex] ?? rackIndex;
    const displacedLetter = boardTile.letter;
    const displacedRackSlot = boardTile.rackSlot ?? 6;

    // Put the dragged rack tile in the board position.
    boardTile.letter = incomingLetter;
    boardTile.rackSlot = incomingRackSlot;
    board[row][col] = incomingLetter;

    // Remove the incoming tile from the rack.
    playerTiles.splice(rackIndex, 1);
    playerRackPositions.splice(rackIndex, 1);

    // Return the displaced tile to its original rack slot, keeping all other
    // rack tiles in their existing slots.
    const insertAt = playerRackPositions.findIndex(slot => slot > displacedRackSlot);
    if (insertAt === -1) {
        playerTiles.push(displacedLetter);
        playerRackPositions.push(displacedRackSlot);
    } else {
        playerTiles.splice(insertAt, 0, displacedLetter);
        playerRackPositions.splice(insertAt, 0, displacedRackSlot);
    }

    selectedRackTile = null;
    selectedBoardCell = null;

    if (tileMessageElement) {
        tileMessageElement.textContent = "";
        tileMessageElement.className = "tile-message";
    }

    displayTileRack();
    displayBoard();
    calculatePlayerScore();
}


/* ==================================================
BOARD CLICKING
================================================== */

function handleBoardClick(
    row,
    col
) {
    // Tile interactions should not display instructional prompts.
    if (tileMessageElement && !tileMessageElement.classList.contains("error")) {
        tileMessageElement.textContent = "";
        tileMessageElement.className = "tile-message";
    }

    // Once the solver solution is revealed, all board tiles are locked.
    if (answerRevealed) return;

    const key =
        keyForCell(
            row,
            col
        );


    /*
     * Clicking an existing player tile
     * returns it to the rack.
     */

    if (
        playerPlacedTiles[key]
    ) {

        const tile =
            playerPlacedTiles[key];


        // Return the tile to its original rack slot, keeping the other tiles still.
        const returnSlot = tile.rackSlot ?? 6;
        const insertAt = playerRackPositions.findIndex(slot => slot > returnSlot);
        if (insertAt === -1) {
            playerTiles.push(tile.letter);
            playerRackPositions.push(returnSlot);
        } else {
            playerTiles.splice(insertAt, 0, tile.letter);
            playerRackPositions.splice(insertAt, 0, returnSlot);
        }


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
        // Clicking the currently selected empty cell again deselects it.
        if (
            selectedBoardCell &&
            selectedBoardCell.row === row &&
            selectedBoardCell.col === col
        ) {
            selectedBoardCell = null;

            if (tileMessageElement) {
                tileMessageElement.textContent = "";
                tileMessageElement.className = "tile-message";
            }
        } else {
            // Allow the player to choose the board position before choosing a rack tile.
            selectedBoardCell = { row, col };

            if (tileMessageElement) {
                tileMessageElement.textContent = "";
                tileMessageElement.className = "tile-message";
            }
        }

        displayBoard();
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

    selectedBoardCell = null;

    if (tileMessageElement) {
        tileMessageElement.textContent = "";
        tileMessageElement.className = "tile-message";
    }

    playerPlacedTiles[key] = {

        letter: tile,

        rackSlot: playerRackPositions[selectedRackTile] ?? selectedRackTile,

        row,

        col
    };


    playerTiles.splice(
        selectedRackTile,
        1
    );
    playerRackPositions.splice(
        selectedRackTile,
        1
    );


    selectedRackTile =
        null;


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


    /*
     * Find words created by current board.
     */

    const words =
        getAllWords(
            board
        );


    /*
     * Every player tile starts
     * as invalid.
     */

    for (
        const key
        of playerKeys
    ) {

        statuses[key] =
            "invalid";
    }


    /*
     * Handle disconnected tiles.
     */

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


    /*
     * Connected player tile is valid
     * only if all words it participates
     * in are valid dictionary words.
     */

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


        /*
         * Must participate in at least
         * one valid 2+ letter word.
         */

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


        /*
         * Word must contain at least
         * one player tile.
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
                    ] ===
                    "valid"
            );


        if (
            !allPlayerTilesValid
        ) {

            continue;
        }


        /*
         * Score player tiles for
         * premium squares.
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

    // When the solver answer is revealed, use the solver's turn-by-turn
    // scoring total. Re-scoring every tile on the completed board would apply
    // reusable premium squares to all historical turns at once and inflate
    // the displayed total compared with the solver's move summary.
    if (answerRevealed && bestSolution) {
        // Show the solver's score on the board without overwriting the player's
        // own score, which is used by the share popup and personal-best tracking.
        updateScoreDisplay(bestSolution.score, "");
        displayScoringWords(bestSolution.scoringWords || []);
        return bestSolution.score;
    }

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


    /*
     * 6-tile bonus.
     */

    if (
        playerTiles.length === 0 &&
        Object.keys(
            playerPlacedTiles
        ).length === initialRackTiles.length
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
                    "+100 all-tiles-in-one-word bonus";

            } else {

                bonus = 50;

                bonusText =
                    "+50 all-tiles bonus";
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

    saveDailyBestScore();
    updateShareButtonPulse();


    return score;
}


function calculateHiddenScore() {

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
     * This follows the Hidden Score formula
     * discussed previously:
     *
     * RackValueAvg =
     *     starting rack total / 6,
     *     rounded to the nearest whole number.
     *
     * 2xLscore =
     *     2 x RackValueAvg x number of 2x Letter tiles
     *
     * 3xLscore =
     *     3 x RackValueAvg x number of 3x Letter tiles
     *
     * 2xWscore =
     *     5 x number of 2x Word tiles
     *
     * 3xWscore =
     *     10 x number of 2x Word tiles
     *
     * HiddenScore =
     *     3xWscore +
     *     2xWscore +
     *     2xLscore +
     *     3xLscore +
     *     rack total +
     *     50
     */

    const rackValueAvg =
        Math.round(
            startingRackValueTotal / 6
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

    return hiddenScore;
}


function updateScoreDisplay(
    currentScore,
    bonusText = ""
) {
    updateShareButtonPulse();

    if (scoreValueElement) {
        // Show the player's score and the verified solver target together.
        // The solver target stays hidden until the solver has a result.
        const solverScore =
            bestSolution && Number.isFinite(bestSolution.score)
                ? bestSolution.score
                : null;

        scoreValueElement.textContent =
            `${currentScore}/${solverScore === null ? "—" : solverScore}`;

        updateAchievementStars(
            currentScore,
            solverScore,
            bonusText.includes("all-tiles")
        );
    }

    if (scoreBonusElement) {
        if (bonusText.includes("+100")) {
            scoreBonusElement.innerHTML =
                '<span class="score-bonus-label">BINGO!</span>' +
                '<span class="word-pill-score">+100</span>';
        } else if (bonusText.includes("+50")) {
            scoreBonusElement.innerHTML =
                '<span class="score-bonus-label">ALL TILE BONUS</span>' +
                '<span class="word-pill-score">+50</span>';
        } else {
            scoreBonusElement.textContent = "";
        }
    }
}

function updateAchievementStars(
    currentScore,
    solverScore,
    earnedAllTilesBonus
) {
    let starsElement = document.getElementById("achievementStars");

    if (!starsElement) {
        starsElement = document.createElement("div");
        starsElement.id = "achievementStars";
        starsElement.className = "achievement-stars";
        starsElement.setAttribute("aria-label", "Puzzle achievement stars");

    }

    // Keep the stars directly after the score value, on the same line.
    if (scoreValueElement && starsElement && scoreValueElement.parentNode) {
        scoreValueElement.insertAdjacentElement("afterend", starsElement);
    }

    const hasSolverScore =
        Number.isFinite(solverScore) && solverScore > 0;
    const beatsSolver =
        hasSolverScore && currentScore > solverScore;

    // One star for using all six player tiles in valid words.
    // Two stars for finishing within 10 points below the solver.
    // Three stars for matching or beating the solver; the crown is
    // shown separately only when the player beats the solver.
    let earnedStars = earnedAllTilesBonus ? 1 : 0;

    if (
        hasSolverScore &&
        currentScore < solverScore &&
        solverScore - currentScore <= 10
    ) {
        earnedStars = Math.max(earnedStars, 2);
    }

    if (hasSolverScore && currentScore >= solverScore) {
        earnedStars = 3;
    }

    starsElement.innerHTML = "";

    for (let i = 1; i <= 3; i++) {
        const star = document.createElement("span");
        const earned = i <= earnedStars;
        star.className = earned ? "achievement-star earned" : "achievement-star";
        star.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><filter id="unearnedStarInsetBevel-${i}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/><feOffset in="blur" dx="3" dy="3" result="offsetBlur"/><feComposite in="offsetBlur" in2="SourceAlpha" operator="in" result="darkInside"/><feFlood flood-color="#000000" flood-opacity="0.38" result="darkColor"/><feComposite in="darkColor" in2="darkInside" operator="in" result="darkShadow"/><feOffset in="blur" dx="-2" dy="-2" result="lightOffset"/><feComposite in="lightOffset" in2="SourceAlpha" operator="in" result="lightInside"/><feFlood flood-color="#ffffff" flood-opacity="0.22" result="lightColor"/><feComposite in="lightColor" in2="lightInside" operator="in" result="lightShadow"/><feMerge><feMergeNode in="darkShadow"/><feMergeNode in="lightShadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M57.23,14.5l5.87,13.97c1.13,2.69,3.67,4.54,6.58,4.78l15.1,1.26c6.93.58,9.73,9.21,4.47,13.75l-11.48,9.9c-2.21,1.91-3.18,4.89-2.51,7.73l3.47,14.75c1.59,6.77-5.76,12.1-11.7,8.5l-12.96-7.86c-2.5-1.52-5.63-1.52-8.13,0l-12.96,7.86c-5.94,3.6-13.29-1.73-11.7-8.5l3.47-14.75c.67-2.84-.3-5.83-2.51-7.73l-11.48-9.9c-5.26-4.54-2.46-13.17,4.47-13.75l15.1-1.26c2.91-.24,5.45-2.08,6.58-4.78l5.87-13.97c2.69-6.41,11.77-6.41,14.46,0Z" fill="${earned ? 'currentColor' : '#172c33'}" ${earned ? '' : `filter="url(#unearnedStarInsetBevel-${i})"`}/></svg>`;
        star.setAttribute("aria-hidden", "true");
        starsElement.appendChild(star);
    }

    // The crown is present but hidden until the player beats the solver.
    const crown = document.createElement("span");
    crown.className = "achievement-crown";
    crown.textContent = "👑";
    crown.title = "Solver beaten!";
    crown.setAttribute("role", "img");
    crown.setAttribute("aria-label", "Solver beaten");
    crown.hidden = !beatsSolver;
    crown.style.display = beatsSolver ? "inline-flex" : "none";
    crown.style.alignItems = "center";
    crown.style.marginLeft = "5px";
    crown.style.fontSize = "22px";
    crown.style.lineHeight = "1";
    crown.style.verticalAlign = "middle";
    starsElement.appendChild(crown);

    starsElement.setAttribute(
        "aria-label",
        `${earnedStars} of 3 stars earned${beatsSolver ? "; solver beaten" : ""}`
    );

    // Show the share dialog automatically only for the first three-star
    // achievement and the first crown achievement for this daily puzzle.
    const puzzleKey =
        typeof activeDailyDateKey === "string" && activeDailyDateKey
            ? activeDailyDateKey
            : (document.getElementById("dailyPuzzleNumber")?.textContent || "unknown-puzzle");
    const starsSeenKey = `toucanagram-share-popup-three-stars-${puzzleKey}`;
    const crownSeenKey = `toucanagram-share-popup-crown-${puzzleKey}`;
    const newlyEarnedThreeStars =
        earnedStars === 3 && previousAchievementStars < 3;
    const newlyEarnedCrown = beatsSolver && !previousAchievementCrown;
    let shouldOpenShareDialog = false;

    try {
        if (newlyEarnedThreeStars && !localStorage.getItem(starsSeenKey)) {
            localStorage.setItem(starsSeenKey, "true");
            shouldOpenShareDialog = true;
        }

        if (newlyEarnedCrown && !localStorage.getItem(crownSeenKey)) {
            localStorage.setItem(crownSeenKey, "true");
            shouldOpenShareDialog = true;
        }
    } catch (error) {
        // If browser storage is unavailable, keep first-time behavior for this page.
        if (newlyEarnedThreeStars || newlyEarnedCrown) {
            shouldOpenShareDialog = true;
        }
    }

    // Revealing the solver answer should never trigger the share popup.
    // After revealing, the player can still open it manually with the share icon.
    if (shouldOpenShareDialog && !answerRevealed) {
        refreshShareResultsSummary();
        if (shareResultsDialog && !shareResultsDialog.open) {
            if (typeof shareResultsDialog.showModal === "function") {
                shareResultsDialog.showModal();
            } else {
                shareResultsDialog.setAttribute("open", "");
            }
        }
    }

    previousAchievementStars = earnedStars;
    previousAchievementCrown = beatsSolver;
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



/* ==================================================
BEST MOVE SOLVER + REVEAL ANSWER
================================================== */

function countLetters(letters) {
    const counts = {};
    for (const letter of letters) {
        counts[letter] = (counts[letter] || 0) + 1;
    }
    return counts;
}

function scoreWordOnCandidateBoard(candidateBoard, wordInfo, newlyPlacedKeys) {
    let letterTotal = 0;
    let wordMultiplier = 1;
    const cells = getWordCells(wordInfo.word, wordInfo.row, wordInfo.col, wordInfo.direction);

    for (const cell of cells) {
        const letter = candidateBoard[cell.row][cell.col];
        const value = letterValues[letter] || 0;
        let letterMultiplier = 1;

        // Custom puzzle rule: premium squares remain active when a later
        // word crosses them, including squares covered on an earlier turn.
        const bonus = getBonusSquare(cell.row, cell.col);
        if (bonus === "double-letter") letterMultiplier = 2;
        if (bonus === "triple-letter") letterMultiplier = 3;
        if (bonus === "double-word") wordMultiplier *= 2;
        if (bonus === "triple-word") wordMultiplier *= 3;
        letterTotal += value * letterMultiplier;
    }
    return letterTotal * wordMultiplier;
}

// Score every word formed or extended by this move at its full value.
// This matches the player's scoring behavior: if a placed tile turns BRAZIL
// into BRAZILS while also forming SQUEAL, both BRAZILS and SQUEAL are scored.
function scoreIncrementalWord(candidateBoard, sourceBoard, wordInfo, newKeys) {
    return scoreWordOnCandidateBoard(candidateBoard, wordInfo, newKeys);
}

function candidateTouchesExistingBoard(candidateBoard, newKeys, sourceBoard) {
    for (const key of newKeys) {
        const [row, col] = key.split(",").map(Number);
        const neighbours = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];
        for (const [r, c] of neighbours) {
            if (isInsideBoard(r, c) && sourceBoard[r][c] !== "") return true;
        }
    }
    return false;
}

function evaluateSolverPlacement(word, row, col, direction, sourceBoard, rackCounts) {
    const cells = getWordCells(word, row, col, direction);
    if (!cells.length || cells.some(cell => !isInsideBoard(cell.row, cell.col))) return null;

    // Do not allow the proposed word to be only part of a longer word.
    const beforeRow = row - (direction === "vertical" ? 1 : 0);
    const beforeCol = col - (direction === "horizontal" ? 1 : 0);
    const afterRow = row + (direction === "vertical" ? word.length : 0);
    const afterCol = col + (direction === "horizontal" ? word.length : 0);
    if (isInsideBoard(beforeRow, beforeCol) && sourceBoard[beforeRow][beforeCol] !== "") return null;
    if (isInsideBoard(afterRow, afterCol) && sourceBoard[afterRow][afterCol] !== "") return null;

    const remaining = { ...rackCounts };
    const newKeys = new Set();
    let usedTiles = 0;
    const candidateBoard = cloneBoard(sourceBoard);

    for (const cell of cells) {
        const existing = sourceBoard[cell.row][cell.col];
        if (existing !== "") {
            if (existing !== cell.letter) return null;
            continue;
        }
        if (!remaining[cell.letter]) return null;
        remaining[cell.letter]--;
        usedTiles++;
        const key = keyForCell(cell.row, cell.col);
        newKeys.add(key);
        candidateBoard[cell.row][cell.col] = cell.letter;
    }

    if (usedTiles === 0) return null;
    if (!candidateTouchesExistingBoard(candidateBoard, newKeys, sourceBoard)) return null;
    if (!allWordsAreValid(candidateBoard, solverDictionary)) return null;

    // Score every word created or extended by the move, including cross-words.
    const scoringWords = getAllWords(candidateBoard).filter(info =>
        getWordCells(info.word, info.row, info.col, info.direction)
            .some(cell => newKeys.has(keyForCell(cell.row, cell.col)))
    );
    const mainWord = scoringWords.find(info =>
        info.direction === direction &&
        info.row === row && info.col === col
    );
    if (!mainWord || !solverDictionary.has(mainWord.word)) return null;

    const scoredWords = scoringWords.map(info => ({
        ...info,
        score: scoreIncrementalWord(candidateBoard, sourceBoard, info, newKeys)
    }));
    let totalScore = scoredWords.reduce((sum, info) => sum + info.score, 0);

    // Match the game's all-tiles bonus rule.
    if (usedTiles === initialRackTiles.length) {
        const mainWordUsesAllTiles = getWordCells(mainWord.word, mainWord.row, mainWord.col, mainWord.direction)
            .filter(cell => newKeys.has(keyForCell(cell.row, cell.col))).length === initialRackTiles.length;
        totalScore += mainWordUsesAllTiles ? 100 : 50;
    }

    return {
        word: mainWord.word,
        row,
        col,
        direction,
        score: totalScore,
        board: candidateBoard,
        newKeys: [...newKeys],
        usedTiles,
        scoringWords: scoredWords
    };
}

function getSolverFrontier(targetBoard) {
    const frontier = new Set();
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (targetBoard[row][col] === "") continue;

            for (const [dr, dc] of directions) {
                const nextRow = row + dr;
                const nextCol = col + dc;
                if (!isInsideBoard(nextRow, nextCol)) continue;
                if (targetBoard[nextRow][nextCol] !== "") continue;
                frontier.add(keyForCell(nextRow, nextCol));
            }
        }
    }

    return [...frontier].map(key => {
        const [row, col] = key.split(",").map(Number);
        const bonus = getBonusSquare(row, col);
        const bonusPriority = {
            "triple-word": 40,
            "double-word": 30,
            "triple-letter": 20,
            "double-letter": 10
        }[bonus] || 0;
        return { row, col, key, priority: bonusPriority };
    }).sort((a, b) => b.priority - a.priority);
}

function getRunThroughCell(targetBoard, row, col, direction) {
    const dr = direction === "vertical" ? 1 : 0;
    const dc = direction === "horizontal" ? 1 : 0;
    let startRow = row;
    let startCol = col;

    while (
        isInsideBoard(startRow - dr, startCol - dc) &&
        targetBoard[startRow - dr][startCol - dc] !== ""
    ) {
        startRow -= dr;
        startCol -= dc;
    }

    let word = "";
    let endRow = startRow;
    let endCol = startCol;
    while (
        isInsideBoard(endRow, endCol) &&
        targetBoard[endRow][endCol] !== ""
    ) {
        word += targetBoard[endRow][endCol];
        endRow += dr;
        endCol += dc;
    }

    return {
        word,
        startRow,
        startCol,
        endRow,
        endCol,
        dr,
        dc
    };
}

// An unfinished word may still become valid if one of its ends is empty.
// If both ends are blocked, an invalid word can never be repaired later.
function partialRunCanStillBecomeValid(targetBoard, row, col, direction) {
    const run = getRunThroughCell(targetBoard, row, col, direction);
    if (run.word.length < 2 || dictionary.has(run.word)) return true;

    const canExtendBefore =
        isInsideBoard(run.startRow - run.dr, run.startCol - run.dc) &&
        targetBoard[run.startRow - run.dr][run.startCol - run.dc] === "";
    const canExtendAfter =
        isInsideBoard(run.endRow, run.endCol) &&
        targetBoard[run.endRow][run.endCol] === "";

    return canExtendBefore || canExtendAfter;
}

function getFullRackSolutionScore(solutionBoard, newKeys) {
    const keySet = new Set(newKeys);
    const scoringWords = getAllWords(solutionBoard).filter(info =>
        getWordCells(info.word, info.row, info.col, info.direction)
            .some(cell => keySet.has(keyForCell(cell.row, cell.col)))
    );

    let total = scoringWords.reduce(
        (sum, info) => sum + scoreWordOnCandidateBoard(solutionBoard, info, keySet),
        0
    );

    const usesAllTilesInOneWord = scoringWords.some(info =>
        getWordCells(info.word, info.row, info.col, info.direction)
            .filter(cell => keySet.has(keyForCell(cell.row, cell.col))).length === initialRackTiles.length
    );

    // Keep the game's all-tiles bonus: +100 if one word uses all rack tiles,
    // otherwise +50 when all rack tiles are used in the same placement.
    total += usesAllTilesInOneWord ? 100 : 50;

    return { score: total, words: scoringWords };
}

function findBestMoveOnBoard(sourceBoard, rackCounts, searchBudget) {
    const directions = ["horizontal", "vertical"];
    const words = [...solverDictionary]
        .filter(word => word.length >= 2 && word.length <= boardSize)
        // Check promising words first if the safety limit is reached.
        .sort((a, b) => {
            const valueA = [...a].reduce((sum, letter) => sum + (letterValues[letter] || 0), 0);
            const valueB = [...b].reduce((sum, letter) => sum + (letterValues[letter] || 0), 0);
            return (b.length * 10 + valueB) - (a.length * 10 + valueA);
        });

    let bestMove = null;
    let checked = 0;
    let limitReached = false;

    for (const word of words) {
        for (const direction of directions) {
            const maxRow = direction === "vertical" ? boardSize - word.length : boardSize - 1;
            const maxCol = direction === "horizontal" ? boardSize - word.length : boardSize - 1;

            for (let row = 0; row <= maxRow; row++) {
                for (let col = 0; col <= maxCol; col++) {
                    // Fast pre-check: reject placements that cannot match the board
                    // or cannot be made from the remaining rack before cloning/scoring.
                    const remaining = { ...rackCounts };
                    let usedTiles = 0;
                    let matches = true;
                    let touchesBoard = false;

                    const cells = getWordCells(word, row, col, direction);
                    for (const cell of cells) {
                        const existing = sourceBoard[cell.row][cell.col];
                        if (existing !== "") {
                            if (existing !== cell.letter) {
                                matches = false;
                                break;
                            }
                            touchesBoard = true;
                        } else {
                            if (!remaining[cell.letter]) {
                                matches = false;
                                break;
                            }
                            remaining[cell.letter]--;
                            usedTiles++;
                            const neighbours = [
                                [cell.row - 1, cell.col], [cell.row + 1, cell.col],
                                [cell.row, cell.col - 1], [cell.row, cell.col + 1]
                            ];
                            if (neighbours.some(([r, c]) =>
                                isInsideBoard(r, c) && sourceBoard[r][c] !== ""
                            )) touchesBoard = true;
                        }
                    }

                    if (!matches || usedTiles === 0 || !touchesBoard) continue;

                    checked++;
                    if (checked > searchBudget) {
                        limitReached = true;
                        return { move: bestMove, checked, limitReached };
                    }

                    const move = evaluateSolverPlacement(
                        word, row, col, direction, sourceBoard, rackCounts
                    );
                    if (move) {
                        const rackSize = Object.values(rackCounts)
                            .reduce((sum, count) => sum + count, 0);
                        const moveUsesAllTiles = move.usedTiles === rackSize;
                        const bestUsesAllTiles = bestMove && bestMove.usedTiles === rackSize;

                        // Prefer a move that uses the entire remaining rack.
                        // Among full-rack moves, choose the highest-scoring one.
                        // Only compare ordinary moves when no full-rack move has
                        // been found, or when both moves use the same tile count.
                        if (
                            !bestMove ||
                            (moveUsesAllTiles && !bestUsesAllTiles) ||
                            (moveUsesAllTiles === bestUsesAllTiles && move.score > bestMove.score)
                        ) {
                            bestMove = move;
                        }
                    }
                }
            }
        }
    }

    return { move: bestMove, checked, limitReached };
}

function findBestSolution() {
    if (!solverDictionary.size || !originalBoard.length || !initialRackTiles.length) return;

    const startingBoard = cloneBoard(originalBoard);
    const remainingCounts = countLetters(initialRackTiles);
    const allNewKeys = [];
    const moves = [];
    const allScoringWords = [];
    let totalScore = 0;
    let visitedCandidates = 0;
    const searchLimit = 25000;
    let searchLimitReached = false;
    let currentBoard = startingBoard;

    // Greedily choose the highest-scoring legal move, apply it, remove the
    // letters used by that move, then solve again against the updated board.
    while (Object.values(remainingCounts).some(count => count > 0)) {
        const remainingTiles = Object.values(remainingCounts)
            .reduce((sum, count) => sum + count, 0);
        if (remainingTiles === 0) break;

        const result = findBestMoveOnBoard(
            currentBoard,
            remainingCounts,
            Math.max(1, searchLimit - visitedCandidates)
        );
        visitedCandidates += result.checked;
        if (result.limitReached) searchLimitReached = true;

        const move = result.move;
        if (!move) break;

        // Store this turn separately so its score is not recalculated against
        // the final board and premium squares are not counted more than once.
        const moveRecord = {
            turn: moves.length + 1,
            word: move.word,
            row: move.row,
            col: move.col,
            direction: move.direction,
            score: move.score,
            usedTiles: move.usedTiles,
            newKeys: [...move.newKeys],
            // Save each word's score as it was scored on this specific turn.
            // This is important because the custom puzzle rule allows premium
            // squares to be reused on later turns.
            // These scores are already incremental: extended existing words
            // contribute only their increase, while newly formed cross-words
            // contribute their full score.
            scoringWords: move.scoringWords.map(info => ({ ...info }))
        };
        moves.push(moveRecord);
        totalScore += move.score;
        currentBoard = cloneBoard(move.board);

        for (const key of move.newKeys) {
            const [row, col] = key.split(",").map(Number);
            const letter = currentBoard[row][col];
            if (remainingCounts[letter] > 0) remainingCounts[letter]--;
            allNewKeys.push(key);
        }
        allScoringWords.push(...moveRecord.scoringWords.map(info => ({ ...info, move: moveRecord.turn })));

        if (searchLimitReached) break;
    }

    const tilesUsed = allNewKeys.length;
    const tilesRemaining = initialRackTiles.length - tilesUsed;
    const fullSolution = tilesRemaining === 0;

    // A one-turn full-rack move already includes its +50 or +100 bonus.
    // If all rack tiles are used across multiple turns, award +50 on completion.
    const completionBonus = fullSolution && moves.length > 1 ? 50 : 0;
    totalScore += completionBonus;

    bestSolution = tilesUsed > 0 ? {
        board: cloneBoard(currentBoard),
        newKeys: allNewKeys,
        score: totalScore,
        completionBonus,
        words: allScoringWords.map(info => info.word),
        scoringWords: allScoringWords,
        moves,
        tilesUsed,
        tilesRemaining,
        fullSolution,
        searchLimitReached,
        visitedCandidates
    } : null;

    if (bestScoreWordElement) {
        bestScoreWordElement.textContent = fullSolution
            ? `${moves.length} turns · all tiles placed`
            : tilesUsed > 0
                ? `${moves.length} turns · ${tilesRemaining} tile${tilesRemaining === 1 ? "" : "s"} left`
                : "No legal move found";
    }
    if (bestScoreValueElement) {
        bestScoreValueElement.textContent = bestSolution ? `${totalScore} points` : "—";
    }
    if (revealAnswerButton) {
        revealAnswerButton.disabled = !bestSolution;
        revealAnswerButton.textContent = fullSolution ? "Reveal Full Answer" : "Reveal Solver Answer";
    }
    // Refresh the displayed solver target and achievement stars now that the
    // solver has finished calculating this puzzle.
    updateScoreDisplay(score, "");

    if (bestScoreMessageElement) {
        if (!bestSolution) {
            bestScoreMessageElement.textContent = "No legal move was found for these tiles on this board.";
        } else {
            const turnSummary = moves.map(move =>
                `Turn ${move.turn}: ${move.word} (+${move.score}, ${move.usedTiles} tile${move.usedTiles === 1 ? "" : "s"})`
            ).join(" · ");
            bestScoreMessageElement.textContent = fullSolution
                ? moves.length === 1
                    ? `All ${initialRackTiles.length} tiles placed in one turn; the solver chose the highest-scoring full-rack move. ${turnSummary}`
                    : `All ${initialRackTiles.length} tiles placed across ${moves.length} turns, including the +50 all-tiles bonus. ${turnSummary}`
                : searchLimitReached
                    ? `Search limit reached after ${tilesUsed} tile${tilesUsed === 1 ? "" : "s"} placed; ${tilesRemaining} remain. ${turnSummary}`
                    : `No further legal move was found after placing ${tilesUsed} of ${initialRackTiles.length} tiles; ${tilesRemaining} remain. ${turnSummary}`;
        }
    }
}

function revealBestAnswer() {
    if (!bestSolution || !bestSolution.newKeys.length) return;

    answerRevealed = true;
    board = cloneBoard(bestSolution.board);
    playerPlacedTiles = {};

    for (const key of bestSolution.newKeys) {
        const [row, col] = key.split(",").map(Number);
        playerPlacedTiles[key] = { letter: board[row][col], row, col };
    }

    playerTiles = [];
    playerRackPositions = [];
    selectedRackTile = null;
    answerRevealed = true;

    displayTileRack();
    displayBoard();
    calculatePlayerScore();

    if (revealAnswerButton) {
        revealAnswerButton.textContent = bestSolution.fullSolution
            ? "Full Answer Revealed"
            : "Solver Answer Revealed";
    }
    // Keep sharing available after revealing the solution.
    if (shareResultsButton) {
        shareResultsButton.disabled = false;
        shareResultsButton.classList.remove("needs-sharing");
    }
    // Keep the solver step panel hidden after revealing the solution.
    if (bestScoreBoxElement) {
        bestScoreBoxElement.hidden = true;
    }

    // Remove the rack controls so the scoring pills move up into their place.
    const rackActionsElement = document.getElementById("rackActions");
    if (rackActionsElement) {
        rackActionsElement.hidden = false;
        rackActionsElement.classList.add("solver-revealed");
    }
    [shuffleRackButton, clearBoardButton, revealPuzzleButton, nextPuzzleButton].forEach(button => {
        if (button) {
            button.hidden = true;
            button.disabled = true;
        }
    });

    // Show the solver's all-tiles bonus pill when the revealed solution earns one.
    if (scoreBonusElement) {
        let bonus = 0;
        if (bestSolution.fullSolution) {
            if (bestSolution.moves.length > 1) {
                bonus = bestSolution.completionBonus || 50;
            } else {
                const move = bestSolution.moves[0];
                if (move && move.usedTiles === initialRackTiles.length) {
                    const mainWordUsesAllTiles =
                        (move.newKeys || []).length === initialRackTiles.length;
                    bonus = mainWordUsesAllTiles ? 100 : 50;
                }
            }
        }

        if (bonus === 100) {
            scoreBonusElement.innerHTML =
                '<span class="score-bonus-label">BINGO!</span>' +
                '<span class="word-pill-score">+100</span>';
        } else if (bonus === 50) {
            scoreBonusElement.innerHTML =
                '<span class="score-bonus-label">ALL TILE BONUS</span>' +
                '<span class="word-pill-score">+50</span>';
        } else {
            scoreBonusElement.textContent = "";
        }
    }

    // Keep the board area clear after revealing the solver's answer.
    if (tileMessageElement) {
        tileMessageElement.textContent = "";
        tileMessageElement.className = "tile-message";
    }

    // Prepare the special share popup for when the player clicks Share.
    shareResultsMode = "reveal";
}

if (revealAnswerButton) {
    revealAnswerButton.addEventListener("click", revealBestAnswer);
}


/* ==================================================
RACK ACTION BUTTONS
================================================== */

if (shuffleRackButton) {
    shuffleRackButton.addEventListener("click", () => {
        // Fisher–Yates shuffle: change tile order without changing the letters.
        for (let i = playerTiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playerTiles[i], playerTiles[j]] = [playerTiles[j], playerTiles[i]];
        }

        selectedRackTile = null;
        displayTileRack();
    });
}

if (clearBoardButton) {
    clearBoardButton.addEventListener("click", () => {
        // Return the original rack letters and restore only the fixed puzzle tiles.
        playerTiles = [...initialRackTiles];
        playerRackPositions = playerTiles.map((_, index) => index);
        board = cloneBoard(originalBoard);
        playerPlacedTiles = {};
        selectedRackTile = null;
        selectedBoardCell = null;
        answerRevealed = false;

        displayTileRack();
        displayBoard();
        calculatePlayerScore();

        if (tileMessageElement) {
            tileMessageElement.textContent = "";
            tileMessageElement.className = "tile-message";
        }
    });
}


/* ==================================================
REVEAL PUZZLE PANEL CONFIRMATION
================================================== */

if (revealPuzzleButton && bestScoreBoxElement) {
    let revealConfirmationPending = false;
    let revealConfirmationTimeout = null;

    revealPuzzleButton.addEventListener("click", () => {
        if (!revealConfirmationPending) {
            revealConfirmationPending = true;
            revealPuzzleButton.textContent = "Are you sure?";
            revealPuzzleButton.setAttribute(
                "aria-label",
                "Confirm revealing the full-rack solution"
            );

            // Return to the original button state if the user doesn't confirm
            // within five seconds.
            revealConfirmationTimeout = setTimeout(() => {
                if (!revealConfirmationPending) return;

                revealConfirmationPending = false;
                revealPuzzleButton.textContent = "Reveal Puzzle";
                revealPuzzleButton.removeAttribute("aria-label");
                revealConfirmationTimeout = null;
            }, 5000);

            return;
        }

        // The user confirmed in time, so cancel the reset timer.
        if (revealConfirmationTimeout !== null) {
            clearTimeout(revealConfirmationTimeout);
            revealConfirmationTimeout = null;
        }
        revealConfirmationPending = false;

        // Replace the rack action buttons with the full-rack solution panel.
        const rackActionsElement = document.getElementById("rackActions");
        if (rackActionsElement) {
            rackActionsElement.hidden = true;
        }
        // Do not show the solver step/details panel when revealing the answer.
        bestScoreBoxElement.hidden = true;
        revealPuzzleButton.disabled = true;
        revealPuzzleButton.setAttribute("aria-expanded", "true");

        // Use the exact same action as the panel's existing answer button.
        revealBestAnswer();
    });
}


/* ==================================================
DAILY CHALLENGE
================================================== */

let dailyRandomState = 0;
let activeDailyDateKey = "";
let dailyChallengeDateKey = "";
let dailyClockInterval = null;
let dailyChallengeInfoElement = null;

function getUtcDateKey(date = new Date()) {
    // The pre-generation workflow can supply a specific date while keeping
    // the normal game tied to the real current UTC date.
    if (
        typeof window !== "undefined" &&
        window.__SCRABBLE_PREGENERATE_DATE__
    ) {
        return window.__SCRABBLE_PREGENERATE_DATE__;
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Small deterministic PRNG. The same date key always produces the same
// random sequence, so every visitor generates the same board and rack.
function seededDailyRandom() {
    let t = dailyRandomState += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function seedDailyRandom(dateKey) {
    let hash = 2166136261;
    for (let i = 0; i < dateKey.length; i++) {
        hash ^= dateKey.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    dailyRandomState = hash >>> 0;

    // The existing generator already routes its random choices through
    // Math.random(), so seeding it keeps the existing generation logic intact.
    Math.random = seededDailyRandom;
}

function ensureDailyChallengeInfo() {
    if (!dailyChallengeInfoElement) {
        dailyChallengeInfoElement = document.getElementById("dailyChallengeInfo");
    }

    if (!dailyChallengeInfoElement && generateButton && generateButton.parentNode) {
        dailyChallengeInfoElement = document.createElement("div");
        dailyChallengeInfoElement.id = "dailyChallengeInfo";
        generateButton.parentNode.insertBefore(dailyChallengeInfoElement, generateButton);

        const style = document.createElement("style");
        style.textContent = `
            #dailyChallengeInfo {
                margin: 0 auto 10px;
                max-width: 100%;
                color: #64748b;
                font: 600 13px/1.5 Arial, Helvetica, sans-serif;
                text-align: center;
            }
            #generateButton { min-width: 190px; }
        `;
        document.head.appendChild(style);
    }
}

function updateDailyChallengeClock() {
    if (!dailyChallengeDateKey) return;

    // The daily challenge always follows the real current UTC date.
    // Loading a future puzzle for testing must not change this.
    if (getUtcDateKey() !== dailyChallengeDateKey) {
        window.location.reload();
        return;
    }

    const now = new Date();
    const nextUtcMidnight = Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0
    );
    const remainingSeconds = Math.max(0, Math.floor((nextUtcMidnight - now.getTime()) / 1000));
    const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(remainingSeconds % 60).padStart(2, "0");

    ensureDailyChallengeInfo();
    if (dailyChallengeInfoElement) {
        dailyChallengeInfoElement.textContent =
            `DAILY CHALLENGE · ${activeDailyDateKey}`;
        // `DAILY CHALLENGE · ${activeDailyDateKey} · New puzzle in ${hours}:${minutes}:${seconds}`;
    }
}

function updateDailyPuzzleNumber(dateKey) {
    const numberElement = document.getElementById("dailyPuzzleNumber");
    if (!numberElement || !dateKey) return;

    // Daily puzzle numbering follows the number of daily puzzles in the year:
    // January 1 is #0001, January 2 is #0002, and so on.
    const puzzleDate = new Date(dateKey + "T00:00:00Z");
    const yearStart = Date.UTC(puzzleDate.getUTCFullYear(), 0, 1);
    const puzzleNumber = Math.floor((puzzleDate.getTime() - yearStart) / 86400000) + 1;

    numberElement.textContent = `Daily Puzzle #${String(puzzleNumber).padStart(4, "0")}`;
}

function getNextPuzzleDateKey(dateKey) {
    const date = new Date(dateKey + "T00:00:00Z");
    date.setUTCDate(date.getUTCDate() + 1);
    return getUtcDateKey(date);
}

async function loadPuzzleForDate(dateKey, allowDailyFallback = false) {
    if (isGenerating) return;

    isGenerating = true;

    if (generateButton) {
        generateButton.disabled = true;
        generateButton.textContent = "Loading Daily Puzzle…";
    }

    if (!dailyChallengeDateKey) {
        dailyChallengeDateKey = getUtcDateKey();
    }

    activeDailyDateKey = dateKey;
    updateDailyPuzzleNumber(activeDailyDateKey);
    ensureDailyChallengeInfo();

    if (dailyClockInterval) clearInterval(dailyClockInterval);
    updateDailyChallengeClock();
    dailyClockInterval = setInterval(updateDailyChallengeClock, 1000);

    try {
        const response = await fetch(
            `puzzles/${activeDailyDateKey}.json`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error(
                `Puzzle request failed: ${response.status}`
            );
        }

        const puzzle = await response.json();

        if (
            !puzzle ||
            !Array.isArray(puzzle.board) ||
            !Array.isArray(puzzle.originalBoard) ||
            !puzzle.boardSize ||
            !Array.isArray(puzzle.initialRackTiles) ||
            !puzzle.bestSolution
        ) {
            throw new Error("Daily puzzle file is incomplete.");
        }

        boardSize = puzzle.boardSize;
        board = cloneBoard(puzzle.board);
        originalBoard = cloneBoard(puzzle.originalBoard);
        bonusSquares = { ...(puzzle.bonusSquares || {}) };
        puzzleWords = Array.isArray(puzzle.puzzleWords)
            ? puzzle.puzzleWords.map(word => ({ ...word }))
            : [];

        initialRackTiles = [...puzzle.initialRackTiles];
        playerTiles = [...initialRackTiles];
        playerRackPositions = playerTiles.map((_, index) => index);
        playerPlacedTiles = {};
        bestSolution = {
            ...puzzle.bestSolution,
            board: cloneBoard(puzzle.bestSolution.board),
            newKeys: [...(puzzle.bestSolution.newKeys || [])],
            words: [...(puzzle.bestSolution.words || [])],
            scoringWords: (puzzle.bestSolution.scoringWords || []).map(word => ({ ...word })),
            moves: (puzzle.bestSolution.moves || []).map(move => ({
                ...move,
                newKeys: [...(move.newKeys || [])],
                scoringWords: (move.scoringWords || []).map(word => ({ ...word }))
            }))
        };

        startingRackValueTotal = initialRackTiles.reduce(
            (total, letter) =>
                total + (letterValues[letter] ?? 0),
            0
        );

        selectedRackTile = null;
        selectedBoardCell = null;
        score = 0;
        answerRevealed = false;

        if (revealAnswerButton) {
            revealAnswerButton.textContent = bestSolution.fullSolution
                ? "Reveal Full Answer"
                : "Reveal Solver Answer";
            revealAnswerButton.disabled = !bestSolution;
        }

        if (bestScoreWordElement) {
            const tilesRemaining = bestSolution.tilesRemaining ?? initialRackTiles.length;
            bestScoreWordElement.textContent = bestSolution.fullSolution
                ? `${bestSolution.moves.length} turns · all tiles placed`
                : `${bestSolution.moves.length} turns · ${tilesRemaining} tile${tilesRemaining === 1 ? "" : "s"} left`;
        }

        if (bestScoreValueElement) {
            bestScoreValueElement.textContent = `${bestSolution.score} points`;
        }

        if (bestScoreMessageElement) {
            const moves = bestSolution.moves || [];
            const turnSummary = moves.map(move =>
                `Turn ${move.turn}: ${move.word} (+${move.score}, ${move.usedTiles} tile${move.usedTiles === 1 ? "" : "s"})`
            ).join(" · ");

            bestScoreMessageElement.textContent =
                bestSolution.fullSolution
                    ? moves.length === 1
                        ? `All ${initialRackTiles.length} tiles placed in one turn; the solver chose the highest-scoring full-rack move. ${turnSummary}`
                        : `All ${initialRackTiles.length} tiles placed across ${moves.length} turns, including the +50 all-tiles bonus. ${turnSummary}`
                    : bestSolution.searchLimitReached
                        ? `Search limit reached after ${bestSolution.tilesUsed} tile${bestSolution.tilesUsed === 1 ? "" : "s"} placed; ${bestSolution.tilesRemaining} remain. ${turnSummary}`
                        : `No further legal move was found after placing ${bestSolution.tilesUsed} of ${initialRackTiles.length} tiles; ${bestSolution.tilesRemaining} remain. ${turnSummary}`;
        }

        // Loading another puzzle should always return the normal puzzle UI.
        const rackActionsElement = document.getElementById("rackActions");
        if (rackActionsElement) {
            rackActionsElement.hidden = false;
            rackActionsElement.classList.remove("solver-revealed");
        }
        [shuffleRackButton, clearBoardButton, revealPuzzleButton, nextPuzzleButton].forEach(button => {
            if (button) {
                button.hidden = false;
                button.disabled = false;
            }
        });
        if (bestScoreBoxElement) {
            bestScoreBoxElement.hidden = true;
        }
        if (revealPuzzleButton) {
            revealPuzzleButton.disabled = false;
            revealPuzzleButton.textContent = "Reveal Solver";
            revealPuzzleButton.removeAttribute("aria-label");
            revealPuzzleButton.setAttribute("aria-expanded", "false");
        }
        if (shareResultsButton) {
            shareResultsButton.disabled = false;
        }

        displayBoard();
        displayTileRack();
        updateWordCount();
        calculatePlayerScore();
    } catch (error) {
        console.error("Could not load pre-generated puzzle:", error);

        if (allowDailyFallback) {
            // Only the real daily puzzle may use the legacy browser fallback.
            // The test/next-puzzle button always requires a pre-generated file.
            try {
                if (solverDictionary.size === 0) {
                    await loadSolverDictionary();
                }

                if (solverDictionary.size > 0) {
                    isGenerating = false;
                    await generateDailyPuzzle();
                    return;
                }
            } catch (fallbackError) {
                console.error("Fallback puzzle generation also failed:", fallbackError);
            }
        }

        if (tileMessageElement) {
            tileMessageElement.textContent = allowDailyFallback
                ? "Today's puzzle could not be loaded. Please try again later."
                : "Puzzle " + dateKey + " could not be loaded.";
            tileMessageElement.className = "tile-message error";
        }
    } finally {
        isGenerating = false;

        if (generateButton) {
            generateButton.disabled = false;
            generateButton.textContent = "Restart Daily Puzzle";
        }

        updateDailyChallengeClock();
    }
}

async function loadDailyPuzzle() {
    dailyChallengeDateKey = getUtcDateKey();
    return loadPuzzleForDate(dailyChallengeDateKey, true);
}

async function loadNextPuzzle() {
    if (!activeDailyDateKey) return;
    const nextDateKey = getNextPuzzleDateKey(activeDailyDateKey);
    return loadPuzzleForDate(nextDateKey, false);
}

async function generateDailyPuzzle() {
    if (isGenerating) return;

    isGenerating = true;
    if (generateButton) {
        generateButton.disabled = true;
        generateButton.textContent = "Loading Daily Puzzle…";
    }

    activeDailyDateKey = getUtcDateKey();
    updateDailyPuzzleNumber(activeDailyDateKey);
    seedDailyRandom(activeDailyDateKey);
    ensureDailyChallengeInfo();

    if (dailyClockInterval) clearInterval(dailyClockInterval);
    updateDailyChallengeClock();
    dailyClockInterval = setInterval(updateDailyChallengeClock, 1000);

    const maxPuzzleAttempts = 100;
    let solvedWithAllTiles = false;

    try {
        for (let attempt = 1; attempt <= maxPuzzleAttempts; attempt++) {
            if (dailyChallengeInfoElement) {
                dailyChallengeInfoElement.textContent =
                    `Preparing today's shared puzzle… (attempt ${attempt})`;
            }

            generateBoard();

            const hasFourLetterSolverWord =
                bestSolution &&
                Array.isArray(bestSolution.moves) &&
                bestSolution.moves.some(
                    move =>
                        typeof move.word === "string" &&
                        move.word.length >= 4
                );

            if (
                bestSolution &&
                bestSolution.fullSolution &&
                hasFourLetterSolverWord
            ) {
                solvedWithAllTiles = true;
                break;
            }

            // Give the browser a chance to update the progress message.
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        if (!solvedWithAllTiles && tileMessageElement) {
            tileMessageElement.textContent =
                `The daily puzzle could not be prepared after ${maxPuzzleAttempts} attempts. Please reload the page to try again.`;
        }

        if (
            typeof window !== "undefined" &&
            window.__SCRABBLE_PREGENERATE__ === true &&
            solvedWithAllTiles &&
            bestSolution
        ) {
            window.__SCRABBLE_PUZZLE_EXPORT__ = {
                date: activeDailyDateKey,
                boardSize,
                board: cloneBoard(originalBoard),
                originalBoard: cloneBoard(originalBoard),
                bonusSquares: { ...bonusSquares },
                puzzleWords: puzzleWords.map(word => ({ ...word })),
                initialRackTiles: [...initialRackTiles],
                bestSolution: {
                    ...bestSolution,
                    board: cloneBoard(bestSolution.board),
                    newKeys: [...bestSolution.newKeys],
                    words: [...bestSolution.words],
                    scoringWords: (bestSolution.scoringWords || []).map(word => ({ ...word })),
                    moves: (bestSolution.moves || []).map(move => ({
                        ...move,
                        newKeys: [...move.newKeys],
                        scoringWords: (move.scoringWords || []).map(word => ({ ...word }))
                    }))
                }
            };
        }
    } finally {
        isGenerating = false;
        if (generateButton) {
            generateButton.disabled = false;
            generateButton.textContent = "Restart Daily Puzzle";
        }
        updateDailyChallengeClock();
    }
}

if (generateButton) {
    generateButton.textContent = "Daily Puzzle";
    generateButton.addEventListener("click", loadDailyPuzzle);
}

if (nextPuzzleButton) {
    nextPuzzleButton.addEventListener("click", loadNextPuzzle);
}


/* ==================================================
NEW TILES BUTTON
================================================== */

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
                    6
                );
            playerRackPositions = playerTiles.map((_, index) => index);

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


/* ==================================================
WORD COUNT
================================================== */

function updateWordCount() {

    if (
        !wordCountElement
    ) {

        return;
    }


    wordCountElement.textContent =
        `${puzzleWords.length} words`;
}


/* ==================================================
RULES POPUP
================================================== */

if (rulesHelpButton && rulesDialog) {
    const rulesTabs = Array.from(rulesDialog.querySelectorAll("[data-rules-tab]"));
    const rulesPanels = Array.from(rulesDialog.querySelectorAll("[data-rules-panel]"));

    function activateRulesTab(tabName, moveFocus = false) {
        rulesTabs.forEach(tab => {
            const isActive = tab.dataset.rulesTab === tabName;
            tab.classList.toggle("is-active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
            tab.tabIndex = isActive ? 0 : -1;
            if (isActive && moveFocus) tab.focus();
        });

        rulesPanels.forEach(panel => {
            const isActive = panel.dataset.rulesPanel === tabName;
            panel.hidden = !isActive;
            panel.classList.toggle("is-active", isActive);
        });
    }

    rulesTabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activateRulesTab(tab.dataset.rulesTab));

        tab.addEventListener("keydown", event => {
            let nextIndex = index;
            if (event.key === "ArrowRight") nextIndex = (index + 1) % rulesTabs.length;
            else if (event.key === "ArrowLeft") nextIndex = (index - 1 + rulesTabs.length) % rulesTabs.length;
            else if (event.key === "Home") nextIndex = 0;
            else if (event.key === "End") nextIndex = rulesTabs.length - 1;
            else return;

            event.preventDefault();
            activateRulesTab(rulesTabs[nextIndex].dataset.rulesTab, true);
        });
    });

    rulesHelpButton.addEventListener("click", () => {
        if (typeof rulesDialog.showModal === "function") {
            rulesDialog.showModal();
        } else {
            rulesDialog.setAttribute("open", "");
        }
    });

    if (closeRulesButton) {
        closeRulesButton.addEventListener("click", () => {
            if (typeof rulesDialog.close === "function") {
                rulesDialog.close();
            } else {
                rulesDialog.removeAttribute("open");
            }
        });
    }



    // Open the Word List information as a separate dialog above How to Play.
    const wordListDialog = document.getElementById("wordListDialog");
    const openWordListButton = document.getElementById("openWordListButton");
    const closeWordListButton = document.getElementById("closeWordListButton");

    if (wordListDialog && openWordListButton) {
        openWordListButton.addEventListener("click", () => {
            if (typeof wordListDialog.showModal === "function") {
                wordListDialog.showModal();
            } else {
                wordListDialog.setAttribute("open", "");
            }
        });

        if (closeWordListButton) {
            closeWordListButton.addEventListener("click", () => {
                if (typeof wordListDialog.close === "function") {
                    wordListDialog.close();
                } else {
                    wordListDialog.removeAttribute("open");
                }
            });
        }

        wordListDialog.addEventListener("click", event => {
            if (event.target === wordListDialog) {
                if (typeof wordListDialog.close === "function") {
                    wordListDialog.close();
                } else {
                    wordListDialog.removeAttribute("open");
                }
            }
        });
    }

    rulesDialog.addEventListener("click", event => {
        // Clicking the dimmed backdrop closes the rules; clicks inside the panel do not.
        if (event.target === rulesDialog) {
            if (typeof rulesDialog.close === "function") {
                rulesDialog.close();
            } else {
                rulesDialog.removeAttribute("open");
            }
        }
    });

    rulesDialog.addEventListener("cancel", event => {
        // Keep Escape-key dismissal consistent across browsers.
        if (typeof rulesDialog.close !== "function") {
            event.preventDefault();
            rulesDialog.removeAttribute("open");
        }
    });
}


/* ==================================================
SHARE RESULTS POPUP
================================================== */

function updateShareButtonPulse() {
    if (!shareResultsButton) return;
    if (answerRevealed) {
        shareResultsButton.classList.remove("needs-sharing");
        return;
    }

    const allTilesUsed =
        playerTiles.length === 0 &&
        Object.keys(playerPlacedTiles).length === initialRackTiles.length;

    shareResultsButton.classList.toggle("needs-sharing", allTilesUsed);
}

function getDailyPuzzleNumber() {
    const puzzleLabel = document.getElementById("dailyPuzzleNumber")?.textContent || "";
    const puzzleMatch = puzzleLabel.match(/#(\d+)/);
    return puzzleMatch ? puzzleMatch[1] : "0000";
}

function getDailyBestScoreKey() {
    return `toucanagram-best-score-${getDailyPuzzleNumber()}`;
}

function getDailyBestResult() {
    try {
        const saved = JSON.parse(localStorage.getItem(getDailyBestScoreKey()) || "null");
        return saved && Number.isFinite(saved.score)
            ? saved
            : { score: 0, stars: 0, crown: false };
    } catch (error) {
        return { score: 0, stars: 0, crown: false };
    }
}

function saveDailyBestScore() {
    // The solver's revealed answer must never overwrite the player's personal best.
    if (answerRevealed || !Number.isFinite(score)) return;

    const current = getDailyBestResult();
    if (score <= current.score) return;

    const solverScore =
        bestSolution && Number.isFinite(bestSolution.score)
            ? bestSolution.score
            : null;
    const allTilesUsed =
        playerTiles.length === 0 &&
        Object.keys(playerPlacedTiles).length === initialRackTiles.length;

    let stars = allTilesUsed ? 1 : 0;
    if (solverScore !== null && score < solverScore && solverScore - score <= 10) {
        stars = Math.max(stars, 2);
    }
    if (solverScore !== null && score >= solverScore) {
        stars = 3;
    }

    try {
        localStorage.setItem(getDailyBestScoreKey(), JSON.stringify({
            score,
            stars,
            crown: solverScore !== null && score > solverScore
        }));
    } catch (error) {
        // The game still works if browser storage is unavailable.
    }
}

function getShareResultDetails() {
    const currentScore = Number.isFinite(score) ? score : 0;
    const solverScore =
        bestSolution && Number.isFinite(bestSolution.score)
            ? bestSolution.score
            : null;
    const savedBest = getDailyBestResult();
    const playerScore = Math.max(currentScore, savedBest.score);

    const allTilesUsed =
        playerTiles.length === 0 &&
        Object.keys(playerPlacedTiles).length === initialRackTiles.length;

    let stars = allTilesUsed ? 1 : 0;
    if (solverScore !== null && playerScore < solverScore && solverScore - playerScore <= 10) {
        stars = Math.max(stars, 2);
    }
    if (solverScore !== null && playerScore >= solverScore) {
        stars = 3;
    }
    stars = Math.max(stars, savedBest.stars || 0);

    const crown = (solverScore !== null && playerScore > solverScore) || !!savedBest.crown;
    const puzzleNumber = getDailyPuzzleNumber();

    return {
        playerScore,
        solverScore,
        stars,
        crown,
        puzzleNumber
    };
}

function getShareResultsText() {
    const result = getShareResultDetails();
    const scoreLine = `${result.playerScore}/${result.solverScore === null ? "—" : result.solverScore}`;
    const starLine = "⭐".repeat(result.stars) + (result.crown ? " 👑" : "");
    return `Toucanagram #${result.puzzleNumber}\n\n${scoreLine}\n\n${starLine}\n\nPlay now at https://scrabble-puzzle.onrender.com/`;
}

function refreshShareResultsSummary() {
    const result = getShareResultDetails();
    const shareResultsTitle = document.getElementById("shareResultsTitle");
    const shareResultsSubtitle = document.getElementById("shareResultsSubtitle");
    const isRevealMode = shareResultsMode === "reveal";

    let popupMessage;
    if (isRevealMode) {
        popupMessage = {
            title: "Solver used",
            subtitle: "That is how the solver did it, \"Know your enemy and know yourself\" and all that jazz. But your best score is below to share."
        };
    } else if (result.stars === 3 && result.crown) {
        popupMessage = {
            title: "You dropped this...",
            subtitle: "I think it was the philosopher Cady Heron who once said, \"The limit does not exist\" and she was probably thinking about this exact moment."
        };
    } else if (result.stars === 3) {
        popupMessage = {
            title: "2 can play at this game",
            subtitle: "That was like watching the train station fight in The Matrix, only with a word-based puzzle game."
        };
    } else if (result.stars === 2) {
        popupMessage = {
            title: "🤏 This close",
            subtitle: "You're hot on the heels, within reach, down in extra time, this is your moment. They will make a plucky, underdog movie about this one day "
        };
    } else if (result.stars === 1) {
        popupMessage = {
            title: "Nice!",
            subtitle: "Channeling a bathroom decorator you used up your tiles, but now need to manifest your inner postman and move some letters around."
        };
    } else {
        popupMessage = {
            title: "Keep going",
            subtitle: "Coldplay was going to write a song about this. But a song about grey stars had less commercial potential than yellow. Don't be put off though, I believe in you."
        };
    }

    if (shareResultsTitle) {
        shareResultsTitle.textContent = popupMessage.title;
    }
    if (shareResultsSubtitle) {
        shareResultsSubtitle.textContent = popupMessage.subtitle;
        shareResultsSubtitle.hidden = false;
    }

    const shareResultsAchievements = document.querySelector(".share-results-achievements");
    if (shareResultsAchievements) {
        shareResultsAchievements.hidden = false;
    }

    const continuePlayingButton = document.getElementById("continuePlayingButton");
    if (continuePlayingButton) {
        continuePlayingButton.hidden = isRevealMode;
    }
    if (shareResultsSummary) {
        shareResultsSummary.textContent = `${result.playerScore}/${result.solverScore === null ? "—" : result.solverScore}`;
    }
    const starsElement = document.getElementById("shareResultsStars");
    if (starsElement) {
        starsElement.innerHTML = "";
        for (let i = 1; i <= 3; i++) {
            const star = document.createElement("span");
            const earned = i <= result.stars;
            star.className = earned ? "achievement-star earned" : "achievement-star";
            star.setAttribute("aria-hidden", "true");
            star.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="M57.23,14.5l5.87,13.97c1.13,2.69,3.67,4.54,6.58,4.78l15.1,1.26c6.93.58,9.73,9.21,4.47,13.75l-11.48,9.9c-2.21,1.91-3.18,4.89-2.51,7.73l3.47,14.75c1.59,6.77-5.76,12.1-11.7,8.5l-12.96-7.86c-2.5-1.52-5.63-1.52-8.13,0l-12.96,7.86c-5.94,3.6-13.29-1.73-11.7-8.5l3.47-14.75c.67-2.84-.3-5.83-2.51-7.73l-11.48-9.9c-5.26-4.54-2.46-13.17,4.47-13.75l15.1-1.26c2.91-.24,5.45-2.08,6.58-4.78l5.87-13.97c2.69-6.41,11.77-6.41,14.46,0Z" fill="currentColor"/></svg>';
            starsElement.appendChild(star);
        }
        starsElement.setAttribute("aria-label", `${result.stars} of 3 stars earned`);
    }
    const crownElement = document.getElementById("shareResultsCrown");
    if (crownElement) {
        crownElement.hidden = !result.crown;
    }
    if (shareResultsStatus) {
        shareResultsStatus.textContent = "";
    }
}

if (shareResultsButton && shareResultsDialog) {
    shareResultsButton.addEventListener("click", () => {
        shareResultsButton.classList.remove("needs-sharing");
        shareResultsMode = answerRevealed ? "reveal" : "normal";
        refreshShareResultsSummary();
        if (typeof shareResultsDialog.showModal === "function") {
            shareResultsDialog.showModal();
        } else {
            shareResultsDialog.setAttribute("open", "");
        }
    });

    if (closeShareResultsButton) {
        closeShareResultsButton.addEventListener("click", () => {
            if (typeof shareResultsDialog.close === "function") {
                shareResultsDialog.close();
            } else {
                shareResultsDialog.removeAttribute("open");
            }
        });
    }

    const continuePlayingButton = document.getElementById("continuePlayingButton");
    if (continuePlayingButton) {
        continuePlayingButton.addEventListener("click", () => {
            if (typeof shareResultsDialog.close === "function") {
                shareResultsDialog.close();
            } else {
                shareResultsDialog.removeAttribute("open");
            }
        });
    }

    shareResultsDialog.addEventListener("click", event => {
        if (event.target === shareResultsDialog) {
            if (typeof shareResultsDialog.close === "function") {
                shareResultsDialog.close();
            } else {
                shareResultsDialog.removeAttribute("open");
            }
        }
    });
}

if (copyShareResultsButton) {
    copyShareResultsButton.addEventListener("click", async () => {
        const textToCopy = shareResultsMode === "reveal"
            ? `Toucanagram #${getShareResultDetails().puzzleNumber}\nI didn't get it, but you might!\nTry at https://scrabble-puzzle.onrender.com/`
            : getShareResultsText();

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                const temporaryInput = document.createElement("textarea");
                temporaryInput.value = textToCopy;
                temporaryInput.setAttribute("readonly", "");
                temporaryInput.style.position = "absolute";
                temporaryInput.style.left = "-9999px";
                document.body.appendChild(temporaryInput);
                temporaryInput.select();
                const copied = document.execCommand("copy");
                temporaryInput.remove();
                if (!copied) throw new Error("Clipboard copy failed");
            }

            if (shareResultsStatus) {
                shareResultsStatus.textContent = "Results copied to clipboard!";
            }
        } catch (error) {
            if (shareResultsStatus) {
                shareResultsStatus.textContent = "Could not copy automatically. Please select and copy the results above.";
            }
        }
    });
}


/* ==================================================
INITIALISE
================================================== */

async function initialise() {

    /*
     * Read the generator settings
     * from the panel.
     */

    getGeneratorSettings();


    const isPreGenerationMode =
        typeof window !== "undefined" &&
        window.__SCRABBLE_PREGENERATE__ === true;

    await loadDictionary();

    if (isPreGenerationMode) {
        await loadSolverDictionary();
    }


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


    if (isPreGenerationMode) {
        await generateDailyPuzzle();
    } else {
        await loadDailyPuzzle();

        // Show How to Play once per browser on the player's first visit.
        try {
            const rulesSeenKey = "toucanagramsHowToPlaySeen";
            if (!localStorage.getItem(rulesSeenKey) && rulesDialog) {
                if (typeof rulesDialog.showModal === "function") {
                    rulesDialog.showModal();
                } else {
                    rulesDialog.setAttribute("open", "");
                }
                localStorage.setItem(rulesSeenKey, "true");
            }
        } catch (error) {
            // If storage is unavailable, still show the first-visit help popup.
            if (rulesDialog && !rulesDialog.open) {
                if (typeof rulesDialog.showModal === "function") {
                    rulesDialog.showModal();
                } else {
                    rulesDialog.setAttribute("open", "");
                }
            }
        }
    }
}


initialise();
