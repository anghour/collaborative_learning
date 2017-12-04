/**
 * @Author Azziz ANGHOUR
 * Agent de Communication (CA)
 */
var eve = require('evejs');
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', {reconnect: true});
var Group = require('./util/Group');

//Add a connect listener
socket.on('connect', function (socket) {
 console.log('Connected!');
});
//socket.emit('CH01', 'me', 'test msg');


var groups = {};


function CA(id) {
	// execute super constructor
	eve.Agent.call(this, id);
	
	// extend the agent with pattern listening functionality
	 // this.extend('pattern');
	  
	  // load the RPC module
	  this.rpc = this.loadModule('rpc', this.rpcFunctions);

	// connect to all transports configured by the system
	this.connect(eve.system.transports.getAll());
	
	// Gestion des groupes	
	/*
	this.listen(/new-group/i, function (from, msg) {
		  console.log('CA => Réception d\'un nouveau groupe');
		  var data = msg.split(';');
		  //var lo = data[0];
		  socket.emit('new-group', msg, function (success) {
		      if (success) {
		    	  console.log('CA => Cuccess');
		      }
		    });
	  });
	  */
}

CA.prototype = Object.create(eve.Agent.prototype);
CA.prototype.constructor = CA;
//create an object containing all RPC functions.
CA.prototype.rpcFunctions = {};

//create an RPC function
CA.prototype.rpcFunctions.addGroup = function(params, from) {
	
	
	var lo = params.lo;
	var id = params.id;
	var state = params.state;
	var members = params.members;
	var languages = params.languages;
	var group = groups[id];
	if(group === undefined){
		group = new Group(id, lo, members, languages);
		groups[id] = group;
	}
	else{
		group.languages = languages;
		group.members = members;
		groups[id] = group;
	}
	
	var data = {
			'id' : id,
			'lo' : lo,
			'members' : members,
			'languages' : languages,
			'state' : state
			
	};
	console.log('CA => Réception d\'un nouveau groupe sur le LO :'+lo+'\n');
	console.log('\t\t|- id : '+id+', state : '+state);
	
	socket.emit('new-group', data, function (success) {
	      if (success) {
	    	  console.log('CA => Success');
	      }
	    });
	
	
};




module.exports = CA;