/**
 * @Author Azziz ANGHOUR
 * Agent de Formation de Groupes (GFA)
 */
var eve = require('evejs');
var fs = require("fs");
var Group = require('./util/Group');
var CA = require('./CA');
var ca;
var nmbrGroup = 0;


/* UN ARRAY DE GROUPES */
var groups = [];

/* LE LO EN QUESTION */
var lo;
var name;

/* Tableau des timeout */
var groupsTimeout = [];

function GFA(id) {
	// execute super constructor
	eve.Agent.call(this, id);
	
	// extend the agent with pattern listening functionality
	  this.extend('pattern');

	// connect to all transports configured by the system
	this.connect(eve.system.transports.getAll());
}

// extend the eve.Agent prototype
GFA.prototype = Object.create(eve.Agent.prototype);
GFA.prototype.constructor = GFA;
var des;
GFA.prototype.sayHello = function(to) {
	this.send(to, 'Hello ' + to + '!');
};


GFA.prototype.receive = function(from, message) {
	// learners[0] = from;
	// console.log('List learnes : ' + learners);

	console.log(from + ' said: ' + JSON.stringify(message));

	if (message.indexOf('Hello') === 0) {
		// reply to the greeting
		this.send(from, 'Hi ' + from + ', nice to meet you!');
	}
};

// deconnecté l'agent
GFA.prototype.kill = function() {

	console.log('GFA est détruit');
	this.disconnect();

};

// l'apprenant exist -t-il toujours
function isExist(pseudo) {
	for (var i = 0; i < groups.length; i++) {
		var g = groups[i];
		var members = g.members;
		var index = members.indexOf(pseudo);
		if (index !== -1) {
			return g;
		}
	}
	return undefined;
}

// vérifier si le groupe contient au moins 2 éléments
function isAGroup(g) {
	var size = g.members.length;
	if (size > 1) {
		return true;
	}
	return false;
}

// supprimer le groupe d'un apprenant
function deleteGroup(pseudo) {
	for (var i = 0; i < groups.length; i++) {
		var g = groups[i];
		var members = g.members;
		var index = members.indexOf(pseudo);
		if (index !== -1) {
			var tos = g.timeout;
			for ( var t in tos) {
				// if(t !== pseudo){
				console.log('LE TMO A SUPP : ' + t);
				clearTimeout(tos[t]);
				// }

			}

			// delete groups[i];
			groups.splice(i, 1);
		}
	}

}

// ajouter un learner
GFA.prototype.assignLearner = function(pseudo, lo, timeout) {
	
	var caName = lo+'_CA';
	var data = {};
	var message;
	this.lo = lo;
	
	name = lo+'_Agent';
	console.log('LO = '+lo);

	console.log(name+' => New learner [ pseudo : ' + pseudo + ', timeout : '
			+ timeout+']');
	// Get content from file
	var contents = fs.readFileSync("learner-data.json");
	// Define to JSON type
	var jsonContent = JSON.parse(contents);
	// Get Value from JSON
	var lang = userLang(pseudo);
	var me = this;
	var group;
	var id;
	
	if(ca === undefined){ // Si l'agent CA n'existe pas encore, je le crée.
		ca = new CA(caName);
	}
	var tmo = setTimeout(function() {

		var g = isExist(pseudo);
		if (g !== undefined && !isAGroup(g)) { // l'apprenant seul dans le
			// groupe
			// Envoyer l'apprenant à l'agent de gestion de conflits
			console.log(name+' => '+pseudo + ' est en cas critique');
			data = {
					'id' : g.id,
					'lo' : g.lo,
					'members' : g.members,
					'languages' : g.languages,
					'state' : 'FAILED' 
			};
			
			message = {method:'addGroup', params: data};
			
			ca.rpc.request(caName, message); // Enveoyer le groupe
			//ca.send(caName, 'new-group');

			// Supprimer son groupe de la liste
			deleteGroup(pseudo);

			// Si groups.length == 0 => tuer l'agent
			if (groups.length === 0) {
				me.send('agentManager', lo+';destroy');
				//this.disconnect();
			}
			// 
		} else {
			// Envoyer le groupe à l"agent de communication
			console.log('Envoyer le groupe à l"agent de communication ');
			data = {
					'id' : g.id,
					'lo' : g.lo,
					'members' : g.members,
					'languages' : g.languages,
					'state' : 'SUCCESS' 
			};
			
			message = {method:'addGroup', params: data};
			
			ca.rpc.request(caName, message); // Enveoyer le groupe
			//ca.send(caName, 'new-group');

			// clearTimeout des autres membres du groupe
			// Suprimer le groupe de la liste
			deleteGroup(pseudo);
			console.log('Suppression du groupe de ' + pseudo);

			// Si groups.length == 0 => tuer l'agent
			if (groups.length === 0) {
				me.send('agentManager', lo+';destroy');
			}

		}

	}, timeout);
	// clearTimeout(tmo);
	
	if (groups.length === 0) {
		var members = [ pseudo ];
		nmbrGroup++;
		id = 'G'+nmbrGroup+'_'+lo;
		group = new Group(id, lo, members, lang);
		group.timeout[pseudo] = tmo;
		console.log("TMO : " + group.timeout[pseudo]);
		groups[0] = group;
		data = {
				'id' : group.id,
				'lo' : group.lo,
				'members' : group.members,
				'languages' : group.languages,
				'state' : 'INPROGRESS' // Groupe encours de construction
		};
		
		message = {method:'addGroup', params: data};
		
		ca.rpc.request(caName, message); // Enveoyer le groupe
		console.log("Create group " + group.lo);
	} else {
		var jun = []; // Variable pour stocker les langues du groupe
		var index = 0;

		for (var i = 0; i < groups.length; i++) {
			group = groups[i];
			var gl = group.languages;
			for (var j = 0; j < lang.length; j++) {
				var r = gl.indexOf(lang[j]);
				if (r !== -1) {
					jun[index] = lang[j];
					index++;
				}
			}
			if (jun.length !== 0) {
				group.languages = jun;
				group.members.push(pseudo);
				group.timeout[pseudo] = tmo;
				console.log("TMO : " + group.timeout[pseudo]);
				groups[i] = group;
				data = {
						'id' : group.id,
						'lo' : group.lo,
						'members' : group.members,
						'languages' : group.languages,
						'state' : 'INPROGRESS' // Groupe encours de construction
				};
				
				if (group.members.length === 5) { // Le group est complet (max
					// = 5)
					// Contacter l'agent de communication et supprimer le group
					// de la liste
					console
							.log('Envoyer le groupe à l"agent de communication ');
					
					data['state'] = 'SUCCESS';
					message = {method:'addGroup', params: data};
					ca.rpc.request(caName, message);

					// Supprimer le groupe de la liste
					deleteGroup(pseudo);

					// Si groups.length == 0 => tuer l'agent
					if (groups.length === 0) {
						console.log('GFA_'+lo+' détruit');
						this.send('agentManager', lo+';destroy');
						//this.disconnect();
					}
				}
				else{
					message = {method:'addGroup', params: data};
					ca.rpc.request(caName, message);
					//ca.send(caName, 'new-group');
				}
				
				break;
			}
		}
		if (jun.length === 0) {
			// index = groups.length;
			var members = [ pseudo ];
			nmbrGroup++;
			id = 'G'+nmbrGroup+'_'+lo;
			group = new Group(id, lo, members, lang);
			group.timeout[pseudo] = tmo;
			groups.push(group);
			data = {
					'id' : group.id,
					'lo' : group.lo,
					'members' : group.members,
					'languages' : group.languages,
					'state' : 'INPROGRESS' // Groupe encours de construction
			};
			message = {method:'addGroup', params: data};
			ca.rpc.request(caName, message);
		}
	}

	console.log("Number of groups " + groups.length);

	var grp = groups[0];
	console
			.log("group id : " + grp.lo + ", group size : "
					+ grp.members.length);

};
function userTimeout(pseudo) {
	console.log(pseudo + " Est en cas critique !!!");
}

function userLang(pseudo) {
    // Get content from file
    var contents = fs.readFileSync("learner-data.json");
    // Define to JSON type
    var learnersJson = JSON.parse(contents);

    for (i = 0; i < learnersJson.length; i++) {
        if (learnersJson[i].email === pseudo) {
        	console.log('GFA => Languges for ' + pseudo +' : ' + learnersJson[i].languages);
            return learnersJson[i].languages;
        }
    }
    var languages = [];
    return languages;
}

function userLang2(pseudo) {
	console.log("\n *STARTING* \n");
	// Get content from file
	var contents = fs.readFileSync("learner-data.json");
	// Define to JSON type
	var jsonContent = JSON.parse(contents);
	// Get Value from JSON
	return jsonContent[pseudo];
}

/*
 * loAgent.prototype.connect = function(){
 * 
 * this.connect(); };
 */

module.exports = GFA;