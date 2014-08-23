var crawler = require("../my_modules/crawler.js"),
    target  = "http://subscene.com/subtitles/title?q=",
    fs      = require("fs"),
    _       = require("underscore"); 

exports.index = function(req, res){
    res.render("index",{});
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

exports.getCache = function(req, res){
    var cache = _.shuffle(crawler.getCache());
    
    console.log("User requested cache!");
    cache = cache.slice(0,10);

    res.json(JSON.stringify(cache));
};

exports.feedback = function(req, res){
    fs.appendFile('log.txt', 
            new Date() + "\n" +
            req.query.answere + "\n\n", function (err) {
                if (err) console.log(err);
            }
    );
};
