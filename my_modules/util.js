
/**
 *  Compares two strings to get the distance beween them
 */
exports.levenstein = function(one, two){
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
