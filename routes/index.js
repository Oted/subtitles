var crawler = require("../my_modules/crawler.js"),
    target = "http://subscene.com/subtitles/title?q=";

exports.index = function(req, res){
    res.render("index",{});
};

exports.maintenance = function(req, res){
    res.render("404", {});
};

    
exports.getSubtitle = function(req, res){
    console.log();
    console.log("--------- " + new Date().toString()  + " -----------");
    
    if (!(req.query.title || req.query.language)){ 
        res.send(500, { error: "something blew up :o" });
        console.log("Something blew up!");
    } else {
        crawler.checkCache(req.query.title.toLowerCase(), req.query.language.toLowerCase() ,function(fileName){
            if (!fileName){
                crawler.getData(target, req.query.title.toLowerCase(), req.query.language.toLowerCase(),res); 
            } else {
                console.log("Found cache for " + req.query.title + ", " + fileName);
                res.json({"filename" : fileName, "quality":"1"});
            }
        });
    }
};

exports.downloadSubtitle = function(req, res){
    res.download("." + req.path);
};

