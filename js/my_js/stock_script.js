/* DEPENDENT on:
base.js

*/
var StockManager = StockManager || {};

$(document).ready(function() {

	var tableId = "#stock_table";
	var json = StockManager.jsonData[tableId];

	var queryStr = StockManager.getStocksQuery("yql", json, "Symbol", false);
	StockManager.generateTable_usingYQL(queryStr, tableId);

	queryStr = StockManager.getHistoricalDataQuery("yql", json["stocks"]);
	StockManager.generateCharts_usingYQL(queryStr, json["stocks"]);
	
});