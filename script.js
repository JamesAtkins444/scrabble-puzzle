```javascript
/* =========================================
   SCRABBLE PUZZLE
   ========================================= */


/* =========================================
   BOARD SETTINGS
   ========================================= */

const BOARD_SIZE = 15;

const CENTRE_ROW = 7;

const CENTRE_COL = 7;

const TARGET_WORD_COUNT = 12;


/* =========================================
   WORD LENGTH SETTINGS
   ========================================= */

/*
   Words deliberately generated after
   the starting word must be between
   3 and 8 letters.
*/

const MIN_WORD_LENGTH = 3;

const MAX_WORD_LENGTH = 8;


/*
   The first word must be at least
   11 letters long.
*/

const STARTING_WORD_MIN_LENGTH = 11;


/* =========================================
   SCRABBLE TILE VALUES
   ========================================= */

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


/* =========================================
   SCRABBLE FUNCTIONS
   ========================================= */

function getTotalTileCount() {

    let total = 0;

    for (const letter in SCRABBLE_TILES) {

        total += SCRABBLE_TILES[letter].count;

    }

    return total;

}


function getLetterValue(letter) {

    const upperLetter =
        letter.toUpperCase();

    if (SCRABBLE_TILES[upperLetter]) {

        return SCRABBLE_TILES[upperLetter].value;

    }

    return 0;

}


function calculateWordScore(word) {

    let score = 0;

    for (const letter of word) {

        score += getLetterValue(letter);

    }

    return score;

}


/* =========================================
   HTML ELEMENTS
   ========================================= */

const boardElement =
    document.getElementById("board");


const generateButton =
    document.getElementById("generateButton");


const wordCountElement =
    document.getElementById("wordCount");


const wordListElement =
    document.getElementById("wordList");


/* =========================================
   GAME DATA
   ========================================= */

let board = [];

let placedWords = [];

let dictionary = [];

let dictionarySet = new Set();


/* =========================================
   CREATE EMPTY BOARD
   ========================================= */

function createEmptyBoard() {

    board = [];

    for (
        let row = 0;
        row < BOARD_SIZE;
        row++
    ) {

        board[row] = [];

        for (
            let col = 0;
            col < BOARD_SIZE;
            col++
        ) {

            board[row][col] = null;

        }

    }

}


/* =========================================
   CHECK BOARD POSITION
   ========================================= */

function isInsideBoard(row, col) {

    return (

        row >= 0 &&
        row < BOARD_SIZE &&
        col >= 0 &&
        col < BOARD_SIZE

    );

}


/* =========================================
   GET BOARD POSITION
   ========================================= */

function getPosition(
    row,
    col
) {

    if (
        !isInsideBoard(
            row,
            col
        )
    ) {

        return null;

    }

    return board[row][col];

}


/* =========================================
   COPY BOARD
   ========================================= */

function copyBoard(sourceBoard) {

    return sourceBoard.map(
        row => [...row]
    );

}


/* =========================================
   PLACE WORD
   ========================================= */

function putWord(
    word,
    row,
    col,
    direction
) {

    for (
        let i = 0;
        i < word.length;
        i++
    ) {

        let currentRow = row;

        let currentCol = col;


        if (direction === "horizontal") {

            currentCol += i;

        } else {

            currentRow += i;

        }


        board[currentRow][currentCol] =
            word[i];

    }

}


/* =========================================
   READ A WORD
   ========================================= */

function readWord(
    row,
    col,
    direction
) {

    let word = "";

    let currentRow = row;

    let currentCol = col;


    while (
        isInsideBoard(
            currentRow,
            currentCol
        )
        &&
        board[currentRow][currentCol]
    ) {

        word +=
            board[currentRow][currentCol];


        if (direction === "horizontal") {

            currentCol++;

        } else {

            currentRow++;

        }

    }


    return word;

}


/* =========================================
   GET ALL WORDS ON BOARD
   ========================================= */

function getAllBoardWords() {

    const words = [];


    /* ---------------------------------
       HORIZONTAL WORDS
    --------------------------------- */

    for (
        let row = 0;
        row < BOARD_SIZE;
        row++
    ) {

        let col = 0;

        while (
            col < BOARD_SIZE
        ) {

            if (
                board[row][col]
            ) {

                let startCol = col;

                let word = "";


                while (
                    col < BOARD_SIZE &&
                    board[row][col]
                ) {

                    word +=
                        board[row][col];

                    col++;

                }


                if (word.length >= 2) {

                    words.push({

                        word: word,

                        direction: "horizontal",

                        row: row,

                        col: startCol

                    });

                }

            } else {

                col++;

            }

        }

    }


    /* ---------------------------------
       VERTICAL WORDS
    --------------------------------- */

    for (
        let col = 0;
        col < BOARD_SIZE;
        col++
    ) {

        let row = 0;

        while (
            row < BOARD_SIZE
        ) {

            if (
                board[row][col]
            ) {

                let startRow = row;

                let word = "";


                while (
                    row < BOARD_SIZE &&
                    board[row][col]
                ) {

                    word +=
                        board[row][col];

                    row++;

                }


                if (word.length >= 2) {

                    words.push({

                        word: word,

                        direction: "vertical",

                        row: startRow,

                        col: col

                    });

                }

            } else {

                row++;

            }

        }

    }


    return words;

}


/* =========================================
   CHECK BOARD VALIDITY
   ========================================= */

function isBoardValid() {

    const words =
        getAllBoardWords();


    /*
       Every connected sequence of
       2 or more letters must exist
       in the dictionary.
    */

    for (const item of words) {

        if (
            item.word.length >= 2 &&
            !dictionarySet.has(
                item.word
            )
        ) {

            return false;

        }

    }


    return true;

}


/* =========================================
   GET EXISTING LETTERS
   ========================================= */

function getExistingLetters() {

    const letters = [];


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

            if (
                board[row][col]
            ) {

                letters.push({

                    row: row,

                    col: col,

                    letter:
                        board[row][col]

                });

            }

        }

    }


    return letters;

}


/* =========================================
   CHECK IF CELL IS PART OF WORD
   ========================================= */

function isCellInWord(
    row,
    col,
    startRow,
    startCol,
    wordLength,
    direction
) {

    for (
        let i = 0;
        i < wordLength;
        i++
    ) {

        let checkRow =
            startRow;

        let checkCol =
            startCol;


        if (
            direction === "horizontal"
        ) {

            checkCol += i;

        } else {

            checkRow += i;

        }


        if (
            checkRow === row &&
            checkCol === col
        ) {

            return true;

        }

    }


    return false;

}


/* =========================================
   GET DIRECTION OF EXISTING WORD
   ========================================= */

function getExistingWordDirection(
    row,
    col
) {

    let horizontal = false;

    let vertical = false;


    if (
        col > 0 &&
        board[row][col - 1]
    ) {

        horizontal = true;

    }


    if (
        col < BOARD_SIZE - 1 &&
        board[row][col + 1]
    ) {

        horizontal = true;

    }


    if (
        row > 0 &&
        board[row - 1][col]
    ) {

        vertical = true;

    }


    if (
        row < BOARD_SIZE - 1 &&
        board[row + 1][col]
    ) {

        vertical = true;

    }


    if (
        horizontal &&
        !vertical
    ) {

        return "horizontal";

    }


    if (
        vertical &&
        !horizontal
    ) {

        return "vertical";

    }


    if (
        horizontal &&
        vertical
    ) {

        return "both";

    }


    return null;

}


/* =========================================
   TRY TO PLACE WORD
   ========================================= */

function tryPlaceWord(
    word,
    row,
    col,
    direction
) {

    /*
       Candidate words must be
       between 3 and 8 letters.
    */

    if (
        word.length <
            MIN_WORD_LENGTH ||
        word.length >
            MAX_WORD_LENGTH
    ) {

        return false;

    }


    /*
       Word must be in dictionary.
    */

    if (
        !dictionarySet.has(word)
    ) {

        return false;

    }


    /*
       Make sure word fits.
    */

    if (
        direction === "horizontal"
    ) {

        if (
            col + word.length >
            BOARD_SIZE
        ) {

            return false;

        }

    } else {

        if (
            row + word.length >
            BOARD_SIZE
        ) {

            return false;

        }

    }


    let hasOverlap = false;

    let addsNewTile = false;


    /*
       Check every tile.
    */

    for (
        let i = 0;
        i < word.length;
        i++
    ) {

        let currentRow = row;

        let currentCol = col;


        if (
            direction === "horizontal"
        ) {

            currentCol += i;

        } else {

            currentRow += i;

        }


        const existingLetter =
            board[currentRow][currentCol];


        if (
            existingLetter
        ) {

            /*
               Existing letter must
               match the new letter.
            */

            if (
                existingLetter !==
                word[i]
            ) {

                return false;

            }


            hasOverlap = true;

        } else {

            addsNewTile = true;

        }

    }


    /*
       New words must cross an
       existing word.
    */

    if (!hasOverlap) {

        return false;

    }


    /*
       Must actually add letters.
    */

    if (!addsNewTile) {

        return false;

    }


    /*
       Save board before testing.
    */

    const oldBoard =
        copyBoard(board);


    /*
       Place the word.
    */

    putWord(
        word,
        row,
        col,
        direction
    );


    /*
       Make sure every resulting
       board word is valid.
    */

    if (
        !isBoardValid()
    ) {

        board = oldBoard;

        return false;

    }


    /*
       Make sure we haven't already
       added this word.
    */

    for (const existingWord of placedWords) {

        if (
            existingWord.word === word
        ) {

            board = oldBoard;

            return false;

        }

    }


    /*
       Store word.
    */

    placedWords.push({

        word: word,

        row: row,

        col: col,

        direction: direction

    });


    return true;

}


/* =========================================
   SHUFFLE ARRAY
   ========================================= */

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


/* =========================================
   FIND A CROSSING WORD
   ========================================= */

function findCrossingWord() {

    const existingLetters =
        getExistingLetters();


    if (
        existingLetters.length === 0
    ) {

        return false;

    }


    /*
       Randomise existing letters
       so boards don't always grow
       in exactly the same way.
    */

    shuffle(existingLetters);


    for (
        const existingCell
        of existingLetters
    ) {

        const letter =
            existingCell.letter;


        /*
           Find dictionary words
           containing this letter.
        */

        let candidates =
            dictionary.filter(
                word =>

                    word.length >=
                        MIN_WORD_LENGTH &&

                    word.length <=
                        MAX_WORD_LENGTH &&

                    word.includes(letter)

            );


        shuffle(candidates);


        /*
           Try a limited number of
           candidates at this letter.
        */

        const maxCandidates =
            Math.min(
                candidates.length,
                80
            );


        for (
            let i = 0;
            i < maxCandidates;
            i++
        ) {

            const word =
                candidates[i];


            /*
               Try every occurrence
               of the crossing letter
               in the candidate word.
            */

            for (
                let letterIndex = 0;
                letterIndex < word.length;
                letterIndex++
            ) {

                if (
                    word[letterIndex] !==
                    letter
                ) {

                    continue;

                }


                /*
                   New word should preferably
                   run perpendicular to the
                   existing word.
                */

                const existingDirection =
                    getExistingWordDirection(
                        existingCell.row,
                        existingCell.col
                    );


                let directions = [];


                if (
                    existingDirection ===
                    "horizontal"
                ) {

                    directions = [
                        "vertical"
                    ];

                } else if (
                    existingDirection ===
                    "vertical"
                ) {

                    directions = [
                        "horizontal"
                    ];

                } else {

                    directions = [
                        "horizontal",
                        "vertical"
                    ];

                }


                shuffle(directions);


                for (
                    const direction
                    of directions
                ) {

                    let startRow =
                        existingCell.row;

                    let startCol =
                        existingCell.col;


                    if (
                        direction ===
                        "horizontal"
                    ) {

                        startCol -=
                            letterIndex;

                    } else {

                        startRow -=
                            letterIndex;

                    }


                    if (
                        tryPlaceWord(
                            word,
                            startRow,
                            startCol,
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


/* =========================================
   GET STARTING WORD
   ========================================= */

function getStartingWord() {

    const candidates =
        dictionary.filter(
            word =>

                word.length >=
                STARTING_WORD_MIN_LENGTH &&

                word.length <=
                BOARD_SIZE
        );


    if (
        candidates.length === 0
    ) {

        return null;

    }


    /*
       Pick a random starting word.
    */

    const index =
        Math.floor(
            Math.random() *
            candidates.length
        );


    return candidates[index];

}


/* =========================================
   PLACE FIRST WORD
   ========================================= */

function placeFirstWord(word) {

    const startCol =
        CENTRE_COL -
        Math.floor(
            word.length / 2
        );


    /*
       Make sure the word fits.
    */

    if (
        startCol < 0 ||
        startCol + word.length >
        BOARD_SIZE
    ) {

        return false;

    }


    /*
       Place horizontally through
       the centre row.
    */

    putWord(
        word,
        CENTRE_ROW,
        startCol,
        "horizontal"
    );


    placedWords.push({

        word: word,

        row: CENTRE_ROW,

        col: startCol,

        direction: "horizontal"

    });


    return true;

}


/* =========================================
   GENERATE BOARD
   ========================================= */

function generateBoard() {

    createEmptyBoard();

    placedWords = [];


    /*
       Find a valid starting word.
    */

    const startingWord =
        getStartingWord();


    if (!startingWord) {

        console.error(
            "No starting word of 11 letters or more was found."
        );

        alert(
            "No suitable starting word was found in dictionary.txt."
        );

        return;

    }


    /*
       Place first word.
    */

    if (
        !placeFirstWord(
            startingWord
        )
    ) {

        console.error(
            "Could not place starting word."
        );

        return;

    }


    /*
       Add crossing words.
    */

    let attempts = 0;

    const MAX_ATTEMPTS = 500;


    while (
        placedWords.length <
            TARGET_WORD_COUNT &&
        attempts <
            MAX_ATTEMPTS
    ) {

        const before =
            placedWords.length;


        findCrossingWord();


        attempts++;


        /*
           If nothing was added,
           continue trying different
           random combinations.
        */

        if (
            placedWords.length ===
            before
        ) {

            continue;

        }

    }


    console.log(
        "Board generated."
    );


    console.log(
        "Words:",
        placedWords
    );


    console.log(
        "Word count:",
        placedWords.length
    );


    displayBoard();

    displayWordList();

}


/* =========================================
   DISPLAY BOARD
   ========================================= */

function displayBoard() {

    boardElement.innerHTML = "";


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

            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "cell";


            const letter =
                board[row][col];


            if (letter) {

                cell.classList.add(
                    "letter"
                );


                /*
                   Large letter
                */

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


                /*
                   Scrabble value
                */

                const valueElement =
                    document.createElement(
                        "span"
                    );


                valueElement.className =
                    "tile-value";


                valueElement.textContent =
                    getLetterValue(
                        letter
                    );


                cell.appendChild(
                    valueElement
                );

            }


            boardElement.appendChild(
                cell
            );

        }

    }

}


/* =========================================
   DISPLAY WORD LIST
   ========================================= */

function displayWordList() {

    wordListElement.innerHTML = "";


    wordCountElement.textContent =
        placedWords.length +
        " words";


    /*
       Sort words by length,
       longest first.
    */

    const sortedWords =
        [...placedWords].sort(
            (a, b) =>
                b.word.length -
                a.word.length
        );


    for (
        const item
        of sortedWords
    ) {

        const wordElement =
            document.createElement(
                "div"
            );


        wordElement.className =
            "word";


        const score =
            calculateWordScore(
                item.word
            );


        wordElement.textContent =
            item.word +
            " (" +
            score +
            ")";


        wordListElement.appendChild(
            wordElement
        );

    }

}


/* =========================================
   LOAD DICTIONARY
   ========================================= */

async function loadDictionary() {

    try {

        const response =
            await fetch(
                "dictionary.txt"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Could not load dictionary.txt"
            );

        }


        const text =
            await response.text();


        /*
           Split dictionary into
           individual lines.
        */

        const words =
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
                        /^[A-Z]+$/.test(word)
                )
                .filter(
                    word =>
                        word.length >= 2
                );


        /*
           Remove duplicates.
        */

        dictionary =
            [...new Set(words)];


        dictionarySet =
            new Set(dictionary);


        console.log(
            "Dictionary loaded:",
            dictionary.length,
            "words"
        );


        /*
           Check that we have
           suitable starting words.
        */

        const startingWords =
            dictionary.filter(
                word =>
                    word.length >=
                    STARTING_WORD_MIN_LENGTH &&
                    word.length <=
                    BOARD_SIZE
            );


        console.log(
            "Starting words available:",
            startingWords.length
        );


        if (
            startingWords.length === 0
        ) {

            alert(
                "dictionary.txt does not contain any words between 11 and 15 letters."
            );

            return;

        }


        /*
           Generate the first board.
        */

        generateBoard();

    }

    catch (error) {

        console.error(
            error
        );


        alert(
            "There was a problem loading dictionary.txt. Check that dictionary.txt is in the same folder as index.html."
        );

    }

}


/* =========================================
   GENERATE BUTTON
   ========================================= */

generateButton.addEventListener(
    "click",
    generateBoard
);


/* =========================================
   START
   ========================================= */

loadDictionary();
```
