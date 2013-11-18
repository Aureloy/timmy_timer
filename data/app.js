var app = module.exports = require('appjs');

var path = require('path');
app.init({
    "CachePath":path.resolve(__dirname,"./cache") // change to whatever path you like
});


app.serveFilesFrom(__dirname + '/content');
/*

var menubar = app.createMenu([{
  label:'&File',
  submenu:[
    {
      label:'E&xit',
      action: function(){
        window.close();
      }
    }
  ]
},{
  label:'&Window',
  submenu:[
    {
      label:'Fullscreen',
      action:function(item) {
        window.frame.fullscreen();
        console.log(item.label+" called.");
      }
    },
    {
      label:'Minimize',
      action:function(){
        window.frame.minimize();
      }
    },
    {
      label:'Maximize',
      action:function(){
        window.frame.maximize();
      }
    },{
      label:''//separator
    },{
      label:'Restore',
      action:function(){
        window.frame.restore();
      }
    }
  ]
}]);

menubar.on('select',function(item){
  console.log("menu item "+item.label+" clicked");
});

var trayMenu = app.createMenu([{
  label:'Show',
  action:function(){
    window.frame.show();
  },
},{
  label:'Minimize',
  action:function(){
    window.frame.hide();
  }
},{
  label:'Exit',
  action:function(){
    window.close();
  }
}]);



var statusIcon = app.createStatusIcon({
  icon:'./data/content/icons/32.png',
  tooltip:'AppJS Hello World',
  menu:trayMenu
});
*/


var window = app.createWindow({
	width  : 325,
	height : 480,
	autoResize: false,
	resizable: true,
	margin: 0,
	opacity        : 1,
	disableSecurity: true,
	showChrome : true,
	icons  : __dirname + '/content/icons',
	left : -1,
	top : -1

	/***************************** defaults ********************************
	* url            : 'http://appjs', // serve static file root and routers
	* autoResize     : false,          // resizes in response to html content
	* showChrome     : true,           // show border and title bar
	* resizable      : false,          // control if users can resize window
	* disableSecurity: true,           // allow cross origin requests
	* opacity        : 1,              // flat percent opacity for window
	* alpha          : false,          // per-pixel alpha blended (Win & Mac)
	* fullscreen     : false,          // client area covers whole screen
	* left           : -1,             // centered by default
	* top            : -1,             // centered by default
	*************************************************************************/

});

window.on('create', function(){
  console.log("Window Created");
  window.frame.show();
  window.frame.center();
  // window.frame.setMenuBar(menubar);
});

window.on('ready', function(){
  console.log("Window Ready");
  window.process = process;
  window.module = module;

  function F12(e){ return e.keyIdentifier === 'F12' }
  function Command_Option_J(e){ return e.keyCode === 74 && e.metaKey && e.altKey }

  window.addEventListener('keydown', function(e){
    if (F12(e) || Command_Option_J(e)) {
      window.frame.openDevTools();
    }
  });
	
	// this.dispatchEvent(new this.Event('app-ready'));
	
});

window.on('close', function(){
  console.log("Window Closed");
});
