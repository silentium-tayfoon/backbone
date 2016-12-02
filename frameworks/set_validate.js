(function() {


    var showVisualErrors = function (validation_input_dom, validation_title_dom, validation_error_dom, error_text) {
        // 1) red border for input
        validation_input_dom.classList.add(Global.predefine_values.class.ERROR_HIGHLIGHT_CLASS);

        // 2) red color for title
        validation_title_dom.classList.add(Global.predefine_values.class.ERROR_LABEL_CLASS);

        // 3) put text and remove hidden class
        validation_error_dom.innerHTML = error_text;
        validation_error_dom.classList.remove(Global.predefine_values.class.HIDDEN);
    };

    var hideVisualErrors = function (validation_input_dom, validation_title_dom, validation_error_dom) {
        // 1) remove red border for input
        validation_input_dom.classList.remove(Global.predefine_values.class.ERROR_HIGHLIGHT_CLASS);

        // 2) remove red color for title
        validation_title_dom.classList.remove(Global.predefine_values.class.ERROR_LABEL_CLASS);

        // 3) add hidden class
        //validation_error_dom.innerHTML = ''; // do not need to clear it - because no one can see it
        validation_error_dom.classList.add(Global.predefine_values.class.HIDDEN);
    };

    var visualErrors = function (error, target_dom, show) {

        var validation_element_dom,
            validation_input_dom,
            validation_title_dom,
            validation_error_dom;

        var field_has_error_class;

            if(target_dom.name && target_dom.name === error.key){
                // target_dom - we have dom of input field
                validation_input_dom = target_dom;
            }else{
                // target_dom - we have dom of form
                validation_input_dom = target_dom.querySelector('[name=' + error.key + ']');
            }

            field_has_error_class = validation_input_dom.classList.contains(Global.predefine_values.class.ERROR_HIGHLIGHT_CLASS);

            if(validation_input_dom){
                // there is such element, find all other elements

                validation_element_dom = Global.helpers.findParent(validation_input_dom, 'validation_element');

                if(validation_element_dom){
                    // there is container for all other fields

                    validation_title_dom = validation_element_dom.querySelector('.validation_title');
                    validation_error_dom = validation_element_dom.querySelector('.validation_error');

                    if (validation_title_dom && validation_error_dom) {
                        // there is all needed elements, to show/hide error

                        if(show){
                            showVisualErrors(validation_input_dom, validation_title_dom, validation_error_dom, error.value);
                        } else {
                            // show === false => need to hide visual error
                            // field_has_error_class === true => the field is not clear
                            // ==> there need to remove error classes
                            if (field_has_error_class === true) {
                                hideVisualErrors(validation_input_dom, validation_title_dom, validation_error_dom);
                            }
                        }
                    } else {

                        console.error('validation error - can\'t find dom some of element: validation_title_dom or validation_error_dom');
                    }

                } else {

                    console.error('validation error - can\'t find dom parent of element: '+ error.key);
                }
            } else {

                console.error('validation error - no such element in dom: '+ error.key);
            }

    };


    /**
     * @param {object} all_fields - backbone return all model
     * @param {object} options - different parameters to validate one field ar all
     * @param {object} options.target_dom - dom link - can be link to 'field' or to 'form'
     * @param {object} options.field - field name
     * @param {object} options - different parameters to validate one field ar all
     * */
    var Rules = function () {

        //var this = this;

        this.check_valid = function (all_fields, options) {

            console.log('RUN validation');

            var validate_sum = {};
            var key, validate_result, dependencies_key;
            var target_dom = options.target_dom;

            // if we pass options.field = {first_name:'some name'} => so need to check only one field,
            // else check all that bunch of fields
            // but still need all_fields for situation with dependencies!
            var to_validate = (options.field) ? options.field : all_fields;

            for(key in to_validate){

                validate_result = null;
                dependencies_key = null;

                if(this.defaults.elements.hasOwnProperty(key)){
                    // there is such predefined rule

                    var error = {
                        key: key,
                        value: ''
                    };
                    visualErrors(error,target_dom,false);

                    if (this.defaults.elements[key].dependencies !== false) {
                        // check dependence field

                        dependencies_key = this.defaults.elements[key].dependencies;

                        if(all_fields.hasOwnProperty(dependencies_key.name)) {
                            // there is such dependence field

                            if (all_fields[dependencies_key.name] === dependencies_key.value) {
                                // check dependence field value

                                // validate_result - string with error description
                                validate_result = this.makeValidation(key,to_validate[key]);

                                if (validate_result) {
                                    // store error to the validate_sum object
                                    validate_sum[key] = validate_result;

                                    // show error to user
                                    error.value = validate_result;
                                    visualErrors(error,target_dom,true);
                                }
                            }
                        }else{
                            // there is no such field in object - where to find?
                            console.error('validation error - no dependencies field');
                        }
                    }else{

                        // validate_result - string with error description
                        validate_result = this.makeValidation(key,to_validate[key]);

                        if (validate_result) {
                            // store error to the validate_sum object
                            validate_sum[key] = validate_result;

                            // show error to user
                            error['value'] = validate_result;
                            visualErrors(error,target_dom,true);
                        }
                    }
                }
            }




            if(Object.keys(validate_sum).length > 0){
                console.log('VALIDATION RESULT !!! ');
                console.log(validate_sum);
                return validate_sum;
            }
        };

        /***
         *
         * run for key a list of rules
         *
         * @return {string} - error result
         * */
        this.makeValidation = function (key, value) {

            var i;
            var rule_name;
            var result;
            var rules = this.defaults.elements[key].rules;
            var return_message = null;

            console.log(key+' : '+value);

            this.value = value;

            for (i = 0; i < rules.length; i++) {

                rule_name = rules[i];

                if(typeof rule_name === 'object'){
                    result = this.list[rule_name.name].execute.call(this, rule_name.value);
                }else{
                    result = this.list[rule_name].execute.call(this);
                }

                if (!result) {

                    if(this.list[rule_name]){
                        return_message = this.list[rule_name].message;
                    }else{
                        return_message = this.list[rule_name.name].message(rule_name.value);
                    }

                    return return_message;
                }
            }
        };

    };

    Rules.prototype.list = {
        not_empty: {
            execute: function() {
                var is_only_spaces = /^[\s\n]+$/.test(this.value);
                //var is_select_null_value = this.tagName.toLowerCase() === 'select' ? this.value.toLowerCase() === 'null' : false;
                //!is_select_null_value &&
                return  !is_only_spaces && this.value.length !== 0;
            },
            message: 'Can\'t be empty.'
        },
        min: {
            execute: function(value) {
                return this.value.length >= value;
            },
            message: function(value) {
                return 'Must be at least ' + value + ' characters.';
            }
        },
        max: {
            execute: function(value) {
                return this.value.length <= value;
            },
            message: function(value) {
                return 'Must be at most ' + value + ' characters.';
            }
        },
        has_no_quotes: {
            execute: function() {
                var result = false;
                if(this.value.search('"') === -1 && this.value.search("'") === -1){
                    result = true;
                }
                return result;
            },
            message: function() {
                return 'Quotes not allowed.';
            }
        },
        regex: {
            execute: function(value) {
                return value.test(this.value);
            },
            message: 'Not valid.'
        },
        is_number: {
            execute: function() {
                var expression = /^[\d\s]+$/;
                return expression.test(this.value);
            },
            message: 'Value is invalid.'
        },
        decimal_number: {
            execute: function() {
                var expression = /^[\d.]+$/;
                return expression.test(this.value);
            },
            message: 'Value is invalid.'
        },
        is_domain: {
            execute: function() {
                var expression = /^[a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]((?:\.([a-zA-Z]|[a-zA-Z0-9]){2,})+|)$/;
                return expression.test(this.value);
            },
            message: 'Domain name is invalid.'
        },
        domain_with_tld: {
            execute: function() {
                var expression = /^[a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]((?:\.[a-zA-Z]{2,})+)$/;
                return expression.test(this.value);
            },
            message: 'Domain name is invalid.'
        },
        is_bulk_domains: {
            execute: function() {
                var expression = /^\s*([0-9a-zA-Z- ]+(?:\.[ 0-9a-zA-Z-]+)+\s*([\s]+[0-9a-zA-Z- ]+(?:\.[0-9a-zA-Z- ]+)+)*)$/i;
                return expression.test(this.value.trim());
            },
            message: 'Please check your domains.'
        },
        is_bulk_fax: {
            execute: function() {
                var expression = /^[\d\n\s+]+$/;
                return expression.test(this.value);
            },
            message: 'Please check your fax numbers.'
        },
        is_url: {
            execute: function() {
                var expression = /^((http[s]?|ftp):\/\/)?([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9])(?:\..*[^\!\@\#\$\%\^\*\(\)\+\|\~\`\"\'\;])+$/;
                return expression.test(this.value);
            },
            message: 'Url is not valid.'
        },
        abc_123_space: {
            execute: function() {
                var expression = /^[0-9a-zA-Z ]+$/;
                return expression.test(this.value);
            },
            message: function() {
                return 'Character not allowed.';
            }
        },
        is_phone: {
            execute: function() {
                var expression = /^\+?[0-9\s]+$/;
                return expression.test(this.value);
            },
            message: 'Phone number is not valid.'
        },
        is_email: {
            execute: function() {
                var expression = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                return expression.test(this.value);
            },
            message: 'Email is not valid.'
        },
        credit_card_number: {
            execute: function() {
                var value = this.value.replace(/\-/g, '');
                var expression = /^(3[4,7][0-9]{13}|5[1-5][0-9]{14}|4[0-9]{12}|4[0-9]{15}|4[0-9]{18}|(5018|5020|5038|6304|6759|6761|6762|6763)[0-9]{8,12}|(5018|5020|5038|6304|6759|6761|6762|6763)[0-9]{14,15})$/;
                return expression.test(value);
            },
            message: 'Card number is not valid.'
        },
        file: {
            execute: function() {
                return this.files && !!this.files.length;
            },
            message: 'Select file to upload.'
        },
        ip_address: {
            execute: function() {
                var ip4 = /^(([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)\.){3}([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)$/mg;
                var ip6 = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/mg;
                var i;
                var values = this.value.split(',');
                var pass = true;

                for(i=0; i<values.length; i++){

                    if (ip4.test(values[i])) {
                        pass = true;
                    } else if (ip6.test(values[i])) {
                        pass = true;
                    } else {
                        return false;
                    }

                    return pass;
                }
            },
            message: 'IP address is not valid.'
        },
        hex_color: {
            execute: function() {
                var expression = /^[#]?[0-9a-f]{6}$/i;
                return expression.test(this.value);
            },
            message: 'Not color (example: #ffffff).'
        },
        is_equal_element: {
            execute: function(value) {
                var element = this.form.querySelector('[name="'+ value + '"]');
                return element && element.value ? this.value == element.value : true;
            },
            message: 'Different values.'
        },
        in_list: {
            execute: function(value) {
                return !!~value.indexOf(this.value);
            },
            message: 'Value is not valid.'
        },
        not_in_list: {
            execute: function(value) {
                return !~value.indexOf(this.value);
            },
            message: 'Value is not valid.'
        },
        not_duplicated: {
            execute: function(value, params) {
                var is_duplicated;

                var $elements_by_name = $(params.form).find('[name="' + this.name +'"]');
                var self_index = $elements_by_name.index(this);

                for (var i = 0, l = self_index; i < l; i++) {
                    is_duplicated = this.value.toLowerCase() === $elements_by_name[i].value.toLowerCase();

                    if (is_duplicated) {
                        return false;
                    }
                }

                return true;
            },
            message: 'Duplicated values.'
        },
        is_existing_member: {
            execute: function() {
                if (typeof window.Global.validation.existingMemberCheckIfFound === 'undefined') {
                    return true;
                }

                return window.Global.validation.existingMemberCheckIfFound(this);
            },
            message: 'Customer not found.'
        }
    };

    Rules.prototype.defaults = {};

    Rules.prototype.defaults.elements = {
        //username: {rules: ['not_empty', {name: 'min', value: 8}, {name: 'max', value: 100}], dependencies: false},
        first_name: {rules: ['not_empty', {name: 'min', value: 8}, {name: 'max', value: 100}], dependencies: false},
        password: {rules: ['not_empty', {name: 'min', value: 6}, {name: 'max', value: 100}], dependencies: false},
        // domain: ['not_empty', {name: 'min', value: 3}, {name: 'max', value: 255} , 'is_domain'],
        // bulk_domains: ['not_empty', 'is_bulk_domains'],
        //
        // // profile info
        // first_name: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 255}, 'has_no_quotes'],
        // last_name: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 255}, 'has_no_quotes'],
        // address: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 255}],
        // city: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 255}],
        // country: ['not_empty'],
        // state: ['not_empty', {name: 'max', value: 255}],
        // post_code: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 15}, 'abc_123_space'],
        // phone: ['not_empty', 'is_phone'],
        // email: ['not_empty', 'is_email'],
        //
        business_name: {
            rules: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 255}],
            dependencies: {name: 'acc_type', value: 'business'}
        }
        // business_name_id_au: 'business_name_id_au',
        // business_number: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 255}],
        //
        // username_login: ['not_empty', 'is_existing_member'],
        //
        // new_password: 'password',
        // old_password: 'password',
        //
        // card_number: ['not_empty', {name: 'min', value: 14}, {name: 'max', value: 23}, 'credit_card_number'],
        // card_exp_month: ['not_empty', 'is_number'],
        // card_exp_year: ['not_empty', 'is_number'],
        // card_cvv: ['not_empty', {name: 'max', value: 4}, 'is_number']
    };


    // init
    var validation_object = new Rules();

    if (typeof define === 'function' && define.amd) {
        define('Validate', [], function() {
            return validation_object;
        });
    }
})();