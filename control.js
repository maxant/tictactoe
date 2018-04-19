// file contains stuff specific to controlling model and view, unspecific to RL and any game

function learn(){
    model.isLearning = true;
    toggleWhoPlaysWhat();
    toggleAuto();
}

function isNotFinished(){
	//the game is still in play if not drawn and there is no winner
	return !model.winner && !model.draw;
}

function isFinished(){
	return !isNotFinished();
}

function toggleWhoPlaysWhat(){
    model.computerStarts = !model.computerStarts;
    clear(); //restart game
    render();
}

/** does a move for the computer if the came is not yet finished */
function playAi(player, rival){
    checkAndHandleFinished();
    if(isNotFinished()){
        doAiMove(player, rival);
        checkAndHandleFinished();
    }
    render();
}

function toggleAuto(){
    model.playAutonomously.active = !model.playAutonomously.active;
    model.useExploring.active = model.playAutonomously.active; //ALWAYS use exploring when autoplaying
    autoPlay();
}

function toggleUseExploring(){
    model.useExploring.active = !model.useExploring.active;
}

function autoPlay(){
    if(isFinished() && model.totalGames % 100 === 0) { //switch every 100 games, so learning is balanced for both players
        toggleWhoPlaysWhat();
    }
    if(model.isLearning && isFinished() && (model.totalGames >= 50000 || hasLearnedEverything())){
        model.isLearning = false;
        toggleAuto();
        if(COMPUTER === O){
            toggleWhoPlaysWhat();
        }
        model.useExploring.active = false;
        resetStats();
        clear();
    }

    if(model.playAutonomously.active){
        if(isFinished()){
            clear();
        }
        playAi(HUMAN, COMPUTER);
        playAi(COMPUTER, HUMAN);
        setTimeout(autoPlay, 0);
    }

    render();
}

/** is the click event inside the cell? */
function isHit(e, cell){
    return (e.x >= cell.x && e.x <= cell.x + cell.w) &&
            (e.y >= cell.y && e.y <= cell.y + cell.h);
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

