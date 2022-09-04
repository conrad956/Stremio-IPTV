
const express = require('express');
const app = express();
const cors = require('cors');

const iptv = require("./iptv");

var manifest = require("./manifest.json");

const regions = require('./regions.json');
const landingTemplate = require('./landingTemplate');

app.use(cors())


app.get('/', (_, res) => {
  res.redirect('/configure')
  res.end();
});


app.get('/:configuration?/configure', (req, res) => {
  res.setHeader('content-type', 'text/html');
  res.end(landingTemplate());
});


app.get('/manifest.json', (req, res) => {
	var i = 0;
for (let region in regions) {
    manifest.catalogs[i] = {
        "type": "tv",

        "id": region,

        "name": regions[region].name
    };
    i++;
};

	res.setHeader('Cache-Control', 'max-age=86400, public');
	res.setHeader('Content-Type', 'application/json');
	res.send(manifest);
	res.end();
});


app.get('/:configuration?/manifest.json', (req, res) => {
	console.log("dexter");
	console.log(manifest.catalogs)
	var providors = req.params.configuration.split('|')[0].split('=')[1].split(',');
	var costumURL = atob(req.params.configuration.split('|')[1].split('=')[1]);
	console.log(costumURL);
	
  var c = 0;
  
  if (costumURL){
	  manifest.catalogs[c] = {
        "type": "tv",

        "id": "customiptv",

        "name": "Custom IPTV"
    };
	c++;
  }
  
  
for (let i=0;i<providors.length;i++) {

    manifest.catalogs[c] = {
        "type": "tv",

        "id": providors[i],

        "name": regions[providors[i]].name
    };
    c++;
};
  

	res.setHeader('Cache-Control', 'max-age=86400, public');
	res.setHeader('Content-Type', 'application/json');
	res.send(manifest);
	res.end();
});


app.get('/:configuration?/:resource/:type/:id/:extra?.json', (req, res) => {
	
	res.setHeader('Cache-Control', 'max-age=86400, public');
	res.setHeader('Content-Type', 'application/json');
	
	console.log(req.params);
	const { configuration, resource, type, id } = req.params;
	const extra = req.params.extra ? qs.parse(req.url.split('/').pop().slice(0, -5)) : {}
  
	var providors = configuration.split('|')[0].split('=')[1].split(',');
	var costumURL = atob(configuration.split('|')[1].split('=')[1]);
	if(resource == "catalog"){
	if ((type == "tv")) {
        Promise.resolve(iptv.catalog(id,costumURL))
        .then((metas) => { 
	res.send(JSON.stringify({ metas}));
	res.end();
		});
    }}
	else if(resource == "meta"){
	if ((type == "tv")) {
		
	console.log('costumURL',costumURL);
        Promise.resolve(iptv.meta(id,costumURL))
        .then((meta) => {  
		console.log(meta)
	res.send(JSON.stringify({ meta}));
	res.end();
		});
		
    }}
	
	else if(resource == "stream"){
	if ((type == "tv")) {
        Promise.resolve(iptv.stream(id,costumURL))
        .then((stream) => { 
		console.log(stream)
	res.send(JSON.stringify({streams: stream}));
	res.end();
		});
    }}
	
})






module.exports = app