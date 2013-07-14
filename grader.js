#!/usr/bin/env node
/*
 * Automatically grade files for the presence of specified
 * HTML tags/attributes. Uses commander.js and cheerio. Teaches
 * command line application development and basic DOM parsing.
 *
 */

var fs = require("fs");
var program = require("commander");
var cheerio = require("cheerio");
var rest = require("restler");
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if(!fs.existsSync(instr)) {
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1);
  }
  return instr;
};

var cheerioHtmlFile = function(htmlfile) {
  return cheerio.load(fs.readFileSync(htmlfile));
}

var cheerioHtmlText = function(text) {
  return cheerio.load(text);
}

var loadChecks = function(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(src, checksfile, isUrl) {
  if (!isUrl) {
    $ = cheerioHtmlFile(src);
  } else {
    $ = cheerioHtmlText(src);
  }
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for(var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  
  return out;
};

var clone = function(fn) {
  return fn.bind();
}

var getContent = function(url, callback) {
  rest.get(url).on('complete', function(result) {
    callback(result);
  });
};


if(require.main == module) {
  program
    .option('-c, --checks <check_file>', 'Path to checks.json',
        clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', 
        clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url_link>', 'URL to website for checking')
    .parse(process.argv);
  console.log(program.url);
  var source = "";
  if (program.url != null) {
    getContent(program.url, function(result) {
      source = result;

      var checkJson = checkHtmlFile(source, program.checks, true);
      var outJson = JSON.stringify(checkJson, null, 4);
      console.log(outJson);
    });
  }
  else {
    source = program.file;
    
    var checkJson = checkHtmlFile(source, program.checks, false);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
  }
} else {
  exports.checkHtmlFile = checkHtmlFile;
}
