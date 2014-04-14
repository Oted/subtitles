var jsdom = require("jsdom"),
    util = require("./util.js"),
    archivehandler = require("./archiveHandler.js"),
    cache = [],
    CacheEntity = require("./CacheEntity.js");

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
    
    jsdom.env(url, function(errors, window){
        var document = window.document,
            a1s = document.getElementsByClassName("a1"),
            //minimum level for levenstein, if no result is below this the quaility will
            //be set to 0 and the final result will show up in yellow. 
            levenDistanceMin = 0.31;

        if (errors){
            res.send(404, "Sorry, nothing could be found, maybe you need to be more specific?");
        }
        for (var i = 0; i < a1s.length; i++){
            var data = a1s[i],
                language = data.getElementsByTagName("span")[0].textContent.toLowerCase(),
                title = data.getElementsByTagName("span")[1].textContent.toLowerCase(),
                url = data.getElementsByTagName("a")[0].href,
                newDistance = util.levenstein(query, title);
            
            if (language.indexOf(targetLanguage) >= 0 && newDistance < levenDistanceMin) {
                levenDistanceMin = newDistance;
                bestPossible = [];
                bestPossible.push(url);
            } else if (language.indexOf(targetLanguage) >= 0 && newDistance === levenDistanceMin){
                if (bestPossible.indexOf(url) < 0) bestPossible.push(url);  
            } else if (language.indexOf(targetLanguage) >= 0){
                if (worstPossible.indexOf(url) < 0) worstPossible.push(url);  
            }
        }
        
        if (worstPossible.length < 1 && bestPossible.length < 1) {
            res.send(404, "Sorry, nothing could be found, maybe you need to be more specific?");
            window.close();
        } else if (bestPossible.length > 0){
            getBestUrls(bestPossible, function(best){
                if (best.url.length > 0){
                    archivehandler.extractFile(best.url, function(fileName){
                        if (fileName){
                            res.json({"filename" : fileName, "quality":"1"});
                            cache.push(new CacheEntity(query, fileName, targetLanguage));
                        } else {
                            res.send(404, "Sorry, nothing could be found :(");
                            window.close();
                        }
                    });
                } else {
                    res.send(404, "Sorry, nothing could be found :(");
                    window.close();
                };
            });
        } else {
            getBestUrls(worstPossible, function(best){
                if (best.url.length > 0){
                    archivehandler.extractFile(best.url, function(fileName){
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
 * If search suggest movie titles, compare the distance and select 
 * the best matching movie option, let getData call itself recurivley with 
 * the new url found, not used at the moment
 *
 */
var fallbackSearch = function(document, query, callback){
    var titles = document.getElementsByClassName("title"),
        title,
        best,
        levenDistanceMin = 0.67,
        levenDistanceTemp;

    for (var i = 0; i < titles.length; i++){ 
        title = titles[i].getElementsByTagName("a")[0].innerHTML.toLowerCase();
        levenDistanceTemp = util.levenstein(query, title);     
        if (levenDistanceTemp <= levenDistanceMin) {
            best = titles[i].getElementsByTagName("a")[0].href;
        }
    }
    if (best) callback(best)
    else callback(null);
}

/**
 *  Check within possible urls to give them score depending on downloads and rating,
 *  returns the url with best rating/downloads
 */
var getBestUrls = function(urls, callbackhell){
    var best = {"score":0,"url":""},
        waiting = 0;

    for (var j=0; j < urls.length; j++){
        waiting++;
        jsdom.env(urls[j], function(errors, window){
            var document = window.document,
                details = document.getElementsByClassName("details");
            if (errors){ 
                callbackhell(best);
                window.close();
                return ;
            } 
            for (var i = 0; i < details.length; i++){
                var data = details[i],
                    list = data.getElementsByTagName("ul")[0].getElementsByTagName("li");
                for (var i = 0; i < list.length; i++){
                    var liContent = list[i].innerHTML.toLowerCase();
                    if (liContent.indexOf("downloads") >= 0){
                        waiting--;
                        var downloads = parseInt(liContent.replace(/\D+/g, ""), 10);
                         
                        if (best.score < downloads){
                            best.score = downloads;
                            best.url = document.getElementById("downloadButton").href;
                        }
                        
                        if (waiting < 1){ 
                            callbackhell(best);
                            window.close();
                            return ;
                        }
                        break;
                    }
                };
            };
        });
    };
};
