var model = {};

const O = "O";
const X = "X";
var HUMAN = O;
var COMPUTER = X;
const DRAW = "draw";

function buildModel(){

    model.computerStarts = true;

    //the board, including sizes. the value attribute will contain whether X or O selects.
    var i, j;
    model.board = buildEmtpyBoard();

    //the clear button
    model.clear = {
        x: 10,
        y: 80,
        w: 40,
        h: 20
    };

    //the resetStats button
    model.resetStats = {
        x: 60,
        y: 80,
        w: 80,
        h: 20
    };

    //the playAutonomously button
    model.playAutonomously = {
        x: 150,
        y: 80,
        w: 130,
        h: 20
    };

    //the whoPlaysWhat button
    model.whoPlaysWhat = {
        x: 290,
        y: 80,
        w: 80,
        h: 20
    };

    //the useExploring button
    model.useExploring = {
        x: 380,
        y: 80,
        w: 60,
        h: 20,
        active: true
    };

	resetEverything();
}

function resetStats(){
    model.stats = {
        xWins: 0,
        oWins: 0,
        draws: 0
    };
}

/** reset the game */
function clear(){
    for(i = 0; i < model.board.length; i++){
        for(j = 0; j < model.board[i].length; j++){
            delete model.board[i][j].v;
        }
    }
    delete model.winner;
    delete model.draw;
    model.history = [];

    if(model.computerStarts){
        COMPUTER = X;
        HUMAN = O;
        playAi(COMPUTER, HUMAN);
    }else{
        COMPUTER = O;
        HUMAN = X;
    }
	console.log("======== cleared ============");
}

function resetEverything(){
    //a place to store moves of the current game
    model.history = [];

    //a place to store pattern recognition memory
    model.patternRecognition = {};

    model.totalGames = 0;
    model.uniqueGames = {};
    model.totalUniqueGames = 0;
    model.numExplorations = 0;
    model.numAiMoves = 0;

    const learnFromScratch = new URL(window.location).searchParams.get("learnFromScratch")
    if(!learnFromScratch) {
        //a place to store pattern recognition memory
        model.patternRecognition = precalculated.patternRecognition;

        model.totalGames = precalculated.totalGames;
        model.uniqueGames = precalculated.uniqueGames;
        model.totalUniqueGames = precalculated.totalUniqueGames;
        model.numExplorations = precalculated.numExplorations;
        model.numAiMoves = precalculated.numAiMoves;
    }

	resetStats();
}

function buildEmtpyBoard() {
    var board = [];
    for(i = 0; i < 3; i++){
        board[i] = [];
        for(j = 0; j < 3; j++){
            board[i][j] = {
                i: i,
                j: j,
                x: 20 * i,
                y: 20 * j,
                w: 20,
                h: 20
            };
        }
    }
    return board;
}

