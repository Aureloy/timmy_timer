/* CONF */

var url_ws = 'http://tools.like-interactive.com/timer/';
var debug = false;


/* PAGE TRANSITION */

var page = {

	load : function(page, data, callback, callbackData)
	{
		if( data == undefined ) data = false;
		if( callback == undefined ) callback = false;
		if( callbackData == undefined ) callbackData = false;
		
		$.ajax(
		{
			 url:"pages/" + page + ".html"
			,data : data
			,type : 'GET'
			,cache :false
			,dataType : 'html'
			,success: function(data)
			{
				$('#page_container').html(data);
				if($.isFunction(callback))	callback(callbackData);
			}
			,error:function(){
				alert('Une erreur AJAX est survenue.');
			}
		});
	}
}




/* AJAX REQUEST : connexion */

var ajax = {

	checkLogin_status : false,
	
	checkLogin : function(login)
	{
		if(ajax.checkLogin_status == true) return false;
		ajax.checkLogin_status = true;
		
		$.ajax({
			url : url_ws + 'ajax/login.php'
			,data:'login=' + encodeURIComponent(login)
			,dataType:'json'
			,type:'POST'
			,cache :false
			,success: function(response)
			{
				ajax.checkLogin_status = false;
				
				if(response.result == undefined || response.result != 'ok')
				{
					delete localStorage.id;
					delete localStorage.name;
					
					alert('Une erreur est survenue : ' + (response.err != undefined ? response.err : 'LOGIN#2' ))
					return;
				}
				
				localStorage.id = response.id;
							
				page.load('day', null, initDay, { day : new Date().getTime() });
			}
			,error: function(jqXHR, statusText)
			{
				ajax.checkLogin_status = false;
				alert('Une erreur est survenue. LOGIN#1' + ' jqXHR=' + jqXHR.status +  ' jqXHR.statusText=' + jqXHR.statusText );
			}
		});
	},
	
	syncTasks : function(myDate, data)
	{
		if(!localStorage.id) location.reload();
		$.ajax({
			url : url_ws + 'ajax/syncTasks.php'
			,data:'id=' + localStorage.id 
				+ '&day=' + myDate.getFullYear() + '-' + (parseInt(myDate.getMonth(),10)+1) + '-' +  myDate.getDate()
				+ '&tasks=' + encodeURIComponent(data)
			,dataType:'json'
			,type:'POST'
			,cache :false
			,success: function(response)
			{
				if(response.result == undefined || response.result != 'ok')
				{
					alert('Une erreur est survenue : ' + (response.err != undefined ? response.err : 'SYNCTASKS#2' ))
					return;
				}
				
				project.reload(response);
			}
			,error: function(jqXHR, statusText)
			{
				alert('Une erreur est survenue. SYNCTASKS#1' + ' jqXHR=' + jqXHR.status +  ' jqXHR.statusText=' + jqXHR.statusText );
			}
		});
	},
	
	getLastProjects : function(myDate)
	{
		$.ajax({
			url : url_ws + 'ajax/getLastTasks.php'
			,data:'id=' + localStorage.id 
				+ '&day=' + myDate.getFullYear() + '-' + (parseInt(myDate.getMonth(),10)+1) + '-' +  myDate.getDate()
			,dataType:'json'
			,type:'POST'
			,cache :false
			,success: function(response)
			{
				if(response.result == undefined || response.result != 'ok')
				{
					alert('Une erreur est survenue : ' + (response.err != undefined ? response.err : 'GETTASKS#2' ))
					return;
				}
				
				project.setAutocomplete(response.tasksNames);
			}
			,error: function(jqXHR, statusText)
			{
				alert('Une erreur est survenue. GETTASKS#1' + ' jqXHR=' + jqXHR.status +  ' jqXHR.statusText=' + jqXHR.statusText );
			}
		});
	}
	
	,removeTask : function( task_id )
	{
		$.ajax({
			url : url_ws + 'ajax/removeTask.php'
			,data:'id=' + localStorage.id 
				+ '&task_id=' + task_id
			,dataType:'json'
			,type:'POST'
			,cache :false
			,success: function(response)
			{
				if(response.result == undefined || response.result != 'ok')
				{
					alert('Une erreur est survenue : ' + (response.err != undefined ? response.err : 'DELTASKS#2' ))
					return;
				}
				
				$('li[data-id=' + task_id + ']').slideUp(150);
				setTimeout("$('li[data-id=" + task_id + "]').remove(); tasks.sync();",160);
					
			}
			,error: function(jqXHR, statusText)
			{
				console.log(jqXHR);
				alert('Une erreur est survenue. DELTASKS#1' + ' jqXHR=' + jqXHR.status +  ' jqXHR.statusText=' + jqXHR.statusText );
			}
		});
	}
	
	,getCurrentWeek : function(day)
	{
		var myDate = new Date();
		myDate.setTime(day);
		
		$.ajax({
			url : url_ws + 'ajax/getCurrentWeek.php'
			,data:'id=' + localStorage.id + '&day=' + myDate.getFullYear() + '-' + (parseInt(myDate.getMonth(),10)+1) + '-' +  myDate.getDate()
			,dataType:'json'
			,type:'POST'
			,cache :false
			,success: function(response)
			{
				if(response.result == undefined || response.result != 'ok')
				{
					alert('Une erreur est survenue : ' + (response.err != undefined ? response.err : 'CURWEEK#2' ))
					return;
				}
				
				if(response.data == undefined)
				{
					alert('Une erreur est survenue : ' + (response.err != undefined ? response.err : 'CURWEEK#3' ))
					return;
				}
				
				file.saveLocalCSV(response.data);
				
			}
			,error: function(jqXHR, statusText)
			{
				alert('Une erreur est survenue. CURWEEK#1' + ' jqXHR=' + jqXHR.status +  ' jqXHR.statusText=' + jqXHR.statusText );
			}
		});
	}
}


var tasks = {

	load : function(day)
	{
		var myDate = new Date();
		myDate.setTime(day);
		
		$.ajax({
			url : url_ws + 'ajax/getTasks.php'
			,data:'id=' + localStorage.id + '&day=' + myDate.getFullYear() + '-' + (parseInt(myDate.getMonth(),10)+1) + '-' +  myDate.getDate()
			,dataType:'json'
			,type:'POST'
			,cache :false
			,success: function(response)
			{
				if(response.result == undefined || response.result != 'ok')
				{
					alert('Une erreur est survenue : ' + (response.err != undefined ? response.err : 'TASKS#2' ))
					return;
				}
				
				if(response.tasks && $('#date').attr('data-day') == day)
				{
					for(var i in response.tasks)
					{
						project.add(response.tasks[i]);
					}
				}
			}
			,error: function(jqXHR, statusText)
			{
				alert('Une erreur est survenue. TASKS#1' + ' jqXHR=' + jqXHR.status +  ' jqXHR.statusText=' + jqXHR.statusText );
			}
		});
	},
	
	active : false,
	
	sync : function(newTask)
	{
		var myDate = new Date();
		myDate.setTime(day);
		
		tasks.active = false;
		$('#projectList li').each(function(){ if($(this).hasClass('active')) tasks.active = $(this).attr('data-id');	} );
			
		data = new Array();
		
		$('#projectList li').each(function()
		{
			data.push(
			{
				id 			: $(this).attr('data-id'),
				day 		: myDate.getFullYear() + '-' + (parseInt(myDate.getMonth(),10)+1) + '-' +  myDate.getDate(),
				name 		: $(this).find('.projectName').val(),
				duration 	: parseInt($(this).find('.projectHour').val()) * 3600 + parseInt($(this).find('.projectMin').val()) * 60,
				date_maj 	: (new Date).getTime()
			});
		});
		
		if(newTask != undefined && newTask != '')
		{
			data.push( 
			{
				id 			: 'new',
				day 		: myDate.getFullYear() + '-' + (parseInt(myDate.getMonth(),10)+1) + '-' +  myDate.getDate(),
				name 		: newTask,
				duration 	: 0,
				date_maj 	: (new Date).getTime()
			});
		}
		
		data = JSON.stringify(data);
		
		ajax.syncTasks(myDate, data);
	}
}




var menu = 
{

	handle : function()
	{
		if($('#menu').width() > 0) menu.close();
		else menu.open();
	},

	open : function()
	{
	
		$('#menu li').hide().delay(150).fadeIn();
		$('#menu_btn').animate({right:206},150);
		$('#menu').animate({width:200},150);
		$('#menucover').fadeIn(150);
		
	}
	,close: function(){
	
		$('#menu_btn').animate({right:6},150);
		$('#menu').animate({width:0},150);
		$('#menu li').hide(20);
		$('#menucover').fadeOut(150);
		
	}


};

	
/* ADD PROJECT TO LIST */

var project = {

	add : function(task)
	{
		$('#projectList').append('<li data-id="' + task.id + '" data-day="' + task.day + '" data-date_maj="' + task.date_maj + '" data-duration="' + task.duration + '">\
			<img src="img/play.png" class="imgbutton"> <input class="projectName" value="' + task.name + '">\
			<p class="imgbutton delete"></p><p><input class="projectHour" data-max="12" value="' + ("00" + Math.floor(task.duration/60/60)).slice(-2) + '">h<input class="projectMin" data-max="59" value="' + ("00" + Math.floor(task.duration/60%60)).slice(-2) + '"></p>\
		</li>');
		
		/* MODIFICATION DE LA VALEUR */ 
		$('li[data-id=' + task.id + '] .projectHour, li[data-id=' + task.id + '] .projectMin').bind('focus',chrono.editTime);
		
		/* VALEUR MODIFIEE */ 
		$('li[data-id=' + task.id + '] .projectHour, li[data-id=' + task.id + '] .projectMin').bind('blur',chrono.changeTime);
		
		/* BOUTON PLAY / PAUSE */ 
		$('#projectList li[data-id=' + task.id + '] img').click(chrono.projectButton);
	
		/* BOUTON SUPPRESSION */ 
		$('#projectList li[data-id=' + task.id + '] .delete').click(function(){ ajax.removeTask(task.id) });
	}
	
	
	,reload : function(data)
	{
		$('#projectList li').remove();
		if(data.tasks && $('#date').attr('data-day') == day)
		{
			for(var i in data.tasks)
			{
				project.add(data.tasks[i]);
			}
		}
		if(tasks.active != false)
		{
			$('#projectList li').each(function(){ if($(this).attr('data-id') == tasks.active) $(this).addClass('active');	} );
		}
	}
	
	,setAutocomplete : function(data)
	{
		$( "#new-name" ).autocomplete({
			source: function( request, response ) 
			{
				var matches = $.map( data, function(tag) {
				  if ( tag.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
					return tag;
				  }
				});
				response(matches);
			}
			,position: { my : "left bottom", at: "left top" }
			,minLength: 0 
			,autoFocus:true
		});
	}
	
	,newProject : function()
	{ 
		var val = $('#new-name').val();
		if(val == '') return false;
		
		/* check doublon */
		var doublon = false;
		$('#projectList li .projectName').each(function(){ if($(this).val() == val) doublon = true; } );
		if(doublon) return false;
		
		tasks.sync(val);
		$('#new-name').val(''); /* clean field */ 
	}
}




var chrono = {

	run : function()
	{
		var found = false;
		$('#projectList li').each(function(){ if($(this).hasClass('active')) found = $(this).attr('data-id');	} );
		if(!found)
		{
			$('#projectList li').each(function(){ if($(this).hasClass('lastActive')) {  found = $(this).attr('data-id'); $(this).addClass('active'); }	} );
		}
		if(!found)
		{
			$('#projectList li:last').addClass('active');
			found = $('#projectList li:last').attr('data-id');
		}
		if(!found)
		{
			$('#chronotrigger').attr('src','img/play.png');
			timer.stop();
			$('#timmy').stop().fadeOut(150);
		}

		duration = parseInt($('#projectList li[data-id=' + found + ']').attr('data-duration'),10) + 1;
		$('#projectList li[data-id=' + found + ']').attr('data-duration', duration);
		
		$('#projectList li[data-id=' + found + '] img').attr('src','img/pause.png');
		$('#projectList li[data-id=' + found + '] .projectHour').val( ("00" +  Math.floor(duration/60/60)).slice(-2) ); 
		$('#projectList li[data-id=' + found + '] .projectMin').val(   ("00" + Math.floor(duration/60%60)).slice(-2) ); 
		
		/* sauvegarde serveur toutes les minutes */
		
		if(duration != 0 && Math.floor(duration%60) == 0)
		{
			tasks.sync();
		}
	},

	/* BOUTON PLAY PAUSE PRINCIPAL */
	mainButton : function()
	{
		if(timer.isActive)
		{
			$(this).attr('src','img/play.png');
			$('#projectList li img').each(function(){ $(this).attr('src','img/play.png'); });
			$('#projectList li').each(function()
			{ 
				$(this).removeClass('lastActive'); 
				if($(this).hasClass('active')) $(this).addClass('lastActive');
				$(this).removeClass('active'); 
			});
			timer.pause();
			$('#timmy').stop().fadeOut(150);
		}
		else
		{
			$(this).attr('src','img/pause.png');
			timer.play();
			$('#timmy').stop().fadeIn(600000);
		}
	},
	
	/* BOUTON PLAY PAUSE PRINCIPAL */
	projectButton : function()
	{
		if($(this).parent().hasClass('active'))
		{
			$('#projectList li').each(function(){ $(this).removeClass('active').removeClass('lastActive'); });
			$(this).parent().addClass('lastActive'); 
			$(this).attr('src','img/play.png');
			$('#chronotrigger').attr('src','img/play.png');
			timer.pause();
			$('#timmy').stop().fadeOut(150);
		}
		else
		{
			$('#projectList li').each(function(){ $(this).removeClass('active'); });
			$('#projectList li img').each(function(){ $(this).attr('src','img/play.png'); });
			$(this).parent().addClass('active').addClass('lastActive');
			$(this).attr('src','img/pause.png');
			$('#chronotrigger').attr('src','img/pause.png');
			timer.play();
			$('#timmy').stop().fadeIn(600000);
		}
	},
	
	editTime : function()
	{
		$(this).attr('placeholder',$(this).val());
		$(this).val('');
		
		$('#projectList li').each(function(){ if($(this).hasClass('active')) {  found = $(this).attr('data-id'); $(this).addClass('lastActive'); }	} );
		$('#projectList li').each(function(){ $(this).removeClass('active'); });
		$('#chronotrigger').attr('src', 'img/play.png');
		$('#projectList li img').each(function(){ $(this).attr('src','img/play.png'); });
		timer.pause();
		$('#timmy').stop().fadeOut(150);
	},
	
	changeTime : function()
	{
		if($(this).val() == '' && $(this).attr('placeholder') != '')
		{
			$(this).val($(this).attr('placeholder'));
			return false;
		}
		
		if($(this).val() != '' && !$.isNumeric($(this).val() ) )
		{
			$(this).val('00');
		}
		
		if($(this).val() < 0)
		{
			$(this).val('00');
		}
		
		if(parseInt($(this).val(),10) > parseInt($(this).attr('data-max'),10))
		{
			$(this).val($(this).attr('data-max'));
		}
		
		if($(this).val().length == 1)
		{
			$(this).val('0' + $(this).val());
		}
		
		tasks.sync();
		
	}
}


/* INIT */
var timmay = false;

addEventListener('app-ready', function(e)
{
	// autologin //
	
	if(localStorage.name && localStorage.name != '')
	{
		ajax.checkLogin(localStorage.name);
	}
	else
	{
		// page de login //
	
		page.load('login', false, function()
		{
			// manual login //
			$('#login-form-valid').click(function() { if($('#login').val() != '') ajax.checkLogin($('#login').val()); });
			$('#login').keypress(function( event ) { if ( event.which == 13 ) { event.preventDefault(); if($('#login').val() != '') { localStorage.name = $('#login').val(); ajax.checkLogin($('#login').val()); } } } );
			$('#login').change(function()
			{
				localStorage.name = $('#login').val();
				$('#login').css( { border: "1px solid #41B7D8" }, 'fast');
			});
			
			$('#timmy_front').click(function(){timmay.play()});
		});
	}
	
	soundManager.setup(
	{
		  url: '../swf/',
		  // optional: use 100% HTML5 mode where available
		  preferFlash: false,
		  debugMode:false,
		  useConsole:false,
		  onready: function() 
		  {
			timmay = soundManager.createSound({
			  id: 'timmay',
			  url: '/sound/timmay.mp3'
			});
		  },
		  ontimeout: function() {
			// Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
		  }
	});
});






/* FUNCTION INIT PAGE DAY */

var timer = false;
var day = false;

function initDay(param)
{
	/* get day to display */
	if(timer != false)
	{	
		timer.stop();
		$('#timmy').stop().fadeOut(150);
	}
	timer = false;
	
	var myDate = new Date();
	myDate.setTime(param.day);
	day = param.day;
	
	var jours = { 1 : 'Lundi', 2 : 'Mardi', 3 : 'Mercredi', 4 : 'Jeudi', 5 : 'Vendredi', 6 : 'Samedi', 0 : 'Dimanche' }
	
	$('#date').html(jours[myDate.getDay()] + ' ' + ("0" + myDate.getDate()).slice(-2) + '/' + ("0" + (parseInt(myDate.getMonth(),10) + 1)).slice(-2) + '/' + myDate.getFullYear() );
	
	$('#date').attr('data-day', param.day);
	
	// $('#datepicker').datepicker(myDate, { firstDay: 1 } );
	
	$('#date').click(function()
	{
		$( "#datepicker" ).datepicker( "dialog", myDate, function(dateText)
			{
				var myDate = new Date(dateText);
				// console.log(myDate.toDateString());
				page.load('day', null, initDay, { day : myDate.getTime() });
			}, { firstDay: 1, beforeShowDay: $.datepicker.noWeekends } 
		);
	});
	
	
	
	/* Navigation */
	$('#before').click(function(){ page.load('day', null, initDay, { day : param.day - 24*60*60*1000 })});
	$('#after' ).click(function(){ page.load('day', null, initDay, { day : param.day + 24*60*60*1000 })});
	
	
	/* gestion du chrono */
	timer = $.timer(chrono.run, 1000, false);
	
	/* BOUTON + */
	$('#new-plus').click(project.newProject);
	$('#new-name').keypress(function( event ) { if ( event.which == 13 ) { event.preventDefault(); project.newProject(); } } );
	
	ajax.getLastProjects(myDate);
	
	
	/* BOUTON PLAY / PAUSE */ 
	$('#chronotrigger').click(chrono.mainButton);
	
	tasks.load(param.day);
	
	
	/* MENU */
	
	$('#menu_btn,#menucover').click(menu.handle);
	
	$('#export').click(function(){ ajax.getCurrentWeek(param.day); });
	
	$('#duree').click(function(){ alert('Soon !'); });
	
	$('#console').click(function(){ window.frame.openDevTools() });
	$('#refresh').click(function(){ location.reload(); });
	$('#disconnect').click(function(){ delete localStorage.name; location.reload(); });
}


var file = {
	
	/* Enregistre un fichier CSV en local à partir d'un array type : [["c1l1", "c2l1", "c3l1"], ["c1l2", "c2l2", "c3l2"]] */
	saveLocalCSV : function(arr, initialName)
	{
		var csvContent = "\uFEFF";
		
		arr.forEach(function(infoArray, index)
		{
			dataString = infoArray.join(';');
			csvContent += index < infoArray.length ? dataString+ "\n" : dataString;
		});

		window.frame.openDialog( { type:'save', multiSelect:false, title : 'Choisissez un nom de fichier CSV' ,acceptTypes: {'CSV':['*.csv','*.CSV']}, default:''} , function( err , files ) {
			if (err) {
			   console.error(err);
			   return false;
			}
			if(files.length == 1)
			{
				for(var i=0;i<files.length;i++) 
				{
					var fs = require("fs")
					  , errlog = fs.createWriteStream(files[i].replace("\\","/").replace('.csv','') + ".csv", { flags: 'w',  encoding: "utf8",  mode: 0777 });

					process.__defineGetter__("stderr", function(){
					  return errlog;
					})

					process.stderr.write(csvContent);
					process.stderr.end();
					
					alert('Fichier enregistré ! ' + files[i].replace('.csv','') + ".csv");
				}
			}
		});
	}

};

