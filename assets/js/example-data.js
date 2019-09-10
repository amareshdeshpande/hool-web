ExampleData = {};

ExampleData.handleMockjaxResponse = function(settings) {
    var page = settings.data.page || 1;
    var order_by = settings.data.order_by;
    var sortorder = settings.data.sortorder;

	var rows_per_page = 10;
	var start_index = (page - 1) * rows_per_page;

	var total_pages = 1;
	var data = ExampleData.fruits;
	if (data.length != 0) {
		total_pages = parseInt((data.length - 1) / rows_per_page) + 1;
	}

	if (order_by) {
		data.sort(function(left, right) {
			var a = left[order_by];
			var b = right[order_by];

			if (sortorder == 'desc') {
				var c = b;
				b = a;
				a = c;
			}

			if (a < b) {
				return -1;
			}
			else if (a > b) {
				return 1;
			}
			else {
				return 0;
			}
		});
	}

	var result = {
		total_pages: total_pages,
		rows: data.slice(start_index, start_index + rows_per_page)
	};
    this.responseText = result;
};

ExampleData.fruits = [{
	"kibitzer": "10",
	"history": "",
	"players": "01/04",
    "host": "Persea americana",
	"": "",
    "time": "01 sec"
},
{
	"kibitzer": "11",
	"history": "",
	"players": "02/04",
    "host": "Capsicum annuum",
	"": "",
    "time": "02 sec"
},
{
	"kibitzer": "12",
	"history": "",
	"players": "03/04",
    "host": "Momordica charantia",
	"": "",
    "time": "03 sec"
},
{
	"kibitzer": "13",
	"history": "",
	"players": "04/04",
    "host": "Cucurbita pepo",
	"": "",
    "time": "04 sec"
},
{
	"kibitzer": "14",
	"history": "",
	"players": "05/04",
    "host": "Cucumis sativus",
	"": "",
    "time": "05 sec"
},
{
	"kibitzer": "15",
	"history": "",
	"players": "06/04",
    "host": "Coccinia grandis",
	"": "",
    "time": "06 sec"
},
{
	"kibitzer": "16",
	"history": "",
	"players": "07/04",
    "host": "Solanum melongena",
	"": "",
    "time": "07 sec"
},
{
	"kibitzer": "17",
	"history": "",
	"players": "08/04",
    "host": "Cucurbita spp.",
	"": "",
    "time": "08 sec"
},
{
	"players": "09/04",
    "host": "Zea mays",
    "time": "09 sec"
},
{
	"players": "10/04",
    "host": "Capsicum annuum Grossum group",
    "time": "10 sec"
},
{
    "host": "Praecitrullus fistulosus",
    "time": "11 sec"
},
{
    "host": "Physalis philadelphica",
    "time": "12 sec"
},
{
    "host": "Solanum lycopersicum var",
    "time": "13 sec"
},
{
    "host": "Benincasa hispida",
    "time": "14 sec"
},
{
    "host": "Cucumis anguria",
    "time": "15 sec"
},
{
    "host": "Cucurbita pepo",
    "time": "16 sec"
}];