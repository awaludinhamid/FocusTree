/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function(){
    //loadingStateChange("show");
    
    /* VARIABLE DECLARATION */
    //
    var m = [100, 80, 100, 80], //svg padding to tree(up,left,down,right)
        minW = 1360, //min tree diagram width
        minH = 768, //min tree diagram height
        w = 0, //tree diagram width
        h = 0, //tree diagram height
        cnt = 0; //node count
    var root, tree, diagonal, vis, tooltip, linktip, linGradRed, linGradGreen, linGradYellow, linGradBlue, linGradGrey, linGradPurple, radGrad; //tree var holder
    var squareSide = 30; //square side width/length
    var lLine = 320; //hierarchy line length
    var linkTree = "";	//json file name
    var hoverFlag = 0;//avoid hover on click
    var delimiter = "_";//kpi param value separator
    //	
    var kpiBrkdwnFlag = 0; //0=by kpi 1=by area
    //
    var arrFlag = [], //switch flagging, for hide/unhide item
        arrVal = [{name: "dept",value:""},  // current option selected
                  {name: "members",value:""},
                  {name: "kpiCode",value:""},
                  {name: "dts",value:""},
                  {name: "coy",value:""},
                  {name: "lob",value:""},
                  {name: "initMembers",value:""}];
    //
    var arrZoomPoint = [{left:"0px",scale:0.4},
                        {left:"12px",scale:0.7},
                        {left:"27px",scale:1},
                        {left:"42px",scale:1.25},
                        {left:"54px",scale:1.5}];
    var currZoomPoint = 2;//init index of arrZoomPoint array
    var bodyProp;//holder of <body> property like width,height
    //hardcode top position of hover info depend on various zooming, next time might be replaced with formulation found
    var arrTopPoint = {1:100,0.9:200,0.8:340,0.7:520,0.6:770,0.5:1100,0.4:1600,0.3:2420,0.2:4100,0.1:9100};
    /* *** */

    /* MEMBER & DEPARTMENT GENERATE */
    //load user detail json data
    //flag to switch data [un]loading and flag to switch detail[breakdown] view
    arrFlag.push({code: "dept", flag: 0, detFlag: 0});
    arrFlag.push({code: "coy", flag: 0, detFlag: 0});
    //append/labelling/styling distinct dept/layer, show first item only and set current dept/layer
    $("#kpiSelect").append(
      "<ul id='dept' class='list-unstyled'>"+
        "<li id='selectdept'>"+
          "<span id='spanselectdept' class='"+lblStyle+"' style='background-color: "+bkLabel+"; text-align: left; cursor: default'>"+
            "&nbsp;&nbsp;Department"+
          "</span>"+
        "</li>"+
        "<li id='mkt'><span id='spanmkt' class='"+pickStyle+"' style='text-align: left'>&nbsp;&nbsp;Marketing</span></li>"+
        "<li id='opr' style='display: none'><span id='spanopr' class='"+unpickStyle+"' style='text-align: left'>&nbsp;&nbsp;Operation</span></li>"+
      "</ul>");
    setValue("dept","mkt");
    $("#kpiSelect").append(
      "<ul id='coy' class='list-unstyled'>"+
        "<li id='selectcoy'>"+
          "<span id='spanselectcoy' class='"+lblStyle+"' style='background-color: "+bkLabel+"; text-align: left; cursor: default'>"+
            "&nbsp;&nbsp;Company"+
          "</span>"+
        "</li>"+
        "<li id='amf'><span id='spanamf' class='"+pickStyle+"' style='text-align: left'>&nbsp;&nbsp;AMF</span></li>"+
        "<li id='fif' style='display: none'><span id='spanfif' class='"+unpickStyle+"' style='text-align: left'>&nbsp;&nbsp;FIF</span></li>"+
        "<li id='mgs' style='display: none'><span id='spanmgs' class='"+unpickStyle+"' style='text-align: left'>&nbsp;&nbsp;MGS</span></li>"+
      "</ul>");
    setValue("coy","amf");
    //show data tree
    showJson();
    /* *** */

    /* ITEM CLICKED FUNCTION */
    //click on kpi option group (layer/coy/lob)
    $("#kpiSelect").on("click","ul li",function() {
      var thisId = this.id; //current item id
      var parentId = $(this).parent().attr("id"); //current parent (group)
      //label static, toggle list view and when current value different from previous one reload data
      //specific to dept group including change member/level item list
      if(thisId != "select"+parentId) {
        if(getFlag(parentId) == 1 && thisId != getValue(parentId)) {
          //set current group value
          setValue(parentId,thisId);
          showJson();
          setFlag(parentId,0);
        } else {
          setFlag(parentId,1);
        }
        toggleList(parentId,thisId);
      }
    });
    
    //click on zoom in button
    $("#zoom-slider #btn-zoom-in").click(function() {        
      for(var idx = 0; idx < arrZoomPoint.length; idx++) {
        //execute on current zoom index, apply if index greater than 1
        //see arrZoomPoint array to check the value of each position
        //decreased zooming by one position
        //redefine left/top tree position if zooming is greater than normal to avoid hidden view
        if(idx === currZoomPoint && idx > 0) {
          currZoomPoint -= 1;
          var bodyObj = $("#body");
          bodyObj.css("transform", "scale("+arrZoomPoint[currZoomPoint].scale+")");
          if(currZoomPoint >= 2) {
            bodyObj.css("left", (bodyProp.width*arrZoomPoint[currZoomPoint].scale-bodyProp.width)/2+bodyProp.left+"px");
            bodyObj.css("top", (bodyProp.height*arrZoomPoint[currZoomPoint].scale-bodyProp.height)/2+bodyProp.top+"px");
          }
          $("#zoom-slider #btn-slider").css("left",arrZoomPoint[currZoomPoint].left);
          break;
        }          
      }      
    });
    
    //click on zoom out button
    $("#zoom-slider #btn-zoom-out").click(function() {        
      for(var idx = 0; idx < arrZoomPoint.length; idx++) {
        //execute on current zoom index, apply if index less than array length
        //see arrZoomPoint array to check the value of each position
        //increased zooming by one position
        //redefine left/top tree position if zooming is greater than normal to avoid hidden view
        if(idx === currZoomPoint && idx < arrZoomPoint.length-1) {
          currZoomPoint += 1;
          var bodyObj = $("#body");
          bodyObj.css("transform", "scale("+arrZoomPoint[currZoomPoint].scale+")");
          if(currZoomPoint >= 2) {
            bodyObj.css("left", (bodyProp.width*arrZoomPoint[currZoomPoint].scale-bodyProp.width)/2+bodyProp.left+"px");
            bodyObj.css("top", (bodyProp.height*arrZoomPoint[currZoomPoint].scale-bodyProp.height)/2+bodyProp.top+"px");
          }
          $("#zoom-slider #btn-slider").css("left",arrZoomPoint[currZoomPoint].left);
          break;
        }          
      }      
    });    
    
    //click on expand/collapse button
    $("#zoom-slider #btn-expand-collapse").click(function() {
      //toggle between button (expand or collapse), identify through its current css class
      if($(this).hasClass("glyphicon-resize-small")) {
        $(this).attr("title","Expand All");
        collapseAll();
      } else {
        $(this).attr("title","Collapse All");
        expandAll();
      }
      $(this).toggleClass("glyphicon-resize-small").toggleClass("glyphicon-resize-full");
    });
    
    //click on back button
    $("#zoom-slider #btn-back").click(function(){
      backToMain();
    });
    
    /* *** */

    /* DATA MANIPULATION FUNCTION */
    //show data tree through json
    function showJson() {
      var linkTreeTemp = getKpiName(); //json name to create
      //generate json, if current json different from previous one and GET status is success then reload data
      if(linkTree != linkTreeTemp) {
        var data = window[linkTreeTemp];
        loadingStateChange("show");
        linkTree = linkTreeTemp;
        currZoomPoint = 2;
        $("#zoom-slider #btn-slider").css("left",arrZoomPoint[currZoomPoint].left);
        updateTree(data);
      }
    }

    //update tree object and data view
    function updateTree(treeLinked) {
      //clean tree contanier and create a new one
      d3.selectAll("#body").remove();
      $("body").append("<div id='body'></div>");
      //save json data to temporer var, init variable needed (including window size)
      //show first children only, update view, and restore scroll position
      root = treeLinked;
      initTreeVariable();
      if(bodyProp == null)
        bodyProp = {left:m[3],top:m[0],width:$("#body").css("width").replace("px",""),height:$("#body").css("height").replace("px","")};
      $("#body").css("left", (bodyProp.width*arrZoomPoint[currZoomPoint].scale-bodyProp.width)/2+bodyProp.left+"px");
      $("#body").css("top", (bodyProp.height*arrZoomPoint[currZoomPoint].scale-bodyProp.height)/2+bodyProp.top+"px");
      if(kpiBrkdwnFlag === 1) {
        $("#zoom-slider #btn-expand-collapse").addClass("glyphicon-resize-full").removeClass("glyphicon-resize-small");
        $("#zoom-slider #btn-expand-collapse").attr("title","Expand All");
        collapseAll();
      } else {
        $("#zoom-slider #btn-expand-collapse").addClass("glyphicon-resize-small").removeClass("glyphicon-resize-full");
        $("#zoom-slider #btn-expand-collapse").attr("title","Collapse All");
      }
      update(root);
      setDefTreeView();
      loadingStateChange("hide");
    }

    //update tree object
    function update(source) {
      var duration = d3.event && d3.event.altKey ? 5000 : 500;  //node transition duration
      //Compute the new tree layout
      var nodes = tree
        .nodes(root)
        .reverse();
      //Normalize for fixed-depth
      nodes.forEach(function(d) {d.y = d.depth * lLine;});
      // Update the nodes?
      var node = vis
        .selectAll("g.node")
        .data(nodes, function(d) {return d.id || (d.id = ++cnt);});
      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node
        .enter()
        .append("svg:g")
        .attr("class", "node")
        .attr("transform", function(d) {return "translate(" + source.y0 + "," + source.x0 + ")";});

      //put growth value on foreignObject or text node (if IE browser) and its properties
      if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) {//If IE
        nodeEnter
          .append("svg:rect")//only for background
          .attr("width",function(d) {return (
            d.name.length < 10 && d.name.toUpperCase() === d.name ? 9 :
            (d.name.length < 10 || d.name.toUpperCase() === d.name? 8 : 6)) * (d.name.length);})
          .attr("height", 20)
          .attr("rx", 5)
          .attr("ry", 5)
          //filled object with color related to its value, except root has additional color if it not in breakdown view
          .style("fill", function(d){
            if(kpiBrkdwnFlag == 0 && d == root) {
                return "purple";
              } else {
                if(d.button == "btn btn-success btn-sm") {
                  return "green";
                } else if(d.button == "btn btn-danger btn-sm") {
                  return "red";
                } else if(d.button == "btn btn-warning btn-sm") {
                  return "orange";
                } else {
                  return "grey";
                }
              }})
          .style("cursor", function(d) {return (kpiBrkdwnFlag == 0 && d == root) ? "default" : "pointer";})
          .attr("y", "4")
          //.attr("x", function(d) {return d.systemId === 3 ? "40" : "13";})
          .attr("x", "13")
          //show info by breakdown or detail depend on flag          
          .on("click",function(d) {
            showInfo(root,d);
          });
        nodeEnter
          .append("svg:text")
          .text(function(d) {return d.name;})
          .style("font-size","10px")
          .attr("fill",function(d){if(d.button == "btn btn-default btn-sm") return "black"; else return "white";})
          .attr("y", "17")
          //.attr("x", function(d) {return d.systemId === 3 ? "44" : "17";})
          .attr("x", "17")
          .style("cursor",function(d) {return (kpiBrkdwnFlag == 0 && d == root) ? "default" : "pointer";})
          .on("click",function(d) {        //after action performed, reset counter
            showInfo(root,d);
          });
      } else {
        nodeEnter
          .append("svg:foreignObject")
          .attr("width", function(d) {if(d.name.length * 10 > 320) return 320; return (d.name.length < 10? 15 : 8) * (d.name.length);})
          .attr("height", "22px")
          .attr("id","foreignObject")
          .attr("y", "0em")
          //.attr("x", function(d) {return d.systemId === 3 ? "2.3em" : "1.0em";})
          .attr("x", "1.0em")
          .style("opacity","0.8")
          //filled object with color and icon related to its value, except root has additional color if it not in breakdown view
          .html(function(d) {
            var htmlElement = "<button class='"+d.button+"' title='Show breakdown'>"+              
              d.name+"&nbsp;"+(navigator.userAgent.indexOf("Chrome") == -1 ? "<span class='"+d.icon+"'></span>" : "")+"</button>"; //If Chrome
            if(kpiBrkdwnFlag == 0) {
              if(d == root) {
                htmlElement = htmlElement.replace("title='Show breakdown'","style='cursor: not-allowed'");
              }
            } else if(kpiBrkdwnFlag == 1) {
              if(d == root) {
                htmlElement = htmlElement.replace("Show breakdown","Back to KPI");
              } else {
                htmlElement = htmlElement.replace("Show breakdown","Show detail");
              }
            } else {
              htmlElement = htmlElement.replace("class='"+d.icon+"' style='cursor: pointer'","");
            }
            return htmlElement;
          })
          .on("click",function(d) {
            showInfo(root,d);
          });
        }
      //polyline nodes and its properties
      nodeEnter.append("svg:polygon")
        .attr("points", "14,-4 14,4 16,4 16,9 20,0 16,-9 16,-4")
        .attr("fill",function(d){return d.color;})
        ;
      //circle nodes and its properties
      nodeEnter
        //.append("svg:circle")
        .append("svg:rect")
        .attr("class",function(d) {
          if(d.color === "green") return "ball-rounding";
          if(d.color === "yellow") return "ball-rounding-fast";
          if(d.color === "red") return "ball-beat";
          return "";})
        //.attr("r", rCircle)
        .attr("width",squareSide)
        .attr("height",squareSide)
        .attr("x","-15px")
        .attr("y","-15px")
        .attr("rx",function(d){return d.systemId === 3 ? "4px" : "15px";})
        .attr("ry",function(d){return d.systemId === 3 ? "4px" : "15px";})
        .style("fill", function(d){return "url(#"+d.color+")";})
        .style("fill-opacity","1")
        .style("cursor", function(d) {return d._children ? "pointer" : "default";})
        .on("click", function(d) {
          hoverFlag = 1;
          if(d != root && (d.children || d._children)) {toggle(d);update(d);}
          tooltip
            .transition()
            .duration(0)
            .style("opacity", 0)
            .style("left", "0px")
            .style("top", "0px");
          linktip
            .transition()
            .duration(0)
            .style("opacity", 0)
            .style("left", "0px")
            .style("top", "0px");
        })
        .on("mouseover", function(d) {
          var suffix = d.satuan == "P" ? "%" : ""; //satuan, mis. %
          var prefix = d.satuan == "A" ? "Rp " : ""; //simbol mata uang
          var suffix1 = d.achieve == null ? suffix : "%"; //satuan, mis. % di batas atas/bawah
          var prefix1 = d.achieve == null ? prefix : ""; //simbol mata uang di batas atas/bawah
          if(hoverFlag == 0 && d.color != "purple" && d.color != "grey") {
            //alert(d.satuan);
            tooltip
              .transition()
              .duration(500)
              .style("opacity", .9);
            tooltip
              .html("<div>"+
                      "<table class='table-data-hover'>"+
                        "<thead><tr><td>"+d.name+"</td><td>Value</td></tr></thead>"+
                        "<tbody>"+
                        "<tr><td>Target</td><td>"+numberFormat(d.target,suffix,prefix)+"</td></tr>" +
                        "<tr><td>Batas Atas</td><td>"+numberFormat(d.batasAtas,suffix1,prefix1)+"</td></tr>" +
                        "<tr><td>Batas Bawah</td><td>"+numberFormat(d.batasBawah,suffix1,prefix1)+"</td></tr>" +
                        "<tr><td>Actual</td><td>"+(d.satuan == "B"?(d.actual == 1?"Sudah":"Belum"):numberFormat(d.actual,suffix,prefix))+"</td></tr>" +
                        "<tr><td>Achieve</td><td>"+numberFormat(d.achieve,"%")+"</td></tr>" +
                        "<tr><td nowrap>Last Month</td><td>"+numberFormat(d.lastMonth,suffix,prefix)+"</td></tr>" +
                        "<tr><td>Growth</td><td>"+numberFormat(d.growth,"%")+"</td></tr>"+
                        "<tr><td>Populate</td><td>"+d.datePopulate.replace(" ","<br>")+"</td></tr>"+
                        "</tbody>"+
                      "</table>"+
                    "</div>")
              .style("left",function() {
                if(currZoomPoint >= 2)
                  return (d3.event.pageX +
                        (d.depth  * (lLine * (1-arrZoomPoint[currZoomPoint].scale))) -
                        (bodyProp.left * arrZoomPoint[currZoomPoint].scale)) + "px";
                return (d3.event.pageX +
                        (d.depth  * (lLine * (1-arrZoomPoint[currZoomPoint].scale))) +
                        (bodyProp.width*(arrZoomPoint[currZoomPoint].scale-1))/2 -
                        (bodyProp.left * arrZoomPoint[currZoomPoint].scale)) + "px";
              })
              .style("top",function() {
                var pageY = d3.event.pageY;
                if(currZoomPoint >= 2)
                  return (1/arrZoomPoint[currZoomPoint].scale*pageY -
                        1/arrZoomPoint[currZoomPoint].scale*bodyProp.top -
                        (pageY > h ? 200 : 0)) + "px";
                return (pageY * 1/arrZoomPoint[currZoomPoint].scale -
                        arrTopPoint[arrZoomPoint[currZoomPoint].scale] +
                        (kpiBrkdwnFlag == 0 ? 0 : 70/Math.pow(arrZoomPoint[currZoomPoint].scale,2))) + "px";
              });
            linktip
              .transition()
              .duration(500)
              .style("opacity", .9);
            linktip
              .html("<div><span class='btn btn-primary btn-sm'><span class='glyphicon glyphicon-map-marker'></span>&nbsp;Show Map</span></div>")
              .style("left", (d3.event.pageX + 20) + "px")
              .style("top", (d3.event.pageY - 28) + "px")
              .on("click", function() {
                tooltip
                  .transition()
                  .duration(0)
                  .style("opacity", 0)
                  .style("left", "0px")
                  .style("top", "0px");
                linktip
                  .transition()
                  .duration(0)
                  .style("opacity", 0)
                  .style("left", "0px")
                  .style("top", "0px");
                mapShow(d.kpi);
              });
          }
          hoverFlag = 0;
        })
        .on("mouseout", function(d) {
          if(hoverFlag == 0 && d.color != "purple" && d.color != "grey") {
            tooltip
              .transition()
              .duration(1500)
              .style("opacity", 0)
              .style("left", "0px")
              .style("top", "0px");
            linktip
              .transition()
              .delay(1000)
              .duration(500)
              .style("opacity", 0)
              .style("left", "0px")
              .style("top", "0px");
          }
        });

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) {return "translate(" + d.y + "," + d.x + ")";});
      //update polyline
      nodeUpdate.select("polygon")
        .style("opacity",function(d){return d._children ? ".8":"0";});

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {return "translate(" + source.y + "," + source.x + ")";})
        .remove();
      //exit circle properties
      nodeExit.select("circle")
        .attr("r", 1e-6);

      // Update the links?
      var link = vis.selectAll("path.link")
        .data(tree.links(nodes), function(d) {return d.target.id;});
      // Enter any new links at the parent's previous position.
      link.enter().insert("svg:path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
        })
        .transition()
        .duration(duration)
        .attr("d", diagonal);
      // Transition links to their new position.
      link.transition()
        .duration(duration)
        .attr("d", diagonal);
      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();

      // Stash the old positions for transition.
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
        });
    }

    //toggle children between expand or collapse.
    function toggle(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    }
    
    //expand children only
    function expand(d){   
      var children = (d.children)?d.children:d._children;
      if (d._children) {        
          d.children = d._children;
          d._children = null;       
      }
      if(children)
        children.forEach(expand);
    }
    
    //toggle children only
    function collapse(d) {
      if(d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    //expand children of all nodes
    function expandAll(){
        expand(root); 
        update(root);
    }

    //collapse children of all nodes
    function collapseAll(){
      root.children.forEach(collapse);
      //collapse(root);
      update(root);
    }

    //init tree variable
    function initTreeVariable() {
        //init line
        diagonal = d3
          .svg
          .diagonal()
          .projection(function(d) {return [d.y, d.x];});
        //init tooltip
        tooltip = d3
          .select("#body")
          .append("div") //declare the tooltip div
          .attr("class", "tooltip") //apply the 'tooltip' class
          .style("opacity", 0);
        linktip = d3
          .select("#body")
          .append("div") 
          .attr("class", "tooltip") 
          .style("opacity", 0);
        linktip.style("display","none");//remark to show this object, prepare for map
        //sizing tree
        var depth = 0;
        var depthTemp = 0;
        setDepth(root);
        var stack = root.children.length;
        //var tempW = (rCircle+lLine)*depth;
        var tempW = (squareSide/2+lLine)*depth;
        var tempH = kpiBrkdwnFlag === 0 ? stack*(m[0]+m[2]) : stack*(m[0]+m[2])/2;
        w =  tempW > minW ? tempW : minW;
        h = tempH > minH ? tempH : minH;
        //x,y node start position
        root.x0 = h / 2;
        root.y0 = 0;
        //created tree object
        tree = d3
          .layout
          .tree()
          .size([h, w]);
        //created svg object on tree (container)
        vis = d3
          .select("#body")
          .append("svg:svg")
          .attr("width", w + m[1] + m[3])
          .attr("height", h + m[0] + m[2])
          .append("svg:g")
          .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
        //gradient color
        linGradRed = vis
          .append("svg:defs")
          .append("svg:linearGradient")
          .attr("id","red")
          .attr("x1","70%")
          .attr("y1","80%")
          .attr("x2","10%")
          .attr("y2","0%")
          .attr("spreadMethod", "pad");
        linGradRed
          .append("svg:stop")
          .attr("offset","0%")
          .attr("style","stop-color:#c00;stop-opacity:1");
        linGradRed
          .append("svg:stop")
          .attr("offset","100%")
          .attr("style","stop-color:#fdd;stop-opacity:1");
        linGradGreen = vis
          .append("svg:defs")
          .append("svg:linearGradient")
          .attr("id","green")
          .attr("x1","70%")
          .attr("y1","80%")
          .attr("x2","10%")
          .attr("y2","0%")
          .attr("spreadMethod", "pad");
        linGradGreen
          .append("svg:stop")
          .attr("offset","0%")
          .attr("style","stop-color:#090;stop-opacity:1");
        linGradGreen
          .append("svg:stop")
          .attr("offset","100%")
          .attr("style","stop-color:#dfd;stop-opacity:1");
        linGradYellow = vis
          .append("svg:defs")
          .append("svg:linearGradient")
          .attr("id","yellow")
          .attr("x1","70%")
          .attr("y1","80%")
          .attr("x2","10%")
          .attr("y2","0%")
          .attr("spreadMethod", "pad");
        linGradYellow
          .append("svg:stop")
          .attr("offset","0%")
          .attr("style","stop-color:#ee0;stop-opacity:1");
        linGradYellow
          .append("svg:stop")
          .attr("offset","100%")
          .attr("style","stop-color:#ffd;stop-opacity:1");
        linGradBlue = vis
          .append("svg:defs")
          .append("svg:linearGradient")
          .attr("id","blue")
          .attr("x1","70%")
          .attr("y1","80%")
          .attr("x2","10%")
          .attr("y2","0%")
          .attr("spreadMethod", "pad");
        linGradBlue
          .append("svg:stop")
          .attr("offset","0%")
          .attr("style","stop-color:#009;stop-opacity:1");
        linGradBlue
          .append("svg:stop")
          .attr("offset","100%")
          .attr("style","stop-color:#ddf;stop-opacity:1");
        linGradGrey = vis
          .append("svg:defs")
          .append("svg:linearGradient")
          .attr("id","grey")
          .attr("x1","70%")
          .attr("y1","80%")
          .attr("x2","10%")
          .attr("y2","0%")
          .attr("spreadMethod", "pad");
        linGradGrey
          .append("svg:stop")
          .attr("offset","0%")
          .attr("style","stop-color:#444;stop-opacity:1");
        linGradGrey
          .append("svg:stop")
          .attr("offset","100%")
          .attr("style","stop-color:#ddd;stop-opacity:1");
        linGradPurple = vis
          .append("svg:defs")
          .append("svg:linearGradient")
          .attr("id","purple")
          .attr("x1","70%")
          .attr("y1","80%")
          .attr("x2","10%")
          .attr("y2","0%")
          .attr("spreadMethod", "pad");
        linGradPurple
          .append("svg:stop")
          .attr("offset","0%")
          .attr("style","stop-color:#337;stop-opacity:1");
        linGradPurple
          .append("svg:stop")
          .attr("offset","100%")
          .attr("style","stop-color:#ddf;stop-opacity:1");
        radGrad = vis
          .append("svg:defs")
          .append("svg:radialGradient")
          .attr("id","radGrad")
          .attr("x1","70%")
          .attr("y1","80%")
          .attr("x2","10%")
          .attr("y2","0%")
          .attr("spreadMethod", "pad");
        radGrad
          .append("svg:stop")
          .attr("offset","0%")
          .attr("style","stop-color:green;stop-opacity:1");
        radGrad
          .append("svg:stop")
          .attr("offset","100%")
          .attr("style","stop-color:white;stop-opacity:1");
        //grab the most length of nodes
        function setDepth(obj) {
          if (obj.children) {
              obj.children.forEach(function (d) {
                  depthTemp++;
                  setDepth(d);
                  if (depthTemp > depth) {
                      depth = depthTemp;
                  }
                  depthTemp = 0;
              });
          }
          depthTemp++;
        }
    }
    /* *** */

    /* SUPPORTING FUNCTION */

    //show map (next future?)
    function mapShow(kpiTemp) {
      loadingStateChange("show");
      $("div#map iframe").attr("src","http://10.17.18.123:8081/poi/index.jsp?kpi="+kpiTemp);
      $("div#map").show("slow");
      setDefTreeView();      
      loadingStateChange("hide");
    }

    //show info by breakdown (new tree hierarchy) or detail depend on flag
    function showInfo(dataRoot,dataDet) {
      if(!(dataDet == dataRoot && kpiBrkdwnFlag == 0)) {
        if(dataDet == dataRoot && kpiBrkdwnFlag == 1) {
          backToMain();
        } else if(dataDet != dataRoot && kpiBrkdwnFlag == 0)  {
          setValue("kpiCode",dataDet.kpi);
          $("div:has(#kpiSelect), #zoom-slider #btn-back").slideToggle(translation);
          kpiBrkdwnFlag = 1;
          showJson();
        //just popup info
        } else {
          showInfoDet(dataDet);
        }
      }
    }

    //detail info from dataDetTemp json object
    function showInfoDet(dataDetTemp) {
      var suffix = dataDetTemp.satuan == "P" ? "%" : ""; //satuan, mis. %
      var prefix = dataDetTemp.satuan == "A" ? "Rp " : ""; //simbol mata uang
      var suffix1 = dataDetTemp.achieve == null ? suffix : "%"; //satuan, mis. % di batas atas/bawah
      var prefix1 = dataDetTemp.achieve == null ? prefix : ""; //simbol mata uang di batas atas/bawah
      $("#mdl-detail .modal-body #title").text(dataDetTemp.name);
      $("#mdl-detail .modal-body #target").text(numberFormat(dataDetTemp.target,suffix,prefix));
      $("#mdl-detail .modal-body #batasAtas").text(numberFormat(dataDetTemp.batasAtas,suffix1,prefix1));
      $("#mdl-detail .modal-body #batasBawah").text(numberFormat(dataDetTemp.batasBawah,suffix1,prefix1));
      $("#mdl-detail .modal-body #actual").text((dataDetTemp.satuan == "B" ? (dataDetTemp.actual == 1 ? "Sudah" : "Belum") :
              numberFormat(dataDetTemp.actual,suffix,prefix)));
      $("#mdl-detail .modal-body #achieve").text(numberFormat(dataDetTemp.achieve,"%"));
      $("#mdl-detail .modal-body #lastMonth").text(numberFormat(dataDetTemp.lastMonth,suffix,prefix));
      $("#mdl-detail .modal-body #growth").text(numberFormat(dataDetTemp.growth,"%"));
      $("#mdl-detail .modal-body #populate").text(dataDetTemp.datePopulate);
      $("#mdl-detail").modal("show");
    }

    //get current show/hide flag of codeTemp
    function getFlag(codeTemp) {
      for(idx = 0; idx < arrFlag.length; idx ++) {
        if(arrFlag[idx].code == codeTemp) {
          return arrFlag[idx].flag;
        }
      }
      return 0;
    }

    //set current show/hide flag of codeTemp to flagTemp
    function setFlag(codeTemp,flagTemp) {
      for(idx = 0; idx < arrFlag.length; idx ++) {
        if(arrFlag[idx].code == codeTemp) {
          arrFlag[idx].flag = flagTemp;
          break;
        }
      }
    }

    //get value of nameTemp
    function getValue(nameTemp) {
      for(idx = 0; idx < arrVal.length; idx ++) {
        if(arrVal[idx].name == nameTemp) {
          return arrVal[idx].value;
        }
      }
      return "";
    }

    //set value of nameTemp with valueTemp
    function setValue(nameTemp,valueTemp) {
      for(idx = 0; idx < arrVal.length; idx ++) {
        if(arrVal[idx].name == nameTemp) {
          arrVal[idx].value = valueTemp;
          break;
        }
      }
    }

    //get current kpi patam value
    //template:
    //kpi_[timeseries]_[layer]_[level]_[coy]_[lob]_[kpi_id|null]_[timestamp]
    function getKpiName() {
      var kpiCodeTemp = getValue("kpiCode");
      if(kpiCodeTemp == null || kpiCodeTemp == "")
        return "kpi"+delimiter+getValue("dept")+delimiter+getValue("coy");
      return "kpi"+delimiter+"1";//kpiCodeTemp;
    }

    //set tree view default position
    function setDefTreeView() {
      $(window).scrollLeft(0);
      $(window).scrollTop(kpiBrkdwnFlag === 0 ? h/2 : h/3);
    }
    
    //back application to its main page
    function backToMain() {      
      setValue("kpiCode","");
      //hide all option
      $("div:has(#kpiSelect), #zoom-slider #btn-back").slideToggle(translation);
      kpiBrkdwnFlag = 0;
      showJson();
    }
    /* *** */
});

