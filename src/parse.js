var ArgumentParser = require ('argparse').ArgumentParser;
var Scaffolder = require('./scaffolder');
var StringBuilder = require('string-builder');
var sb = new StringBuilder();
var path = require('path');
var fs = require('fs.extra');


var parser = new ArgumentParser({
    version: '0.0.1',
    addHelp:true,
    description: 'Argparse example'
});

parser.addArgument(
    [ '-s', '--source' ],
    {
        help: 'The file containing the var_dump result to be parsed'
    }
);

var err = false;
options = parser.parseArgs();

if (options.source==null) {
    sb.appendLine("- The Source file must be specified");
    err = true;
}

if (err) {
    console.log("Please, check the following errors (parse -h or parse --help for the User Guide)");
    console.log(sb.toString());
    return;
}

scaffolder = new Scaffolder(false);
scaffolder.generate(options);
