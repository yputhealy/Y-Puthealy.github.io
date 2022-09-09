 

var Mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/puthealy/ckyvo21e3003z14ql7y5c000p/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicHV0aGVhbHkiLCJhIjoiY2t5dm82enFtMDBqODJ1cDF1NjcyYWM3NCJ9.bz38ppXYa1zIzeBKfcOuBQ', {
        attribution: `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>`
    }),

    OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

var map = L.map('map', {
    zoom: 5,
    layers: [OpenStreetMap, Mapbox]
});

var baseMaps = {
    "OpenStreetMap": OpenStreetMap,
    "Mapbox": Mapbox

};

L.control.layers(baseMaps).addTo(map);


var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {
    minZoom: 20,
    maxZoom: 18,
    attribution: osmAttrib
});

map.addLayer(osm);
map.setView(new L.LatLng(12.5657, 104.9910), 7);
var osm2 = new L.TileLayer(osmUrl, {
    minZoom: 4,
    maxZoom: 13,
    attribution: osmAttrib
});
var miniMap = new L.Control.MiniMap(osm2, {
    toggleDisplay: true
}).addTo(map);

var ndx;
    d3.csv("data/fim.csv").then(function(old_data) {
    array_nat = []
    array_note_co = []
    array_data_c = []
    array_cap_inv_m = []
    for (var i = 0; i < old_data.length; i++) {
        var array = old_data[i].nat.replace(/\s*\,\s*/g, ",").trim().split(",");
        var array_1 = old_data[i].note_co.replace(/\s*\,\s*/g, ",").trim().split(",");
        var array_2 = old_data[i].data_c.replace(/\s*\,\s*/g, ",").trim().split(",");
        var array_3 = old_data[i].cap_inv_m.replace(/\s*\,\s*/g, ",").trim().split(",");
        array_nat.push(array);
        array_note_co.push(array_1);
        array_data_c.push(array_2);
        array_cap_inv_m.push(array_3);
    };
    var data = []
    for (var i = 0; i < old_data.length; i++) {
        data.push({
            sector: old_data[i].sector,
            pro_loc: old_data[i].pro_loc,
            nat: array_nat[i],
            note_co: array_note_co[i],
            data_c: old_data[i].data_c,
            lat: old_data[i].lat,
            long: old_data[i].long,
            cap_inv_m: array_cap_inv_m[i]

        });
    };

    // console.log(data);

    function remove_empty_bins(source_group) {
        return {
            all: function() {
                return source_group.all().filter(function(d) {
                    return d.value != 0;
                });
            }
        };
    }


    ndx = crossfilter(data);

    var locationDim = ndx.dimension(function(d) {
        return [d["lat"],
            d["long"],
            d["sector"],
            d["pro_loc"],
            d["nat"],
            d["note_co"],
            d["data_c"],
            d["cap_inv_m"],
        ];
    });

    var sectorDim = ndx.dimension(function(d) {
        return d["sector"];
    });
    var pro_locDim = ndx.dimension(function(d) {
        return d["pro_loc"];
    });
    var natDim = ndx.dimension(function(d) {
        return d["nat"];
    }, true);

    var note_coDim = ndx.dimension(function(d) {
        return d["note_co"];
    }, true);

    var data_cDim = ndx.dimension(function(d) {
        return d["data_c"];
    });
    var data_cDim1 = ndx.dimension(function(d) {
        return d["data_c"];
    });
    var cap_inv_mDim = ndx.dimension(function(d) {
        return d["cap_inv_m"];
    });

    var allDim = ndx.dimension(function(d) {
        return d;
    });


    var groupname = "marker-select";
    var all = ndx.groupAll();
    var locationGroup = locationDim.group().reduce(function(p, v) {
            p["lat"] = v["lat"]
            p["long"] = v["long"]
            p["sector"] = v["sector"]
            p["pro_loc"] = v["pro_loc"]
            p["nat"] = v["nat"]
            p["note_co"] = v["note_co"]
            p["data_c"] = v["data_c"]
            p["cap_inv_m"] = v["cap_inv_m"]
                ++p.count;
            return p;
        },
        function(p, v) {
            --p.count;
            return p;
        },
        function() {
            return {
                count: 0
            };
        });

    var sectorGroup = sectorDim.group().reduceCount();
    var pro_locGroup = pro_locDim.group().reduceCount();
    var natGroup = natDim.group().reduceCount();
    var note_coGroup = note_coDim.group().reduceCount();
    var data_cGroup = data_cDim.group().reduceCount();
    var data_cGroup1 = data_cDim1.group().reduceCount();
    nonEmptyHist_year = remove_empty_bins(data_cGroup1)


    var sectorChart = dc.pieChart('#chart-ring-sector', groupname);
    var pro_locChart = dc.pieChart('#chart-ring-pro_loc', groupname);
    var natChart = dc.rowChart("#chart-ring-nat", groupname);
    var natAxisChart = new dc.axisChart('#nat-row-axis', groupname);
    var note_coChart = dc.pieChart('#chart-ring-note_co', groupname);
    var data_cChart = dc.pieChart('#chart-ring-data_c', groupname);
    var data_cChart1 = dc.barChart('#chart-data_c-count', groupname);
    

    var dataTableCount = dc.dataCount('.dc-dataTable-count', groupname);
    var dataTable = dc_datatables.datatable('#data-table', groupname);
    var dataCount = dc.dataCount('.dc-dataTitle-count', groupname);

    var d3SchemeCategory20c = ['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476', '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc', '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9']

    var paperMarkers = dc_leaflet.markerChart("#cluster-map-anchor", groupname)
        .dimension(locationDim)
        .group(locationGroup)
        .map(map)
        .valueAccessor(function(kv) {
            return kv.value.count;
        })
        .locationAccessor(function(kv) {
            return [kv.value.lat, kv.value.long];
        })
        .showMarkerTitle(false)
        .fitOnRender(true)
        .fitOnRedraw(true)
        .filterByArea(true)
        .cluster(true)
        .popup(function(kv, marker) {

            return "<dt><span style='font-weight:bolder'>Sector: </span> </dt> <dd>" + kv.value.sector + "<dd>" +
            "<dt><span style='font-weight:bolder'>Investment in million: </span> </dt> <dd>" + kv.value.cap_inv_m + "<dd>"+
            "<dt><span style='font-weight:bolder'>Project location: </span> </dt> <dd>" + kv.value.pro_loc + "<dd>"
                //"<dt><span style='font-weight:bolder'>Year: </span> </dt> <dd>" + kv.value.pro_loc + "<dd>" +
                //"<dt><span style='font-weight:bolder'>Authors: </span> </dt> <dd>" + kv.value.note_co + "<dd>" +
                //"<dt><span style='font-weight:bolder'>First Author: </span> </dt> <dd>" + '<a href= "' + kv.value.data_c + '" target="_blank">' + kv.value.first_author + "</a>" + "<dd>" +
                //"<dt><span style='font-weight:bolder'>First Author Institution: </span> </dt> <dd>" + kv.value.pro_dev + "<dd>" 
                // "<dt><span style='font-weight:bolder'>Papers Cited By As of Data Entry Date: </span> </dt> <dd>" + '<a href= "' + kv.value.paper_citedBy_url + '" target="_blank">' + kv.value.paper_citedBy_AsOf_dataEntryDate + "</a>" + "<dd>" +
                // "<dt><span style='font-weight:bolder'>Keywords: </span> </dt> <dd>" + kv.value.keyword_1 + ", " + kv.value.keyword_2 + ", " + kv.value.keyword_3 + ", " + kv.value.keyword_4 + ", " + kv.value.keyword_5 + "<dd>" +
                // "<dt><span style='font-weight:bolder'>The location where the study focused on: </span> </dt> <dd>" + kv.value.studyArea + "<dd>"
        })
        .clusterOptions({
            spiderfyOnMaxZoom: true,
            spiderLegPolylineOptions: {
                weight: 3,
                color: '#000',
                opacity: 0.8
            }
        });

    sectorChart
    .width(200)
    .height(280)
    .innerRadius(40)
    .dimension(sectorDim)
    .group(sectorGroup)
    .legend(new dc.HtmlLegend()
        .container('#sector-legend')
        .horizontal(false)
        .highlightSelected(true));

    pro_locChart
    .width(200)
    .height(280)
    .dimension(pro_locDim)
    .innerRadius(40)
    .group(pro_locGroup)
    .legend(new dc.HtmlLegend()
        .container('#pro_loc-legend')
        .horizontal(false)
        .highlightSelected(true))
          
    note_coChart
        .width(200)
        .height(280)
        .dimension(note_coDim)
        .group(note_coGroup)
        .innerRadius(40)
        .legend(new dc.HtmlLegend()
            .container('#note_co-legend')
            .horizontal(false)
            .highlightSelected(true));

    data_cChart1
        .width(260)
        .height(400)
        .dimension(data_cDim1)
        .group(nonEmptyHist_year)
        .x(d3.scaleOrdinal().domain(data_cDim1))
        .xUnits(dc.units.ordinal)
        .elasticX(true)
        .elasticY(true)
        .brushOn(false)
        .centerBar(true)
        .yAxisLabel('Count')
        .barPadding(0.8)
        .outerPadding(10)
        .gap(2)
        .renderlet(function(chart) {
            chart.selectAll("g.x text")
                .attr('dx', '0')
                .attr('dy', '14')
        })
        .yAxis().ticks(12);
    
    data_cChart
        .width(200)
        .height(280)
        .innerRadius(40)
        .dimension(data_cDim)
        .group(data_cGroup)
        .legend(new dc.HtmlLegend()
            .container('#data_c-legend')
            .horizontal(false)
            .highlightSelected(true));

    natChart
        .width(200)
        .height(380)
        .margins({
            left: 10,
            top: 15,
            right: 10,
            bottom: 0
        })
        .dimension(natDim)
        .group(natGroup)
        .elasticX(true)
        .colors("#1ca3ec")
        .ordering(function(d) {
            return -d.value;
        })
        .xAxis().ticks(7)
    natAxisChart
        .margins({
            left: 10,
            top: 0,
            right: 10,
            bottom: 10
        })
        .height(50)
        .width(320)
        .dimension(natDim)
        .group(natGroup)
        .elastic(true);

    dataCount
        .dimension(ndx)
        .group(all);

    dataTableCount
        .dimension(ndx)
        .group(all)

    dataTable
        .dimension(allDim)
        .group(function(d) {
            return 'dc.js insists on putting a row here so I remove it using JS';
        })
        .size(10)
        .columns([{
                label: 'Sector',
                type: 'string',
                format: function(d) {
                    return '<a href= "' + d["sector"] + '" target="_blank">' + d["sector"] + "</a>";;
                }

            }, {
                label: 'Location',
                type: 'string',
                format: function(d) {
                    return '<a href= "' + d["pro_loc"] + '" target="_blank">' + d["pro_loc"] + "</a>";
                }

            }, {
                label: 'Nationality',
                type: 'string',
                format: function(d) {
                    return '<a href= "' + d["nat"] + '" target="_blank">'+ d["nat"] + "</a>";
                }

            }, {
                label: 'Note of Coordinate',
                type: 'string',
                format: function(d) {
                    return '<a href= "' + d["note_co"] + '" target="_blank">' + d["note_co"] + "</a>";
                }

            }, {
                label: 'Data Classification',
                type: 'string',
                format: function(d) {
                    return '<a href= "' + d["data_c"] + '" target="_blank">' + d["data_c"] + "</a>";
                }
            }
        ])


    .sortBy(function(d) {
            return d.Sector;
        })
        .order(d3.ascending)
        .options({
            "scrollX": true
        })
        .on('renderlet', function(table) {
            table.selectAll('.dc-table-group').classed('info', true);
        });

    d3.selectAll('a#all').on('click', function() {
        dc.filterAll(groupname);
        dc.renderAll(groupname);
    });

    d3.selectAll('a#sector').on('click', function() {
        sectorChart.filterAll(groupname);
        dc.redrawAll(groupname);
    });
    d3.selectAll('a#pro_loc').on('click', function() {
        pro_locChart.filterAll(groupname);
        dc.redrawAll(groupname);
    });
    d3.selectAll('a#nat').on('click', function() {
        natChart.filterAll(groupname);
        dc.redrawAll(groupname);
    });

    d3.selectAll('a#note_co').on('click', function() {
        note_coChart.filterAll(groupname);
        dc.redrawAll(groupname);
    });

    d3.selectAll('a#data_c').on('click', function() {
        data_cChart.filterAll(groupname);
        dc.redrawAll(groupname);
    });
    d3.selectAll('a#data_c').on('click', function() {
        data_cChart1.filterAll(groupname);
        dc.redrawAll(groupname);
    });

    $("#mapReset").on('click', function() {
        paperMarkers.map().setView([24.5, 1.343465], 2);
    });

    dc.renderAll(groupname);
    dc.redrawAll(groupname);

});
$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
});

var offset = 70;
$('.navbar li a').click(function(event) {
    event.preventDefault();
    $($(this).attr('href'))[0].scrollIntoView();
    scrollBy(0, -offset);
});

var navOffset = $('.navbar').height();

$('.navbar li a').click(function(event) {
    var href = $(this).attr('href');

    event.preventDefault();
    window.location.hash = href;

    $(href)[0].scrollIntoView();
    window.scrollBy(0, -navOffset);
});
