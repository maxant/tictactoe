function init(){
    var canvas = document.getElementById("canvas");

    canvas.width  = window.innerWidth - 150;
    canvas.height = window.innerHeight;

    document.addEventListener("click", click);

    buildModel();

	// ////////////////////
	// configuration
	// ////////////////////
	model.useInstantWinLossChecks = false; //if true, markedly improves intelligence quickly. but it is cooler to learn this on its own!

    test();
    clear();
    resetStats();

    render();

    learn();
}

function click(e){

	var cell;

    if(isHit(e, model.clear)){
        clear();
        render();
    }else if(isHit(e, model.resetStats)){
        resetStats();
        render();
    }else if(isHit(e, model.playAutonomously)){
        toggleAuto();
    }else if(isHit(e, model.useExploring)){
        toggleUseExploring();
        render();
    }else if(isHit(e, model.whoPlaysWhat)){
        toggleWhoPlaysWhat();
    } else if(isNotFinished()){
		//find where user is clicking and move there
        for(i = 0; i < model.board.length; i++){
            for(j = 0; j < model.board[i].length; j++){
                cell = model.board[i][j];
                if(!cell.v && isHit(e, cell)){
                    selectCell(i, j, HUMAN);
                    playAi(COMPUTER, HUMAN);
                    return;
                }
            }
        }
    }
}

function render(){
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var i, j, cell, x,y, w, h;

    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(i = 0; i < model.board.length; i++){
        for(j = 0; j < model.board[i].length; j++){
            cell = model.board[i][j];
            ctx.strokeRect(cell.x, cell.y, cell.w, cell.h);
            if(cell.v){
                ctx.strokeText(cell.v, cell.x + 5, cell.y + 15);
            }
        }
    }

    ctx.strokeRect(model.clear.x, model.clear.y, model.clear.w, model.clear.h);
    ctx.strokeText("clear", model.clear.x + 6, model.clear.y + 14);

    ctx.strokeRect(model.resetStats.x, model.resetStats.y, model.resetStats.w, model.resetStats.h);
    ctx.strokeText("reset stats", model.resetStats.x + 6, model.resetStats.y + 14);

    ctx.strokeRect(model.playAutonomously.x, model.playAutonomously.y, model.playAutonomously.w, model.playAutonomously.h);
    ctx.strokeText("play autonomously", model.playAutonomously.x + 6, model.playAutonomously.y + 14);

    ctx.strokeRect(model.whoPlaysWhat.x, model.whoPlaysWhat.y, model.whoPlaysWhat.w, model.whoPlaysWhat.h);
    ctx.strokeText("swap roles", model.whoPlaysWhat.x + 6, model.whoPlaysWhat.y + 14);

    ctx.strokeRect(model.useExploring.x, model.useExploring.y, model.useExploring.w, model.useExploring.h);
    ctx.strokeText("explore", model.useExploring.x + 6, model.useExploring.y + 14);

    ctx.strokeStyle = "red";
    if(model.winner){
        ctx.strokeText("WON BY " + model.winner, model.clear.x + 6, model.clear.y + 40);
    }else if(model.draw){
        ctx.strokeText("DRAW", model.clear.x + 6, model.clear.y + 40);
    }

    ctx.strokeStyle = "black";
    var xp = (100*(model.stats.xWins)/(model.stats.draws+model.stats.xWins+model.stats.oWins)).toFixed(2);
    var op = (100*(model.stats.oWins)/(model.stats.draws+model.stats.xWins+model.stats.oWins)).toFixed(2);
    ctx.strokeText("X wins: " + model.stats.xWins + " ( " + xp + "%)",
        model.clear.x + 6, model.clear.y + 60);
    ctx.strokeText("O wins: " + model.stats.oWins + " ( " + op + "%)",
        model.clear.x + 6, model.clear.y + 75);
    ctx.strokeText("Draws: " + model.stats.draws, model.clear.x + 6, model.clear.y + 90);
    ctx.strokeText("Total games played: " + model.totalGames, model.clear.x + 6, model.clear.y + 105);
    ctx.strokeText("Unique patterns seen: " + model.totalUniquePatterns, model.clear.x + 6, model.clear.y + 120);
    ctx.strokeText("Number of explorations: " + model.numExplorations + "; chance of exploring: " + model.chanceOfExploring.toFixed(0) + "%; exploring enabled: " + model.useExploring.active, model.clear.x + 6, model.clear.y + 135);
    ctx.strokeText("Number of AI moves: " + model.numAiMoves, model.clear.x + 6, model.clear.y + 150);
    ctx.strokeText("Pattern known? " + model.currentPatternKnown, model.clear.x + 6, model.clear.y + 165);

    ctx.strokeText("Tic Tac Toe", 100, 20);
    ctx.strokeText("X starts", 100, 35);
    ctx.strokeText("You play '" + HUMAN + "', computer plays '" + COMPUTER + "'.", 100, 50);
    ctx.strokeText("As you play the computer will learn.", 100, 65);

    document.getElementById("learning").style.display = model.isLearning ? "block" : "none";
}
