let boardSize = 7;

let dictionary = new Set();

let board = [];
let originalBoard = [];

let playerPlacedTiles = {};
let playerTiles = [];
let initialRackTiles = [];
let bestSolution = null;
let answerRevealed = false;

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

// Stores the total value of the original 7-tile rack.
// This remains unchanged when tiles are placed on the board.
let startingRackValueTotal = 0;

let isGenerating = false;


/* ==================================================
PUZZLE GENERATOR SETTINGS
================================================== */

let generatorSettings = {
    gridSize: 8,
    wordCount: 4,
    initialWordLength: 5
};


/* ==================================================
DOM ELEMENTS
================================================== */

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
        drawRandomTiles(7);

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


    /*
     * Prefer spacing bonuses at least
     * Manhattan distance 2 apart.
     */

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


    /*
     * Fallback if there weren't enough
     * appropriately spaced cells.
     */

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


            /* --------------------------------
               LETTER TILE
            -------------------------------- */

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

    // Always 4 consonants
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

    // Shuffle the 7 tiles so the vowels aren't always at the front
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


/* ==================================================
BOARD CLICKING
================================================== */

function handleBoardClick(
    row,
    col
) {

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
     *     starting rack total / 7,
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

    return hiddenScore;
}


function updateScoreDisplay(
    currentScore,
    bonusText = ""
) {

    /*
     * Hidden Score
     *
     * Create the display element here so no other
     * HTML structure needs to be changed.
     */

    if (
        scoreValueElement
    ) {

        let hiddenScoreElement =
            document.getElementById(
                "hiddenScoreValue"
            );

        if (!hiddenScoreElement) {

            hiddenScoreElement =
                document.createElement(
                    "div"
                );

            hiddenScoreElement.id =
                "hiddenScoreValue";

            hiddenScoreElement.style.fontSize =
                "22px";

            hiddenScoreElement.style.fontWeight =
                "800";

            hiddenScoreElement.style.textAlign =
                "center";

            hiddenScoreElement.style.marginBottom =
                "6px";

            hiddenScoreElement.style.lineHeight =
                "1";

            const hiddenScoreLabel =
                document.createElement(
                    "span"
                );

            hiddenScoreLabel.textContent =
                "Hidden Score ";

            hiddenScoreLabel.style.fontSize =
                "12px";

            hiddenScoreLabel.style.fontWeight =
                "600";

            hiddenScoreLabel.style.opacity =
                "0.6";

            hiddenScoreLabel.style.marginRight =
                "6px";

            hiddenScoreElement.appendChild(
                hiddenScoreLabel
            );

            const scoreRowElement =
                scoreValueElement.parentNode;

            if (
                scoreRowElement.parentNode
            ) {

                scoreRowElement.parentNode.insertBefore(
                    hiddenScoreElement,
                    scoreRowElement
                );

            } else {

                scoreRowElement.insertBefore(
                    hiddenScoreElement,
                    scoreValueElement
                );
            }
        }

        /*
         * Keep the label and number separate so
         * only the number changes.
         */

        let hiddenScoreNumber =
            document.getElementById(
                "hiddenScoreNumber"
            );

        if (!hiddenScoreNumber) {

            hiddenScoreNumber =
                document.createElement(
                    "span"
                );

            hiddenScoreNumber.id =
                "hiddenScoreNumber";

            hiddenScoreElement.appendChild(
                hiddenScoreNumber
            );
        }

        const hiddenScore =
            calculateHiddenScore();

        hiddenScoreNumber.textContent =
            hiddenScore;

        scoreValueElement.textContent =
            currentScore;

        /* Update the three achievement stars beneath Hidden Score. */
        updateAchievementStars(
            currentScore,
            hiddenScore,
            bonusText.includes("7-tile")
        );
    }


    if (
        scoreBonusElement
    ) {

        scoreBonusElement.textContent =
            bonusText;
    }
}


function updateAchievementStars(
    currentScore,
    hiddenScore,
    earnedAllTilesBonus
) {
    let starsElement = document.getElementById("achievementStars");

    if (!starsElement) {
        starsElement = document.createElement("div");
        starsElement.id = "achievementStars";
        starsElement.className = "achievement-stars";
        starsElement.setAttribute("aria-label", "Puzzle achievement stars");

        const hiddenScoreElement = document.getElementById("hiddenScoreValue");
        if (hiddenScoreElement && hiddenScoreElement.parentNode) {
            hiddenScoreElement.insertAdjacentElement("afterend", starsElement);
        } else if (scoreValueElement && scoreValueElement.parentNode) {
            scoreValueElement.parentNode.insertBefore(starsElement, scoreValueElement);
        }
    }

    /*
     * The score thresholds determine the two- and three-star levels.
     * The all-tiles bonus independently earns the one-star level.
     */
    let earnedStars = 0;

    if (earnedAllTilesBonus) {
        earnedStars = 1;
    }

    if (currentScore > hiddenScore - 8 && currentScore <= hiddenScore) {
        earnedStars = Math.max(earnedStars, 2);
    }

    if (currentScore > hiddenScore) {
        earnedStars = 3;
    }

    starsElement.innerHTML = "";

    for (let i = 1; i <= 3; i++) {
        const star = document.createElement("span");
        const earned = i <= earnedStars;

        star.className = earned ? "achievement-star earned" : "achievement-star";
        star.textContent = "★";
        star.setAttribute("aria-hidden", "true");
        starsElement.appendChild(star);
    }

    starsElement.setAttribute(
        "aria-label",
        `${earnedStars} of 3 stars earned`
    );
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
        const key = keyForCell(cell.row, cell.col);
        const letter = candidateBoard[cell.row][cell.col];
        const value = letterValues[letter] || 0;
        let letterMultiplier = 1;

        // Premium squares only count when a tile is newly placed on them.
        if (newlyPlacedKeys.has(key)) {
            const bonus = getBonusSquare(cell.row, cell.col);
            if (bonus === "double-letter") letterMultiplier = 2;
            if (bonus === "triple-letter") letterMultiplier = 3;
            if (bonus === "double-word") wordMultiplier *= 2;
            if (bonus === "triple-word") wordMultiplier *= 3;
        }
        letterTotal += value * letterMultiplier;
    }
    return letterTotal * wordMultiplier;
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
    if (!allWordsAreValid(candidateBoard)) return null;

    // Score every word created or extended by the move, including cross-words.
    const scoringWords = getAllWords(candidateBoard).filter(info =>
        getWordCells(info.word, info.row, info.col, info.direction)
            .some(cell => newKeys.has(keyForCell(cell.row, cell.col)))
    );
    const mainWord = scoringWords.find(info =>
        info.direction === direction &&
        info.row === row && info.col === col
    );
    if (!mainWord || !dictionary.has(mainWord.word)) return null;

    let totalScore = scoringWords.reduce((sum, info) =>
        sum + scoreWordOnCandidateBoard(candidateBoard, info, newKeys), 0
    );

    // Match the game's 7-tile bonus rule.
    if (usedTiles === 7) {
        const mainWordUsesAllTiles = getWordCells(mainWord.word, mainWord.row, mainWord.col, mainWord.direction)
            .filter(cell => newKeys.has(keyForCell(cell.row, cell.col))).length === 7;
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
        scoringWords
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
            .filter(cell => keySet.has(keyForCell(cell.row, cell.col))).length === 7
    );

    // Keep the game's existing 7-tile bonus: +100 if one word uses all tiles,
    // otherwise +50 when all seven rack tiles are used in the same placement.
    total += usesAllTilesInOneWord ? 100 : 50;

    return { score: total, words: scoringWords };
}

function findBestMoveOnBoard(sourceBoard, rackCounts, searchBudget) {
    const directions = ["horizontal", "vertical"];
    const words = [...dictionary]
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
                    if (move && (!bestMove || move.score > bestMove.score)) {
                        bestMove = move;
                    }
                }
            }
        }
    }

    return { move: bestMove, checked, limitReached };
}

function findBestSolution() {
    if (!dictionary.size || !originalBoard.length || !initialRackTiles.length) return;

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
        allScoringWords.push(...move.scoringWords.map(info => ({ ...info, move: moveRecord.turn })));

        if (searchLimitReached) break;
    }

    const tilesUsed = allNewKeys.length;
    const tilesRemaining = initialRackTiles.length - tilesUsed;
    const fullSolution = tilesRemaining === 0;

    bestSolution = tilesUsed > 0 ? {
        board: cloneBoard(currentBoard),
        newKeys: allNewKeys,
        score: totalScore,
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
    if (bestScoreMessageElement) {
        if (!bestSolution) {
            bestScoreMessageElement.textContent = "No legal move was found for these tiles on this board.";
        } else {
            const turnSummary = moves.map(move =>
                `Turn ${move.turn}: ${move.word} (+${move.score}, ${move.usedTiles} tile${move.usedTiles === 1 ? "" : "s"})`
            ).join(" · ");
            bestScoreMessageElement.textContent = fullSolution
                ? `All ${initialRackTiles.length} tiles placed across ${moves.length} turns. ${turnSummary}`
                : searchLimitReached
                    ? `Search limit reached after ${tilesUsed} tile${tilesUsed === 1 ? "" : "s"} placed; ${tilesRemaining} remain. ${turnSummary}`
                    : `No further legal move was found after placing ${tilesUsed} of ${initialRackTiles.length} tiles; ${tilesRemaining} remain. ${turnSummary}`;
        }
    }
}

function revealBestAnswer() {
    if (!bestSolution || !bestSolution.newKeys.length) return;

    board = cloneBoard(bestSolution.board);
    playerPlacedTiles = {};

    for (const key of bestSolution.newKeys) {
        const [row, col] = key.split(",").map(Number);
        playerPlacedTiles[key] = { letter: board[row][col], row, col };
    }

    playerTiles = [];
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
    if (tileMessageElement) {
        const moveSummary = bestSolution.moves.map(move =>
            `Turn ${move.turn}: ${move.word} (+${move.score})`
        ).join("; ");
        tileMessageElement.textContent = bestSolution.fullSolution
            ? `Solver answer revealed: all ${initialRackTiles.length} tiles placed across ${bestSolution.moves.length} turns for ${bestSolution.score} total points. ${moveSummary}`
            : `Solver answer revealed: ${bestSolution.tilesUsed} of ${initialRackTiles.length} tiles placed for ${bestSolution.score} total points. ${bestSolution.tilesRemaining} tile${bestSolution.tilesRemaining === 1 ? "" : "s"} could not be placed. ${moveSummary}`;
        tileMessageElement.className = bestSolution.fullSolution
            ? "tile-message success"
            : "tile-message";
    }
}

if (revealAnswerButton) {
    revealAnswerButton.addEventListener("click", revealBestAnswer);
}


/* ==================================================
NEW PUZZLE BUTTON
================================================== */

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
INITIALISE
================================================== */

async function initialise() {

    /*
     * Read the generator settings
     * from the panel.
     */

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
