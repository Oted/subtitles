var util = require("./util.js"),
    fs = require("fs");

module.exports = CE;

function CE(key, value, language){
    if (fs.existsSync("./output/"+value)) {
        this.value = value;
        this.key = util.strip(key);
        this.created = new Date();
        this.language = language;
        console.log("Created new cache entity " + key + ", " + value);
    } else console.log("CE could not bew created, file does not exists");
};

CE.prototype.hasExpired = function(){
    var difference = difference = new Date() - this.created;
    return Math.round(difference/(1000*60*60)) > 30;
};

CE.prototype.equals = function(query, language){
    if (this.key === util.strip(query) && this.language === language) return true;
    else return false;
};

CE.prototype.getValue = function(){
    return this.value;
};
