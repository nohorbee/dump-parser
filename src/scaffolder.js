var path = require('path');
var fs = require('fs');
var Parser = require('./parser');
var StringBuilder = require('string-builder');
var sb = new StringBuilder();
var Scaffolder = module.exports = function(verbose) {
    this.verbose = verbose;
}


Scaffolder.prototype.generate = function(options) {
  var stringToParse = fs.readFileSync(options.source).toString();
  parser = new Parser(this.verbose);
  var that = this;
  parser.parse(stringToParse).then(
    function(parsedObject) { console.log(that.scaffold(parsedObject)) },
    function(e) { console.log("ERROR: " + e.getMessage()) }
  );
};

Scaffolder.prototype.scaffold = function(baseObject) {
  try {
    //console.log("baseObject: " + JSON.stringify(baseObject, null, "  "))

    var instanceName = getVarName(baseObject);
    var clazzName = getClassName(baseObject);

    sb.appendLine("$"+ instanceName +" = new " + clazzName + "();");
    for (var propertyName in baseObject) {
      if (baseObject.hasOwnProperty(propertyName) && (propertyName!="metadata")) {
        if(baseObject[propertyName].metadata.isObject) {
          this.scaffold(baseObject[propertyName]);
          appendPropertyObjectLine(sb, propertyName, "$"+ getVarName(baseObject[propertyName]) , instanceName);
        } else {
          appendPropertyLine(sb, propertyName, baseObject, instanceName);
        }
      }
    }
    return sb.toString();
  } catch(e) {
    console.log(e);
  }


}

var getVarName = function(object) {
  return object.metadata.clazz + "_" + object.metadata.phpId;
}

var getClassName = function(object) {
  return object.metadata.clazz;
}



var appendPropertyObjectLine = function(sb, propertyName, generatedInstance, instanceName) {

  if(propertyName.substring(0,1)=="_") {
    var setter = getSetter(propertyName.substring(1));
    var value = generatedInstance
    sb.appendLine("$"+ instanceName + "->" + setter + "("+ value +");");
  }
}


var appendPropertyLine = function(sb, propertyName, baseObject, instanceName) {
  var property = baseObject[propertyName];
  if(propertyName.substring(0,1)=="_") {
    var setter = getSetter(propertyName.substring(1));
    var value = getValue(property)
    sb.appendLine("$"+ instanceName + "->" + setter + "("+ value +");");
  }


}

var getSetter = function(propertyName) {
  return "set" + propertyName.substring(0,1).toUpperCase() + propertyName.substring(1);
}

var getValue = function(property) {
  var value;
  switch(property.type) {
    case "null":
      value = "NULL"
      break;
    case "int":
      value = property.value;
      break;
    case "bool":
      value = property.value;
      break;
    case "string":
      value = "\""+property.value+ "\"";
      break;
    case "unknown":
      throw new ScaffolderException("can't get type:" + line);
    default:
      break
  }

  return value;
}

function ScaffolderException(message) {
   this.message = message;
   this.name = "ParserException";

   this.getMessage = function() { return this.message }
}
