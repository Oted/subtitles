/**
 *  Public function for levenstein distance
 */
exports.getTotalLeven = function(one, two){
    var oneStripped = this.strip(one),
        twoStripped = this.strip(two),
        standardValue = standardLevenstein(oneStripped, twoStripped),
        modifiedValue  = modifyLevenValue(standardValue, oneStripped, twoStripped) / one.length;
    
    console.log(oneStripped);
    console.log(twoStripped);

    console.log(modifiedValue);
    console.log();
    return modifiedValue;
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
    // console.log(one + " , " + two + "  :  " + value);
    return value;
};


/**
 *  Modify the levenstein value for this specific usage
 */
var modifyLevenValue = function(value, one, two){
    var oneArr = one.split("."),
        twoArr = two.split("."),
        oneSE = one.search(/s[0-9][0-9]e[0-9][0-9]/g),
        twoSE = two.search(/s[0-9][0-9]e[0-9][0-9]/g),
        minValue = Infinity,
        totalMinValue = 0,
        tempValue;
    
    // console.log("value before : " + value);

    for (var i = 0; i < oneArr.length; i++){
        for (var j = 0; j < twoArr.length; j++){
            if (oneArr[i].length > 0 && twoArr[j].length > 0){
                tempValue = standardLevenstein(oneArr[i], twoArr[j]);
                
                
                if (i === 0 && j === 0){
                    minValue = Math.pow(tempValue, 3);
                    break;
                }   
                // if (i == 1) tempValue *= Math.pow(tempValue, 2);   
                
                if (tempValue < minValue){
                    minValue = tempValue; 
                }

                // console.log(oneArr[i] + " , " + twoArr[j] + " : " + tempValue);
            };
        };

        // console.log(minValue);
        totalMinValue += minValue;
        minValue = Infinity;
    }

    if (totalMinValue < value) value = totalMinValue;
    
    if (oneSE !== -1 && twoSE !== -1){
        if (one.substring(oneSE, oneSE + 6) !== two.substring(twoSE, twoSE + 6)){
            value += 0.28 + value;
        }
    }
   
    // console.log("value after : " + value); 
    return value; 
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
