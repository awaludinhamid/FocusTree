$(document).ready(function(){
  //
  var arrPage = ["login","home","application","admin","upload"];//pages name on apps
  var arrBackCenterPage = ["admin","upload","application","home"];//page which has center background
  var arrBackLeftPage = ["admin","upload"];//page which has left background
  //
  //extract page name
  //cut special browser additional character, such as sessionid, etc
  //show the page name
  var path = window.location.pathname;
  var page = path.split("/").pop().replace("#","");
  var addPar = page.indexOf(";");
  if(addPar > -1) {
    page = page.substring(0,addPar);
  }
  $("#pageLabel").text(initCap(page));
  if($.inArray(page, arrBackCenterPage) > -1)
    $(".center-back-pos").show();
  if($.inArray(page, arrBackLeftPage) > -1) {
    $(".left-back-pos").show();
    $(".split-back").show();
  }
  //redefine left position of center background of page
  if($.inArray(page, arrBackCenterPage) > -1 && $.inArray(page, arrBackLeftPage) === -1) {
    $(".center-back-pos").css("left","0px");
  }
  //
  //show menu on spesific page
  //identify user logging to create menu list
  var cnName = $("#cnname").text();
  if(cnName == null || cnName == "") {
    $("#userMenu").append(
      "<span class='label label-default full-width'>Not logged in</span>"
    );
  } else if($.inArray(page, arrPage) > -1){
    $("#userMenu").append(
      "<button class='btn btn-sm' style='cursor: not-allowed'>Welcome, " + cnName + "</button>" +
      "<button data-toggle='dropdown' class='btn btn-sm dropdown-toggle'><span class='caret'></span></button>" +
      "<ul class='dropdown-menu pull-right'>" +
        "<li id='idLogout'><a href='#'><i class='glyphicon glyphicon-off'>&nbsp;</i>Logout</a></li>" +
        ((page == "application" || page == "admin") ?
          "<li id='idRefresh'><a href='#'><i class='glyphicon glyphicon-refresh'>&nbsp;</i>Refresh Data</a></li>" : "") +
        ((page == "home") ?
          "" : "<li id='idHome'><a href='../../apps/main/home'><i class='glyphicon glyphicon-home'>&nbsp;</i>Home</a></li>") +
        ((page == "application") ?
          "<li id='btn-download'><a href='#'><i class='glyphicon glyphicon-download'>&nbsp;</i>Download</a></li>" :
                  "<li><a href='../../apps/main/application'><i class='glyphicon glyphicon-tags'>&nbsp;</i>Aplikasi</a></li>") +
        ((page == "admin") ?
          "" : "<li><a href='../../apps/main/admin'><i class='glyphicon glyphicon-lock'>&nbsp;</i>Admin</a></li>") +
        ((page == "upload") ?
          "" : "<li><a href='../../apps/main/upload'><i class='glyphicon glyphicon-upload'>&nbsp;</i>Upload</a></li>") +
      "</ul>"
    );
    //show dropdown menu
    $(".dropdown-toggle").dropdown();
    //click on logout menu
    $("#idLogout").on("click", function() {
      $("#mdl-logout").modal("show");
    });
    //click on yes button of logout
    $("#mdl-logout .modal-footer button#btn-yes").click(function(){
      window.location.replace("../../apps/auth/logout");
    });
  } else {
    $("#userMenu").append(
      "<span class='label label-default full-width'>Error</span>"
    );
  }
});