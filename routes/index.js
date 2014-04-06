var crawler = require("../my_modules/crawler.js")
    target = "http://subscene.com/subtitles/title?q=";

exports.index = function(req, res){
    res.render("index",{});
}

exports.getSubtitle = function(req, res){
    crawler.getData(target, req.query.title.toLowerCase(), req.query.language.toLowerCase(),res); 
}

exports.downloadSubtitle = function(req, res){
    res.download("." + req.path);
};

