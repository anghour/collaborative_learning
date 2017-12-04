/**
 * @Author Azziz ANGHOUR
 */

function Group(id, lo, members, languages){
	this.id = id;
	this.lo = lo;
	this.members = members;
	this.languages = languages;
	this.timeout = {};
	
}
Group.prototype.getLO = function(){
	return this.lo;
};

Group.prototype.setLO = function(lo){
	this.lo = lo;
};

Group.prototype.getMembers = function(){
	return this.members;
};

Group.prototype.setMembers = function(members){
	this.members = members;
};

Group.prototype.getLanguages = function(){
	return this.languages;
};

Group.prototype.setLanguage = function(languages){
	this.languages = languages;
};



module.exports = Group;