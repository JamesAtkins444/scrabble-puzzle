* {
    box-sizing: border-box;
}


body {

    margin: 0;

    padding: 40px 20px;

    font-family: Arial, sans-serif;

    background: #f2f2f2;

    color: #222;

}


.container {

    width: 100%;

    max-width: 900px;

    margin: 0 auto;

    text-align: center;

}


h1 {

    margin-bottom: 5px;

}


.description {

    margin-top: 0;

    color: #666;

}


/* --------------------------------
   BUTTON
-------------------------------- */

button {

    border: none;

    border-radius: 6px;

    padding: 12px 20px;

    background: #222;

    color: white;

    font-size: 16px;

    cursor: pointer;

    margin: 20px 0;

}


button:hover {

    background: #444;

}


/* --------------------------------
   SCRABBLE BOARD
-------------------------------- */

.board {

    width: min(90vw, 650px);

    aspect-ratio: 1 / 1;

    margin: 20px auto;

    display: grid;

    grid-template-columns:
        repeat(15, 1fr);

    grid-template-rows:
        repeat(15, 1fr);

    border: 3px solid #222;

    background: #222;

}


.cell {

    background: #e8d8b5;

    border: 1px solid #c4b38f;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size:
        clamp(10px, 2vw, 24px);

    font-weight: bold;

    user-select: none;

}


.cell.letter {

    background: #f4dfad;

}


/* --------------------------------
   INFORMATION
-------------------------------- */

.information {

    margin-top: 30px;

    background: white;

    border-radius: 8px;

    padding: 20px;

    text-align: left;

}


.information h2 {

    margin-top: 0;

}


#wordList {

    display: flex;

    flex-wrap: wrap;

    gap: 8px;

}


.word {

    background: #eee;

    padding: 5px 8px;

    border-radius: 4px;

    font-size: 14px;

}


/* --------------------------------
   MOBILE
-------------------------------- */

@media (max-width: 600px) {

    body {

        padding: 20px 10px;

    }


    .board {

        width: 96vw;

    }

}
