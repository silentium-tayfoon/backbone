/**
 *
 * */
Backbone.sync = function(method, model, options) {
    // works only on post!
    var type = 'POST'; //methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
        emulateHTTP: Backbone.emulateHTTP,
        emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
        params.url = _.result(model, 'url') || urlError();
    }

    var ajax_type_and_token = {'ajax_token':window.Global.ajax_token,'ajax_method': method};

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
        params.contentType = 'application/json';

        var final_params_data = options.attrs || model.toJSON(options);

        _.extend(final_params_data,ajax_type_and_token);

        params.data = JSON.stringify(final_params_data);
    }else{
        options.data = ajax_type_and_token;
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
        params.processData = false;
    }

    // Pass along `textStatus` and `errorThrown` from jQuery.
    var error = options.error;
    options.error = function(xhr, textStatus, errorThrown) {
        options.textStatus = textStatus;
        options.errorThrown = errorThrown;
        if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    console.log(params);
    model.trigger('request', model, xhr, options);
    return xhr;
};

// Backbone.Validation = function(){
//
//     var version = 0.1;
//
//     this.get_version = function () {
//         return version;
//     };
//
//
//     this.validate = function (link, attr) {
//         return {data:attr};
//     };
// };