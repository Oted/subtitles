var util = require("./util.js"),
    archivehandler = require("./archiveHandler.js"),
    cache = [],
    CacheEntity = require("./CacheEntity.js"),
    request = require('request'),
    cheerio = require('cheerio');

/**
 * Checks if this search has been cached before
 */
exports.checkCache = function(query, language, callback){
    if (cache.length === 0){
        callback("");
        return;
    }
    for (var i = cache.length - 1; i >= 0; i--){
        var entity = cache[i];
        if (entity.equals(query, language)){
            callback(entity.getValue());
            break;
        } else if (entity.hasExpired()){
            console.log(entity.getValue() + " has been removed from cache.");
            cache.splice(i, 1);
        }
        if (i === 0){
            callback("");
        }
    }
};

/**
 *  Called from router with the url to crawl, injects respose object
 */
exports.getData = function(target, query, targetLanguage, res){
    var url = target + query,
        bestPossible = [],
        worstPossible = [];
   
    console.log("Request received : " + url);
    if (!target) res.send(500, { error: "something blew up :o" });
    
    request(url, function (error, response, html) {
        if (error){
            callback("");
            return ;
        }
        
        var $ = cheerio.load(html),
            //minimum level for levenstein, if no result is below this the quaility will
            //be set to 0 and the final result will show up in yellow. 
            levenDistanceMin = 0.28;
    
        $(".a1").each(function(i, data){
            var language = $($(data).find("span")[0]).text().toLowerCase(),
                title = $($(data).find("span")[1]).text().toLowerCase(),
                url = "http://subscene.com" + $($(data).find("a")[0]).attr("href"),
                newDistance = util.getTotalLeven(query, title);
    
            if (language.indexOf(targetLanguage) >= 0 && newDistance < levenDistanceMin) {
                levenDistanceMin = newDistance;
                bestPossible = [];
                bestPossible.push(url);
            } else if (language.indexOf(targetLanguage) >= 0 && newDistance === levenDistanceMin){
                if (bestPossible.indexOf(url) < 0) bestPossible.push(url);  
            } else if (language.indexOf(targetLanguage) >= 0){
                if (worstPossible.indexOf(url) < 0) worstPossible.push(url);  
            }
        });
        
        if (worstPossible.length < 1 && bestPossible.length < 1) {
            res.send(404, "Sorry, nothing could be found, maybe you need to be more specific?");
        } else if (bestPossible.length > 0){
            getBestUrls(bestPossible, function(best){
                if (best.url.length > 0){
                    archivehandler.extractFile(best.url, targetLanguage, function(fileName){
                        if (fileName){
                            res.json({"filename" : fileName, "quality":"1"});
                            cache.push(new CacheEntity(query, fileName, targetLanguage));   
                            res.end();
                        } else {
                            res.send(404, "Sorry, nothing could be found :(");
                        }
                    });
                } else {
                    res.send(404, "Sorry, nothing could be found :(");
                };
            });
        } else {
            getBestUrls(worstPossible, function(best){
                if (best.url.length > 0){
                    archivehandler.extractFile(best.url, targetLanguage, function(fileName){
                        if (fileName){
                            res.json({"filename" : fileName, "quality":"0"});
                            res.end();
                        } else {
                            res.send(404, "Sorry, nothing could be found :(");
                        }
                    });
                } else {
                    res.send(404, "Sorry, nothing could be found :(");
                }
            });
        };
    });
};

/**
 *  Check within possible urls to give them score depending on downloads and rating,
 *  returns the url with best rating/downloads
 */
var getBestUrls = function(urls, callbackhell){
    var best = {"score":0,"url":""},
        waiting = 0;

    for (var j=0; j < urls.length; j++){
        waiting++;
        request(urls[j], function (error, response, html) {
            if (error){
                callbackhell(best);
                return ;
            }
            
            var $ = cheerio.load(html);
            $("#details li").each(function(i, data){
                var liContent = $(data).text().toLowerCase();
                if (liContent.indexOf("downloads") >= 0){

                    waiting--;
                    var downloads = parseInt(liContent.replace(/\D+/g, ""), 10);
                     
                    if (best.score < downloads){
                        best.score = downloads;
                        best.url = "http://subscene.com" + $("#downloadButton").attr("href");
                    }
                    
                    if (waiting < 1){ 
                        callbackhell(best);
                    }
                } else {
                    if (best.score === "0"){
                        best.url = "http://subscene.com" + $("#downloadButton").attr("href");
                    }
                }
            });
        });
    };
};
