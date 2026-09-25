const BOARD_SIZE = 10;

const CENTRE_ROW = 4;
const CENTRE_COL = 4;

const TARGET_WORD_COUNT = 12;

const MIN_WORD_LENGTH = 2;
const MAX_WORD_LENGTH = 8;


/* --------------------------------
   HTML ELEMENTS
-------------------------------- */

const boardElement =
    document.getElementById("board");

const generateButton =
    document.getElementById("generateButton");

const wordCountElement =
    document.getElementById("wordCount");

const wordListElement =
    document.getElementById("wordList");


/* --------------------------------
   GAME DATA
-------------------------------- */

let board = [];

let placedWords = [];

let dictionary = [];

let dictionarySet = new Set();


/* --------------------------------
   CREATE EMPTY BOARD
-------------------------------- */

function createEmptyBoard() {

    board = [];

    for (let row = 0; row < BOARD_SIZE; row++) {

        board[row] = [];

        for (let col = 0; col < BOARD_SIZE; col++) {

            board[row][col] = null;

        }

    }

}


/* --------------------------------
   DISPLAY BOARD
-------------------------------- */

function displayBoard() {

    boardElement.innerHTML = "";


    for (let row = 0; row < BOARD_SIZE; row++) {

        for (let col = 0; col < BOARD_SIZE; col++) {

            const cell =
                document.createElement("div");

            cell.className = "cell";


            const letter =
                board[row][col];


            if (letter) {

                cell.textContent = letter;

                cell.classList.add("letter");

            }


            boardElement.appendChild(cell);

        }

    }

}


/* --------------------------------
   DISPLAY WORD LIST
-------------------------------- */

function displayWords() {

    wordCountElement.textContent =
        `${placedWords.length} words`;


    wordListElement.innerHTML = "";


    placedWords.forEach(wordData => {

        const element =
            document.createElement("span");

        element.className = "word";

        element.textContent =
            wordData.word;

        wordListElement.appendChild(element);

    });

}


/* --------------------------------
   BOARD POSITION
-------------------------------- */

function isInsideBoard(row, col) {

    return (
        row >= 0 &&
        row < BOARD_SIZE &&
        col >= 0 &&
        col < BOARD_SIZE
    );

}


/* --------------------------------
   GET POSITION
-------------------------------- */

function getPosition(
    row,
    col,
    direction,
    index
) {

    if (direction === "horizontal") {

        return {
            row: row,
            col: col + index
        };

    }

    return {
        row: row + index,
        col: col
    };

}


/* --------------------------------
   COPY BOARD
-------------------------------- */

function copyBoard() {

    return board.map(
        row => [...row]
    );

}


/* --------------------------------
   PUT WORD ON BOARD
-------------------------------- */

function putWordOnBoard(
    testBoard,
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

        const position =
            getPosition(
                row,
                col,
                direction,
                i
            );


        testBoard[
            position.row
        ][
            position.col
        ] = word[i];

    }

}


/* --------------------------------
   GET ALL WORDS
-------------------------------- */

function getAllBoardWords(testBoard) {

    const words = [];


    /* ----------------------------
       HORIZONTAL
    ---------------------------- */

    for (
        let row = 0;
        row < BOARD_SIZE;
        row++
    ) {

        let col = 0;


        while (col < BOARD_SIZE) {

            if (!testBoard[row][col]) {

                col++;

                continue;

            }


            let word = "";


            while (
                col < BOARD_SIZE &&
                testBoard[row][col]
            ) {

                word +=
                    testBoard[row][col];

                col++;

            }


            if (word.length >= 2) {

                words.push(word);

            }

        }

    }


    /* ----------------------------
       VERTICAL
    ---------------------------- */

    for (
        let col = 0;
        col < BOARD_SIZE;
        col++
    ) {

        let row = 0;


        while (row < BOARD_SIZE) {

            if (!testBoard[row][col]) {

                row++;

                continue;

            }


            let word = "";


            while (
                row < BOARD_SIZE &&
                testBoard[row][col]
            ) {

                word +=
                    testBoard[row][col];

                row++;

            }


            if (word.length >= 2) {

                words.push(word);

            }

        }

    }


    return words;

}


/* --------------------------------
   CHECK BOARD
-------------------------------- */

function isEntireBoardValid(testBoard) {

    const words =
        getAllBoardWords(testBoard);


    for (const word of words) {

        if (!dictionarySet.has(word)) {

            return false;

        }

    }


    return true;

}


/* --------------------------------
   GET EXISTING LETTERS
-------------------------------- */

function getExistingLetters() {

    const positions = [];


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

            if (board[row][col]) {

                positions.push({

                    row: row,

                    col: col,

                    letter: board[row][col]

                });

            }

        }

    }


    return positions;

}


/* --------------------------------
   CHECK WORD FIT
-------------------------------- */

function wordFits(
    word,
    row,
    col,
    direction
) {

    let newTiles = 0;


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


        /* Must stay on board */

        if (
            !isInsideBoard(
                position.row,
                position.col
            )
        ) {

            return {
                fits: false,
                newTiles: 0
            };

        }


        const existingLetter =
            board[
                position.row
            ][
                position.col
            ];


        /*
           Existing letter must match.
        */

        if (
            existingLetter &&
            existingLetter !== word[i]
        ) {

            return {
                fits: false,
                newTiles: 0
            };

        }


        if (!existingLetter) {

            newTiles++;

        }

    }


    /*
       A word must actually add
       at least one new tile.
    */

    if (newTiles === 0) {

        return {
            fits: false,
            newTiles: 0
        };

    }


    return {
        fits: true,
        newTiles: newTiles
    };

}


/* --------------------------------
   TRY WORD AT POSITION
-------------------------------- */

function tryPlaceWord(
    word,
    row,
    col,
    direction
) {

    word =
        word.toUpperCase();


    if (
        word.length < MIN_WORD_LENGTH ||
        word.length > MAX_WORD_LENGTH
    ) {

        return false;

    }


    if (!dictionarySet.has(word)) {

        return false;

    }


    const fit =
        wordFits(
            word,
            row,
            col,
            direction
        );


    if (!fit.fits) {

        return false;

    }


    const testBoard =
        copyBoard();


    putWordOnBoard(
        testBoard,
        word,
        row,
        col,
        direction
    );


    /*
       The ENTIRE board must be valid.
    */

    if (
        !isEntireBoardValid(
            testBoard
        )
    ) {

        return false;

    }


    /*
       Success.
    */

    board =
        testBoard;


    placedWords.push({

        word: word,

        row: row,

        col: col,

        direction: direction

    });


    return true;

}


/* --------------------------------
   FIND WORDS CONTAINING LETTER
-------------------------------- */

function getWordsContainingLetter(letter) {

    const results = [];


    for (const word of dictionary) {

        if (
            word.includes(letter)
        ) {

            results.push(word);

        }

    }


    return results;

}


/* --------------------------------
   SHUFFLE ARRAY
-------------------------------- */

function shuffle(array) {

    const copy = [...array];


    for (
        let i = copy.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            copy[i],
            copy[j]
        ] =
        [
            copy[j],
            copy[i]
        ];

    }


    return copy;

}


/* --------------------------------
   TRY TO ADD A CROSSWORD
-------------------------------- */

function tryAddCrossword() {

    /*
       Get every letter already
       on the board.
    */

    const existingLetters =
        getExistingLetters();


    if (
        existingLetters.length === 0
    ) {

        return false;

    }


    /*
       Randomise which existing
       letters we try first.
    */

    const shuffledLetters =
        shuffle(existingLetters);


    /*
       Try each existing letter.
    */

    for (
        const existing of shuffledLetters
    ) {

        /*
           Find dictionary words
           containing this letter.
        */

        const possibleWords =
            getWordsContainingLetter(
                existing.letter
            );


        /*
           Randomise the words.
        */

        const shuffledWords =
            shuffle(possibleWords);


        /*
           Don't try thousands of words
           every time.
        */

        const wordsToTry =
            shuffledWords.slice(0, 100);


        for (
            const word of wordsToTry
        ) {

            /*
               Find every occurrence
               of the matching letter
               inside the new word.
            */

            for (
                let i = 0;
                i < word.length;
                i++
            ) {

                if (
                    word[i] !==
                    existing.letter
                ) {

                    continue;

                }


                /*
                   --------------------------------
                   HORIZONTAL
                   --------------------------------

                   Put the matching letter
                   directly over the existing
                   letter.
                */

                const horizontalRow =
                    existing.row;

                const horizontalCol =
                    existing.col - i;


                if (
                    tryPlaceWord(
                        word,
                        horizontalRow,
                        horizontalCol,
                        "horizontal"
                    )
                ) {

                    return true;

                }


                /*
                   --------------------------------
                   VERTICAL
                   --------------------------------
                */

                const verticalRow =
                    existing.row - i;

                const verticalCol =
                    existing.col;


                if (
                    tryPlaceWord(
                        word,
                        verticalRow,
                        verticalCol,
                        "vertical"
                    )
                ) {

                    return true;

                }

            }

        }

    }


    return false;

}


/* --------------------------------
   GENERATE BOARD
-------------------------------- */

function generateBoard() {

    /*
       Start fresh.
    */

    createEmptyBoard();

    placedWords = [];


    /*
       --------------------------------
       FIRST WORD
       --------------------------------

       SCRABBLE crosses the centre
       area of the board.
    */

    const firstWord =
        "SCRABBLE";


    const firstRow =
        CENTRE_ROW;


    const firstCol =
        CENTRE_COL -
        Math.floor(firstWord.length / 2);


    placeFirstWord(
        firstWord,
        firstRow,
        firstCol
    );


    displayBoard();

    displayWords();


    /*
       Generate crosswords gradually.
    */

    let failedAttempts = 0;


    function addNextWord() {

        /*
           Stop when we have enough
           words.
        */

        if (
            placedWords.length >=
            TARGET_WORD_COUNT
        ) {

            console.log(
                "Board complete:",
                placedWords.length,
                "words"
            );

            return;

        }


        /*
           Try several crossword
           placements.
        */

        let added = false;


        for (
            let attempt = 0;
            attempt < 20;
            attempt++
        ) {

            if (
                tryAddCrossword()
            ) {

                added = true;

                break;

            }

        }


        if (added) {

            failedAttempts = 0;

            displayBoard();

            displayWords();

        }
        else {

            failedAttempts++;

        }


        /*
           If we can't find any more
           legal words, stop.
        */

        if (
            failedAttempts >= 5
        ) {

            console.log(
                "Could not find any more legal crossword placements."
            );

            return;

        }


        /*
           Wait a little before
           continuing.
        */

        setTimeout(
            addNextWord,
            20
        );

    }


    addNextWord();

}


/* --------------------------------
   PLACE FIRST WORD
-------------------------------- */

function placeFirstWord(
    word,
    row,
    col
) {

    for (
        let i = 0;
        i < word.length;
        i++
    ) {

        board[row][col + i] =
            word[i];

    }


    placedWords.push({

        word: word,

        row: row,

        col: col,

        direction: "horizontal"

    });

}


/* --------------------------------
   LOAD DICTIONARY
-------------------------------- */

async function loadDictionary() {

    try {

        console.log(
            "Loading dictionary..."
        );


        const response =
            await fetch(
                "dictionary.txt"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load dictionary.txt"
            );

        }


        const text =
            await response.text();


        /*
           Convert dictionary into
           uppercase words.
        */

        dictionary =
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
                        word.length >=
                        MIN_WORD_LENGTH
                )
                .filter(
                    word =>
                        word.length <=
                        MAX_WORD_LENGTH
                );


        /*
           Remove duplicates.
        */

        dictionary =
            [
                ...new Set(dictionary)
            ];


        dictionarySet =
            new Set(dictionary);


        console.log(
            "Dictionary loaded:",
            dictionary.length,
            "words"
        );


        /*
           Check that SCRABBLE exists.
        */

        if (
            !dictionarySet.has("SCRABBLE")
        ) {

            console.warn(
                "SCRABBLE is not in dictionary.txt"
            );

        }


        /*
           Start game.
        */

        generateBoard();

    }
    catch (error) {

        console.error(
            "Dictionary error:",
            error
        );


        createEmptyBoard();

        placedWords = [];


        placeFirstWord(
            "SCRABBLE",
            CENTRE_ROW,
            CENTRE_COL -
            Math.floor(
                "SCRABBLE".length / 2
            )
        );


        displayBoard();

        displayWords();


        wordListElement.textContent =
            "Could not load dictionary.txt";

    }

}


/* --------------------------------
   GENERATE BUTTON
-------------------------------- */

generateButton.addEventListener(
    "click",
    generateBoard
);


/* --------------------------------
   START
-------------------------------- */

loadDictionary();
