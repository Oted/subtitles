/**
 *  Public function for levenstein distance
 */
exports.getTotalLeven = function(query, result){
    var queryStripped = this.strip(query),
        resultStripped = this.strip(result),
        modifiedObj  = modifyLevenValue(queryStripped, resultStripped);
    
    // console.log(resultStripped);
    // console.log(modifiedObj);

    if (modifiedObj.rating === 1){
        return modifiedObj.value / query.length;
    } else if (modifiedObj.rating === 2) {
        return modifiedObj.value / query.length + 0.28;
    } else {
       return 1.0;
    }
};


/**
 *  Compare strings to get the distance beween them
 */
var standardLevenstein = function(query, result){
    var matrix = [],
        cost;

    if (query.length < 1 || result.length < 1) return 100000;
    for (var i = 0; i < query.length; i++){
        matrix[i] = [];
        for (var j = 0; j < result.length; j++){
            if (i === 0) matrix[i][j] = j;
            else if (j === 0) matrix[i][j] = i;
            else {
                if (query[i] === result[j]) cost = 0;
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

    value = matrix[query.length - 1][result.length - 1]; 
    return value;
};


/**
 *  Modify the levenstein value for this specific usage
 */
var modifyLevenValue = function(query, result){
    var queryArr = query.split("."),
        resultArr = result.split("."),
        sReg = /s(\d+)(:?\.*|\W*)*?e(\d+)/gi,
        totalMinValue = 0,
        returnObj = {rating: 1, value: 0},
        queryR,
        resultR,
        tempValue;

        queryR = sReg.exec(query);
        sReg.lastIndex = 0;
        resultR = sReg.exec(result);
    
        
    //check for pattern sXXeYY 
    if (queryR && resultR){
        if (queryR[1] === resultR[1] && queryR[3] === resultR[3]){
            query.replace(queryR[0], "");
            result.replace(resultR[0], "");
            queryArr = query.split(".");
            resultArr = result.split(".");
        } else {
            returnObj.rating = 2;
        }
    } else if (queryR || resultR){
        returnObj.rating = 2;
    }

    //greatly enchance levendistance by splitting up the string to substrings and compare all, obs ordo(n^2) 
    for (var i = 0; i < queryArr.length; i++){
        var minValue = 99;
        for (var j = 0; j < resultArr.length; j++){
            if (queryArr[i].length > 0 && resultArr[j].length > 0){
                tempValue = standardLevenstein(queryArr[i], resultArr[j]);
                
                if (i === 0 && j === 0){
                    // console.log(resultArr[i]);
                    if (resultArr[i] !== queryArr[j]){
                        returnObj.rating = 2; 
                    }
                } 
                
                if (tempValue < minValue){
                    minValue = tempValue; 
                }
            } else {
                minValue = 1;
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
 * Strips a string down to its bquerys
 */
exports.strip = function(str){
    str = str.replace(/[ _,\-]/g, ".");
    str = str.replace(/[#\+()\t\n]/g,"");
    str = str.replace(/\[[^\].]+\]$/,"");
    return str.toLowerCase();
};
