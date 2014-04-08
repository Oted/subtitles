var crawler = require("../my_modules/crawler.js"),
    target = "http://subscene.com/subtitles/title?q=";

exports.index = function(req, res){
    res.render("index",{});
};

exports.getSubtitle = function(req, res){
    crawler.checkCache(req.query.title.toLowerCase(), req.query.language.toLowerCase() ,function(fileName){
        if (!fileName){
            crawler.getData(target, req.query.title.toLowerCase(), req.query.language.toLowerCase(),res); 
        } else {
            res.json({"filename" : fileName, "quality":"1"});
        }
    });
};

exports.downloadSubtitle = function(req, res){
    res.download("." + req.path);
};

