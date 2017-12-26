function recurse_det(matrix, column){
    var result = [];
    var orig_size = matrix.length;
    for(var row = 1; row<orig_size; row++){
       result.push(matrix[row].slice(0, column).concat(matrix[row].slice(column+1,orig_size)));
    }
    return result;
}

function det(matrix){
    if(matrix.length == 0){
        return 1;
    } else if(matrix.length == 1){
        return matrix[0][0];
    }

    var multiplier = 1;
    var result = 0;
    for(var col_num = 0; col_num < matrix[0].length; col_num++){
        result += multiplier*matrix[0][col_num]*(det(recurse_det(matrix, col_num)));
        multiplier *= -1;
    }
    return result;
}

function cramer(system, answer, col){

    var D = det(system);
    for(var i = 0; i< system.length; i++){
        system[i][col] = answer[i];
    }
    var D_col = det(system);
    return D_col/D;
}

function hypotenuse(x, y){
    return Math.sqrt(x*x + y*y);
}


