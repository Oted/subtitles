/**
 *  Public function for levenstein distance
 */
exports.getTotalLeven = function(one, two){
    var oneStripped = this.strip(one),
        twoStripped = this.strip(two),
        modifiedObj  = modifyLevenValue(oneStripped, twoStripped);
    
    // console.log(modifiedObj);

    if (modifiedObj.rating === 1){
        return modifiedObj.value / one.length;
    } else if (modifiedObj.rating === 2) {
        return modifiedObj.value / one.length + 0.28;
    } else {
       return 1.0;
    }
};


/**
 *  Compares two strings to get the distance beween them
 */
var standardLevenstein = function(one, two){
    var matrix = [],
        cost;

    if (one.length < 1 || two.length < 1) return 100000;
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

    value = matrix[one.length - 1][two.length - 1]; 
    return value;
};


/**
 *  Modify the levenstein value for this specific usage
 */
var modifyLevenValue = function(one, two){
    var oneArr = one.split("."),
        twoArr = two.split("."),
        oneSE = one.search(/s[0-9][0-9]e[0-9][0-9]/g),
        twoSE = two.search(/s[0-9][0-9]e[0-9][0-9]/g),
        totalMinValue = 0,
        tempValue,
        returnObj = {rating: 1, value: 0};
   
    //check for patter sXXeYY 
    if (oneSE !== -1 && twoSE !== -1){
        if (one.substring(oneSE, oneSE + 6) !== two.substring(twoSE, twoSE + 6)){
            returnObj.rating = 2;
        }
    }

    //greatly enchance levendistance by splitting up the string to substrings and compare all, obs ordo(n^2) 
    for (var i = 0; i < oneArr.length; i++){
        var minValue = 99;
        for (var j = 0; j < twoArr.length; j++){
            if (oneArr[i].length > 0 && twoArr[j].length > 0){
                tempValue = standardLevenstein(oneArr[i], twoArr[j]);
                
                if (i === 0 && j === 0){
                    if (tempValue > 1){
                        returnObj.rating = 3; 
                    }
                } 
                
                if (tempValue < minValue){
                    minValue = tempValue; 
                }
            } else {
                minValue = 9;
            }
        };

        // console.log(minValue);
        totalMinValue += minValue;
        minValue = Infinity;
    }

    returnObj.value = totalMinValue;
    return returnObj; 
};


/**
 * Strips a string down to its bones
 */
exports.strip = function(str){
    str = str.replace(/[ _]/g, ".");
    str = str.replace(/[#,\-\+()\t\n]/g,"");
    str = str.replace(/\[[^\].]+\]$/,"");
    return str.toLowerCase();
};
