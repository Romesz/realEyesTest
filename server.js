/* jshint esversion: 6 */
/* globals require, console */

const request = require('request');
const cheerio = require('cheerio');
const express = require('express');

const app = express();

app.get('/data', getXml);

app.listen(3000);
console.log('server is listening on port 3000');

function getXml(req, res) {
  request('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml', (err, response, body) => {
    if(err || response.statusCode !== 200)
     throw(err);

    let $ = cheerio.load(body, {
      xmlMode: true
    });
    //console.log($);

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Content-Type', 'application/xml');
    res.send($.xml());
  });
}