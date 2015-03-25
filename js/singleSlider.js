$( function( $ ) {

$.widget("ui.singleslider", {
    version: "0.0.1",
    widgetEventPrefix: "singleslider",

    // initialization

    options: {
        min: 0,
        max: 100,
        step: 1,
        value: 0,

        // callbacks
        change: null
    },

    _sliderTrackOptions: function() {
        var options =  {
            max: this.options.max,
            min: this.options.min,
            step: this.options.step,
            handles: this._handles()
        };

        if ( typeof this._onSliderTrackInit === "function" ) {
            this._onSliderTrackInit( options );
        }

        return options;
    },

    _handles: function() {
        return {
            single: {
                value: this.options.value
            }
        };
    },

    _create: function() {
        this._initSliderTrack();
        this._setupEvents();
    },

    _initSliderTrack: function () {
        var _track = $( "<div />" ).appendTo( this.element);

        _track.slidertrack( this._sliderTrackOptions() );
        this._track = _track;
    },

    // events

    _setupEvents: function () {
        this._on( this._track, {
            "slidertrackhandlechange": "_handlechange"
        });
    },

    _handlechange: function( event, ui ) {
        this._trigger("change", event, { value: ui.value });
    }
});

} ( jQuery ) );