/**
 * A browser based markdown editor with live preview, using localStorage to synchronize between different browser windows.

 * @author ConcurrentHashMap <ConcurrentHashMap@arcor.de>
 * @license Licensed under MIT (https://github.com/ConcurrentHashMap/localstorage-markdown-editor/blob/master/LICENSE)
 */
$(document).ready(function() {
  // create a timer for input events
  var timer = 0;

  // Some helper functions converted to jQuery, mainly taken from
  // https://github.com/arturadib/strapdown/blob/gh-pages/v/0.2/strapdown.js
  var prettify = function() {
    // Prettify
    $("code").each(function() {
      var temp = $(this).attr("class");
      $(this).removeClass().addClass('prettyprint lang-' + temp);
    });
    prettyPrint();

    // Style tables
    $("table").each(function() {
      $(this).removeClass().addClass('table table-striped table-bordered');
    });

    // Adjust textarea height
    if($('#content').height() > ($(window).height()-135)) {
      $('#raw-input').height($('#content').height());
    } else {
      $('#raw-input').height($(window).height()-135);
    }
  }

  var updateLinks = function() {
    // change the urls for download
    var d = new Date();
    // add leading zero
    h = d.getHours() < 10 ? "0"+d.getHours() : d.getHours();
    m = d.getMinutes() < 10 ? "0"+d.getMinutes() : d.getMinutes();
    s = d.getSeconds() < 10 ? "0"+d.getSeconds() : d.getSeconds();

    content = "data:application/octet-stream;charset=utf-8;base64," + window.btoa(unescape(encodeURIComponent($('#raw-input').val())));
    $('#download-md').attr('download', "markdown-" + (d.getFullYear()*100 + d.getMonth()+1)*10 + d.getDate() + "-" + h + m + s + ".md");
    $('#download-md').attr('href', content);

    content = "data:application/octet-stream;charset=utf-8;base64," + window.btoa(unescape(encodeURIComponent(marked($('#raw-input').val()))));
    $('#download-html').attr('download', "markdown-" + (d.getFullYear()*100 + d.getMonth()+1)*10 + d.getDate() + "-" + h + m + s + ".html");
    $('#download-html').attr('href', content);
  }

  var parseUpdate = function() {
    var currentText = null;

    // save the currentText to the local storage of the browser in order to be able to rollback if browser will be closed accidently
    if(typeof(Storage) !== "undefined") {
      var save = localStorage.getItem("markdown-editor-storage");
      if(save !== undefined && save !== null && save != '') {
        currentText = localStorage.getItem("markdown-editor-storage");
      }
    }

    if(currentText == null) {
      // currentText seems to be null
      currentText = $('#raw-input').val();;
    }

    // generate HTML from markdown
    $('#content').html(marked(currentText));
    prettify();
    updateLinks();
  }

  // try to fetch the content of rawInput from the local storage of the browser
  if(typeof(Storage) !== "undefined") {
    var save = localStorage.getItem("markdown-editor-storage");
    if(save !== undefined && save !== null && save != '') {
      $('#raw-input').val(localStorage.getItem("markdown-editor-storage"));
      parseUpdate();
    }

    // bind an update listener if something changes inside the localStorage
    $(window).bind('storage', function() {
      $('#raw-input').val(localStorage.getItem("markdown-editor-storage"));
      parseUpdate();
    });
  }

  // add button for downloading as HTML or markdown
  $('.navbar-inner .container').append('<ul class="nav"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">Download document as... <b class="caret"></b></a><ul class="dropdown-menu"><li><a href="#" id="download-md">Markdown</a></li><li><a href="#" id="download-html">HTML</a></li></ul></li><li><a href="#" id="clear-storage">Clear</a></li></ul>');

  // when DOM is ready, parse the text from 
  parseUpdate();

  // Firefox bug: body { display: none; } seems not be removed
  $('body').removeAttr('style');

  // when something is changed inside the textarea
  $('#raw-input').on('input', function() {
    // store in localStorage for sychronization between windows
    if(typeof(Storage) !== "undefined") {
      localStorage.setItem("markdown-editor-storage", $(this).val());
    }

    // add some delay to the input event to not always trigger when
    if(timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(parseUpdate, 400);

    // update the links for download directly
    updateLinks();
  });

  // clear the storage on click
  $('#clear-storage').click(function() {
    if(confirm('Are you sure? All changes will be lost!')) {
      if(typeof(Storage) !== "undefined") {
        localStorage.clear();
      }
      $('#raw-input').val('');
      parseUpdate();
    }
  });
});