// jQuery Dateliner Plugin
// Delect dates on an infinite timeline, 
// Requires JQUERY / JQUERY UI SELECTABLE / ( ? BOOTSTRAP)
// by Loïc Pennamen, 2015

;jQuery(function ($) {

    $.fn.dateliner = function(options){
		
        // plugin's default options, this is private property and is accessible only from inside the plugin
        var defaults = {
			
            duration: 400,
            easing: 'easeOutQuad',
            leftChar: '<',
            rightChar: '>',
			
            moveFirst: true,
            weekFirstDay: 1, // 0 pour dimanche, 1 pour lundi...
            // weekPerLine: 2, // maybe later
			
            // Callbacks
            onChange: function() {	return true;	},
            onInit: function(inst) {	return true;	}

        }
		
		// LOCAL VARS
        var D = this, // "D" is current instance of the object
			today = new Date(),
			to, // short timer to avoid "bubbling" events
			currentDate = today, // par défaut, current date est aujourd'hui
			selected = [] // selected dates
			;
		
        // mergin defaults, and given params
		D.settings = $.extend({}, defaults, options);
		
		
		// ///////////////////// 
		// METHODS: 
		
		// init
        D.init = function(inst) {
			onInit(inst);
        }
		
        // next month
        D.nextMonth = function(){
			newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() +1, 1);
			loadMonth(newDate);
			currentDate = newDate;
        }
		
        // prev month
        D.prevMonth = function(){
			newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() -1, 1);
			loadMonth(newDate);
			currentDate = newDate;
        }
		
		// Déselectionner toutes les dates
		D.reset = function(array){
			
			// update "global" array
			selected = [];
			
			// change cell style
			$('.dateliner-d').removeClass('ui-selected');
			
			// callback function, passing selected array
			clearTimeout(to);
			to = setTimeout(function(){ 
				D.settings.onChange(selected);
			}, 100);
		}
		
		// Sélectionner certaines dates dans le mois courant
		D.selectDates = function(array){
			for(i=0; i<array.length; i++){
				
				var str = currentDate.getFullYear() +'-'+ ("0" + (currentDate.getMonth()+1)).slice(-2) 	+ '-'+("0" + array[i]).slice(-2);
				
				if($.inArray(str, selected) == -1){
					
					// update "global" array
					selected[selected.length] = str;
					
					// change cell style
					$('[data-humandate='+str+']').addClass('ui-selected');
					
					// callback function, passing selected array
					clearTimeout(to);
					to = setTimeout(function(){ 
						D.settings.onChange(selected);
					}, 100);
					
				}
			}
		}
		
		// retourner la liste des éléments sélectionnés
		D.getSelected = function(){
			return selected;
		}
		
		
		// /////////////////////
		// PRIVATE METHODS
		
        // these methods can be called only from inside the plugin like:
        // methodName(arg1, arg2, ... argn)

        // Retourner les infos du mois donné
        var get_month_datas = function(month, year){ 
			
			// vars
			var last_day,
				first_day,
				today = new Date(),
				month_datas={};
			
			// valeurs par défaut ou précisées - dernier jour du mois (0)
			if(typeof( month ) !== "number" || typeof( year ) !== "number"){
				month = today.getMonth();
				year  = today.getFullYear();
			}
			
			// last and first day of month
			first_day = new Date(year, month, 1);
			last_day  = new Date(year, month +1, 0); // 0 = last day of previous month = number of days in month
			
			// retourner le nombre de jours, et le premier
			month_datas.firstDay = first_day.getDay(); // jour ds la semaine
			month_datas.ndays = last_day.getDate(); // nombre de jours dans le mois
			month_datas.month = first_day.getMonth();
			month_datas.year = first_day.getFullYear();
			
			return month_datas;
		}
		
		// listage des jours
		var list_days = function(month_datas){
			
			var html = '',
				cell,
				todayClass,
				selectedClass,
				humandate,
				todayStr,
				decalage = 0, // valeur du décalage du premier jour (multiplicateur, 0 à 6)
				jump = false, // saut de ligne ?
				// weekdays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
				weekdays = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']
				;
			
			// aujourd'hui, en string
			todayStr =  today.getFullYear() +'-'+ ("0" + (today.getMonth()+1)).slice(-2) 	+ '-'+("0" + today.getDate()).slice(-2);
			
			// valeur du décalage du premier jour (multiplicateur)
			if(D.settings.moveFirst){
				decalage = month_datas.firstDay - D.settings.weekFirstDay;
				if(decalage < 0) decalage = 7+decalage;
				// remplissage de cases vides
				for(i=0; i < decalage; i++)	
					html +=  '<div class="dateliner-d dateliner-d-empty"><span class="str">&nbsp;</span><span class="int">&nbsp;</span></div>';
			}
			
			// chaque jour
			for(i=1; i <= month_datas.ndays; i++){
				
				// 0 à 6 - dimanche à samedi
				weekday = (i-1 + month_datas.firstDay) % 7;
				
				// humandate : représentation unique de chaque jour
				humandate = month_datas.year 	+'-'+ ("0" + (month_datas.month+1)).slice(-2) 	+ '-'+("0" + i).slice(-2);
				
				// ce jour est-il sélectionné ?
				if( $.inArray(humandate, selected) > -1 ) 	selectedClass = 'ui-selected';
				else										selectedClass = '';
					
				// ce jour est-il aujourd'hui ?
				if( humandate == todayStr ) 	todayClass = 'today';
				else							todayClass = '';
					
				// html for this cell
				cell =  '<div class="dateliner-d dateliner-selectable dateliner-weekday-'+weekday+' '+selectedClass+' '+todayClass+' decalage-'+decalage+'" data-humandate="'+humandate+'">'
							+'<span class="str">' + weekdays[weekday] + ' </span>'
							+'<span class="int">' + i + ' </span>'
						+'</div>';
				
				html += cell;
				
				// saut de ligne ?
				// if(weekday == (D.settings.weekFirstDay -1) %7)	
					// html += '<br />';
				
			}
			
			return html;
		}
		
		// Chargement d'une slide
		var loadMonth = function(newDate){
			
			// infos des dates du mois courant
			var anim;
			var container = D.find('.dateliner-col-center');
			var w = container.innerWidth();
			var month_datas = get_month_datas(newDate.getMonth(), newDate.getFullYear());
			var months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
			
			if(newDate == currentDate) anim = 0;
			if(newDate < currentDate) anim = 1; // LTR
			if(newDate > currentDate) anim = -1; // RTL
			
			// Html 
			var html = $('<div class="dateliner-slide" data-month="'+newDate.getMonth()+'-'+newDate.getFullYear()+'">'
							+'<div class="dateliner-monthname">'+months[newDate.getMonth()]+' '+newDate.getFullYear()+'</div>'
							+'<div class="dateliner-days">'
								+ list_days(month_datas)
							+'</div>'
						+'</div>');
			
			// positionning
			html.css('left', (anim * w * -1) +'px');
			
			// display first of the line
			container.append(html);
			
			// class work for target current slide
			html.addClass('dateliner-slide-current').siblings().removeClass('dateliner-slide-current');
			
			// animation
			container.find('.dateliner-slide').each(function(){
				
				var position = parseInt($(this).css('left'));
				
				$(this).animate({
						'left' : (position + w*anim) +'px'
					}, { 
						queue:false, 
						duration: D.settings.duration, 
						easing: D.settings.easing,
						complete: function(){
							// suppression des divs inutiles
							if(!$(this).hasClass('dateliner-slide-current'))	
								$(this).remove();
						}
					});
			});
			
			// application de jqueryui selectable
			html.find('.dateliner-days')
				// permettre le on-off au clic d'une sélection (more touch-friendly)
				.bind( "mousedown", function ( e ) {
					e.metaKey = true;
					console.log('md');
				} )
				// selectable
				.selectable({
					filter: '.dateliner-selectable',
					selected: function(e, ui){
						date_record( $(ui.selected).attr('data-humandate') ) ;
					},
					unselected: function(e, ui){
						date_forget( $(ui.unselected).attr('data-humandate') ) ;
					}
				});
			
			
		}
		
		// enregistrer une date sélectionnée
		var date_record = function(str){
			
			if($.inArray(str, selected) == -1) 
				selected[selected.length] = str;
			
			// callback function, passing selected array
			clearTimeout(to);
			to = setTimeout(function(){ 
				D.settings.onChange(selected);
			}, 100);

		}
		
		// retirer une date sélectionnée
		var date_forget = function(str){
			
			var index = $.inArray(str, selected);
			if (index > -1) 
				selected.splice(index, 1);
			
			// callback function, passing selected array
			clearTimeout(to);
			to = setTimeout(function(){ 
				D.settings.onChange(selected);
			}, 100);
		}
		
		
		// /////////////////////
        // Initialisation du plugin à l'application // Applying plugin to jquery object
		$(this).each(function(){
			
			// création du template
			var tpl = '<div class="dateliner-container">'
							
						// left nav
						+'<div class="dateliner-col-left btn btn-primary">'
							+ D.settings.leftChar
						+'</div>'
						
						+'<div class="dateliner-col-center">'
							// ***slides*** //
						+'</div>'
						
						// right nav
						+'<div class="dateliner-col-right btn btn-primary">'
							+ D.settings.rightChar
						+'</div>'
						
					+'</div>'
					;
				
			$(this).html(tpl);
			
			// chargement de la première slide, avec le jour d'aujourd'hui
			loadMonth(currentDate);
			
		});
		
		
		// /////////////////////
        // INTERACTIONS
		D.find('.dateliner-col-left').on('click', function(){
			
			newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() -1, 1);
			loadMonth(newDate);
			currentDate = newDate;
			
		});
		D.find('.dateliner-col-right').on('click', function(){
			
			newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() +1, 1);
			loadMonth(newDate);
			currentDate = newDate;
			
		});
		
		
		// /////////////////////
        // call the "constructor" method
        D.settings.onInit(this);
		
		
		// /////////////////////
        // returns this instance
        return this;
		
    }
	
});

