/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

    var folderJson = "../../json/";
    var vTimeStamp = Math.floor((new Date().getTime())/1000);
    //button class
    var btnDefault = "btn btn-default btn-sm",
        btnPrimary = "btn btn-primary btn-sm",
        btnInfo = "btn btn-info btn-sm",
        btnDanger = "btn btn-danger btn-sm",
        btnWarning = "btn btn-warning btn-sm",
        btnSuccess = "btn btn-success btn-sm";
    //label class
    var lblPrimary = "label label-primary full-width";
    //icon class
    var glyOpen = "glyphicon glyphicon-folder-open",
        glyClose = "glyphicon glyphicon-folder-close",
        glyUp = "glyphicon glyphicon-circle-arrow-up",
        glyDown = "glyphicon glyphicon-circle-arrow-down",
        glyRight = "glyphicon glyphicon-circle-arrow-right",
        glyLeft = "glyphicon glyphicon-circle-arrow-left",
        glyTags = "glyphicon glyphicon-tags",
        glyTriDown = "glyphicon glyphicon-triangle-bottom",
        glyTriTop = "glyphicon glyphicon-triangle-top";
    //
    var lblStyle = btnPrimary+" "+glyTags; //label style
    var pickStyle = btnPrimary+" "+glyTriDown; //chosen style
    var unpickStyle = btnDefault+" "+glyClose; //unchosen style
    var bkLabel = "#444";//"#347"; //label background color
    var bkColPick = "#99b"; //chosen background color
    var bkColUnpick = "#fff"; //unchosen background color
    var translation = 400; //waktu perubahan show/hide