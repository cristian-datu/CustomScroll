/*! Copyright (c) 2012 Datu Cristian (https://github.com/cristian-datu)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://brandonaaron.net for mouse component
 *
 * Version: 1
 *
 * Requires: 1.2.2+
 */
(function($) {
    $.CustomScroll = function(el, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        // Add a reverse reference to the DOM object
        base.$el.data('CustomScroll', base);
        // Options
        base.options = {};
        // Initialization Function
        base.init = function() {
            base.options = $.extend({}, $.CustomScroll.defaultOptions, options);
            base.options['scroll-x'] = Boolean(base.options['scroll-x']);
            base.options['scroll-y'] = Boolean(base.options['scroll-y']);
            base.options['mousewheel'] = Boolean(base.options['mousewheel']);
        };
        // Run initializer
        base.init();
    };

    $.CustomScroll.defaultOptions = {
        'scroll-x'   : true,
        'scroll-y'   : true,
        'mousewheel' : true
    };

    $.fn.CustomScroll = function(options) {
        return this.each(function() {
            var
                plugin = new $.CustomScroll(this, options),
                $this     = $(this),
                $Viewport = null,
                $Scroll   = null,
                // X axis controls
                $ScrollX = null,
                $CtrlX   = null,
                ratioX   = 1,
                minX     = 0,
                maxX     = 0,
                // Y axis controls
                $ScrollY = null,
                $CtrlY   = null,
                ratioY   = 1,
                minY     = 0,
                maxY     = 0;

/* Viewport
------------------------------------------------------------------------------*/
            $this.createViewport = function() {
                if(!$this.$Viewport || !$this.$Scroll) {
                    $this.$Scroll = $('<div></div>')
                        .css({
                            position : 'absolute',
                            top      : 0,
                            left     : 0,
                            margin   : 0,
                            padding  : 0,
                            overflow : 'hidden',
                            width    : $(this).outerWidth(),
                            height   : $(this).outerHeight()
                        })
                        .addClass('scroll-canvas');

                    $this.$Viewport = $('<div></div>')
                        .css({
                            padding  : 0,
                            overflow : 'hidden',
                            position : 'relative'
                        })
                        .addClass('viewport')
                        .append($this.$Scroll);
                    if(plugin.options['mousewheel']) {
                        $this.$Viewport.mousewheel(function(event, delta, deltaX, deltaY) {
                            var x = 0, y =0, speed = 10;

                            if($this.$CtrlX) {
                                x = $this.$Scroll.position().left;
                                if(deltaX > 0) { // Scroll Right
                                    x += $this.$Scroll.width() / speed;
                                } else if(deltaX < 0) { // Scroll Left
                                    x -= $this.$Scroll.width() / speed;
                                }
                                if(x < $this.minX) {
                                    x = $this.minX;
                                } else if(x > $this.maxX) {
                                    x = $this.maxX;
                                }
                                $this.$Scroll.css({left:x});
                            }

                            if($this.$CtrlY) {
                                y = $this.$Scroll.position().top;
                                if(deltaY > 0) { // Scroll Up
                                    y += $this.$Scroll.height() / speed;
                                } else if(deltaY < 0) { // Scroll Down
                                    y -= $this.$Scroll.height() / speed;
                                }
                                if(y < $this.minY) {
                                    y = $this.minY;
                                } else if(y > $this.maxY) {
                                    y = $this.maxY;
                                }
                                $this.$Scroll.css({top:y});
                            }
                            $this.updateControlsPosition();
                            event.preventDefault();
                        });
                    }
                }
                return $this.$Viewport;
            }

/* Scroll X
------------------------------------------------------------------------------*/
            $this.createScrollX = function() {
                $this.$CtrlX = $('<a></a>')
                    .attr('href', '#')
                    .click(function(event){event.preventDefault();})
                    .css({
                        cursor   : 'pointer',
                        margin   : 0,
                        padding  : 0,
                        overflow : 'hidden',
                        position : 'absolute' ,
                        top      : 0,
                        bottom   : 0,
                        left     : 0,
                        width    : 30
                    })
                    .addClass('ctrl')
                    .addClass('ctrl-x')
                    .html('&nbsp;')
                    .draggable({
                        axis        : 'x',
                        containment : 'parent',
                        drag        : function(event, ui) { $this.scrollToX(ui.position.left); }
                    });
                $this.$ScrollX = $('<div></div>')
                    .css({
                        margin   : 0,
                        padding  : 0,
                        position : 'absolute',
                        bottom   : 0,
                        left     : 0,
                        right    : 0,
                        height   : 10
                    })
                    .addClass('scroll')
                    .addClass('scroll-x')
                    .append($this.$CtrlX);

                $this.createViewport().append($this.$ScrollX);
                // Setup positioning
                $this.updateScroll();
                // Update parameters in case of window resize
                $(window).resize(function(){ $this.updateScroll(); });
            }

/* Scroll Y
------------------------------------------------------------------------------*/
            $this.createScrollY = function() {
                $this.$CtrlY = $('<a></a>')
                    .attr('href', '#')
                    .click(function(event){event.preventDefault();})
                    .css({
                        cursor   : 'pointer',
                        margin   : 0,
                        padding  : 0,
                        overflow : 'hidden',
                        position : 'absolute' ,
                        top      : 0,
                        left     : 0,
                        right    : 0,
                        height   : 30
                    })
                    .addClass('ctrl')
                    .addClass('ctrl-y')
                    .html('&nbsp;')
                    .draggable({
                        axis        : 'y',
                        containment : 'parent',
                        drag        : function(event, ui) { $this.scrollToY(ui.position.top); }
                    });
                $this.$ScrollY = $('<div></div>')
                    .css({
                        margin   : 0,
                        padding  : 0,
                        position : 'absolute',
                        top      : 0,
                        bottom   : 0,
                        right    : 0,
                        width    : 10
                    })
                    .addClass('scroll')
                    .addClass('scroll-y')
                    .append($this.$CtrlY);
                if($this.$ScrollX) {
                    $this.$ScrollX.css({'right':$this.$ScrollY.width()});
                    $this.updateScroll();
                }

                $this.createViewport().append($this.$ScrollY);
                // Setup positioning
                $this.updateScroll();
            }

/* Positioning
------------------------------------------------------------------------------*/
            $this.updateScroll = function() {
                var
                    viewportWidth  = $this.$Viewport.innerWidth(),
                    viewportHeight = $this.$Viewport.innerHeight(),
                    scrollWidth    = $this.$Scroll.outerWidth(),
                    scrollHeight   = $this.$Scroll.outerHeight(),
                    scrollXWidth   = 0,
                    ctrlXWidth     = 0,
                    scrollYHeight  = 0,
                    ctrlYHeight    = 0;

                $this.maxX = 0;
                $this.minX = 0;
                if(scrollWidth > viewportWidth) {
                    $this.minX = viewportWidth - scrollWidth;
                }

                $this.maxY = 0;
                $this.minY = 0;
                if(scrollHeight > viewportHeight) {
                    $this.minY = viewportHeight - scrollHeight;
                }

                if($this.$ScrollX) {
                    if($this.minX < $this.maxX) {
                        $this.$ScrollX.css({display:'block'});
                        scrollXWidth = $this.$ScrollX.innerWidth();
                        ctrlXWidth = $this.$CtrlX.outerWidth();
                        $this.minY = $this.minY - $this.$ScrollX.outerHeight();
                    } else {
                        $this.$ScrollX.css({display:'none'});
                    }

                }
                if($this.$ScrollY) {
                    if($this.minY < $this.maxY) {
                        $this.$ScrollY.css({display:'block'});
                        scrollYHeight = $this.$ScrollY.innerHeight();
                        ctrlYHeight = $this.$CtrlY.outerHeight();
                        $this.minX = $this.minX - $this.$ScrollY.outerWidth();
                    } else {
                        $this.$ScrollY.css({display:'none'});
                    }
                }

                $this.ratioX = (scrollWidth - viewportWidth) / (scrollXWidth - ctrlXWidth);
                $this.ratioY = (scrollHeight - viewportHeight) / (scrollYHeight - ctrlYHeight);

                if($this.$Scroll.position().left > $this.maxX) {
                    $this.$Scroll.css({'left':$this.maxX});
                } else if($this.$Scroll.position().left < $this.minX) {
                    $this.$Scroll.css({'left':$this.minX});
                }

                if($this.$Scroll.position().top > $this.maxY) {
                    $this.$Scroll.css({'top':$this.maxY});
                } else if($this.$Scroll.position().top < $this.minY) {
                    $this.$Scroll.css({'top':$this.minY});
                }
            }

            $this.updateControlsPosition = function () {
                $this.updateScroll();
                if($this.$CtrlX) {
                    $this.$CtrlX.css({'left': Math.round(0 - ($this.$Scroll.position().left / $this.ratioX))});
                }
                if($this.$CtrlY) {
                    $this.$CtrlY.css({'top': Math.round(0 - ($this.$Scroll.position().top / $this.ratioY))});
                }
            }

            $this.scrollToX = function(left) {
                var x = -1 * left * $this.ratioX;
                if(x<$this.minX) { x = $this.minX; }
                if(x>$this.maxX) { x = $this.maxX; }
                $this.$Scroll.css({left: Math.ceil(x)});
            }

            $this.scrollToY = function(top) {
                var y = -1 * top * $this.ratioY;
                if(y<$this.minY) { y = $this.minY; }
                if(y>$this.maxY) { y = $this.maxY; }
                $this.$Scroll.css({top: Math.ceil(y)});
            }

/* Create and display viewport
------------------------------------------------------------------------------*/
            if(plugin.options['scroll-x'] || plugin.options['scroll-y']) {
                // Create Viewport
                $this.replaceWith($this.createViewport());
                $this.$Scroll.append(this);
                // Add Scroll X
                if(plugin.options['scroll-x']) {
                    $this.createScrollX();
                }
                // Add Scroll Y
                if(plugin.options['scroll-y']) {
                    $this.createScrollY();
                }
                // Update Positioning
                $this.updateScroll();
                // Update positioning in case of window resize
                $(window).resize(function(){
                    $this.updateControlsPosition();
                });
            }
        });
    };
})(jQuery);