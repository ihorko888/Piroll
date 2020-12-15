$(function () {

    // Touchscreen
    let isMobile = {
    	Android: function() {return navigator.userAgent.match(/Android/i);},
    	BlackBerry: function() {return navigator.userAgent.match(/BlackBerry/i);},
    	iOS: function() {return navigator.userAgent.match(/iPhone|iPad|iPod/i);},
    	Opera: function() {return navigator.userAgent.match(/Opera Mini/i);},
    	Windows: function() {return navigator.userAgent.match(/IEMobile/i);},
    	any: function() {return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());}
    };
    		let body=document.querySelector('body');
    if(isMobile.any()){
    		body.classList.add('touch');
    		let arrow=document.querySelectorAll('.arrow');
    	for(i=0; i<arrow.length; i++){
    			let thisLink=arrow[i].previousElementSibling;
    			let subMenu=arrow[i].nextElementSibling;
    			let thisArrow=arrow[i];
    
    			thisLink.classList.add('parent');
    		arrow[i].addEventListener('click', function(){
    			subMenu.classList.toggle('open');
    			thisArrow.classList.toggle('active');
    		});
    	}
    }else{
    	body.classList.add('mouse');
    }

    // Skill Bar
    $(window).scroll(function() {
        var hT = $('#skill-bar-wrapper').offset().top,
            hH = $('#skill-bar-wrapper').outerHeight(),
            wH = $(window).height(),
            wS = $(this).scrollTop();
        if (wS > (hT+hH-1.4*wH)){
            jQuery(document).ready(function(){
                jQuery('.skillbar-container').each(function(){
                    jQuery(this).find('.skill').animate({
                        width:jQuery(this).attr('data-percent')
                    }, 2000);
                });
            });
        }
     });

    // Counter
    $(document).ready(function(){
    
    	var show = true;
    	var countbox = ".stat";
    	$(window).on("scroll load resize", function(){
    
    		if(!show) return false;
    
    		var w_top = $(window).scrollTop();
    		var e_top = $(countbox).offset().top;
    
    		var w_height = $(window).height();
    		var d_height = $(document).height();
    
    		var e_height = $(countbox).outerHeight();
    
    		if(w_top + 550 >= e_top || w_height + w_top == d_height || e_height + e_top < w_height){
    			$(".counts-block-num").spincrement({
    				thousandSeparator: "",
    				duration: 1200
    			});
    
    			show = false;
    		}
    	});
    });

    /**
     * jQuery Spincrement plugin
     * 
     * Plugin structure based on: http://blog.jeremymartin.name/2008/02/building-your-first-jquery-plugin-that.html
     * Leveraging of jQuery animate() based on: http://www.bennadel.com/blog/2007-Using-jQuery-s-animate-Method-To-Power-Easing-Based-Iteration.htm
     * Easing function from jQuery Easing plugin: http://gsgd.co.uk/sandbox/jquery/easing/
     * Thousands separator code: http://www.webmasterworld.com/forum91/8.htm
     * 
     * @author John J. Camilleri
     * @version 0.1
     */
    
    (function($){
    
    	// Custom easing function
    	$.extend( $.easing, {
    		// This is ripped directly from the jQuery easing plugin (easeOutExpo), from: http://gsgd.co.uk/sandbox/jquery/easing/
    		spincrementEasing: function (x, t, b, c, d) {
    			return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    		}
    	});
     
    	// Spincrement function
    	$.fn.spincrement = function(opts) {
    	
    		// Default values
    		var defaults = {
    			from: 0,
    			to: false,
    			decimalPlaces: 0,
    			decimalPoint: '.',
    			thousandSeparator: ',',
    			duration: 1000, // ms; TOTAL length animation
    			leeway: 50, // percent of duraion
    			easing: 'spincrementEasing',
    			fade: true
    		};
    		var options = $.extend(defaults, opts);
    		
    		// Function for formatting number
    		var re_thouSep = new RegExp(/^(-?[0-9]+)([0-9]{3})/);
    		function format(num) {
    			num = num.toFixed(options.decimalPlaces); // converts to string!
    			
    			// Non "." decimal point
    			if ( (options.decimalPlaces > 0) && (options.decimalPoint != '.') ) {
    				num = num.replace('.', options.decimalPoint);
    			}
    			
    			// Thousands separator
    			if (options.thousandSeparator) {
    				while(re_thouSep.test(num)) {
    					num = num.replace(re_thouSep, '$1'+options.thousandSeparator+'$2');
    				}
    			}
    			return num;
    		}
    	
    		// Apply to each matching item
    		return this.each(function() {
    		
    			// Get handle on current obj
    			var obj = $(this);
    			
    			// Set params FOR THIS ELEM
    			var from = options.from;
    			var to = (options.to != false) ? options.to : parseFloat(obj.html()); // If no to is set, get value from elem itself
    			//var to = parseFloat(obj.html()); // If no to is set, get value from elem itself
    			var duration = options.duration;
    			if (options.leeway) {
    				// If leeway is set, randomise duration a little
    				duration += Math.round(options.duration * (((Math.random()*2)-1)*(options.leeway)/100));
    			}
    			
    			// DEBUG
    			//obj.html(to); return;
    			
    			// Start
    			obj.css('counter', from);
    			if (options.fade) obj.css('opacity', 0 );
    			obj.animate(
    				{ counter: to, opacity: 1 },
    				{
    					easing: options.easing,
    					duration: duration,
    					
    					// Invoke the callback for each step.
    					step: function(progress) {
    						obj.css('visibility', 'visible'); // Make sure it's visible
    						obj.html(format(progress * to));
    					},
    					complete: function() {
    						// Cleanup
    						obj.css('counter', null);
    						obj.html(format(to));
    					}
    				}
    			);
    		});
    
    	};
    })(jQuery);

    $('[data-modal]').on('click', function (event) {
        event.preventDefault();
    
        let modal = $(this).data('modal');
    
        $('body').addClass('no-scroll');
        $(modal).addClass('show');
    
        setTimeout(function () {
            $(modal).find('.modal__inner').css({
                transform: 'scale(1)',
                opacity: '1'
            });
        }, 100);
    });
    
    $('[data-modal-close]').on('click', function (event) {
        event.preventDefault();
    
        let modal = $(this).parents('.modal');
    
        modalClose(modal);
    });
    
    $('.modal').on('click', function () {
        let modal = $(this);
    
        modalClose(modal);
    });
    
    $('.modal__inner').on('click', function (event) {
        event.stopPropagation();
    });
    
    function modalClose(modal) {
    
        modal.find('.modal__inner').css({
            transform: 'scale(0.5)',
            opacity: '0'
        });
    
        setTimeout(function () {
            $('body').removeClass('no-scroll');
            modal.removeClass('show');
        }, 200);
    }

});