
// ant moves are what the author does to try and win, ie start in the middle
var antMoves = {
    "---|---|---|": {i: 1, j: 1},

    "-O-|-X-|---|": {i: 1, j: 0},
    "---|OX-|---|": {i: 0, j: 1},
    "---|-XO|---|": {i: 0, j: 1},
    "---|-X-|-O-|": {i: 1, j: 0},
};

/** returns DRAW if all squares are full with no winner, otherwise COMPUTER or HUMAN depending on who won. otherwise undefined. */
function checkFinished(board) {
    var i, j, winner;

	// TODO rewrite this function to be dynamic so that it works with any board size

    function sameNotNullHorizontal(i){
        return board[i][0].v === board[i][1].v &&
               board[i][1].v === board[i][2].v &&
               board[i][0].v;
    }
    for(i = 0; i < board.length; i++){
        if(sameNotNullHorizontal(i)){
            winner = board[i][0].v;
        }
    }

    function sameNotNullVertical(j){
        return board[0][j].v === board[1][j].v &&
               board[1][j].v === board[2][j].v &&
               board[0][j].v;
    }
    for(j = 0; j < board.length; j++){
        if(sameNotNullVertical(j)){
            winner = board[0][j].v;
        }
    }

    if(board[0][0].v &&
        board[0][0].v === board[1][1].v &&
        board[1][1].v === board[2][2].v
    ){
        winner = board[1][1].v;
    }

    if(board[0][2].v &&
        board[0][2].v === board[1][1].v &&
        board[1][1].v === board[2][0].v
    ){
        winner = board[1][1].v;
    }

    if(!winner){
        //check for a draw
        var allFull = true;
        for(i = 0; i < board.length; i++){
            for(j = 0; j < board[i].length; j++){
                if(!board[i][j].v){
                    allFull = false;
                    break;
                }
            }
        }
        if(allFull){
            return DRAW;
        }
    }

    return winner;
}

