/**
 * @Author Azziz ANGHOUR
 */

var eve = require('evejs'); // le module NodeJS
var GFA = require('./GFA'); // Group Forming Agent
/*
 * L'ensemble des LOS encours
 */
var los;

/*
 * Map [lo, {users}]
 */

var losAgents = [];

function AgentManager(id) {
	// execute super constructor
	eve.Agent.call(this, id);

	// extend the agent with pattern listening functionality
	this.extend('pattern');

	// Destruction des agents vide
	this.listen(/destroy/i, function(from, msg) {
		console.log('AgentManager => message de  ' + from + ' : ' + msg);
		var data = msg.split(';');
		var lo = data[0];
		var agent = losAgents[lo];
		console.log('Avant : ' + losAgents[lo]);
		delete losAgents[lo];
		console.log('Après : ' + losAgents[lo]);
		agent.kill();
	});

	/*
	 * Gestion de nouvelles connexions
	 */
	this.listen(/new-user/i, function(from, msg) {
		// reply to the greeting
		// this.send(from, 'Hi ' + from + ', nice to meet you!');
		var data = msg.split(';');
		var lo = data[1];
		var pseudo = data[2];
		var timeToWait = data[3] * 1000;
		console.log('Pseudo : ' + pseudo);
		var gfa = losAgents[lo];

		if (gfa !== undefined) { // le lo existe déjà

			// ajouter le user à l'agent qui gère cet lo
			gfa.assignLearner(pseudo, lo, timeToWait);

		} else { // le lo n'existe pas
			// créer l'agent de cet lo
			// ajouter le user à cet lo

			var agentName = lo + '_Agent';
			gfa = new GFA(agentName);
			losAgents[lo] = gfa;
			gfa.assignLearner(pseudo, lo, timeToWait);

		}

	});

	// connect to all transports provided by the system
	this.connect(eve.system.transports.getAll());
}

// extend the eve.Agent prototype
AgentManager.prototype = Object.create(eve.Agent.prototype);
AgentManager.prototype.constructor = AgentManager;

module.exports = AgentManager;
