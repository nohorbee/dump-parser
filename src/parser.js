

var Parser = module.exports = function(verbose) {
  this.verbose = verbose;
};

Object.defineProperty(Parser, "STRUC_STARTER", { value: "{" });
Object.defineProperty(Parser, "STRUCT_ENDING", { value: "}" });
Object.defineProperty(Parser, "OBJ_INDICATOR", { value: "object" });
Object.defineProperty(Parser, "ARR_INDICATOR", { value: "array" });


Parser.prototype.parse = function(stringToParse) {
  var that = this;
  return new Promise(function(fullfill, reject) {
    try {

      lines = stringToParse.split("\n");
      var obj = that.parseSync(lines, that);

      fullfill(obj);

    } catch(e) {
      if (!e.getMessage) { e.getMessage = function() { return e }; };
      reject(e);
    }

  });
}

Parser.prototype.getPropertyName = function(line) {
  var start = line.indexOf("\"");
  if (start>=0) {
    var end = line.indexOf("\"", start + 1);
    return (line.substring(start+1, end));
  } else {
    return "";
  }

}

Parser.prototype.parseSync = function(lines, that) {

  var obj;
  while (lines.length > 0) {
    line = lines.shift().trim();
    if (this.verbose) console.log("line: " + line);
    if(that.startsSubstructure(line)) {
      obj = that.buildObject(line)
    } else if(that.closingObject(line)) {
      return obj;
    } else {
      value = lines.shift().trim();
      if (this.verbose) console.log("value: " + value);
      var propertyName = that.getPropertyName(line)
      if (that.startsSubstructure(value)) {
        lines.unshift(value);
        obj[that.getPropertyName(line)] = that.parseSync(lines, that);
      } else {

        obj[that.getPropertyName(line)] = that.getPropertyValue(value);
      }
    }
  }

  return obj;
}

Parser.prototype.closingObject = function(line) {  return(line==Parser.STRUCT_ENDING) }

Parser.prototype.getPropertyValue = function(line) {
  var prop = {}
  var type;
  var value;

  if (line=="NULL") {
    type = "null",
    value = "null"
  } else if (line.substring(0,3) == "int") {
    type = "int";
    value = line.substring(line.indexOf("(")+1,line.lastIndexOf(")"));
  } else if (line.substring(0,4) == "bool") {
    type = "bool";
    value = line.substring(line.indexOf("(")+1,line.lastIndexOf(")"));
  } else if (line.substring(0,6) == "string") {
    type = "string";
    value = line.substring(line.indexOf("\"")+1,line.lastIndexOf("\""));
  } else {
    throw new ParserException("can't get type:" + line);
    type = "unknown";
    value = line;
  }
  prop = { "type": type, "value": value, "metadata": {}  }
  return prop;
}

Parser.prototype.startsSubstructure = function(line) {

  return (line.indexOf(Parser.STRUC_STARTER) == line.length-1);
}

Parser.prototype.buildObject = function(line) {

  if(!(obj = this.parseObject(line))) {
    if(!(obj = this.parseArray(line))) {
      throw new ParserException("Can't parse as new object or array. Original line: " + line);
    }
  }
  return obj;
}

Parser.prototype.parseObject = function(line) {
  var obj = false
  if (line.substring(0, Parser.OBJ_INDICATOR.length)==Parser.OBJ_INDICATOR) {
    obj = {};
    obj.metadata = {}
    obj.metadata.isObject = true;
    obj.metadata.clazz = line.substring(line.indexOf("(")+1,line.indexOf(")"));
    obj.metadata.propertiesCount = line.substring(line.lastIndexOf("(")+1,line.lastIndexOf(")"));
    obj.metadata.phpId = line.substring(line.indexOf("#")+1,line.indexOf(" ("));
    if (this.verbose) console.log(obj);
  }
  return obj;
}

Parser.prototype.parseArray = function(line) {
  if (line.substring(0, Parser.ARR_INDICATOR.length)==Parser.ARR_INDICATOR) {
    //throw new ParserException("Array serialization is not yet implemented. Original line: " + line);
    obj = {};
    obj.metadata = {};
    obj.metadata.isArray = true;
    //todo: add array values
  }
  return obj;
}


function ParserException(message) {
   this.message = message;
   this.name = "ParserException";

   this.getMessage = function() { return this.message }
}
