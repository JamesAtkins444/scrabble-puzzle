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

const boardElement = document.getElementById("board");
const tileRackElement = document.getElementById("tileRack");
const tileMessageElement = document.getElementById("tileMessage");
const wordListElement = document.getElementById("wordList");
const scoreValueElement = document.getElementById("scoreValue");
const scoreBonusElement = document.getElementById("scoreBonus");
const generateButton = document.getElementById("generateButton");
const newTilesButton = document.getElementById("newTilesButton");
const wordCountElement = document.getElementById("wordCount");
const gridSizeInput = document.getElementById("gridSizeInput");
const wordCountInput = document.getElementById("wordCountInput");
const initialWordLengthInput = document.getElementById(
    "initialWordLengthInput"
);
const generatorMessageElement = document.getElementById(
    "generatorMessage"
);


/* ==================================================
   UTILITY FUNCTIONS
================================================== */

function randomInt(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}


function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [result[i], result[j]] = [
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
   GENERATOR SETTINGS
================================================== */

function getGeneratorSettings() {
    let gridSize = parseInt(
        gridSizeInput?.value,
        10
    );

    let wordCount = parseInt(
        wordCountInput?.value,
        10
    );

    let initialWordLength = parseInt(
        initialWordLengthInput?.value,
        10
    );

    if (Number.isNaN(gridSize)) {
        gridSize = 7;
    }

    if (Number.isNaN(wordCount)) {
        wordCount = 3;
    }

    if (Number.isNaN(initialWordLength)) {
        initialWordLength = 6;
    }

    gridSize = Math.max(
        5,
        Math.min(12, gridSize)
    );

    wordCount = Math.max(
        1,
        Math.min(8, wordCount)
    );

    initialWordLength = Math.max(
        3,
        Math.min(gridSize, initialWordLength)
    );

    if (gridSizeInput) {
        gridSizeInput.value = gridSize;
    }

    if (wordCountInput) {
        wordCountInput.value = wordCount;
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
        const response = await fetch(
            "dictionary.txt"
        );

        if (!response.ok) {
            throw new Error(
                `Dictionary request failed: ${response.status}`
            );
        }

        const text = await response.text();

        dictionary = new Set(
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

            letter: word[i]
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
   WORD PLACEMENT
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
            targetBoard[
                cell.row
            ][
                cell.col
            ];

        if (existing !== "") {
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

    for (const cell of cells) {
        targetBoard[
            cell.row
        ][
            cell.col
        ] = cell.letter;
    }
}


/* ==================================================
   WORD READING / VALIDATION
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

        currentRow += deltaRow;
        currentCol += deltaCol;
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

            const startCol = col;
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
                    col: startCol,
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

            const startRow = row;
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
                    row: startRow,
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


/* ==================================================
   PUZZLE GENERATION
================================================== */

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
            (
                total,
                letter
            ) =>
                total +
                (
                    letterValues[
                        letter
                    ] ?? 0
                ),
            0
        );

    selectedRackTile = null;

    score = 0;

    board =
        createEmptyBoard();

    originalBoard =
        createEmptyBoard();

    puzzleWords = [];

    bonusSquares = {};

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

    const startingDirection =
        Math.random() < 0.5
            ? "horizontal"
            : "vertical";

    const maxStart =
        boardSize -
        startingWord.length;

    const startRow =
        startingDirection ===
        "horizontal"
            ? randomInt(
                0,
                boardSize - 1
            )
            : randomInt(
                0,
                maxStart
            );

    const startCol =
        startingDirection ===
        "horizontal"
            ? randomInt(
                0,
                maxStart
            )
            : randomInt(
                0,
                boardSize - 1
            );

    placeWordOnBoard(
        board,
        startingWord,
        startRow,
        startCol,
        startingDirection
    );

    puzzleWords.push({
        word: startingWord,
        row: startRow,
        col: startCol,
        direction:
            startingDirection
    });

    let attempts = 0;

    const maxAttempts =
        2000;

    while (
        puzzleWords.length <
            settings.wordCount &&
        attempts <
            maxAttempts
    ) {
        attempts++;

        const word =
            getRandomWord(
                3,
                5
            );

        if (!word) {
            break;
        }

        const direction =
            Math.random() < 0.5
                ? "horizontal"
                : "vertical";

        const placements = [];

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
                    canPlaceWord(
                        board,
                        word,
                        row,
                        col,
                        direction,
                        true
                    )
                ) {
                    placements.push({
                        row,
                        col
                    });
                }
            }
        }

        if (
            placements.length === 0
        ) {
            continue;
        }

        const shuffledPlacements =
            shuffle(
                placements
            );

        let placed = false;

        for (
            const placement
            of shuffledPlacements
        ) {
            if (
                placementCreatesValidWords(
                    board,
                    word,
                    placement.row,
                    placement.col,
                    direction
                )
            ) {
                placeWordOnBoard(
                    board,
                    word,
                    placement.row,
                    placement.col,
                    direction
                );

                puzzleWords.push({
                    word,
                    row:
                        placement.row,
                    col:
                        placement.col,
                    direction
                });

                placed = true;
                break;
            }
        }

        if (!placed) {
            continue;
        }
    }

    originalBoard =
        cloneBoard(
            board
        );

    generateBonusSquares();

    renderBoard();
    renderTileRack();
    updateWordList();
    updateScoreDisplay(
        0,
        ""
    );
}


/* ==================================================
   BONUS SQUARES
================================================== */

function getBonusSquare(
    row,
    col
) {
    return bonusSquares[
        keyForCell(
            row,
            col
        )
    ];
}


function generateBonusSquares() {
    bonusSquares = {};

    const bonusTypes = [
        {
            type: "double-letter",
            weight: 40,
            max: 3
        },
        {
            type: "triple-letter",
            weight: 25,
            max: 3
        },
        {
            type: "double-word",
            weight: 20,
            max: 2
        },
        {
            type: "triple-word",
            weight: 15,
            max: 2
        }
    ];

    const totalBonusSquares =
        randomInt(
            4,
            6
        );

    const candidates = [];

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
                board[row][col] !== ""
            ) {
                continue;
            }

            candidates.push({
                row,
                col
            });
        }
    }

    const shuffledCandidates =
        shuffle(
            candidates
        );

    const usedTypes = {
        "double-letter": 0,
        "triple-letter": 0,
        "double-word": 0,
        "triple-word": 0
    };

    function getWeightedType() {
        const available =
            bonusTypes.filter(
                bonus =>
                    usedTypes[
                        bonus.type
                    ] <
                    bonus.max
            );

        if (
            available.length === 0
        ) {
            return null;
        }

        const totalWeight =
            available.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.weight,
                0
            );

        let random =
            Math.random() *
            totalWeight;

        for (
            const item
            of available
        ) {
            random -=
                item.weight;

            if (
                random <= 0
            ) {
                return item.type;
            }
        }

        return available[
            available.length - 1
        ].type;
    }

    for (
        const candidate
        of shuffledCandidates
    ) {
        if (
            Object.keys(
                bonusSquares
            ).length >=
            totalBonusSquares
        ) {
            break;
        }

        const tooClose =
            Object.keys(
                bonusSquares
            ).some(key => {
                const [
                    usedRow,
                    usedCol
                ] =
                    key
                        .split(",")
                        .map(Number);

                const distance =
                    Math.abs(
                        usedRow -
                        candidate.row
                    ) +
                    Math.abs(
                        usedCol -
                        candidate.col
                    );

                return distance < 2;
            });

        if (tooClose) {
            continue;
        }

        const type =
            getWeightedType();

        if (!type) {
            break;
        }

        bonusSquares[
            keyForCell(
                candidate.row,
                candidate.col
            )
        ] = type;

        usedTypes[type]++;
    }
}


/* ==================================================
   BOARD RENDERING
================================================== */

function renderBoard() {
    if (!boardElement) {
        return;
    }

    boardElement.innerHTML = "";

    boardElement.style.gridTemplateColumns =
        `repeat(${boardSize}, 1fr)`;

    boardElement.style.gridTemplateRows =
        `repeat(${boardSize}, 1fr)`;

    boardElement.style.background =
        "transparent";

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

            const letter =
                board[row][col];

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

            if (
                originalBoard[
                    row
                ][
                    col
                ] !== ""
            ) {
                cell.classList.add(
                    "original-tile"
                );
            }

            if (bonus) {
                cell.classList.add(
                    bonus
                );
            }

            if (
                playerPlacedTiles[
                    key
                ]
            ) {
                const status =
                    getPlayerTileStatus(
                        row,
                        col
                    );

                if (
                    status ===
                    "valid"
                ) {
                    cell.classList.add(
                        "player-valid"
                    );
                } else if (
                    status ===
                    "invalid"
                ) {
                    cell.classList.add(
                        "player-invalid"
                    );
                } else if (
                    status ===
                    "isolated"
                ) {
                    cell.classList.add(
                        "player-isolated"
                    );
                }
            }

            if (letter) {
                const letterElement =
                    document.createElement(
                        "span"
                    );

                letterElement.className =
                    "tile-letter";

                letterElement.textContent =
                    letter;

                cell.appendChild(
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

                cell.appendChild(
                    valueElement
                );
            } else if (bonus) {
                const bonusElement =
                    document.createElement(
                        "span"
                    );

                bonusElement.className =
                    "bonus-label";

                bonusElement.textContent =
                    getBonusLabel(
                        bonus
                    );

                cell.appendChild(
                    bonusElement
                );
            }

            cell.addEventListener(
                "click",
                () =>
                    handleBoardCellClick(
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


function getBonusLabel(
    bonus
) {
    switch (bonus) {
        case "double-letter":
            return "2×L";

        case "triple-letter":
            return "3×L";

        case "double-word":
            return "2×W";

        case "triple-word":
            return "3×W";

        default:
            return "";
    }
}


/* ==================================================
   TILE DRAWING
================================================== */

function createTileBag() {
    const bag = [];

    Object.entries(
        letterDistribution
    ).forEach(
        ([letter, count]) => {
            for (
                let i = 0;
                i < count;
                i++
            ) {
                bag.push(
                    letter
                );
            }
        }
    );

    return bag;
}


function drawRandomTiles(
    count
) {
    const bag =
        createTileBag();

    const tiles = [];

    for (
        let i = 0;
        i < count &&
        bag.length > 0;
        i++
    ) {
        const index =
            randomInt(
                0,
                bag.length - 1
            );

        tiles.push(
            bag.splice(
                index,
                1
            )[0]
        );
    }

    return tiles;
}


/* ==================================================
   TILE RACK
================================================== */

function renderTileRack() {
    if (!tileRackElement) {
        return;
    }

    tileRackElement.innerHTML = "";

    playerTiles.forEach(
        (letter, index) => {
            const tile =
                document.createElement(
                    "button"
                );

            tile.type = "button";

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

            tile.dataset.index =
                index;

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
                () =>
                    selectRackTile(
                        index
                    )
            );

            tileRackElement.appendChild(
                tile
            );
        }
    );
}


function selectRackTile(
    index
) {
    if (
        index < 0 ||
        index >=
            playerTiles.length
    ) {
        return;
    }

    selectedRackTile =
        selectedRackTile === index
            ? null
            : index;

    renderTileRack();
}


/* ==================================================
   BOARD TILE INTERACTION
================================================== */

function handleBoardCellClick(
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
        returnTileToRack(
            row,
            col
        );

        return;
    }

    if (
        selectedRackTile ===
        null
    ) {
        return;
    }

    if (
        board[row][col] !== ""
    ) {
        return;
    }

    const letter =
        playerTiles[
            selectedRackTile
        ];

    if (!letter) {
        return;
    }

    board[row][col] =
        letter;

    playerPlacedTiles[key] = {
        letter,
        rackIndex:
            selectedRackTile
    };

    playerTiles.splice(
        selectedRackTile,
        1
    );

    selectedRackTile = null;

    validatePlayerTiles();

    renderBoard();
    renderTileRack();
    updateScore();
}


function returnTileToRack(
    row,
    col
) {
    const key =
        keyForCell(
            row,
            col
        );

    const tile =
        playerPlacedTiles[key];

    if (!tile) {
        return;
    }

    playerTiles.push(
        tile.letter
    );

    board[row][col] =
        "";

    delete playerPlacedTiles[
        key
    ];

    validatePlayerTiles();

    renderBoard();
    renderTileRack();
    updateScore();
}


/* ==================================================
   PLAYER TILE VALIDATION
================================================== */

function getConnectedPlayerCells() {
    const connected =
        new Set();

    const originalCells = [];

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
                originalCells.push(
                    keyForCell(
                        row,
                        col
                    )
                );
            }
        }
    }

    const queue =
        [...originalCells];

    originalCells.forEach(
        key =>
            connected.add(
                key
            )
    );

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
                neighbourRow,
                neighbourCol
            ]
            of neighbours
        ) {
            if (
                !isInsideBoard(
                    neighbourRow,
                    neighbourCol
                )
            ) {
                continue;
            }

            if (
                board[
                    neighbourRow
                ][
                    neighbourCol
                ] === ""
            ) {
                continue;
            }

            const neighbourKey =
                keyForCell(
                    neighbourRow,
                    neighbourCol
                );

            if (
                connected.has(
                    neighbourKey
                )
            ) {
                continue;
            }

            connected.add(
                neighbourKey
            );

            queue.push(
                neighbourKey
            );
        }
    }

    return connected;
}


function getPlayerTileStatus(
    row,
    col
) {
    const key =
        keyForCell(
            row,
            col
        );

    if (
        !playerPlacedTiles[
            key
        ]
    ) {
        return null;
    }

    const connected =
        getConnectedPlayerCells();

    if (
        !connected.has(
            key
        )
    ) {
        return "isolated";
    }

    const words =
        getAllWords(
            board
        );

    const playerWords =
        words.filter(
            item =>
                isWordAffectedByPlayerTiles(
                    item
                )
        );

    const valid =
        playerWords.every(
            item =>
                dictionary.has(
                    item.word
                )
        );

    return valid
        ? "valid"
        : "invalid";
}


function isWordAffectedByPlayerTiles(
    wordData
) {
    const cells =
        getWordCells(
            wordData.word,
            wordData.row,
            wordData.col,
            wordData.direction
        );

    return cells.some(
        cell =>
            playerPlacedTiles[
                keyForCell(
                    cell.row,
                    cell.col
                )
            ]
    );
}


function validatePlayerTiles() {
    const connected =
        getConnectedPlayerCells();

    for (
        const key in
        playerPlacedTiles
    ) {
        const tile =
            playerPlacedTiles[
                key
            ];

        tile.connected =
            connected.has(
                key
            );
    }
}


/* ==================================================
   WORD LIST
================================================== */

function updateWordList() {
    if (!wordListElement) {
        return;
    }

    wordListElement.innerHTML = "";

    puzzleWords.forEach(
        item => {
            const wordElement =
                document.createElement(
                    "div"
                );

            wordElement.className =
                "puzzle-word";

            wordElement.textContent =
                item.word;

            wordListElement.appendChild(
                wordElement
            );
        }
    );
}


/* ==================================================
   SCORING
================================================== */

function calculateWordBaseScore(
    word
) {
    return word
        .split("")
        .reduce(
            (
                total,
                letter
            ) =>
                total +
                (
                    letterValues[
                        letter
                    ] ?? 0
                ),
            0
        );
}


function calculateWordScoreAtPosition(
    wordData,
    targetBoard
) {
    const cells =
        getWordCells(
            wordData.word,
            wordData.row,
            wordData.col,
            wordData.direction
        );

    let score = 0;
    let wordMultiplier = 1;

    cells.forEach(
        cell => {
            const letter =
                targetBoard[
                    cell.row
                ][
                    cell.col
                ];

            if (!letter) {
                return;
            }

            let letterScore =
                letterValues[
                    letter
                ] ?? 0;

            const bonus =
                getBonusSquare(
                    cell.row,
                    cell.col
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

            score +=
                letterScore;
        }
    );

    return (
        score *
        wordMultiplier
    );
}


function calculateCurrentScore() {
    const words =
        getAllWords(
            board
        );

    let total = 0;

    words.forEach(
        wordData => {
            if (
                isOriginalPuzzleWord(
                    wordData
                )
            ) {
                return;
            }

            const affected =
                isWordAffectedByPlayerTiles(
                    wordData
                );

            if (!affected) {
                return;
            }

            if (
                !dictionary.has(
                    wordData.word
                )
            ) {
                return;
            }

            total +=
                calculateWordScoreAtPosition(
                    wordData,
                    board
                );
        }
    );

    const playerTileCount =
        Object.keys(
            playerPlacedTiles
        ).length;

    const allSevenUsed =
        playerTileCount === 7;

    if (allSevenUsed) {
        total += 50;
    }

    const singleWordSevenBonus =
        hasSevenTileSingleWordBonus();

    if (
        singleWordSevenBonus
    ) {
        total += 100;
    }

    return {
        total,
        allSevenUsed,
        singleWordSevenBonus
    };
}


function isOriginalPuzzleWord(
    wordData
) {
    return puzzleWords.some(
        puzzleWord =>
            puzzleWord.word ===
                wordData.word &&
            puzzleWord.row ===
                wordData.row &&
            puzzleWord.col ===
                wordData.col &&
            puzzleWord.direction ===
                wordData.direction
    );
}


function hasSevenTileSingleWordBonus() {
    const playerTileCount =
        Object.keys(
            playerPlacedTiles
        ).length;

    if (
        playerTileCount !== 7
    ) {
        return false;
    }

    const words =
        getAllWords(
            board
        );

    return words.some(
        wordData => {
            if (
                !dictionary.has(
                    wordData.word
                )
            ) {
                return false;
            }

            const cells =
                getWordCells(
                    wordData.word,
                    wordData.row,
                    wordData.col,
                    wordData.direction
                );

            const playerCount =
                cells.filter(
                    cell =>
                        playerPlacedTiles[
                            keyForCell(
                                cell.row,
                                cell.col
                            )
                        ]
                ).length;

            return (
                playerCount === 7
            );
        }
    );
}


function updateScore() {
    const result =
        calculateCurrentScore();

    let bonusText = "";

    if (
        result.singleWordSevenBonus
    ) {
        bonusText =
            "+100";
    } else if (
        result.allSevenUsed
    ) {
        bonusText =
            "+50";
    }

    updateScoreDisplay(
        result.total,
        bonusText
    );
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

    score = currentScore;
}


/* ==================================================
   HIDDEN SCORE
================================================== */

function calculateHiddenScore() {
    const counts = {
        doubleLetter: 0,
        tripleLetter: 0,
        doubleWord: 0,
        tripleWord: 0
    };

    Object.values(
        bonusSquares
    ).forEach(
        bonus => {
            if (
                bonus ===
                "double-letter"
            ) {
                counts.doubleLetter++;
            }

            if (
                bonus ===
                "triple-letter"
            ) {
                counts.tripleLetter++;
            }

            if (
                bonus ===
                "double-word"
            ) {
                counts.doubleWord++;
            }

            if (
                bonus ===
                "triple-word"
            ) {
                counts.tripleWord++;
            }
        }
    );

    const rackValue =
        startingRackValueTotal;

    const rackValueAvg =
        Math.round(
            rackValue / 7
        );

    const doubleLetterScore =
        2 *
        rackValueAvg *
        counts.doubleLetter;

    const tripleLetterScore =
        3 *
        rackValueAvg *
        counts.tripleLetter;

    const doubleWordScore =
        5 *
        counts.doubleWord;

    const tripleWordScore =
        10 *
        counts.doubleWord;

    const total =
        tripleWordScore +
        doubleWordScore +
        doubleLetterScore +
        tripleLetterScore +
        rackValue +
        50;

    return {
        ...counts,

        rackValue,
        rackValueAvg,

        doubleLetterScore,
        tripleLetterScore,

        doubleWordScore,
        tripleWordScore,

        total
    };
}


function updateHiddenScoreBreakdown() {
    const hidden =
        calculateHiddenScore();

    const elements = {
        doubleLetterCount:
            document.getElementById(
                "hiddenDoubleLetterCount"
            ),

        doubleLetterScore:
            document.getElementById(
                "hiddenDoubleLetterScore"
            ),

        tripleLetterCount:
            document.getElementById(
                "hiddenTripleLetterCount"
            ),

        tripleLetterScore:
            document.getElementById(
                "hiddenTripleLetterScore"
            ),

        doubleWordCount:
            document.getElementById(
                "hiddenDoubleWordCount"
            ),

        doubleWordScore:
            document.getElementById(
                "hiddenDoubleWordScore"
            ),

        tripleWordCount:
            document.getElementById(
                "hiddenTripleWordCount"
            ),

        tripleWordScore:
            document.getElementById(
                "hiddenTripleWordScore"
            ),

        rackValue:
            document.getElementById(
                "hiddenRackValue"
            ),

        rackValueAvg:
            document.getElementById(
                "hiddenRackValueAvg"
            ),

        total:
            document.getElementById(
                "hiddenScoreTotal"
            ) ||
            document.getElementById(
                "hiddenBreakdownTotal"
            )
    };

    if (
        elements.doubleLetterCount
    ) {
        elements.doubleLetterCount.textContent =
            hidden.doubleLetter;
    }

    if (
        elements.doubleLetterScore
    ) {
        elements.doubleLetterScore.textContent =
            hidden.doubleLetterScore;
    }

    if (
        elements.tripleLetterCount
    ) {
        elements.tripleLetterCount.textContent =
            hidden.tripleLetter;
    }

    if (
        elements.tripleLetterScore
    ) {
        elements.tripleLetterScore.textContent =
            hidden.tripleLetterScore;
    }

    if (
        elements.doubleWordCount
    ) {
        elements.doubleWordCount.textContent =
            hidden.doubleWord;
    }

    if (
        elements.doubleWordScore
    ) {
        elements.doubleWordScore.textContent =
            hidden.doubleWordScore;
    }

    if (
        elements.tripleWordCount
    ) {
        elements.tripleWordCount.textContent =
            hidden.tripleWord;
    }

    if (
        elements.tripleWordScore
    ) {
        elements.tripleWordScore.textContent =
            hidden.tripleWordScore;
    }

    if (
        elements.rackValue
    ) {
        elements.rackValue.textContent =
            hidden.rackValue;
    }

    if (
        elements.rackValueAvg
    ) {
        elements.rackValueAvg.textContent =
            hidden.rackValueAvg;
    }

    if (
        elements.total
    ) {
        elements.total.textContent =
            hidden.total;
    }
}


/* ==================================================
   NEW TILES
================================================== */

function drawNewTiles() {
    playerTiles =
        drawRandomTiles(7);

    startingRackValueTotal =
        playerTiles.reduce(
            (
                total,
                letter
            ) =>
                total +
                (
                    letterValues[
                        letter
                    ] ?? 0
                ),
            0
        );

    selectedRackTile = null;

    playerPlacedTiles = {};

    board =
        cloneBoard(
            originalBoard
        );

    score = 0;

    renderBoard();
    renderTileRack();
    updateScore();
    updateHiddenScoreBreakdown();
}


/* ==================================================
   EVENT HANDLERS
================================================== */

if (generateButton) {
    generateButton.addEventListener(
        "click",
        () => {
            if (isGenerating) {
                return;
            }

            isGenerating = true;

            try {
                generateBoard();
            } finally {
                isGenerating = false;
            }
        }
    );
}


if (newTilesButton) {
    newTilesButton.addEventListener(
        "click",
        () => {
            drawNewTiles();
        }
    );
}


/* ==================================================
   INITIALISE
================================================== */

async function initialise() {
    getGeneratorSettings();

    await loadDictionary();

    if (
        dictionary.size === 0
    ) {
        if (
            generatorMessageElement
        ) {
            generatorMessageElement.textContent =
                "Could not load dictionary.txt.";
        }

        return;
    }

    generateBoard();
}

initialise();
