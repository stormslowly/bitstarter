#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var http = require('http');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertHttpUrl = function(url){
    if(url.substring(0,7)!="http://" ){
        console.log("url %s does not start with http://",url);
        process.exit(1);
    }
    return url;
}

var cheerioHtmlData = function(data){
  return cheerio.load(data)
}


var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};


var checkHtmlData = function(data,checksfile){
  $ = cheerioHtmlData(data);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for(var ii in checks) {
      var present = $(checks[ii]).length > 0;
      out[checks[ii]] = present;
  }
  return out;
}

var checkHtmlFile = function(filename,checksfile){
    data = fs.readfileSync(filename)
    return checkHtmlData(data,checksfile);
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var loadFile = fs.readFile

var loadUrl = function (url, callback){
    http.get(url, function(res) {
        var data = ""

        res.on('data',function(chunk){
            data += chunk;
        });
        res.on('end',function(){
            callback(null,data);
        });
    }).on('error', function(e) {
        callback(e,"");
    });
}

var grade = function(data,checksjson){
    var checkJson = checkHtmlData(data, checksjson);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}

if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u --url <url_link>', 'Link to the html',clone(assertHttpUrl))
        .parse(process.argv);
    
    if(program.url){
        loadUrl(program.url,function(err,data){
            if (err) throw (err);
            grade(data,program.checks);
        });
    }else if (program.file){
        loadFile(program.file, function(err,data){
            if (err) throw(err);
            grade(data,program.checks);
        });
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
