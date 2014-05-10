/* DEPENDENT on:
base.js

*/
var StockManager = StockManager || {};

$(document).ready(function() {

	var tableId = "#stock_table";
	var json = StockManager.jsonData[tableId];

	var queryStr = StockManager.getStocksQuery("yql", json, "Symbol", false);
	StockManager.generateTable_usingYQL(queryStr, tableId);

	//temporary measure to reduce infringing on YDN's rate limit
	//although now we are potentially running a lot more queries
	var stocks = json["stocks"].sort();
	for (var s in stocks) {
		queryStr = StockManager.getHistoricalDataQuery("yql", stocks[s]);
		StockManager.generateCharts_usingYQL(queryStr);
	}
	
});