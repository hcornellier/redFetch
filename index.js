// Config
const fetch = require("node-fetch");
const chalk = require('chalk');
const http  = require('http');
const fs    = require("fs");

// Main 
const start = async () => 
{
    process.stdout.write('\nFetching tickers...... ')
	http.get("http://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt", function (res) {

		// Get tickers
		var tickers = "";
	    res.on('data', (chunk) => {
	        tickers += chunk;
	    });	

		// Get WSB posts
	    res.on('end', () => {	
	    	getRedditPosts(tickers);
	    });
	    
	}).on('error', (e) => {
		console.log(chalk.red('Error!\n' + e.message + '\n'));
	});
}

start();

function getRedditPosts(tickers) 
{
	const tickerArr   = [];
	const matches     = [];
	const matchArr    = [];
	const tickerLines = tickers.split('\n');
	for (var i=0; i<tickerLines.length; i++) 
	{
		var ticker = tickerLines[i].split('|')[0];
		if (ticker.length>0)
		{
			if (isBannedTicker(ticker))
				tickerArr.push('$'+ticker);
			else 
				tickerArr.push(ticker);
		}
	}
	
	process.stdout.write(chalk.green('Success!') + ' (tickers found: ' + chalk.green(tickerArr.length) + ')\nFetching Reddit data.. ');
	fetch( "https://api.reddit.com/r/stocks/new.json?sort=new&limit=100" )
		.then( response => response.json() )
		.then( response => 
		{
			const jsonObj = response.data.children;
			console.log(chalk.green('Success!'));
			Object.keys(jsonObj).forEach(function(key) 
			{
				var content = jsonObj[key].data.title + jsonObj[key].data.selftext;
				// console.log(content);
				var tickerArrLength = tickerArr.length;
				for (var i=0; i<tickerArrLength; i++)
				{
					var splitContent = content.split(" ");
					var splitContentLength = splitContent.length;
					for (var j=0; j<splitContentLength; j++)
					{
						if (splitContent[j] == tickerArr[i]) 
						{
							// Match found
							if (matches.includes(tickerArr[i]))
							{
								var index = matches.indexOf(tickerArr[i]);
								matchArr[index].count++;
							}
							else 
							{
								//console.log('New match found: ' + tickerArr[i]);
								var ticker = {
								    symbol: tickerArr[i],
								    count: 1
								};
								matchArr.push(ticker);
								matches.push(tickerArr[i]);
							}
						}
					}
				}
			});
			console.log('');
		})
		.then ( response => 
		{
			matchArr.sort(compareCount);
			var uniqueTickers = matches.length;
			for (var i=0; i<uniqueTickers; i++)
			{
				if (matchArr[i].count < 2) break;
				console.log(matchArr[i].symbol + '\t' + matchArr[i].count)
			}
			console.log();
		});
}

function compareCount(a, b) 
{
	if (a.count < b.count) { return 1; }
	if (a.count > b.count) { return -1; }
	return 0;
}

function isBannedTicker(ticker)
{
	if (ticker.length == 1)
		return true;
	if (ticker == 'ON')
		return true;
	if (ticker == 'DD')
		return true;
	if (ticker == 'YOLO')
		return true;
	if (ticker == 'IPO')
		return true;
	if (ticker == 'MOON')
		return true;
	if (ticker == 'TH')
		return true;
	if (ticker == 'OVID')
		return true;
	if (ticker == 'UK')
		return true;
}
