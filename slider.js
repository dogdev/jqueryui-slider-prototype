(function( $ ) {

    $.widget("ui.slider", {
        version: "0.0.1",
        widgetEventPrefix: "slide",

        options: {
            animate: false,
            distance: 0,
            max: 100,
            min: 0,
            orientation: "horizontal",
            range: false,
            step: 1,
            value: 0,
            values: null,

            // callbacks
            change: null,
            slide: null,
            start: null,
            stop: null
        },
        
        _create: function () {
            this.element.text('slider');
        }
    });

}(jQuery));
