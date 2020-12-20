/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.8.1
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
;(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function() {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this, dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
                nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function(slider, i) {
                    return $('<button type="button" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                focusOnChange: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                scrolling: false,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                swiping: false,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


            _.registerBreakpoints();
            _.init(true);

        }

        return Slick;

    }());

    Slick.prototype.activateADA = function() {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });

    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function(markup, index, addBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function(index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function() {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function(targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -(_.currentLeft);
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function() {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.getNavTarget = function() {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if ( asNavFor && asNavFor !== null ) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;

    };

    Slick.prototype.asNavFor = function(index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if ( asNavFor !== null && typeof asNavFor === 'object' ) {
            asNavFor.each(function() {
                var target = $(this).slick('getSlick');
                if(!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }

    };

    Slick.prototype.applyTransition = function(slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function() {

        var _ = this;

        _.autoPlayClear();

        if ( _.slideCount > _.options.slidesToShow ) {
            _.autoPlayTimer = setInterval( _.autoPlayIterator, _.options.autoplaySpeed );
        }

    };

    Slick.prototype.autoPlayClear = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function() {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if ( !_.paused && !_.interrupted && !_.focussed ) {

            if ( _.options.infinite === false ) {

                if ( _.direction === 1 && ( _.currentSlide + 1 ) === ( _.slideCount - 1 )) {
                    _.direction = 0;
                }

                else if ( _.direction === 0 ) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if ( _.currentSlide - 1 === 0 ) {
                        _.direction = 1;
                    }

                }

            }

            _.slideHandler( slideTo );

        }

    };

    Slick.prototype.buildArrows = function() {

        var _ = this;

        if (_.options.arrows === true ) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if( _.slideCount > _.options.slidesToShow ) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow
                        .addClass('slick-disabled')
                        .attr('aria-disabled', 'true');
                }

            } else {

                _.$prevArrow.add( _.$nextArrow )

                    .addClass('slick-hidden')
                    .attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });

            }

        }

    };

    Slick.prototype.buildDots = function() {

        var _ = this,
            i, dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active');

        }

    };

    Slick.prototype.buildOut = function() {

        var _ = this;

        _.$slides =
            _.$slider
                .children( _.options.slide + ':not(.slick-cloned)')
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function(index, element) {
            $(element)
                .attr('data-slick-index', index)
                .data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();


        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function() {

        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides,slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if(_.options.rows > 0) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
                originalSlides.length / slidesPerSection
            );

            for(a = 0; a < numOfSlides; a++){
                var slide = document.createElement('div');
                for(b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for(c = 0; c < _.options.slidesPerRow; c++) {
                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children()
                .css({
                    'width':(100 / _.options.slidesPerRow) + '%',
                    'display': 'inline-block'
                });

        }

    };

    Slick.prototype.checkResponsive = function(initial, forceUpdate) {

        var _ = this,
            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if ( _.options.responsive &&
            _.options.responsive.length &&
            _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                    targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if( !initial && triggerBreakpoint !== false ) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }

    };

    Slick.prototype.changeSlide = function(event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        if($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if(!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }

    };

    Slick.prototype.checkNavigable = function(index) {

        var _ = this,
            navigables, prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function() {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots)
                .off('click.slick', _.changeSlide)
                .off('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .off('mouseleave.slick', $.proxy(_.interrupt, _, false));

            if (_.options.accessibility === true) {
                _.$dots.off('keydown.slick', _.keyHandler);
            }
        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);
                _.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);
            }
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.cleanUpSlideEvents = function() {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

    };

    Slick.prototype.cleanUpRows = function() {

        var _ = this, originalSlides;

        if(_.options.rows > 0) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function(event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function(refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }

        if ( _.$prevArrow && _.$prevArrow.length ) {

            _.$prevArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display','');

            if ( _.htmlExpr.test( _.options.prevArrow )) {
                _.$prevArrow.remove();
            }
        }

        if ( _.$nextArrow && _.$nextArrow.length ) {

            _.$nextArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display','');

            if ( _.htmlExpr.test( _.options.nextArrow )) {
                _.$nextArrow.remove();
            }
        }


        if (_.$slides) {

            _.$slides
                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                .removeAttr('aria-hidden')
                .removeAttr('data-slick-index')
                .each(function(){
                    $(this).attr('style', $(this).data('originalStyling'));
                });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if(!refresh) {
            _.$slider.trigger('destroy', [_]);
        }

    };

    Slick.prototype.disableTransition = function(slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function(slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function() {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.fadeSlideOut = function(slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function(filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.focusHandler = function() {

        var _ = this;

        _.$slider
            .off('focus.slick blur.slick')
            .on('focus.slick blur.slick', '*', function(event) {

            event.stopImmediatePropagation();
            var $sf = $(this);

            setTimeout(function() {

                if( _.options.pauseOnFocus ) {
                    _.focussed = $sf.is(':focus');
                    _.autoPlay();
                }

            }, 0);

        });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function() {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function() {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            if (_.slideCount <= _.options.slidesToShow) {
                 ++pagerQty;
            } else {
                while (breakPoint < _.slideCount) {
                    ++pagerQty;
                    breakPoint = counter + _.options.slidesToScroll;
                    counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                }
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if(!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        }else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function(slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide,
            coef;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                coef = -1

                if (_.options.vertical === true && _.options.centerMode === true) {
                    if (_.options.slidesToShow === 2) {
                        coef = -1.5;
                    } else if (_.options.slidesToShow === 1) {
                        coef = -2
                    }
                }
                verticalOffset = (verticalHeight * _.options.slidesToShow) * coef;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                    } else {
                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
            _.slideOffset = ((_.slideWidth * Math.floor(_.options.slidesToShow)) / 2) - ((_.slideWidth * _.slideCount) / 2);
        } else if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft =  0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft =  0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function(option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function() {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function() {

        return this;

    };

    Slick.prototype.getSlideCount = function() {

        var _ = this,
            slidesTraversed, swipedSlide, centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function(index, slide) {
                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function(slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);

    };

    Slick.prototype.init = function(creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();

        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if ( _.options.autoplay ) {

            _.paused = false;
            _.autoPlay();

        }

    };

    Slick.prototype.initADA = function() {
        var _ = this,
                numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
                tabControlIndexes = _.getNavigableIndexes().filter(function(val) {
                    return (val >= 0) && (val < _.slideCount);
                });

        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        if (_.$dots !== null) {
            _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function(i) {
                var slideControlIndex = tabControlIndexes.indexOf(i);

                $(this).attr({
                    'role': 'tabpanel',
                    'id': 'slick-slide' + _.instanceUid + i,
                    'tabindex': -1
                });

                if (slideControlIndex !== -1) {
                   var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex
                   if ($('#' + ariaButtonControl).length) {
                     $(this).attr({
                         'aria-describedby': ariaButtonControl
                     });
                   }
                }
            });

            _.$dots.attr('role', 'tablist').find('li').each(function(i) {
                var mappedSlideIndex = tabControlIndexes[i];

                $(this).attr({
                    'role': 'presentation'
                });

                $(this).find('button').first().attr({
                    'role': 'tab',
                    'id': 'slick-slide-control' + _.instanceUid + i,
                    'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,
                    'aria-label': (i + 1) + ' of ' + numDotGroups,
                    'aria-selected': null,
                    'tabindex': '-1'
                });

            }).eq(_.currentSlide).find('button').attr({
                'aria-selected': 'true',
                'tabindex': '0'
            }).end();
        }

        for (var i=_.currentSlide, max=i+_.options.slidesToShow; i < max; i++) {
          if (_.options.focusOnChange) {
            _.$slides.eq(i).attr({'tabindex': '0'});
          } else {
            _.$slides.eq(i).removeAttr('tabindex');
          }
        }

        _.activateADA();

    };

    Slick.prototype.initArrowEvents = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow
               .off('click.slick')
               .on('click.slick', {
                    message: 'previous'
               }, _.changeSlide);
            _.$nextArrow
               .off('click.slick')
               .on('click.slick', {
                    message: 'next'
               }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow.on('keydown.slick', _.keyHandler);
                _.$nextArrow.on('keydown.slick', _.keyHandler);
            }
        }

    };

    Slick.prototype.initDotEvents = function() {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$dots.on('keydown.slick', _.keyHandler);
            }
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {

            $('li', _.$dots)
                .on('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initSlideEvents = function() {

        var _ = this;

        if ( _.options.pauseOnHover ) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initializeEvents = function() {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(_.setPosition);

    };

    Slick.prototype.initUI = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

    };

    Slick.prototype.keyHandler = function(event) {

        var _ = this;
         //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if(!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' :  'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }

    };

    Slick.prototype.lazyLoad = function() {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function() {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageSrcSet = $(this).attr('data-srcset'),
                    imageSizes  = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function() {

                    image
                        .animate({ opacity: 0 }, 100, function() {

                            if (imageSrcSet) {
                                image
                                    .attr('srcset', imageSrcSet );

                                if (imageSizes) {
                                    image
                                        .attr('sizes', imageSizes );
                                }
                            }

                            image
                                .attr('src', imageSource)
                                .animate({ opacity: 1 }, 200, function() {
                                    image
                                        .removeAttr('data-lazy data-srcset data-sizes')
                                        .removeClass('slick-loading');
                                });
                            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                        });

                };

                imageToLoad.onerror = function() {

                    image
                        .removeAttr( 'data-lazy' )
                        .removeClass( 'slick-loading' )
                        .addClass( 'slick-lazyload-error' );

                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                };

                imageToLoad.src = imageSource;

            });

        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

        if (_.options.lazyLoad === 'anticipated') {
            var prevSlide = rangeStart - 1,
                nextSlide = rangeEnd,
                $slides = _.$slider.find('.slick-slide');

            for (var i = 0; i < _.options.slidesToScroll; i++) {
                if (prevSlide < 0) prevSlide = _.slideCount - 1;
                loadRange = loadRange.add($slides.eq(prevSlide));
                loadRange = loadRange.add($slides.eq(nextSlide));
                prevSlide--;
                nextSlide++;
            }
        }

        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function() {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });

    };

    Slick.prototype.orientationChange = function() {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function() {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function() {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;

    };

    Slick.prototype.postSlide = function(index) {

        var _ = this;

        if( !_.unslicked ) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            if (_.slideCount > _.options.slidesToShow) {
                _.setPosition();
            }

            _.swipeLeft = null;

            if ( _.options.autoplay ) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();

                if (_.options.focusOnChange) {
                    var $currentSlide = $(_.$slides.get(_.currentSlide));
                    $currentSlide.attr('tabindex', 0).focus();
                }
            }

        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });

    };

    Slick.prototype.preventDefault = function(event) {

        event.preventDefault();

    };

    Slick.prototype.progressiveLazyLoad = function( tryCount ) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $( 'img[data-lazy]', _.$slider ),
            image,
            imageSource,
            imageSrcSet,
            imageSizes,
            imageToLoad;

        if ( $imgsToLoad.length ) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageSrcSet = image.attr('data-srcset');
            imageSizes  = image.attr('data-sizes') || _.$slider.attr('data-sizes');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function() {

                if (imageSrcSet) {
                    image
                        .attr('srcset', imageSrcSet );

                    if (imageSizes) {
                        image
                            .attr('sizes', imageSizes );
                    }
                }

                image
                    .attr( 'src', imageSource )
                    .removeAttr('data-lazy data-srcset data-sizes')
                    .removeClass('slick-loading');

                if ( _.options.adaptiveHeight === true ) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [ _, image, imageSource ]);
                _.progressiveLazyLoad();

            };

            imageToLoad.onerror = function() {

                if ( tryCount < 3 ) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout( function() {
                        _.progressiveLazyLoad( tryCount + 1 );
                    }, 500 );

                } else {

                    image
                        .removeAttr( 'data-lazy' )
                        .removeClass( 'slick-loading' )
                        .addClass( 'slick-lazyload-error' );

                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                    _.progressiveLazyLoad();

                }

            };

            imageToLoad.src = imageSource;

        } else {

            _.$slider.trigger('allImagesLoaded', [ _ ]);

        }

    };

    Slick.prototype.refresh = function( initializing ) {

        var _ = this, currentSlide, lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if( !_.options.infinite && ( _.currentSlide > lastVisibleIndex )) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if ( _.slideCount <= _.options.slidesToShow ) {
            _.currentSlide = 0;

        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if( !initializing ) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);

        }

    };

    Slick.prototype.registerBreakpoints = function() {

        var _ = this, breakpoint, currentBreakpoint, l,
            responsiveSettings = _.options.responsive || null;

        if ( $.type(responsiveSettings) === 'array' && responsiveSettings.length ) {

            _.respondTo = _.options.respondTo || 'window';

            for ( breakpoint in responsiveSettings ) {

                l = _.breakpoints.length-1;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {
                    currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while( l >= 0 ) {
                        if( _.breakpoints[l] && _.breakpoints[l] === currentBreakpoint ) {
                            _.breakpoints.splice(l,1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                }

            }

            _.breakpoints.sort(function(a, b) {
                return ( _.options.mobileFirst ) ? a-b : b-a;
            });

        }

    };

    Slick.prototype.reinit = function() {

        var _ = this;

        _.$slides =
            _.$slideTrack
                .children(_.options.slide)
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);

    };

    Slick.prototype.resize = function() {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function() {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if( !_.unslicked ) { _.setPosition(); }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function(index, removeBefore, removeAll) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function(position) {

        var _ = this,
            positionProps = {},
            x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function() {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function() {

        var _ = this,
            targetLeft;

        _.$slides.each(function(index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function() {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption =
    Slick.prototype.slickSetOption = function() {

        /**
         * accepts arguments in format of:
         *
         *  - for changing a single option's value:
         *     .slick("setOption", option, value, refresh )
         *
         *  - for changing a set of responsive options:
         *     .slick("setOption", 'responsive', [{}, ...], refresh )
         *
         *  - for updating multiple values at once (not responsive)
         *     .slick("setOption", { 'option': value, ... }, refresh )
         */

        var _ = this, l, item, option, value, refresh = false, type;

        if( $.type( arguments[0] ) === 'object' ) {

            option =  arguments[0];
            refresh = arguments[1];
            type = 'multiple';

        } else if ( $.type( arguments[0] ) === 'string' ) {

            option =  arguments[0];
            value = arguments[1];
            refresh = arguments[2];

            if ( arguments[0] === 'responsive' && $.type( arguments[1] ) === 'array' ) {

                type = 'responsive';

            } else if ( typeof arguments[1] !== 'undefined' ) {

                type = 'single';

            }

        }

        if ( type === 'single' ) {

            _.options[option] = value;


        } else if ( type === 'multiple' ) {

            $.each( option , function( opt, val ) {

                _.options[opt] = val;

            });


        } else if ( type === 'responsive' ) {

            for ( item in value ) {

                if( $.type( _.options.responsive ) !== 'array' ) {

                    _.options.responsive = [ value[item] ];

                } else {

                    l = _.options.responsive.length-1;

                    // loop through the responsive object and splice out duplicates.
                    while( l >= 0 ) {

                        if( _.options.responsive[l].breakpoint === value[item].breakpoint ) {

                            _.options.responsive.splice(l,1);

                        }

                        l--;

                    }

                    _.options.responsive.push( value[item] );

                }

            }

        }

        if ( refresh ) {

            _.unload();
            _.reinit();

        }

    };

    Slick.prototype.setPosition = function() {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function() {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if ( _.options.fade ) {
            if ( typeof _.options.zIndex === 'number' ) {
                if( _.options.zIndex < 3 ) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
    };


    Slick.prototype.setSlideClasses = function(index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        allSlides = _.$slider
            .find('.slick-slide')
            .removeClass('slick-active slick-center slick-current')
            .attr('aria-hidden', 'true');

        _.$slides
            .eq(index)
            .addClass('slick-current');

        if (_.options.centerMode === true) {

            var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                    _.$slides
                        .slice(index - centerOffset + evenCoef, index + centerOffset + 1)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides
                        .slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

                if (index === 0) {

                    allSlides
                        .eq(allSlides.length - 1 - _.options.slidesToShow)
                        .addClass('slick-center');

                } else if (index === _.slideCount - 1) {

                    allSlides
                        .eq(_.options.slidesToShow)
                        .addClass('slick-center');

                }

            }

            _.$slides
                .eq(index)
                .addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                _.$slides
                    .slice(index, index + _.options.slidesToShow)
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                    allSlides
                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    allSlides
                        .slice(indexOffset, indexOffset + _.options.slidesToShow)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

            }

        }

        if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
            _.lazyLoad();
        }
    };

    Slick.prototype.setupInfinite = function() {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                        infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex - _.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount  + _.slideCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex + _.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.interrupt = function( toggle ) {

        var _ = this;

        if( !toggle ) {
            _.autoPlay();
        }
        _.interrupted = toggle;

    };

    Slick.prototype.selectHandler = function(event) {

        var _ = this;

        var targetElement =
            $(event.target).is('.slick-slide') ?
                $(event.target) :
                $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.slideHandler(index, false, true);
            return;

        }

        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function(index, sync, dontAnimate) {

        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
            _ = this, navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if ( _.options.autoplay ) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if ( _.options.asNavFor ) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if ( navTarget.slideCount <= navTarget.options.slidesToShow ) {
                navTarget.setSlideClasses(_.currentSlide);
            }

        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function() {
                    _.postSlide(animSlide);
                });

            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
            _.animateSlide(targetLeft, function() {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function() {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function(event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.swiping = false;

        if (_.scrolling) {
            _.scrolling = false;
            return false;
        }

        _.interrupted = false;
        _.shouldClick = ( _.touchObject.swipeLength > 10 ) ? false : true;

        if ( _.touchObject.curX === undefined ) {
            return false;
        }

        if ( _.touchObject.edgeHit === true ) {
            _.$slider.trigger('edge', [_, _.swipeDirection() ]);
        }

        if ( _.touchObject.swipeLength >= _.touchObject.minSwipe ) {

            direction = _.swipeDirection();

            switch ( direction ) {

                case 'left':
                case 'down':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable( _.currentSlide + _.getSlideCount() ) :
                            _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable( _.currentSlide - _.getSlideCount() ) :
                            _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:


            }

            if( direction != 'vertical' ) {

                _.slideHandler( slideCount );
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction ]);

            }

        } else {

            if ( _.touchObject.startX !== _.touchObject.curX ) {

                _.slideHandler( _.currentSlide );
                _.touchObject = {};

            }

        }

    };

    Slick.prototype.swipeHandler = function(event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options
                .touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function(event) {

        var _ = this,
            edgeWasHit = false,
            curLeft, swipeDirection, swipeLength, positionOffset, touches, verticalSwipeLength;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        verticalSwipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

        if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
            _.scrolling = true;
            return false;
        }

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = verticalSwipeLength;
        }

        swipeDirection = _.swipeDirection();

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            _.swiping = true;
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function(event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function() {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function() {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides
            .removeClass('slick-slide slick-active slick-visible slick-current')
            .attr('aria-hidden', 'true')
            .css('width', '');

    };

    Slick.prototype.unslick = function(fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();

    };

    Slick.prototype.updateArrows = function() {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if ( _.options.arrows === true &&
            _.slideCount > _.options.slidesToShow &&
            !_.options.infinite ) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            }

        }

    };

    Slick.prototype.updateDots = function() {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots
                .find('li')
                    .removeClass('slick-active')
                    .end();

            _.$dots
                .find('li')
                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                .addClass('slick-active');

        }

    };

    Slick.prototype.visibility = function() {

        var _ = this;

        if ( _.options.autoplay ) {

            if ( document[_.hidden] ) {

                _.interrupted = true;

            } else {

                _.interrupted = false;

            }

        }

    };

    $.fn.slick = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].slick = new Slick(_[i], opt);
            else
                ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));

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

    $('.testimonials-slider').slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: true,
        speed: 700
    });

    // Gallery
    
    $(".graphic__block-gallery").magnificPopup({
        delegate: "a",
        type: "image",
        gallery: {
          enabled: true
        }
    });
    
    (function($) {
        'use strict';
    
        var $elements = null,
            elementsArr,
            animationsArr,
            scroll,
            windowHeight, windowWidth,
            documentWidth, documentHeight,
            scrollTicking = false,
            resizeTicking = false,
            isTouchDevice = window.Modernizr && typeof(Modernizr.touchevents) != 'undefined' ? Modernizr.touchevents : testTouchEvents(),
            PERC_RE = /%/g,
            VU_RE = /v(w|h)/g;
        
        $.parallax = {
            enableTouchDevices: false
        };
    
        function testTouchEvents() {
            return ('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0);
        }
    
        $.fn.parallax = function(method) {
            switch (method) {
                case 'reset':
                    // todo: implement this
                    //this.css('transform', '');
                    break;
                case 'destroy':
                    // todo: implement this
                    $elements.not(this);
                    break;
                default:
                    if (!isTouchDevice || $.parallax.enableTouchDevices || (method && method.enableTouchDevices)) {
                        this.data("parallax-js", method);
                        var firstCall = ($elements === null);
                        if (firstCall) {
                            updateDimensions();
                        }
                        if (firstCall) {
                            $elements = this;
                            window.onresize = onResize;
                            window.onscroll = onScroll;
                            elementsArr = [];
                            animationsArr = [];
                        }
                        else {
                            $elements = $elements.add(this);
                        }
                        updateAnimationsArray.call(this, elementsArr.length);
                        elementsArr = $elements.toArray();
                        onScroll();
                    }
            }
            return this;
        };
    
        function parseOptions() {
            var optionsArr = [],
                dataOptions = this.data("parallax"),
                jsOptions = this.data("parallax-js");
            typeof dataOptions != "undefined" || (dataOptions = {});
            typeof dataOptions == "object" || console.error("Unable to parse data-parallax attribute "+getSelector(this));
            typeof jsOptions != "undefined" || (jsOptions = {});
            typeof jsOptions == "object" || console.error("Unrecognized options passed to $.fn.parallax");
            if (!Array.isArray(dataOptions)) {
                dataOptions = [dataOptions];
            }
            if (!Array.isArray(jsOptions)) {
                jsOptions = [jsOptions];
            }
            for (var i= 0, len = Math.max(dataOptions.length, jsOptions.length); i<len; i++) {
                var options = $.extend(dataOptions[i] || {}, jsOptions[i] || {});
                
                // todo: remove in next minor release
                typeof options.start === "undefined" || (options.triggerElement = options.start);
                typeof options.trigger == "undefined" || (options.triggerHook = options.trigger);
                
                typeof options.offset != "undefined" || (options.offset = 0);
                typeof options.triggerElement === "undefined" || (options.triggerElement = convertToElement(options.triggerElement));
                typeof options.triggerElement != "undefined" || (options.triggerElement = this[0]);
                optionsArr.push(options);
            }
            return optionsArr;
        }
        
        function rebuildAnimationsArray() {
            animationsArr = [];
            PinScene.scenes = [];
            updateAnimationsArray.call($elements);
        }
    
        function updateAnimationsArray(offset) {
            typeof offset === "number" || (offset = 0);
            this.each(function(i) {
                var idx = offset+i;
                animationsArr[idx] = createAnimations.call(this);
            });
        }
    
        function createAnimations() {
            var $this = $(this),
                animations = [],
                optionsArr = parseOptions.call($this);
            for (var i= 0, len = optionsArr.length; i<len; i++) {
                var options = optionsArr[i],
                    globalOptions = {
                        axis: options.axis,
                        triggerElement: options.triggerElement,
                        triggerHook: options.triggerHook,
                        duration: options.duration,
                        offset: options.offset
                    },
                    animation = {},
                    transformOptions = {},
                    bgPositionOptions = {};
                if (typeof options.x != "undefined") {
                    transformOptions.x = mergeOptions(options.x, globalOptions);
                }
                if (typeof options.y != "undefined") {
                    transformOptions.y = mergeOptions(options.y, globalOptions);
                }
                if (typeof options.z != "undefined") {
                    transformOptions.z = mergeOptions(options.z, globalOptions);
                }
                if (typeof options.scale != "undefined") {
                    transformOptions.scale = mergeOptions(options.scale, globalOptions);
                }
                else {
                    if (typeof options.scaleX != "undefined") {
                        transformOptions.scaleX = mergeOptions(options.scaleX, globalOptions);
                    }
                    if (typeof options.scaleY != "undefined") {
                        transformOptions.scaleY = mergeOptions(options.scaleY, globalOptions);
                    }
                }
                if (typeof options.rotate != "undefined") {
                    transformOptions.rotate = mergeOptions(options.rotate, globalOptions);
                }
                if (transformOptions.x || transformOptions.y || transformOptions.z || 
                    transformOptions.scale || transformOptions.scaleX || transformOptions.scaleY || 
                    transformOptions.rotate) {
                    animation.transform = new TransformContainer($this, transformOptions);
                }
    
                if (typeof options.backgroundPositionX != "undefined") {
                    bgPositionOptions.x = mergeOptions(options.backgroundPositionX, globalOptions);
                }
                if (typeof options.backgroundPositionY != "undefined") {
                    bgPositionOptions.y = mergeOptions(options.backgroundPositionY, globalOptions);
                }
                if (bgPositionOptions.x || bgPositionOptions.y) {
                    animation.bgPosition = new XYContainer($this, bgPositionOptions, 'backgroundPosition');
                }
    
                if (typeof options.top != "undefined") {
                    var topOptions = mergeOptions(options.top, globalOptions);
                    animation.top = new StyleScene($this, topOptions, 'top', $this.offsetParent().height(), "px");
                }
                if (typeof options.left != "undefined") {
                    var leftOptions = mergeOptions(options.left, globalOptions);
                    animation.left = new StyleScene($this, leftOptions, 'left', $this.offsetParent().width(), "px");
                }
                if (typeof options.width != "undefined") {
                    var widthOptions = mergeOptions(options.width, globalOptions);
                    animation.width = new StyleScene($this, widthOptions, 'width');
                }
                if (typeof options.height != "undefined") {
                    var heightOptions = mergeOptions(options.height, globalOptions);
                    animation.height = new StyleScene($this, heightOptions, 'height');
                }
                if (typeof options.opacity != "undefined") {
                    var opacityOptions = mergeOptions(options.opacity, globalOptions);
                    animation.opacity = new StyleScene($this, opacityOptions, 'opacity', 1);
                }
                if (typeof options.color != "undefined") {
                    var colorOptions = mergeOptions(options.color, globalOptions);
                    animation.color = new ColorScene($this, colorOptions, 'color', 0xffffff);
                }
                if (typeof options.backgroundColor != "undefined") {
                    var bgColorOptions = mergeOptions(options.backgroundColor, globalOptions);
                    animation.bgColor = new ColorScene($this, bgColorOptions, 'backgroundColor', 0xffffff);
                }
                if (typeof options.pin != "undefined") {
                    var pinOptions = mergeOptions(options.pin, globalOptions);
                    animation.pin = new PinScene($this, pinOptions);
                }
                if (typeof options.class != "undefined") {
                    var classOptions = mergeOptions(options.class, globalOptions);
                    animation.class = new ClassScene($this, classOptions);
                }
                animations.push(animation);
            }
            return animations;
        }
    
        function onResize() {
            if (!resizeTicking) {
                window.requestAnimationFrame(function() {
                    updateDimensions();
                    rebuildAnimationsArray();
                });
                resizeTicking = true;
            }
        }
    
        function updateDimensions() {
            var body = document.body,
                html = document.documentElement;
    
            windowWidth = Math.max(html.clientWidth, window.innerWidth || 0);
            windowHeight = Math.max(html.clientHeight, window.innerHeight || 0);
    
            documentWidth = Math.max( body.scrollWidth, body.offsetWidth,
                html.clientWidth, html.scrollWidth, html.offsetWidth );
            documentHeight = Math.max( body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight );
        }
    
        function onScroll() {
            if (!scrollTicking) {
                window.requestAnimationFrame(animateElements);
                scrollTicking = true;
            }
        }
    
        function animateElements() {
            scroll = getScroll();
            for (var i= 0, len=elementsArr.length; i<len; i++) {
                animateElement.call(elementsArr[i], i);
            }
            scrollTicking = false;
        }
        
        function getScroll() {
            return {
                left: window.pageXOffset || document.documentElement.scrollLeft,
                top: window.pageYOffset || document.documentElement.scrollTop
            };
        }
    
        function animateElement(idx) {
            var animations = animationsArr[idx],
                animation,
                style;
            typeof window.getComputedStyle != "function" || (style = getComputedStyle(this));
            for (var i=0, len=animations.length; i<len; i++) {
                animation = animations[i];
                for (var name in animation) {
                    if (animation[name].needsUpdate()) {
                        animation[name].update(style);
                    }
                }
            }
        }
    
        function mergeOptions(options, globalOptions) {
            if (typeof options != "object") {
                options = {to: options};
            }
            return $.extend({}, globalOptions, options);
        }
    
        function getOffset(elem) {
            var offsetLeft = elem.offsetLeft,
                offsetTop = elem.offsetTop,
                lastElem = elem;
            while (elem = elem.offsetParent) {
                if (elem === document.body) { //from my observation, document.body always has scrollLeft/scrollTop == 0
                    break;
                }
                offsetLeft += elem.offsetLeft;
                offsetTop += elem.offsetTop;
                lastElem = elem;
            }
            if (lastElem.style.position === 'fixed') { //slow - http://jsperf.com/offset-vs-getboundingclientrect/6
                offsetLeft += scroll.left;
                offsetTop += scroll.top;
            }
            return {
                left: offsetLeft,
                top: offsetTop
            };
        }
        
        function convertToOffset(elem, axis) {
            return getOffset(elem)[axis === Scene.AXIS_X ? 'left' : 'top'];
        }
    
        function convertToElement(value) {
            if (typeof value === "string") {
                value = $(value);
                if (value.length) {
                    return value[0];
                }
                console.error("Invalid parallax triggerElement selector: "+value);
            }
            else {
                return value;
            }
        }
    
        function convertOption(value, maxValue) {
            if (typeof value === "string") {
                if (value.match(PERC_RE)) {
                    value = convertPerc(value, maxValue);
                }
                else {
                    var matches = value.match(VU_RE);
                    if (matches) {
                        value = convertVU(value, matches[0]);
                    }
                }
            }
            else if (typeof value === "function") {
                value = value(maxValue);
            }
            return value;
        }
        
        function convertVU(percent, unit) {
            return convertPerc(percent, (unit === 'vw' ? windowWidth : windowHeight));
        }
    
        function convertPerc(percent, maxValue) {
            return parseFloat(percent) / 100 * maxValue;
        }
    
        function isElement(obj) {
            try {
                return obj instanceof HTMLElement;
            }
            catch(e) {
                return (typeof obj === "object") && (obj.nodeType === 1) &&
                    (typeof obj.style === "object") && (typeof obj.ownerDocument ==="object");
            }
        }
        
        function interpolate(from, to, progress) {
            return (to - from) * progress + from;
        }
        
        function inherit(parentProto, childProto) {
            return $.extend(Object.create(parentProto), childProto || {});
        }
        
        function getSelector($el) {
            var selector = "",
                id = $el.attr("id"),
                classNames = $el.attr("class");
            if (id) {
                selector += "#"+ id;
            }
            else if (classNames) {
                selector += "." + $.trim(classNames).replace(/\s/gi, ".");
            }
            return selector;
        }
        
        function parseUnit(value) {
            return value.replace(/^-?\d+(\.\d*)?(\D+)$/, "$2");
        }
        
        function Scene($el, options) {
            this.$el = $el;
            this.from = options.from;
            this.to = options.to;
            this.axis = options.axis;
            
            this.offset = convertOption(options.offset, this.getElementDimension());
            
            typeof options.triggerHook != "undefined" || (options.triggerHook = "100%");
            this.triggerHook = convertOption(options.triggerHook, options.axis === Scene.AXIS_X ? windowWidth : windowHeight);
            this.triggerElement = convertToElement(options.triggerElement);
            
            this._setEase(options.ease);
            this._setDuration(options.duration);
        }
        Scene.AXIS_X = 'x';
        Scene.AXIS_Y = 'y';
        Scene.STATE_BEFORE = 'before';
        Scene.STATE_DURING = 'during';
        Scene.STATE_AFTER = 'after';
        Scene.prototype = {
            _setEase: function(ease) {
                if (typeof ease == "function") {
                    this.ease = ease;
                }
                else {
                    typeof ease === "undefined" || (this.ease = $.easing[ease]);
                    typeof this.ease === "function" || (this.ease = $.easing.linear);
                }
            },
            _setDuration: function(duration) {
                var validateDurationPx = function(value) {
                    if (value < 0) {
                        console.error("Invalid parallax duration: "+value);
                    }
                };
                if (typeof duration === "undefined") {
                    var scene = this;
                    this.duration = function() {
                        var durationPx = (convertToOffset(scene.$el[0], scene.axis) + scene.$el.outerHeight(true)) - scene.start;
                        validateDurationPx(durationPx);
                        return durationPx;
                    };
                }
                else if (typeof duration === "function") {
                    this.duration = function() {
                        var durationPx = duration();
                        validateDurationPx(durationPx);
                        return durationPx;
                    };
                }
                else {
                    var durationPx = convertOption(duration, this.getElementDimension());
                    validateDurationPx(durationPx);
                    this.duration = function () {
                        return durationPx;
                    };
                }
            },
            getElementDimension: function() {
                return this.axis === Scene.AXIS_X ? 
                    this.$el.outerWidth(true) : 
                    this.$el.outerHeight(true);
            },
            needsUpdate: function() {
                this.updateStart();
                this.updateDuration();
                this.updateState();
                return this._needsUpdate();
            },
            _needsUpdate: function() {
                return this.state === Scene.STATE_DURING ||
                    (typeof this.prevState === "undefined" && this.state === Scene.STATE_AFTER) ||
                    (typeof this.prevState != "undefined" && this.prevState != this.state);
            },
            updateStart: function() {
                this.start = Math.max(this.getOffset() - this.triggerHook, 0);
            },
            updateDuration: function() {
                this.durationPx = this.duration.call(this);
                if (this.durationPx === 0) {
                    this.durationPx = ((this.axis === Scene.AXIS_X ? 
                        documentWidth - windowWidth : 
                        documentHeight - windowHeight) - this.start);
                }
            },
            updateState: function() {
                this.prevState = this.state;
                if (scroll.top < this.start) {
                    this.state = Scene.STATE_BEFORE;
                }
                else if (scroll.top <= (this.start + this.durationPx)) {
                    this.state = Scene.STATE_DURING;
                }
                else {
                    this.state = Scene.STATE_AFTER;
                }
            },
            getOffset: function() {
                var offset = this.offset;
                if (isElement(this.triggerElement)) {
                    var pinScene = PinScene.findByElement(this.triggerElement);
                    offset += (pinScene && pinScene.state === Scene.STATE_DURING ? 
                        pinScene.start : 
                        convertToOffset(this.triggerElement, this.axis));
                }
                return offset;
            },
            getProgress: function() {
                if (this.state === Scene.STATE_BEFORE) {
                    return 0;
                }
                else if (this.state === Scene.STATE_DURING) {
                    var posPx = scroll.top - this.start,
                        percent = posPx / this.durationPx,
                        progress = this.ease.call(this, percent);
                    return progress;
                }
                else {
                    return 1;
                }
            },
            update: function(style) {
                this._setFrom(this._getOldValue(style));
                this._setValue(this._getNewValue(), style);
            },
            _getOldValue: function() {},
            _getNewValue: function() {},
            _setFrom: function(defaultValue) {
                typeof this.from != "undefined" || (this.from = defaultValue);
            }
        };
        
        function ScalarScene($el, options, maxValue, defaultUnit) {
            this.convertPerc = false;
            this.unit = defaultUnit;
            if (typeof maxValue != "undefined") {
                options.from = convertOption(options.from, maxValue);
                options.to = convertOption(options.to, maxValue);
            }
            else {
                if (typeof options.from === "string") {
                    options.from = this._parseString(options.from);
                }
                else if (typeof options.from === "function") {
                    options.from = options.from();
                }
                if (typeof options.to === "string") {
                    options.to = this._parseString(options.to);
                }
                else if (typeof options.to === "function") {
                    options.to = options.to();
                }
            }
            Scene.call(this, $el, options);
        }
        ScalarScene.prototype = inherit(Scene.prototype, {
            _parseString: function(value) {
                if (value.match(PERC_RE)) {
                    this.convertPerc = true;
                }
                else {
                    var matches = value.match(VU_RE);
                    if (matches) {
                        value = convertVU(value, matches[0]);
                    }
                    else {
                        this.unit = parseUnit(value);
                    }
                }
                return value;
            },
            _getNewValue: function() {
                var from = this.from,
                    to = this.to;
                if (typeof from === "string") {
                    if (this.convertPerc && from.substr(-1) === "%") {
                        from = convertOption(from, this.durationPx);
                    }
                    else {
                        from = parseFloat(from);
                    }
                }
                if (typeof to === "string") {
                    if (this.convertPerc && to.substr(-1) === "%") {
                        to = convertOption(to, this.durationPx);
                    }
                    else {
                        to = parseFloat(to);
                    }
                }
                var suffix = (typeof this.unit === "undefined" ? 0 : this.unit);
                return interpolate(from, to, this.getProgress()) + suffix;
            }
        });
        
        function StyleScene($el, options, styleName, maxValue, defaultUnit) {
            this.styleName = styleName;
            ScalarScene.call(this, $el, options, maxValue, defaultUnit);
        }
        StyleScene.prototype = inherit(ScalarScene.prototype, {
            _getOldValue: function(style) {
                return parseFloat(style[this.styleName]);
            },
            _setValue: function(newValue) {
                this.$el[0].style[this.styleName] = newValue;
            }
        });
        
        function ColorScene($el, options, styleName, maxValue) {
            StyleScene.call(this, $el, options, styleName, maxValue);
        }
        ColorScene.prototype = inherit(StyleScene.prototype, {
            _getOldValue: function(style) {
                return style[this.styleName];
            },
            _getNewValue: function() {
                var fromColor = RGBColor.fromString(this.from),
                    toColor = RGBColor.fromString(this.to);
                fromColor.interpolate(toColor, this.getProgress());
                return fromColor.toString();
            }
        });
    
        function StateScene($el, options) {
            typeof options.triggerHook != "undefined" || (options.triggerHook = 0);
            Scene.call(this, $el, options);
        }
        StateScene.prototype = inherit(Scene.prototype, {
            _needsUpdate: function() {
                return (typeof this.prevState != "undefined" || this.state == Scene.STATE_DURING) &&
                    this.prevState != this.state;
            }
        });
    
        function ClassScene($el, options) {
            StateScene.call(this, $el, options);
        }
        ClassScene.prototype = inherit(Scene.prototype, {
            _setValue: function() {
                this.$el[this.state == Scene.STATE_DURING ? 'addClass' : 'removeClass'](this.to);
            }
        });
    
        function PinScene($el, options) {
            options.to = convertToElement(options.to);
            isElement(options.to) || (options.to = $el[0]);
            typeof options.triggerHook != "undefined" || (options.triggerHook = 0);
            StateScene.call(this, $el, options);
            PinScene.scenes.push(this);
        }
        PinScene.scenes = [];
        PinScene.findByElement = function(elem) {
            var scenes = PinScene.scenes;
            for (var i=0, len=scenes.length; i<len; i++) {
                if (scenes[i].$el[0] === elem) {
                    return scenes[i];
                }
            }
        };
        PinScene.prototype = inherit(StateScene.prototype, {
            updateStart: function() {
                if (this.state != Scene.STATE_DURING) {
                    Scene.prototype.updateStart.call(this);
                }
            },
            _getOldValue: function(style) {
                var toStyle = getComputedStyle(this.to);
                return {
                    position: toStyle.position,
                    top: toStyle.top,
                    left: toStyle.left,
                    marginLeft: "",
                    marginTop: ""
                };
            },
            _getNewValue: function() {
                if (this.state == Scene.STATE_DURING) {
                    return {
                        position: 'fixed',
                        top: this.from.pinTop + 'px',
                        left: this.from.pinLeft + 'px',
                        marginLeft: 0,
                        marginTop: 0
                    };
                }
                return this.from;
            },
            _setValue: function(newValue) {
                for (var styleName in newValue) {
                    this.to.style[styleName] = newValue[styleName];                
                }
            },
            _setFrom: function(defaultValue) {
                if (typeof this.from === "undefined") {
                    var offset = getOffset(this.to);
                    if (this.axis === Scene.AXIS_X) {
                        defaultValue.pinTop = offset.top;
                        defaultValue.pinLeft = offset.left - this.start;
                    }
                    else {
                        defaultValue.pinTop = offset.top - this.start;
                        defaultValue.pinLeft = offset.left;
                    }
                    this.from = defaultValue;
                }
            }
        });
        
        function VOScene($el, options, propName, maxValue) {
            this.propName = propName;
            ScalarScene.call(this, $el, options, maxValue);
        }
        VOScene.prototype = inherit(ScalarScene.prototype, {
            _getOldValue: function(vo) {
                return vo.get(this.propName);
            },
            _setValue: function(newValue, vo) {
                vo.set(this.propName, newValue);
            }
        });
        
        function SceneContainer($el, options) {
            this.$el = $el;
        }
        SceneContainer.prototype = {
            needsUpdate: function() {
                return true;
            }
        };
        
        function XYContainer($el, options, styleName) {
            SceneContainer.call(this, $el, options);
            this.styleName = styleName;
            if (options.x) {
                this.x = new VOScene($el, options.x, 'x');
            }
            if (options.y) {
                this.y = new VOScene($el, options.y, 'y');
            }
        }
        XYContainer.prototype = inherit(SceneContainer.prototype, {
            update: function(style) {
                var xy = XY.fromString(style[this.styleName]);
                if (this.x && this.x.needsUpdate()) {
                    this.x.update(xy);
                }
                if (this.y && this.y.needsUpdate()) {
                    this.y.update(xy);
                }
                if (xy.isChanged()) {
                    var element = this.$el[0],
                        newValue = xy.toString();
                    element.style[this.styleName] = newValue;
                }
            }
        });
    
        function TransformContainer($el, options) {
            SceneContainer.call(this, $el, options);
            if (options.x) {
                this.x = new VOScene($el, options.x, 'translateX');
            }
            if (options.y) {
                this.y = new VOScene($el, options.y, 'translateY');
            }
            if (options.z) {
                this.z = new VOScene($el, options.z, 'translateZ');
            }
            if (options.scale) {
                this.scale = new VOScene($el, options.scale, 'scale', 1);
            }
            else {
                if (options.scaleX) {
                    this.scaleX = new VOScene($el, options.scaleX, 'scaleX', 1);
                }
                if (options.scaleY) {
                    this.scaleY = new VOScene($el, options.scaleY, 'scaleY', 1);
                }
            }
            if (options.rotate) {
                this.rotate = new VOScene($el, options.rotate, 'rotate', 360);
            }
        }
        TransformContainer.prototype = inherit(SceneContainer.prototype, {
            update: function(style) {
                var matrix = TransformMatrix.fromStyle(style),
                    transform = Transform.fromMatrix(matrix);
                if (this.x && this.x.needsUpdate()) {
                    this.x.update(transform);
                }
                if (this.y && this.y.needsUpdate()) {
                    this.y.update(transform);
                }
                if (this.z && this.z.needsUpdate()) {
                    this.z.update(transform);
                }
                if (this.scale && this.scale.needsUpdate()) {
                    this.scale.update(transform);
                }
                if (this.scaleX && this.scaleX.needsUpdate()) {
                    this.scaleX.update(transform);
                }
                if (this.scaleY && this.scaleY.needsUpdate()) {
                    this.scaleY.update(transform);
                }
                if (this.rotate && this.rotate.needsUpdate()) {
                    this.rotate.update(transform);
                }
                if (transform.isChanged()) {
                    var element = this.$el[0],
                        newValue = transform.toString();
                    element.style['-webkit-transform'] = newValue;
                    element.style['-moz-transform'] = newValue;
                    element.style['-ms-transform'] = newValue;
                    element.style['-o-transform'] = newValue;
                    element.style.transform = newValue;
                }
            }
        });
        
        function RGBColor(r, g, b, a) {
            this.r = r || 0;
            this.g = g || 0;
            this.b = b || 0;
            this.a = typeof a === "number" ? a : 1;
        }
        RGBColor.fromArray = function(array, result) {
            result || (result = new RGBColor());
            if (array.length < 3) {
                return result;
            }
            result.r = parseInt(array[0]);
            result.g = parseInt(array[1]);
            result.b = parseInt(array[2]);
            if (array.length > 3) {
                result.a = parseFloat(array[3]);
            }
            return result;
        };
        RGBColor.fromString = function(string, result) {
            if (string.match(/^#([0-9a-f]{3})$/i)) {
                return RGBColor.fromArray([
                    parseInt(string.charAt(1),16)*0x11,
                    parseInt(string.charAt(2),16)*0x11,
                    parseInt(string.charAt(3),16)*0x11
                ], result);
            }
            if (string.match(/^#([0-9a-f]{6})$/i)) {
                return RGBColor.fromArray([
                    parseInt(string.substr(1,2),16),
                    parseInt(string.substr(3,2),16),
                    parseInt(string.substr(5,2),16)
                ], result);
            }
            return RGBColor.fromArray(string.replace(/^rgb(a)?\((.*)\)$/, '$2').split(","), result);
        };
        RGBColor.fromHSV = function(hsv, result) {
            result || (result = new RGBColor());
            var r = hsv.v,
                g = hsv.v,
                b = hsv.v;
            if (hsv.s != 0) {
                var f  = hsv.h / 60 - Math.floor(hsv.h / 60);
                var p  = hsv.v * (1 - hsv.s / 100);
                var q  = hsv.v * (1 - hsv.s / 100 * f);
                var t  = hsv.v * (1 - hsv.s / 100 * (1 - f));
                switch (Math.floor(hsv.h / 60)){
                    case 0: r = hsv.v; g = t; b = p; break;
                    case 1: r = q; g = hsv.v; b = p; break;
                    case 2: r = p; g = hsv.v; b = t; break;
                    case 3: r = p; g = q; b = hsv.v; break;
                    case 4: r = t; g = p; b = hsv.v; break;
                    case 5: r = hsv.v; g = p; b = q; break;
                }
            }
            result.r = r * 2.55;
            result.g = g * 2.55;
            result.b = b * 2.55;
            result.a = hsv.a;
            return result;
        };
        RGBColor.prototype = {
            getHue: function(maximum, range) {
                var hue = 0;
                if (range != 0) {
                    switch (maximum){
                        case this.r:
                            hue = (this.g - this.b) / range * 60;
                            if (hue < 0) hue += 360;
                            break;
                        case this.g:
                            hue = (this.b - this.r) / range * 60 + 120;
                            break;
                        case this.b:
                            hue = (this.r - this.g) / range * 60 + 240;
                            break;
                    }
                }
                return hue;
        
            },
            interpolate: function(to, progress) {
                var src = HSVColor.fromRGB(this),
                    dst = HSVColor.fromRGB(to);
                src.interpolate(dst, progress);
                RGBColor.fromHSV(src, this);
            },
            toString: function() {
                if (this.a !== 1) {
                    return "rgba("+this.r.toFixed()+","+this.g.toFixed()+","+this.b.toFixed()+","+this.a.toFixed(2)+")";
                }
                return "rgb("+this.r.toFixed()+","+this.g.toFixed()+","+this.b.toFixed()+")";
            }
        };
        
        function HSVColor(h, s, v, a) {
            this.h = h || 0;
            this.s = s || 0;
            this.v = v || 0;
            this.a = typeof a === "number" ? a : 1;
        }
        HSVColor.fromRGB = function(rgb, result) {
            result || (result = new HSVColor());
            var maximum = Math.max(rgb.r, rgb.g, rgb.b);
            var range   = maximum - Math.min(rgb.r, rgb.g, rgb.b);
            result.h = rgb.getHue(maximum, range);
            result.s = (maximum == 0 ? 0 : 100 * range / maximum);
            result.v = maximum / 2.55;
            result.a = rgb.a;
            return result;
        };
        HSVColor.prototype = {
            interpolate: function(to, progress, precision) {
                this.h = interpolate(this.h, to.h, progress);
                this.s = interpolate(this.s, to.s, progress);
                this.v = interpolate(this.v, to.v, progress);
                this.a = interpolate(this.a, to.a, progress);
            },
            toString: function() {
                if (this.a !== 1) {
                    return "hsva("+this.h+","+this.s+","+this.v+","+this.a.toFixed(2)+")";
                }
                return "hsv("+this.h+","+this.s+","+this.v+")";
            }
        };
        
        function VO() {
            
        }
        VO.prototype = {
            get: function(propName) {
                return this[propName];
            },
            set: function(propName, value) {
                this[propName] = value;
                this._changed = true;
            },
            isChanged: function() {
                return this._changed === true;
            }
        };
        
        function XY() {
            this.x = this.y = 0;
            this.xUnit = this.yUnit = "px";
        }
        XY.fromArray = function(array, result) {
            result || (result = new XY());
            var a = array[0],
                b = array[1];
            if (typeof a === "string") {
                result.x = parseFloat(a);
                result.xUnit = parseUnit(a);
            }
            else {
                result.x = a;
            }
            if (typeof b === "string") {
                result.y = parseFloat(b);
                result.yUnit = parseUnit(b);
            }
            else {
                result.y = b;
            }
            return result;
        };
        XY.fromString = function(string, result) {
            return XY.fromArray(string.split(" "), result);
        };
        XY.prototype = inherit(VO.prototype, {
            toString: function() {
                return this.x.toFixed(2) + this.xUnit + " " + this.y.toFixed(2) + this.yUnit;
            }
        });
    
        function Transform() {
            this.translateX = this.translateY = this.translateZ = 0;
            this.scaleX = this.scaleY = 1;
            this.rotate = 0;
        }
        Transform.fromMatrix = function(matrix, result) {
            result || (result = new Transform());
            var a = matrix.matrix[0],
                b = matrix.matrix[1],
                c = matrix.matrix[4],
                d = matrix.matrix[5];
            result.translateX = matrix.matrix[12];
            result.translateY = matrix.matrix[13];
            result.translateZ = matrix.matrix[14];
            result.scaleX = Math.sqrt(a*a + b*b);
            result.scaleY = Math.sqrt(c*c + d*d);
            result.rotate = Math.round(Math.atan2(b, a) * (180/Math.PI));
            return result;
        };
        Transform.prototype = inherit(VO.prototype, {
            get: function(propName) {
                if (propName === "scale") {
                    return this.scaleX;
                }
                return this[propName];
            },
            set: function(propName, value) {
                if (propName === "scale") {
                    this.scaleX = value;
                    this.scaleY = value;
                }
                else {
                    this[propName] = value;
                }
                this._changed = true;
            },
            toString: function() {
                var string = 'translate3d('+this.translateX+'px, '+this.translateY+'px, '+this.translateZ+'px)';
                if (this.scaleX != 1 || this.scaleY != 1) {
                    string += ' scale('+this.scaleX+','+this.scaleY+')';
                }
                if (this.rotate) {
                    string += 'rotate('+this.rotate+'deg)';
                }
                return string;
            }
        });
    
        function TransformMatrix() {
            this.matrix = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        }
        TransformMatrix.fromArray = function(array, result) {
            result || (result = new TransformMatrix());
            if (array.length < 6) {
                return result;
            }
            for (var i=0; i<array.length; i++) {
                array[i] = parseFloat(array[i]);
            }
            if (array.length < 16) {
                array = [
                    array[0], array[1], 0, 0,
                    array[2], array[3], 0, 0,
                    0, 0, 1, 0,
                    array[4], array[5], 0, 1
                ];
            }
            result.matrix = array;
            return result;
        };
        TransformMatrix.fromStyle = function(style, result) {
            if (!style) {
                return result || new TransformMatrix();
            }
            var transform = style.transform || style.webkitTransform || style.mozTransform;
            return TransformMatrix.fromArray(transform.replace(/^matrix(3d)?\((.*)\)$/, '$2').split(/, /), result);
        };
    
        if (!isTouchDevice || $.parallax.enableTouchDevices) {
            $(function() {
    
                $("[data-parallax]").parallax();
    
            });
        }
    
    })(jQuery);
    
    // isArray shim
    if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }
    
    // console.error shim
    if (!console["error"]) {
        console.error = function(message) {
            window.alert(message);
        };
    }

    // scrollTopBtn
    $(document).ready(function() {
    
        $(window).scroll(function() {
            if($(this).scrollTop() > 40){
                $('.topBtn').fadeIn();
            } else {
                $('.topBtn').fadeOut();
            }
        });
    
        $('.topBtn').click(function() {
            $('html, body').animate({scrollTop: 0},500);
        });
    });

    let navToggle = $('#navToggle');   
    let nav = $('#nav');
    
    navToggle.on('click', function(event) {
        event.preventDefault();
    
        $("body").toggleClass('show-nav');
        $(this).toggleClass('active');
        nav.toggleClass('show');
    });
    
    $(window).on('resize', function () {
        $("body").removeClass('show-nav');
        navToggle.removeClass('active');
        nav.removeClass('show');
    });

});