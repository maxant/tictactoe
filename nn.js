//https://medium.freecodecamp.org/how-to-create-a-neural-network-in-javascript-in-only-30-lines-of-code-343dafc50d49
const { Layer, Network, Trainer, Architect } = window.synaptic;

//input: O=-1, -=0, X=1
//output: where to move to; -1 is best move for O, 1 is best move for X. raster, ie 0=(0,0), 4=(1,1), etc.

var myNetworkO = new Architect.Perceptron(9, 20, 9); //TODO train size of hidden layer
var trainerO = new Trainer(myNetworkO);
var trainingSetO = [];

var myNetworkX = new Architect.Perceptron(9, 20, 9); //TODO train size of hidden layer
var trainerX = new Trainer(myNetworkX);
var trainingSetX = [];

Object.keys(precalculated.patterns).forEach(function(key){
    let input = [];
    for (let i = 0; i < key.length; i++) {
        let c = key.charAt(i);
        if(c === 'X'){
            input.push(1);
        }else if(c === 'O'){
            input.push(-1);
        }else if(c === '-'){
            input.push(0);
        }
    }

    //now determine the best place to go
    let value = precalculated.patterns[key];
    let rewards = value.possibleNextMoves.map(function(pnm){

        //calculated in the same way which the algorithm calculates
        //TODO replace with function that is used in both places

        let winRewards = pnm.xWinRewards;
        let drawRewards = pnm.drawRewards;
        let lossRewards = pnm.oWinRewards;

        let total = winRewards + drawRewards + lossRewards;

        //divide by total, because otherwise it seems to learn that one place is GREAT and doesnt give other ones a chance.
        //this way, we work out the win ratio regardless of how often its been played. so its normalised in comparison to the others.
        let rewardX = (100*(winRewards/total)) + (10*(drawRewards/total)) + (-1*(lossRewards/total));
        let rewardO = (100*(lossRewards/total)) + (10*(drawRewards/total)) + (-1*(winRewards/total));
        return {
            i: pnm.i,
            j: pnm.j,
            rewardX: rewardX,
            rewardO: rewardO
        };
    });

    let totalRewardX = 0;
    let totalRewardO = 0;
    rewards.forEach(function(cell){
        totalRewardX += cell.rewardX;
        totalRewardO += cell.rewardO;
    });

    let outputX = [];
    let outputO = [];
    rewards.forEach(function(cell){
        let outputIndex = cell.i + (3*cell.j);
        outputX[outputIndex] = cell.rewardX / totalRewardX;
        outputO[outputIndex] = cell.rewardO / totalRewardO;
    });

    trainingSetO.push({
        input: input,
        output: outputO
    });
    trainingSetX.push({
        input: input,
        output: outputX
    });
});

trainerO.train(trainingSetO,{
	rate: .1,
	iterations: 20000,
	error: .005,
	shuffle: true,
	log: 1000,
	cost: Trainer.cost.CROSS_ENTROPY
});

trainerX.train(trainingSetX,{
	rate: .1,
	iterations: 20000,
	error: .005,
	shuffle: true,
	log: 1000,
	cost: Trainer.cost.CROSS_ENTROPY
});


console.log("place to go: " + myNetworkX.activate([0,0,0,0,0,0,0,0,0])); //expect: [0,0,0,0,1,0,0,0,0]
console.log("did it learn?");


var exportedO = myNetworkO.toJSON();
console.log(exportedO);
var exportedX = myNetworkX.toJSON();
console.log(exportedX);
console.log("exported");
//var imported = Network.fromJSON(exported);