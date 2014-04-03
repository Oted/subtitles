var util = require("../util.js"),
    targets = ["http://subscene.com/subtitles/title?q="];

exports.index = function(req, res){
    res.render("index",{});
}

exports.getSubtitle = function(req, res){
    for (var i=0; i < targets.length; i++){
        util.getData(targets[i], 
                req.query.title.toLowerCase(), 
                req.query.language.toLowerCase(),
                res
        ); 
    }
}

exports.downloadSubtitle = function(req, res){
    res.download("." + req.path);
};

