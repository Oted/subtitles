
/**
 *  Compares two strings to get the distance beween them
 */
exports.levenstein = function(one, two){
    var matrix = [],
        cost;
    
    one = this.strip(one);
    two = this.strip(two);

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

        value = matrix[one.length-1][two.length-1] / (Math.min(one.length + two.length)); 
        
        // console.log(one);
        // console.log(two);
        // console.log(value);
        // console.log();

        return value;
    }
};

/**
 * Strips a string down to its bones
 */
exports.strip = function(str){
    str = str.replace(/ /g, ".");
    str = str.replace(/[#_,\-\+()\t\n]*/g,"");
    str = str.replace(/\[.+\]/g,"");
    return str.toLowerCase();
};
