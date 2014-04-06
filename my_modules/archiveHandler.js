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
        
        console.log(resFileType + " file found, extracting...")    
        if (resFileType === "zip"){
            archiveFileName = "temp.zip";
        } else if (resFileType === "rar"){
           archiveFileName = "temp.rar";
        } else {
            console.log("Invalid response file " + resFileType);
            callback("");
            return ;
        }

        file = fs.createWriteStream(archiveFileName);
        res.pipe(file);
        file.on("finish", function() {
            if (resFileType === "zip"){
                getZipContent("./temp.zip", function(fileName){
                    callback(fileName);
                });
            } else {
                getRarContent("./temp.rar", function(fileName){
                    callback(fileName);
                });
            }
        });
    });
};

var getZipContent = function(archPath, callback){
    fs.createReadStream(archPath, {"autoClose":true}).pipe(unzip.Parse()).on("entry", function (entry) {
        var fileName = entry.path;
        if (fileName.toLowerCase().indexOf(".srt") > 0) {
            var stream = fs.createWriteStream("output/"+fileName);
            stream.on("close", function() {
                callback(fileName)
            });
            entry.pipe(stream);
        } else if (fileName.toLowerCase().indexOf(".rar") > 0){
            var stream = fs.createWriteStream("output/"+fileName);
            stream.on("close", function() {
                getRarContent("output/"+fileName, callback) 
            });
            entry.pipe(stream);
        } else {
            entry.autodrain();
        }
    }).on("error", function(){
        callback("");
    });
}

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


