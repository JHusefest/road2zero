exports.removeDuplicates = function(num) {
   var x,
       len=num.length,
       out=[],
       obj={};

        for (x=0; x<len; x++) {
          obj[num[x]]=0;
        }

        for (x in obj) {
          out.push(x);
       }
        return out.length;
    }

exports.removeDuplicatesCoords = function(num) {
    var x,
        len=num.length,
        out=[],
        obj={};

        for (x=0; x<len; x++) {
              obj[num[x]]=0;
            }

            for (x in obj) {
              out.push(x);
           }
            return out;
      }
