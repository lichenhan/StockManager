/* DEPENDENT on:
base.js

*/
var StockManager = StockManager || {};

$(document).ready(function() {

	var tableId = "#stock_table";
	var queryStr = StockManager.getQuery("yql", StockManager.jsonData[tableId], "Symbol", false);
	StockManager.generateTable_usingYQL(queryStr, tableId);
	 
	
});