/**
 * http://usejsdoc.org/
 */

var http = require('http');
function GGE(){
	
}

GGE.prototype.constructor = GGE;

GGE.prototype.graphBuilt = function(trainingIRI, graph){
	/**
	 * HOW TO Make an HTTP Call - GET
	 */
	// options for GET
	var optionsget = {
	    host : 'localhost', // here only the domain name
	    // (no http/https !)
	    port : 8080,
	    path : '/OntologyWS/rest/from-training/los?trainingIRI='+trainingIRI, // the rest of the url with parameters if needed
	    method : 'GET' // do GET
	};
	 
	console.info('Options prepared:');
	console.info(optionsget);
	console.info('Do the GET call');
	 
	// do the GET request
	var reqGet = http.request(optionsget, function(res) {
	    console.log("statusCode: ", res.statusCode);
	    
	    // uncomment it for header details
	//  console.log("headers: ", res.headers);
	 
	    var responseString = '';
	    res.on('data', function(data) {
	        console.info('GET result:\n');
	        //process.stdout.write(response);
	        responseString += data;
	        //console.info(graph.tariningIRI);
	        console.info('\n\nCall completed');
	    });
	    res.on('end', function() {
	       // console.log(graph);
	        graph = JSON.parse(responseString);
	               
	        //success(graph);
	      });
	 
	});
	 
	reqGet.end();
	reqGet.on('error', function(e) {
	    console.error(e);
	});
};

var gge = new GGE();
var graph={};
gge.graphBuilt('DEV', graph);
console.log(graph);
var toString = JSON.stringify(graph);
console.log(toString);
module.exports = GGE;