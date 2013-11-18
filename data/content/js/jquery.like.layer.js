/*****

 LAYER LIKE

 appel : $.layerOpen('fan.php', false, 666, 350);
 
 -> page php appellée dans le dossier iframes/
 -> booléen qui permet à l'utilisateur de fermer ou non la popup
 -> largeur
 -> hauteur

 fermeture : $.layerClose('becameFan',fid + ',' + 'true');
  -> callback eventuel vers flash 
  avec 	-> nom de la fonction en string 
		-> liste de parametres en string comma-separated


****/
(jQuery.fn.center = function () 
{
    this.css("position","absolute");
    this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
    return this;
});

(jQuery.layerOpen = function (url, canClose, width, height)
{
	delay_time = 200;
	
	if(width != undefined)
	{
		$('#layer-layer').css('width',width);
		$('#layer-iframe').css('width',width);
	}
	if(height != undefined)
	{
		$('#layer-layer').css('height',height);
		$('#layer-iframe').css('height',height);
	}
	
	if(url != undefined)
	{
		$('#layer-iframe').attr('src', url_php + 'iframes/' + url  );
	}
	var fading = $('#layer-mask').css('filter');
	$('#layer-mask').fadeIn(delay_time, function(){$('#layer-mask').css('filter', fading);});
	
	$('#layer-layer').center();
	
	if(canClose === true)
	{
		$('.layer-closer').css('cursor','pointer');
		$('#layer-cross').css('display','block');
		$('.layer-closer').bind('click', function(){$.layerClose()});
	}
	else
	{
		$('.layer-closer').css('cursor','default');
		$('#layer-cross').css('display','none');
		$('.layer-closer').unbind('click');
	}
	
	$('#layer-layer').delay(delay_time).show("slow");
});


(jQuery.layerClose = function (callback, args)
{
	$('#layer-layer').hide(delay_time);
	$('#layer-iframe').attr('src','');

	var fading = $('#layer-mask').css('filter');
	$('#layer-mask').fadeOut(delay_time, function(){$('#layer-mask').css('filter', fading);});
	
	$('#layer-error').remove();
	if(callback != undefined)
	{
		eval('document.getElementById("flashContent").' + callback + '( ' + args + ');');
	}
});
