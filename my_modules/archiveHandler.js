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
            archiveFileName;
        
        if (resFileType === "zip"){
            archiveFileName = "./achives/" + new Date().getTime() + ".zip";
        } else if (resFileType === "rar"){
            archiveFileName = "./achives/" + new Date().getTime() + ".rar";
        } else {
            console.log("Invalid response file " + resFileType);
            callback("");
        }
        file = fs.createWriteStream(archiveFileName);
        res.pipe(file);
        file.on("finish", function() {
            res.emit("end");
            if (resFileType === "zip"){
                getZipContent(archiveFileName, function(fileName){
                    callback(fileName);
                });
            } else if (resFileType === "rar") {
                getRarContent(archiveFileName, function(fileName){
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

var getZipContent = function(archPath, callback){
    var readStream = fs.createReadStream(archPath, {"autoClose":true}),
        parser = unzip.Parse();

    readStream.on("open", function(){
        readStream.pipe(parser)
        .on("entry", function (entry){
            var fileName = entry.path;
            if (isSubtitle(fileName.toLowerCase())) {
                var stream = fs.createWriteStream("./output/"+fileName);
                stream.on("open", function(){
                    entry.pipe(stream);
                });
                stream.on("finish",function(){
                    parser.emit("close");
                    readStream.emit("close");
                    callback(fileName);
                });
                stream.on("error", function(){
                    parser.emit("close");
                    readStream.emit("close");
                    callback(""); 
                });
            } else if (fileName.toLowerCase().indexOf(".rar") > 0){
                entry.autodrain();
            } else {
                entry.autodrain();
            }
        });
    });
    readStream.on("close", function(){
        removeFile(archPath);
    });
    readStream.on("error", function(err){
        console.log(err+"\n");
    });
};

// not yet implemented
var getRarContent = function(archPath, callback){
    callback("");
    /*rarjs({"type": rarjs.OPEN_LOCAL, "file":archPath}, function(err) {
        var that = this;
        if (err) {
            console.log("There was an error opening the rarfile");
            return;
        } else {
            this.entries.forEach(function(entry){
                 var fileName = entry.name;
                 if (fileName.toLowerCase().indexOf(".srt") > 0) {
                    that.get(entry, function(data){
                        var stream = fs.createWriteStream("output/"+fileName);
                        console.log(data);
                        stream.on("close", function() {
                            callback(fileName);
                        });
                        data.pipe(stream);     
                        
                        });
               
                }
            });
        }
    });
   */
} 

var removeFile = function(filePath){
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, function (err) {
            if (err) console.log("could not delete " + filePath);
            else console.log('successfully deleted : '+ filePath);
        });
    };
};

var isSubtitle = function(fileName){
    file = fileName.split(".").pop();
    var postFix = ["srt", "ass", "ssa", "sub", "jss", "gsub", "usf", "idx"];
    
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
