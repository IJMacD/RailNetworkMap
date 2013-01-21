$(function(){
	var relationID = 88071;
	function Node(lat,lon){this.lat=lat;this.lon=lon}
	Node.prototype.toString = function() {return this.lon+','+this.lat;};
	function Way(){this.nodes=[]}
	Way.prototype.toString = function() {return this.nodes.join(',');};
	function Relation(){this.ways=[]}
	Relation.prototype.toString = function() {return this.ways.join(',');};
	$.get('http://www.openstreetmap.org/api/0.6/relation/'+relationID+'/full', function(data){
		var osmXML = $(data),
			nodes = {},
			ways = {},
			relations = {}
			nodesXML = osmXML.find('node'),
			waysXML = osmXML.find('way'),
			relationsXML = osmXML.find('relation');
		$.each(nodesXML, function(i,item){
			var _item = $(item),
				id = _item.attr('id'),
				lat = _item.attr('lat'),
				lon = _item.attr('lon');
			nodes[id] = new Node(lat,lon);
		});
		$.each(waysXML, function(i,item){
			var _item = $(item),
				id = _item.attr('id'),
				nds = _item.find('nd'),
				way = new Way();
			$.each(nds, function(j,jtem){
				var _jtem = $(jtem),
					ref = _jtem.attr('ref');
				way.nodes.push(nodes[ref]);
			});
			ways[id] = way;
		});
		$.each(relationsXML, function(i,item){
			var _item = $(item),
				id = _item.attr('id'),
				members = _item.find('member'),
				relation = new Relation();
			$.each(members, function(j,jtem){
				var _jtem = $(jtem),
					ref = _jtem.attr('ref');
				if(_jtem.attr('role') == "outer")
					relation.ways.push(ways[ref]);
			});
			relations[id] = relation;
		});
		if(typeof relations[relationID] != "undefined")
			$('#output').text("["+relations[relationID].toString()+"]");
		else
			$('#output').text("Not Found");
	});
});
