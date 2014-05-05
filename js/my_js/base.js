/* Global Namespace */
var StockManager = StockManager || {};

StockManager.jsonData = 
{
	"dictionary_YQL": 
	{
		"Name": "Name",
		"Symbol": "Symbol",
		"StockExchange": "Exchange",
		"MarketCapitalization": "Market Capital",
		"PERatio": "P/E",
		"PEGRatio": "PEG",
		"PriceBook": "P/B",
		"EarningsShare": "EPS",
		"DividendShare": "Dividend*",
		"DividendYield": "Dividend Yield*",
		"DividendPayDate": "Dividend Pay Date",
		"LastTradePriceOnly": "Current Price",
		"Change": "Change",
		"PercentChange": "Percent Change"
	},
	"#stock_table": 
	{
		"stocks": ["'aapl'", "'goog'", "'fb'"],
		"fields": ["Name", "Symbol", "StockExchange", "MarketCapitalization", "PERatio", "PEGRatio", "PriceBook", "EarningsShare", "DividendShare", "DividendYield", "DividendPayDate", "LastTradePriceOnly", "Change", "PercentChange"]
	},
	"tooltips":
	{
		"MarketCapitalization": "<b> Market Capital </b></br> is the total dollar market value of a company's outstanding shares, calculated by multiplying the outstanding shares by the current market price of a single share'",
		"PERatio": "<b> Price-to-Earnings Ratio </b></br></br> Calculated as: </br><b> Market Value per Share / Earning per Share </b></br></br> Generally a high P/E ratio means that investors are anticipating higher growth in the future. The average market P/E ratio is 20-25 times earnings. For Value Investing, look at companies with P/E ratios at the lowest 10% of all equity securities.",
		"PEGRatio": "<b> Price-Earnings to Growth </b></br></br> Calculated as: </br><b> P/E &#247 Annual EPS Growth </b></br></br> The PEG ratio measures the value of a company. As a general rule of thumb a low PEG value (less than one) signifies that a company, and by extension, its stock is undervalued.",
		"PriceBook": "<b> Price-to-Book Ratio </b></br></br> Calculated as: </br><b> Stock Price / (Total Assets - Intangible Assets and Liabilities) </b></br></br> Essentially a low P/B could mean a stock is undervalued (bought at less than what it'd be worth if a company liquidated all its assets tommorow) but it could also mean something is fundamentally wrong with the company.",
		"EarningsShare": "<b> Earnings Per Share </b></br></br> Calculated as: </br><b> (Net Income - Dividends on Preferred Stock) / Average Outstanding Shares </b>",
		"DividendShare": "Dividend and Dividend Yield appear to be from the prior year.",
		"DividendYield": "Dividend and Dividend Yield appear to be from the prior year."
	}
};

StockManager.getStocksQuery = function(queryKey, json, order, desc) {
	var result;
	switch (queryKey.toLowerCase()) 
	{
		case "yql":
		default:
			if (json) {
				var str = "select " + json.fields.join()
					+ " from yahoo.finance.quotes"
					+ " where symbol in (" + json.stocks.join() + ")";
				if (json.fields.indexOf(order) >= 0) {
					str += " | sort(field='" + order;
					if (desc) {
						str += ", descending='true'";
					} 
					str += "')";
				}
				result = str;
			}
			break;
	}
	return result;
}

StockManager.getHistoricalDataQuery = function(queryKey, stocks) {

	/* overwrite default Date's toString */
	Date.prototype.toString = function () {
 
	    var padZero = function(obj) {
	          obj = obj + '';
	          if (obj.length == 1)
	              obj = "0" + obj
	          return obj;
	    }
	    
	    var output = "";
	    output += this.getFullYear();
	    output += "-" + padZero(this.getMonth()+1);
	    output += "-" + padZero(this.getDate());
    
    	return output; 
	}

	Date.prototype.getOneYearAgo = function () {
 
	    return new Date(this.getFullYear() - 1, this.getMonth(), this.getDay());
	}
    
	var result;
	switch (queryKey.toLowerCase()) 
	{
		case "yql":
		default:
			if (stocks) {
				var today = new Date();
				var oneYearAgo = today.getOneYearAgo();
				var str = "select Symbol, Date, Close from yahoo.finance.historicaldata"
					+ " where symbol in (" + stocks.join() + ")"
					+ " and startDate = '" + oneYearAgo + "' and endDate = '" + today 
					+ "' | sort(field='Symbol', field='Date', descending='false')";
				
				result = str;
			}
			break;
	}
	return result;
}


StockManager.generateTable_usingYQL = function(queryStr, tableId) {
	var columns = StockManager.jsonData[tableId].fields;

	var buildThead = function() {
		var tooltipMap = StockManager.jsonData["tooltips"];
		var str = "<tr>";
		for (var c in columns) {
			var key = columns[c]
			var id = StockManager.jsonData["dictionary_YQL"][key];
			str += "<th>";
			(function() {
				var foundationTooltipStart = "<span data-tooltip data-options='disable_for_touch:true' class='has-tip' title='";
				var foundationTooltipEnd = "'>";
				switch (key) {
					case "MarketCapitalization":
					case "PERatio":
					case "PEGRatio":
					case "PriceBook":
					case "EarningsShare":
					case "DividendShare":
					case "DividendYield":
						str += foundationTooltipStart + tooltipMap[key] + foundationTooltipEnd + id + "</span>";
						break;
					default:
						str += id;
						break;
				}	
			})();
			str += "</th>";
		}
		str += "</tr>";
		$(tableId+" thead").html(str);

	}

	var buildTbody = function(json) {
		if (json) {
			var str = "";
			var quote = json.quote;
			/* if quote returns a single stock, we throw it into an array to simplify logic */
			var stocks =  (quote.length) ? quote : [quote]; 
			for (var s in stocks) {
				var stock = stocks[s];
				var growth;
				var inner_str = "";
				for (var c in columns) {
					var key = columns[c];
					var value = (stock[key]) ? stock[key] : "N/A";
					if (key == "DividendYield" && value != "N/A") {
						value += "%";
					}
					if (key == "Change") {
					  growth = (value >= 0) ? true : false;
					}
					inner_str += "<td>" + value + "</td>";
				}
				//change to some other variable later to toggle between highlight or plain text
				str += (growth == null) ? "<tr>" : growth ? "<tr class='green'>" : "<tr class='red'>";
				str += inner_str;
				str += "</tr>";
			}
			$(tableId+" tbody").html(str);
		} else {
			console.log("Empty or invalid query");
		}
	}

	buildThead();

	YUI().use('yql', function(Y) {

		var q = new Y.YQLRequest(queryStr, function(r) {
			buildTbody(r.query.results);
			$(tableId).tablesorter();
	    }, {
	        //Optional URL Parameters to add to the request
	        diagnostics: 'true',
	        env: 'store://datatables.org/alltableswithkeys'
	    }, {
	        //Options
	        base: '://query.yahooapis.com/v1/public/yql?',
	        proto: 'https' //Connect using SSL
	    });

	    q.send();
	});

}

StockManager.generateCharts_usingYQL = function(queryStr, stocks) {

	var buildChartDiv = function(symbol) {
		var str = "<div class='row my_row'><div class='large-12 column'><div class='chart' id=" + symbol +"></div></div></div>";
		$("body").append(str);
	}

	YUI().use('yql', function(Y) {

		var q = new Y.YQLRequest(queryStr, function(r) {
			var quote = r.query.results.quote;
			var data = [];
			var currentStock = quote[0]["Symbol"];
			var index = 0;
			for (var q = index; q < quote.length; q++) {
				var symbol = quote[q]["Symbol"];
				var symbolCutQuotations = symbol.replace("'", "");
				if (currentStock != symbolCutQuotations || q == quote.length - 1) {
					buildChartDiv(currentStock);
					var currentChart = $("#" + currentStock + ".chart");
					currentChart.highcharts("StockChart", {
						rangeSelector : {
							selected : 1,
							inputEnabled: currentChart.width() > 480
						},

						title : {
							text : currentStock.toUpperCase() + " Stock Price"
						},
						
						series : [{
							name : currentStock.toUpperCase(),
							data : data,
							tooltip: {
								valueDecimals: 2
							}
						}]
					});
					currentStock = symbol;
					index = q;
					data = [];
					continue;
				}
				var closePrice = Number(quote[q]["Close"]);
				var dateStr = quote[q]["Date"];

				var yearMonthDay = dateStr.split("-");
				var year = Number(yearMonthDay[0]);
                var month = Number(yearMonthDay[1]) - 1;
                var day = Number(yearMonthDay[2]);

                var dateObject = new Date(year, month, day);
                var milliseconds = dateObject.getTime();

				data.push([milliseconds, closePrice]);
			}
	    }, {
	        //Optional URL Parameters to add to the request
	        diagnostics: 'true',
	        env: 'store://datatables.org/alltableswithkeys'
	    }, {
	        //Options
	        base: '://query.yahooapis.com/v1/public/yql?',
	        proto: 'https' //Connect using SSL
	    });

	    q.send();
	});
}



