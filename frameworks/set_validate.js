(function() {

    /**
     * @param {array} to_validate - array of objects to validate;
     * [{key:'first_name',
     *   val:'value from dom',
     *   rules:{['not_empty', {name: 'min', value: 8}, {name: 'max', value: 100}]},
     *   dependencies: {key:'is_business', val: true/false}}]
     * */
    var Rules = function () {

        var this_validation = this;

        /**
         *
         * get object for validation & run validation for every key in object
         *
         * @to_validate {object} - simply {key:value}
         * */
        // this.execute = function (to_validate) {
        //
        //     var i;
        //     var j;
        //     var default_validate;
        //     var default_validate_result;
        //
        //     for (i = 0; i<to_validate.length; i++) {
        //         if(to_validate[i].hasOwnProperty('dependencies') && to_validate[i].dependencies.val === false){
        //             // do not validate
        //         }else{
        //             // select rules to use
        //
        //             this.value = to_validate[i].val;
        //
        //             if (to_validate[i].hasOwnProperty('rules')) {
        //                 // use incoming rules
        //                 for(j=0; j<to_validate[i].rules.length; j++){
        //
        //                     if(this.list.hasOwnProperty(to_validate[i].rules[j])){
        //
        //                         if(this.list[to_validate[i].rules[j]].execute() === false){
        //                             to_validate[i]['error'] = this.list[to_validate[i].rules[j]].message;
        //                             break;
        //                         }else{
        //                             to_validate[i]['error'] = false;
        //                         }
        //                     }else{
        //                         console.error('NO such rule to validate: '+to_validate[i].rules[j]);
        //                     }
        //                 }
        //             }else{
        //                 // find pre-defined rules (username, password)
        //
        //                 if(this.defaults.elements.hasOwnProperty(to_validate[i].key)){
        //
        //                     default_validate = this.defaults.elements[to_validate[i].key];
        //
        //                     for(j=0; j<default_validate.length; j++){
        //
        //                         if(typeof default_validate === 'string'){
        //                             // simple rule, just execute
        //                             default_validate_result = this.list[default_validate].execute();
        //                         }else{
        //                             // rule with data (min, max...)
        //                             default_validate_result = this.list[default_validate.name].execute(default_validate.value);
        //                         }
        //
        //                         if(default_validate_result === false){
        //                             to_validate[i]['error'] = this.list[default_validate.name].message;
        //                         }else{
        //                             to_validate[i]['error'] = false;
        //                         }
        //                     }
        //                 }else{
        //                     console.error('NO such default rule to validate: '+to_validate[i].key);
        //                 }
        //
        //             }
        //         }
        //     }
        //
        //     return to_validate;
        // };

        this.check_valid = function (to_validate) {


            console.log('RUN validation');


            var validate_summ = {};
            var key, validate_result, dependencies_key;


            for(key in to_validate){

                validate_result = null;
                dependencies_key = null;

                if(this_validation.defaults.elements.hasOwnProperty(key)){
                    // there is such predefined rule

                    if (this_validation.defaults.elements[key].dependencies !== false) {
                        // check dependence field

                        dependencies_key = this_validation.defaults.elements[key].dependencies;

                        if(to_validate.hasOwnProperty(dependencies_key.name)) {
                            // there is such dependence field

                            if (to_validate[dependencies_key.name] === dependencies_key.value) {
                                // check dependence field value

                                validate_result = this_validation.makeValidation(key,to_validate[key]);

                                if (validate_result) {
                                    validate_summ[key] = validate_result;
                                }
                            }
                        }else{
                            // there is no such field in object - where to find?
                            console.error('validation error - no dependencies field');
                        }
                    }else{
                        validate_result = this_validation.makeValidation(key,to_validate[key]);

                        if (validate_result) {
                            validate_summ[key] = validate_result;
                        }
                    }
                }
            }

            if(Object.keys(validate_summ).length > 0){
                return validate_summ;
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
            var rules = this_validation.defaults.elements[key].rules;
            var return_message = null;

            console.log(key+' : '+value);

            this.value = value;

            for (i = 0; i < rules.length; i++) {

                rule_name = rules[i];

                if(typeof rule_name === 'object'){
                    result = this_validation.list[rule_name.name].execute.call(this, rule_name.value);
                }else{
                    result = this_validation.list[rule_name].execute.call(this);
                }

                if (!result) {

                    if(this_validation.list[rule_name]){
                        return_message = this_validation.list[rule_name].message;
                    }else{
                        return_message = this_validation.list[rule_name.name].message(rule_name.value);
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
        username: {rules: ['not_empty', {name: 'min', value: 8}, {name: 'max', value: 100}], dependencies: false},
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