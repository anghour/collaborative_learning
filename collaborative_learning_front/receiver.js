var express = require('express'), routes = require('./routes'), graph = require('./routes/graph'), user = require('./routes/user'), http = require('http'), path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Group = require('./agents/util/Group');
var i;
var fs = require('fs');

var AgentManager = require('./agents/AgentManager');

var agentManager = new AgentManager('agentManager');

var Client = require('node-rest-client').Client;
var restClient = new Client();
var restApiUrl = "http://localhost:8080/";

/**
 * Gestion des requêtes HTTP des utilisateurs en leur renvoyant les fichiers du
 * dossier 'public'
 */
app.use('/', express.static(__dirname + '/public'));

/**
 * Liste des utilisateurs connectés
 */
var users = [];

/**
 * Liste des sockets connectés
 */
var sockets = {};

/**
 * Liste des groupes
 */
var groups = {};

/**
 * Historique des messages
 */
var messages = [];

/**
 * Liste des utilisateurs en train de saisir un message
 */
var typingUsers = [];

/**
 * Liste des LOs disponibles
 */
var los = [ "LO1", "LO2", "LO3" ];

/**
 * Liste des agents crées
 */
var agents = [];

/**
 * Ceci est un exemple d'utilisation de Express pour la gestion des routes
 * (URLs)
 */
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'node_modules')));

var elem = 'elements: [' + '{ data: { id: "a" } },' + ' { data: { id: "b" } },'
		+ ' {' + ' data: {' + ' id: "ab",' + 'source: "a",' + 'target: "b"'
		+ '}' + ' }]';

app.get('/index', function(req, res) {
	res.render('index.ejs', {
		elem : elem
	});
});

app.get('/pages/graph2.html', function(req, res) {
    res.render('pages/graph.ejs', {
        elem : elem
    });
});

/** FIN de l'exemple * */

io.on('connection', function(socket) {

	/**
	 * Utilisateur connecté à la socket
	 */
	var loggedUser;

	/**
	 * Emission d'un événement "user-login" pour chaque utilisateur connecté
	 */
	/*
	 * for (i = 0; i < users.length; i++) { socket.emit('user-login', users[i]); } //
	 */

	/**
	 * Emission d'un événement "chat-message" pour chaque message de
	 * l'historique
	 */
	/*
	 * for (i = 0; i < messages.length; i++) { if (messages[i].username !==
	 * undefined) { socket.emit('chat-message', messages[i]); } else {
	 * socket.emit('service-message', messages[i]); } } //
	 */
	/**
	 * Déconnexion d'un utilisateur
	 */
	socket.on('disconnect', function() {
		if (loggedUser !== undefined) {
			// Broadcast d'un 'service-message'
			var serviceMessage = {
				text : 'User "' + loggedUser.username + '" disconnected',
				type : 'logout'
			};
			socket.broadcast.emit('service-message', serviceMessage);
			// Suppression de la liste des connectés
			var userIndex = users.indexOf(loggedUser);
			if (userIndex !== -1) {
				users.splice(userIndex, 1);
			}
			// Ajout du message à l'historique
			messages.push(serviceMessage);
			// Emission d'un 'user-logout' contenant le user
			io.emit('user-logout', loggedUser);
			// Si jamais il était en train de saisir un texte, on l'enlève de la
			// liste
			var typingUserIndex = typingUsers.indexOf(loggedUser);
			if (typingUserIndex !== -1) {
				typingUsers.splice(typingUserIndex, 1);
			}
		}
	});

	/**
	 * Réception d'un nouveau groupe de la part d'un CA :
	 */
	socket.on('new-group', function(data, callback) {
		var lo = data.lo;
		var id = data.id;
		var state = data.state;
		var members = data.members;
		var languages = data.languages;

		if (state === 'FAILED') {
			var sckt = sockets[members[0]];
			var msg = {
					state : 'FAILED'
			};
			sckt.emit('group-build', msg);

		} else {
			
			console.log('Receiver => Réception d\'un nouveau groupe :');
			console.log('\t|- lo : ' + lo + ', id : ' + id
					+ ', members number : ' + members.length + ', state : '
					+ state);
			var size = members.length;
			var uName = members[size - 1];
			var newSckt = sockets[uName];

			// L'envoie de l'id du groupe
			var groupMsg = {
				groupId : id
			};

			newSckt.emit('group-id', groupMsg);

			var group = groups[id];

			if (group === undefined) {
				group = new Group(id, lo, members, languages);
				groups[id] = group;
			} else {
				if (group.members.length !== members.length) {

					group.languages = languages;
					group.members = members;
					groups[id] = group;

					var broadcastedServiceMessage = {};

					// Envoyer la liste des utilisateurs connectés au dernier
					// utilisateur connecté
					for (i = 0; i < size - 1; i++) {
						uName = members[i];
						broadcastedServiceMessage = {
							text : 'User "' + uName + '" logged in',
							type : 'login'
						};
						var usr = getUser(uName);
						newSckt.emit('user-add', usr);
						newSckt.emit('service-message',
								broadcastedServiceMessage);
					}
					var oldSckt;
					var newUsrName = members[size - 1];
					var newUsr = getUser(newUsrName);
					broadcastedServiceMessage = {
						text : 'User "' + newUsrName + '" logged in',
						type : 'login'
					};
					// Envoyer le new au olds
					for (i = 0; i < size - 1; i++) {
						uName = members[i];
						usr = getUser(newUsrName);
						oldSckt = sockets[uName];
						oldSckt.emit('service-message',
								broadcastedServiceMessage);
						oldSckt.emit('user-add', usr);
						

					}

				}
				if(state === 'SUCCESS'){
					
					var msg = {
							state : 'SUCCESS'
					};
					for (i = 0; i < size; i++) {
						uName = members[i];
						usr = getUser(newUsrName);
						oldSckt = sockets[uName];
						
						oldSckt.emit('group-build', msg);
						

					}
				}

			}

		}

		// io.emit('user-login', loggedUser);

	});

	/**
	 * Connexion d'un utilisateur via le formulaire :
	 */
    socket.on('user-login', function(user, callback) {
    	console.log('>> receiver');
    	//console.log('receiver : on user-login : ', user);
        //var fs = require("fs");
        // Get content from file
        //var contents = fs.readFileSync("learner-data.json");
        // Define to JSON type
        //var learnerJson = JSON.parse(contents);
        
        restClient.get(restApiUrl + "learner/search/findByEmail?email=" + user.username, function (data, response) {
            // parsed response body as js object 
        	// raw response 
        	if(response && response.statusCode == 200){
        		
        		learnerJson = JSON.parse(data);
        		
        		if (learnerJson.password === user.password) {
        			console.info("Info >> User login success");
        			//console.log(learnerJson);
        			callback(true);
        		}else{
        			callback(false);
        			console.info("Info >> User login failed, Invalid password");
        		}
        	}else{
        		console.log("Error >> " + response.statusCode + " : " + response.statusMessage);
        	}
        });
    });

	socket.on('learning-event', function(user, callback) {

        if (user !== undefined) {

            //Add user to the connected user list
            users.push(user);

            //Add current socket to the socket list
            sockets[user.username] = socket;

            var lo = user.lo;
            console.log('The learner ' + user.username + ' connected on LO ' + lo);

            var msg = 'new-user;' + lo + ';' + user.username + ';' + user.timeToWait;
            agentManager.send('agentManager', msg);

            //Send notification to the connected user
            var userServiceMessage = {
                text: 'You logged in as "' + user.username + '"',
                type: 'login'
            };
            socket.emit('service-message', userServiceMessage);

            callback(true);
        }else{
            callback(false);
		}

		/*
		// Vérification que l'utilisateur n'existe pas
		var userIndex = -1;
		for (i = 0; i < users.length; i++) {
			if (users[i].username === user.username) {
				userIndex = i;
			}
		}
		if (user !== undefined && userIndex === -1) { // S'il est bien nouveau
			// Sauvegarde de l'utilisateur et ajout à la liste des connectés
			loggedUser = user;
			users.push(loggedUser);

			//l'ajout de la socket à la liste
			sockets[user.username] = socket;

			// Création des Agents sur des LOs
			var indice = parseInt(getRandomArbitrary(1, 3)) - 1;
			console.log('Indice = ' + indice);
			var lo = los[indice];
			lo = 'LO1';
			console.log('The LO is  : ' + lo);

			var msg = 'new-user;' + lo + ';' + loggedUser.username;

			agentManager.send('agentManager', msg);

			// Envoi et sauvegarde des messages de service
			var userServiceMessage = {
				text : 'You logged in as "' + loggedUser.username + '"',
				type : 'login'
			};

			socket.emit('service-message', userServiceMessage);

			callback(true);
		} else {
			callback(false);
		}*/
	});

	/**
	 * Réception de l'événement 'chat-message' et réémission vers tous les
	 * utilisateurs
	 */
	socket.on('chat-message', function(message) {
		console.log('chat-message : ', message);
		// On ajoute le username au message et on émet l'événement
		//message.username = loggedUser.username;
		//console.log(message.groupId);
		var id = message.groupId;
		var g = groups[id];
		var members = g.members;
		//g.messages.push(message);
		groups[id] = g;
		var size = members.length;
		var sckt = null;
		for (var i = 0; i < size; i++) {
			console.log('chat-message : in for loop')
			sckt = sockets[members[i]];
			sckt.emit('chat-message', message);
		}
		// io.emit('chat-message', message);
		// Sauvegarde du message
		messages.push(message);
		if (messages.length > 150) {
			messages.splice(0, 1);
		}
	});

	/**
	 * Réception de l'événement 'start-typing' L'utilisateur commence à saisir
	 * son message
	 */
	socket.on('start-typing', function() {
		// Ajout du user à la liste des utilisateurs en cours de saisie
		if (typingUsers.indexOf(loggedUser) === -1) {
			typingUsers.push(loggedUser);
		}
		io.emit('update-typing', typingUsers);
	});

	/**
	 * Réception de l'événement 'stop-typing' L'utilisateur a arrêter de saisir
	 * son message
	 */
	socket.on('stop-typing', function() {
		var typingUserIndex = typingUsers.indexOf(loggedUser);
		if (typingUserIndex !== -1) {
			typingUsers.splice(typingUserIndex, 1);
		}
		io.emit('update-typing', typingUsers);
	});
});

/**
 * Lancement du serveur en écoutant les connexions arrivant sur le port 3000
 */
http.listen(3000, function() {
	console.log('Server is listening on *:3000');
});

/**
 * Fonctions utiles
 */
// On renvoie un nombre aléatoire entre une valeur min (incluse)
// et une valeur max (exclue)
function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

// Une fonction qui renvoie un objet user sachant son pseudo
function getUser(pseudo) {
	for (var i = 0; i < users.length; i++) {
		var u = users[i];
		if (u.username == pseudo) {
			return u;
		}
	}
	return undefined;
}

function getLos(url, callback){
	console.log(">> getLos");
	restClient.get(url, function (data, response) {
		if(response && response.statusCode == 200){
			data = JSON.parse(data);
			console.log(data);
			callback(data._embedded.lo);
		}else{
			console.log("Error >> " + response.statusCode + " : " + response.statusMessage);
			callback([]);
		}
	});
}

function graphBuilder(req, res) {
	var acquis= [ '1', '2', '3', '4', '5', '6' ];
	getLos(restApiUrl + "/lo", function(los){
		console.log(">>graphBuilder : lo leaded : " + los.length);
		
		var n="";
	    var e="";
	    var j;
	    var color = "#ccc";

	    for(var index in los){
	        color = "#ccc";
	        console.log("------------------------------------------------------------------------------");
	        console.log(los[index]);
	        var pre = los[index].prerequisitesArray;
	        for(var a in acquis){
	            console.log("WWW : "+acquis[a] + ', ' + los[index].identity);
	            if(acquis[a] == los[index].identity){
	                //console.log("GREEN");
	                color="#3c9";
	                break;
	            }
	        }
	        if( color === "#ccc") {
	            var bleu = true;
	            for( var p in pre){
	                //console.log(" ===> " + pre[p] + ", " + acquis);
	                if(!isExist(pre[p], acquis)){
	                    bleu = false;
	                    break;
	                }
	            }

	            if(bleu){
	                //console.log("BLUE");
	                color = "#37c";
	            }
	        }
	        
	        //récupération des prérequis
	        for( var i in los[index].prerequisitesArray){
	            e += [ "{ data: { target: '" + los[index].identity + "', source: '" + los[index].prerequisitesArray[i] +  "' } },"];
	        }
	        var node="{ data: { id: '"+los[index].identity+"', label: '"+los[index].title+"' , color : '" + color + "' }, selectable : false" +  ", grabbable : false },";
	        n += [node];
	    }
	    
	    elements = "elements: {" +
        " nodes: [ " +
        n +
        " ]," +

        " edges: [ " +
        e	+
        " ] " +
        "},";
	    
	    console.log(n);
        console.log(e);
        console.log(elements);
        var login = req.body.login;
        console.log("login : " + login);
        console.log("acquis : " + acquis);
        res.render('pages/graph.ejs', {login : login, elements : elements, color : color});
	});
}
app.get('/pages/graph.html', graphBuilder);

function isExist(lo, los){
    for(var el in los){
        if(lo === los[el]){
            return true;
        }
    }
    return false;
}
