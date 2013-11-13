// adapted from http://detectmobilebrowsers.com
var is_mobile = (function(a){return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)));})(navigator.userAgent||navigator.vendor||window.opera);

if (is_mobile) {
  var margin = {top: 250, right: 50, bottom: 100, left: 50};

  var width = 800 - margin.left - margin.right,
      height = 1200 - margin.top - margin.bottom;
} else {
  var margin = {top: 250, right: 50, bottom: 200, left: 50};

  var width = 1200 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;
}

var svg = d3.select("body").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("display", "block")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/113.json", drawGraph);

d3.select("#congress-picker > select")
  .on("change", function(d) {
    d3.select("#loading").style("display", null);
    congress = this.options[this.selectedIndex].value;
    d3.json("data/" + congress + ".json", drawGraph);
  });

function drawGraph(data) {
  // clear SVG
  svg.text('');

  // Initialize nodes to that Republicans are roughly to the right
  for (var i = 0; i < data.nodes.length; i++) {
    if (data.nodes[i].color  == "b") {
      if (is_mobile)
        data.nodes[i]["y"] = height / 4;
      else
        data.nodes[i]["x"] = width / 4;
   } else if (data.nodes[i].color == "r")
      if (is_mobile)
        data.nodes[i]["y"] = 3 * height / 4;
      else
        data.nodes[i]["x"] = 3 * width / 4;
  }

  var domain = d3.extent(data.links, function(d) {
    return d.weight;
  })

  var link_distance = d3.scale.pow()
    .exponent(3)
    .range([250, 1])
    .domain(domain);

  var force = d3.layout.force()
    .gravity(0.1)
    .charge(-1000)
    .linkDistance(function(d) {
      return link_distance(d.weight);
    })
    .linkStrength(0.05)
    .size([width, height])
    .nodes(data.nodes)
    .links(data.links);

  var stroke_width = d3.scale.pow()
    .exponent(5)
    .range([0, 5])
    .domain(domain);

  // Initiliaze force layout statically
  force.start();
  for (var i = data.links.length; i > 0; --i) force.tick();
  force.stop();

  links = svg.selectAll(".link")
      .data(data.links)
    .enter().append("line")
      .attr("opacity", 0.1)
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .attr("stroke-width", function(d) {
        return stroke_width(d.weight);
      })
      .attr("stroke", function(d) {
        // Edge color is halfway that of the two nodes
        return d3.interpolateLab(color(d["source"]), color(d["target"]))(0.5);
      });

  nodes = svg.selectAll(".node")
      .data(data.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .on("mouseover", highlightNode)
      .on("mouseout", resetHighlight);

  nodes.append("circle")
    .attr("x", 0)
    .attr("y", 0)
    .attr("r", 10)
    .attr("stroke", "white")
    .attr("fill", color);

  nodes.append("text")
    .attr("dx", 16)
    .attr("dy", ".35em")
    .style("pointer-events", "none")
    .style("font-size", 10)
    .style("font-family", "sans-serif")
    .text(function(d) { return d.id });

  //force.alpha(0.01);

  d3.select("#loading").style("display", "none");
}

function color(d) {
  if (d.color == "b")
    return d3.lab("#1414ff");
  else if (d.color == "r")
    return d3.lab("#ff1414");
  else
    return d3.lab("#646464");
}

function highlightNode(node) {
  var g = d3.select(d3.event.target.parentNode);

  g
    .select("circle")
    .attr("r", 12);

  g
    .select("text")
    .attr("dx", 16)
    .style("font-size", 16)
    .style("font-weight", "bold")
    .style("stroke", "white")
    .style("stroke-width", 0.25);

  links
    .attr("opacity", 0.05);

  links
    .filter(function(d) {
      return d.source == node || d.target == node;
    }).attr("opacity", 1);

  links
    .sort(function(a, b) {
      // Makes sure the selected edges are always on top
      if (a.source == node || a.target == node)
        return 1;
      else if (b.source == node || b.target == node)
        return -1;
      else
        return 0;
    });

  nodes
    .filter(function(d) {
      return d != node;
    }).attr("opacity", 0.4);

  nodes
    .sort(function(a, b) {
      if (a == node)
        return 1;
      else if (b == node)
        return -1;
      else
        return 0;
    });
}

function resetHighlight() {
  nodes.selectAll("circle")
    .attr("r", 6);

  nodes.selectAll("text")
    .attr("dx", 10)
    .style("font-size", 10)
    .style("font-weight", null)
    .style("stroke", null)
    .style("stroke-width", null);

  links
    .attr("opacity", 0.1);

  nodes
    .attr("opacity", null);
}
