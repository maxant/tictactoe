function test(){
    model.board[0][0].v = X;
    model.board[1][0].v = X;
    model.board[2][0].v = X;
    checkAndHandleFinished();
    assert(model.winner === X);
    clear();

    model.board[0][1].v = X;
    model.board[1][1].v = X;
    model.board[2][1].v = X;
    checkAndHandleFinished();
    assert(model.winner === X);
    clear();

    model.board[0][2].v = X;
    model.board[1][2].v = X;
    model.board[2][2].v = X;
    checkAndHandleFinished();
    assert(model.winner === X);
    clear();

    model.board[0][0].v = X;
    model.board[0][1].v = X;
    model.board[0][2].v = X;
    checkAndHandleFinished();
    assert(model.winner === X);
    clear();

    model.board[1][0].v = X;
    model.board[1][1].v = X;
    model.board[1][2].v = X;
    checkAndHandleFinished();
    assert(model.winner === X);
    clear();

    model.board[2][0].v = X;
    model.board[2][1].v = X;
    model.board[2][2].v = X;
    checkAndHandleFinished();
    assert(model.winner === X);
    clear();

    model.board[0][0].v = X;
    model.board[1][1].v = X;
    model.board[2][2].v = X;
    checkAndHandleFinished();
    assert(model.winner === X);
    clear();

    model.board[0][2].v = X;
    model.board[1][1].v = X;
    model.board[2][0].v = X;
    checkAndHandleFinished();
    assert(model.winner === X);
    clear();

	resetEverything();
}

function assert(b, message){
    if(!b) {
        var msg = "Failed test";
        if(message) msg += ": " + message;
        throw new Error(msg);
    }
}

