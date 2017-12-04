/*global io*/
/*jslint browser: true*/
var socket = io();
var i;
var groupId;

/** * Fonctions utiles ** */

/**
 * Scroll vers le bas de page si l'utilisateur n'est pas remonté pour lire
 * d'anciens messages
 */
function scrollToBottom() {
	if ($(window).scrollTop() + $(window).height() + 2
			* $('#messages li').last().outerHeight() >= $(document).height()) {
		$('html, body').animate({
			scrollTop : $(document).height()
		}, 0);
	}
}

/** * Gestion des événements ** */

/**
 * Connexion de l'utilisateur Uniquement si le username n'est pas vide et
 * n'existe pas encore
 */
$('#login form').submit(function(e) {
	e.preventDefault();
	var user = {
		username : $('#login input').val().trim(),
		password : $('#password input').val().trim()
	};
	if (user.username.length > 0) { // Si le champ de connexion n'est pas vide
		socket.emit('user-login', user, function(success) {
			if (success) {
				$('body').removeAttr('id'); // Cache formulaire de connexion
				$('#chat input').focus(); // Focus sur le champ du message
			}
		});
	}
});

/**
 * Envoi d'un message
 */
$('#chat form').submit(function(e) {
	e.preventDefault();
	var message = {
		text : $('#m').val(),
		groupId : groupId
	};
	$('#m').val('');
	if (message.text.trim().length !== 0) { // Gestion message vide
		socket.emit('chat-message', message);
	}
	$('#chat input').focus(); // Focus sur le champ du message
});

/**
 * Réception d'un message
 */
socket.on('chat-message', function(message) {
	$('#messages').append(
			$('<li>').html(
					'<span class="username">' + message.username + '</span> '
							+ message.text));
	scrollToBottom();
});

/**
 * Réception d'un message de service
 */
socket.on('service-message', function(message) {
	$('#messages').append(
			$('<li class="' + message.type + '">').html(
					'<span class="info">information</span> ' + message.text));
	
	scrollToBottom();
});

/**
 * Réception de l'id du groupe
 */
socket.on('group-id', function(message) {
	groupId = message.groupId
	console.log("Goupe = " + groupId);
	
});

/**
 * Réception d'un message d'echec de construction du groupe
 */
socket.on('group-build', function(message) {
	var state = message.state;
	if(state === 'FAILED'){// Orienter l'apprenant vers une autre solution
		alert("Construction du groupe : "+state);
	}
	if(state === 'SUCCESS'){// Activer le chat 
		//alert("Construction du groupe : "+state);
		document.getElementById('m').disabled = false;

	}
	
	
});

/**
 * Connexion d'un nouvel utilisateur
 */
socket.on('user-login', function(user) {
	$('#users').append(
			$('<li class="' + user.username + ' new">').html(
					user.username + '<span class="typing">typing</span>'));
	setTimeout(function() {
		$('#users li.new').removeClass('new');
	}, 1000);
});

/**
 * Déconnexion d'un utilisateur
 */
socket.on('user-logout', function(user) {
	var selector = '#users li.' + user.username;
	$(selector).remove();
});

/**
 * Détection saisie utilisateur
 */
var typingTimer;
var isTyping = false;

$('#m').keypress(function() {
	clearTimeout(typingTimer);
	if (!isTyping) {
		socket.emit('start-typing');
		isTyping = true;
	}
});

$('#m').keyup(function() {
	clearTimeout(typingTimer);
	typingTimer = setTimeout(function() {
		if (isTyping) {
			socket.emit('stop-typing');
			isTyping = false;
		}
	}, 500);
});

/**
 * Gestion saisie des autres utilisateurs
 */
socket.on('update-typing', function(typingUsers) {
	$('#users li span.typing').hide();
	for (i = 0; i < typingUsers.length; i++) {
		$('#users li.' + typingUsers[i].username + ' span.typing').show();
	}
});
