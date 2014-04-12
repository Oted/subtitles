var http = require("http"),
    fs = require("fs"),
    unzip = require("unzip"),
    rarjs = require("rarjs");
    
/**
 *  get the rarfile of the best result and extracts the srt file  
 */
exports.extractFile = function(url, callback){
    var file;
    var request = http.get(url, function(res) {
        var resFileType = res.headers["content-disposition"].split(".").pop(),
            archiveFileName = res.headers["content-disposition"].split("=").pop(),
            uniqueName = new Date().getTime(); 
        
        file = fs.createWriteStream("./archives/" + archiveFileName);
        res.pipe(file);
        file.on("finish", function() {
            res.emit("end");
            if (archiveFileName){
                getArchiveContent(archiveFileName, uniqueName, function(fileName){
                    callback(fileName);
                });
            } else {
                callback("");
            }
            file.end();
        });
    }).on("error", function(){
        callback("");
    });
};

//unzip file from server
var getArchiveContent = function(archiveFileName, uniqueName, callback){
    var exec = require('child_process').exec,
        child,
        fileType = archiveFileName.split(".").pop();

    if (fileType === "zip"){
        child = exec("unzip " + "./archives/" + archiveFileName + " -d ./archives/" + uniqueName + "/",function (error, stdout, stderr) {
            if (error) {
                console.log("exec error: " + error);
                callback("");
            } else {
                checkContent(archiveFileName, uniqueName, callback);
            }
        }); 
    } else if (fileType === "rar"){
        child = exec("unrar e " + "./archives/" + archiveFileName + " ./archives/" + uniqueName + "/",function (error, stdout, stderr) {
            if (error) {
                console.log("exec error: " + error);
                callback("");
            } else {
                checkContent(archiveFileName, uniqueName, callback);
            }
        }); 
    } else {
        callback("");
    };
};

var checkContent = function(archiveFileName, uniqueName, callback){
    var subtitles = [],
        fileType = archiveFileName.split(".").pop();

    fs.readdir("./archives/"+uniqueName+"/", function(err, files){
        files.forEach(function(file){
            if (isSubtitle(file)){
                subtitles.push(file);
            }
        });
        if (subtitles.length == 1){
            fs.rename("./archives/"+uniqueName+"/"+subtitles[0], "./output/" + subtitles[0], function(){
                callback(subtitles[0]);
                removeFiles(archiveFileName, uniqueName);
            });    
        } else if (subtitles.length > 1){
            fs.rename("./archives/" + archiveFileName, "./output/" + archiveFileName, function(){
                callback(archiveFileName);
                removeFiles(archiveFileName, uniqueName);
            });
        } else {
            console.log("Archive seems to be empty");
            removeFiles(archiveFileName, uniqueName);
            callback("");
        } 
    });
};

var removeFiles = function(archiveFileName, uniqueName){
    var dir = "./archives/" + uniqueName,
        archive = "./archives/" + archiveFileName,
        exec = require('child_process').exec,
        child;

    child = exec("rm -rf " + dir, function (error, stdout, stderr){}); 
    child = exec("rm " + archive ,function (error, stdout, stderr) {}); 
};

var isSubtitle = function(fileName){
    file = fileName.split(".").pop();
    var postFix = ["txt", "srt", "ass", "ssa", "sub", "jss", "gsub", "usf", "idx"];
    
    for (var i = postFix.length - 1; i >=0; i--){
        if (file === postFix[i]){
            return true;
            break;
        }
        if (i === 0){
            return false;
        }
    }
};
