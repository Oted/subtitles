var jsdom = require("jsdom"),
    http = require("http"),
    fs = require("fs"),
    unzip = require("unzip");


/**
 *  Called from router with the url to crawl, injects respose object
 */
exports.getData = function(target, query, targetLanguage, res){
    var url = target + query,
        bestPossible = [],
        worstPossible = [],
        levenDistanceMin = 0.333;

    console.log("Request received : " + url);
    if (!target) res.send(500, { error: "something blew up :o" });
    
    jsdom.env(url, function(errors, window){
        var document = window.document,
            a1s = document.getElementsByClassName("a1");

        for (var i = 0; i < a1s.length; i++){
            var data = a1s[i],
                language = data.getElementsByTagName("span")[0].textContent.toLowerCase(),
                title = data.getElementsByTagName("span")[1].textContent.toLowerCase(),
                url = data.getElementsByTagName("a")[0].href,
                newDistance = levenstein(query, title);
            
            if (language.indexOf(targetLanguage) >= 0 && newDistance < levenDistanceMin) {
                levenDistanceMin = newDistance;
                bestPossible = [];
                bestPossible.push(url);
            } else if (language.indexOf(targetLanguage) >= 0 && newDistance === levenDistanceMin){
                bestPossible.push(url);  
            } else if (language.indexOf(targetLanguage) >= 0){
                worstPossible.push(url);
            }
        }
        
        if (worstPossible.length < 1 && bestPossible.length < 1) {
            fallbackSearch(document, query, function(newTarget){
                if (newTarget){
                    exports.getData(newTarget, "", targetLanguage, res);
                } else {
                    res.send(404, "Sorry, nothing could be found :(");
                }
            });
        } else if (bestPossible.length > 0){
            getBestUrls(bestPossible, function(best){
                if (best.url.length > 0){
                    getRar(best.url, function(fileName){
                        res.json({"filename" : fileName, "quality":"1"});
                        res.end();
                    });
                } else {
                    res.send(404, "Sorry, nothing could be found :(");
                }
            });
        } else {
            getBestUrls(worstPossible, function(best){
                if (best.url.length > 0){
                    getRar(best.url, function(fileName){
                        res.json({"filename" : fileName, "quality":"0"});
                        res.end();
                    });
                } else {
                    res.send(404, "Sorry, nothing could be found :(");
                }
            });
        }
    });
}


var fallbackSearch = function(document, query, callback){
    var titles = document.getElementsByClassName("title"),
        title,
        best,
        levenDistanceMin = 0.67,
        levenDistanceTemp;

    for (var i = 0; i < titles.length; i++){ 
        title = titles[i].getElementsByTagName("a")[0].innerHTML.toLowerCase();
        levenDistanceTemp = levenstein(query, title);     
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
        waiting = -1;

    for (var j=0; j < urls.length; j++){
        waiting++;
        jsdom.env(urls[j], function(errors, window){
            var document = window.document,
                details = document.getElementsByClassName("details");
            
            for (var i = 0; i < details.length; i++){
                var data = details[i],
                    list = data.getElementsByTagName("ul")[0].getElementsByTagName("li");
                waiting++; 
                for (var i = 0; i < list.length; i++){
                    var liContent = list[i].innerHTML.toLowerCase();
                    if (liContent.indexOf("voted") >= 0){
                        var rating = parseInt(liContent.replace(/\D+/g, ""), 10);
                        
                        if (best.score < rating){
                            best.score = rating;
                            best.url = document.getElementById("downloadButton").href;
                        }

                        if (!waiting--) {
                            callbackhell(best)
                            break;
                        };
                    } else if (liContent.indexOf("downloads") >= 0){
                        var downloads = parseInt(liContent.replace(/\D+/g, ""), 10);
                         
                        if (best.score < downloads){
                            best.score = downloads;
                            best.url = document.getElementById("downloadButton").href;
                        }
                        
                        if (!waiting--){ 
                            callbackhell(best);
                            break;
                        }
                    }
                }
            }
        });
    } 
}

/**
 *  get the rarfile of the best result and extracts the srt file  
 */
var getRar = function(url, callback){
    var file = fs.createWriteStream("temp.zip");
    var request = http.get(url, function(res) {
        res.pipe(file);
        file.on("finish", function() {
            fs.createReadStream("./temp.zip")
            .pipe(unzip.Parse())
            .on("entry", function (entry) {
                var fileName = entry.path;
                
                if (fileName.toLowerCase().indexOf(".srt") > 0) {
                    var stream = fs.createWriteStream("output/"+fileName);
                    
                    stream.on("close", function() {
                        callback(fileName)
                    });
                    
                    entry.pipe(stream);
                } else {
                    entry.autodrain();
                }
            });
            file.close();
        });
    });
}

/**
 *  Compares two strings to get the distance beween them
 */
var levenstein = function(one, two){
    var matrix = [],
        cost;
    
    one = one.replace(/ /g, ".");
    two = two.replace(/ /g, ".");

    one = one.replace(/[#_,\-\+()\t\n]*/g,"");
    two = two.replace(/[#_,\-\+()\t\n]*/g,"");

    one = one.replace(/\[.+\]/g,"");
    two = two.replace(/\[.+\]/g,"");

    if (one.length < 1 || two.length < 1) return 100000;
    else {
        for (var i = 0; i < one.length; i++){
            matrix[i] = [];
            for (var j = 0; j < two.length; j++){
                if (i === 0) matrix[i][j] = j;
                else if (j === 0) matrix[i][j] = i;
                else {
                    if (one[i] === two[j]) cost = 0;
                    else cost = 1;
                    var min = Math.min(
                        matrix[i-1][j] + 1,
                        matrix[i][j-1] + 1,
                        matrix[i-1][j-1] + cost
                    );
                    matrix[i][j] = min;
                }
            }
        }

        value = matrix[one.length-1][two.length-1] / ((one.length + two.length) / 2); 
        return value;
    }
}
