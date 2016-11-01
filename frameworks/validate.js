(function() {
    function Validation(options) {
        options = options || {};

        var self = this;

        this.view = new View(options.view);
        this.rules = new Rules();

        this.forms = {};

        this.options = $.extend(true, {}, options);

        this.add = function(params) {
            var validation_data = {};

            if (typeof params === 'object') {
                validation_data = params;
            } else if (arguments.length === 1) {
                validation_data.form = arguments[0];
            } else if (arguments.length > 1) {
                validation_data = {
                    form: arguments[0],
                    elements: arguments[1],
                    toggles: arguments[2]
                }
            }

            self.forms[validation_data.form] = validation_data.elements || validation_data.form;
            return this;
        };

        $(document)
            .on('submit', 'form', executeBySubmitEvent)
            .on('change', 'input, select, textarea', executeByChangeEvent)
            .on('validationFail validationSuccess', 'input, select, textarea', viewSetByEvent);

        function viewSetByEvent(event, data) {
            data = data || {};
            data.status = event.type !== 'validationFail';
            data.target = event.target;

            self.view.set(data);
        }

        function executeByChangeEvent(event) {
            var form_element = getFormElement({
                target: event.target
            });

            var is_validable = isElementValidable({
                form: form_element,
                target: event.target
            });

            if (!is_validable) {
                $(event.target).trigger('validationSuccess');

                return;
            }

            self.executeItems({
                form: form_element,
                items: [event.target]
            });
        }

        function executeBySubmitEvent(submit_event) {
            var result_data;
            var is_form_validable = isFormValidable(submit_event.target);

            if (!is_form_validable) {
                return;
            }

            result_data = self.executeItems({
                form: submit_event.target,
                items: self.forms[submit_event.target.id]
            });

            result_data.submit_event = submit_event;

            if (result_data.status) {
                $(submit_event.target).trigger('formValidationSuccess', result_data);
            } else {
                submit_event.preventDefault();
                $(submit_event.target).trigger('formValidationFail', result_data);
            }
        }

        function isFormValidable(form) {
            return form.id && self.forms[form.id];
        }

        function isElementValidable(item) {
            if (!item.target) {
                return false;
            }

            var is_form_exist = item.form;
            var is_not_disabled = !item.target.disabled;

            return is_form_exist && is_not_disabled;
        }

        this.execute = function(params) {
            var execute_params = {};

            if (typeof params === 'object') {
                execute_params = params;
            } else if (arguments.length === 1) {
                execute_params.form = arguments[0];
            } else if (arguments.length > 1) {
                execute_params = {
                    form: arguments[0],
                    items: arguments[1],
                    toggles: arguments[2]
                }
            }

            return self.executeItems(execute_params).status;
        };

        this.executeItems = function(params) {
            params.items = params.items || [];

            var result = {
                status: true,
                items: {
                    success: [],
                    fail: []
                }
            };

            var form_element = getFormElement(params);

            iterateItems(params.items);

            /**
             * @params {Array} items
             * @params {Array} rules - for NodeList common rules
             */
            function iterateItems(items, rules) {
                for (var i = 0, l = items.length; i < l; i++) {
                    var item_params = {};
                    var item_result;

                    item_params.target = getItemElement({
                        target: items[i],
                        form: form_element
                    });

                    item_params.form = form_element;

                    if (item_params.target instanceof NodeList) {
                        iterateItems(item_params.target, items[i].rules);
                        continue;
                    }

                    var is_target_validable = isElementValidable(item_params);

                    if (!is_target_validable) {
                        continue;
                    }

                    item_params.dependencies = items[i].dependencies;
                    item_params.rules = rules || items[i].rules || getItemRules(item_params);

                    item_result = self.rules.execute(item_params);

                    if (item_result.status) {
                        /** Success */
                        result.items.success.push(item_result);
                        $(item_params.target).trigger('validationSuccess', item_result);
                    } else {
                        /** Fail */
                        result.items.fail.push(item_result);
                        $(item_params.target).trigger('validationFail', item_result);

                        result.status = false;
                    }
                }
            }

            return result;
        };

        function getItemElement(params) {
            var parent = params.form instanceof HTMLElement ? params.form : document;
            var elements = [];

            if (params.target instanceof HTMLElement) {
                return params.target;
            } else if (typeof params.target === 'string') {
                // get from DOM by name.
                elements = parent.querySelectorAll('[name="' + params.target + '"]');

                elements = elements.length > 0 ? elements :
                    parent.querySelectorAll('[data-validation-field="' + params.target + '"]');
            }

            if (typeof params.target === 'object' && typeof params.target.element === 'string') {
                elements = parent.querySelectorAll('[name="' + params.target.element + '"]');

                elements = elements.length > 0 ? elements :
                    parent.querySelectorAll('[data-validation-field="' + params.target.element + '"]');
            }

            return elements.length > 1 ? elements : elements[0];
        }

        /**
         * Get form element by form id or target element.
         * @param {string} [params.form]
         * @param {string} [params.target]
         */
        function getFormElement(params) {
            if (params.form instanceof HTMLElement) {
                return params.form;
            } else if (typeof params.form === 'string') {
                return document.getElementById(params.form);
            }

            if (!params.target) {
                console.warn('getFormElement', 'cant get form');
                return null;
            }

            var item_element = getItemElement(params);
            var form_element = $(item_element).closest('form');

            return form_element.length ? form_element[0] : null;
        }

        function getItemRules(params) {
            var parent_id = params.form.dataset.validationId || params.form.id;
            var validation_name = params.target.dataset.validationField;

            if (params.rules) {
                return params.rules;
            }

            if (!params.target.name || !parent_id || !self.forms[parent_id] || !self.forms[parent_id][validation_name]) {
                return null;
            }

            var rules = self.forms[params.form.id];

            for (var i = 0, l = rules.length; i < l; i++) {
                if (rules[i] === params.target.name) {
                    return rules[i].rules;
                } else if (rules[i].element === params.target.name) {
                    return rules[i].rules;
                }
            }

            return null;
        }
    }

    /**
     * Rules for check elements
     * @constructor
     */
    function Rules() {
        var self = this;

        this.execute = function(params) {
            var result_item;

            var result = {
                target: params.target,
                status: true,
                data: null
            };

            params.rules = params.rules || self.defaults.elements[params.rules] || self.defaults.elements[params.target.name] || [];
            params.rules = typeof params.rules === 'string' ? self.defaults.elements[params.rules] : params.rules;

            var is_dependencies = checkDependencies(params);

            if (!is_dependencies) {
                return result;
            }

            var is_empty_allowed = params.rules instanceof Array && params.rules[0] !== 'not_empty' &&
                typeof params.target.value !== 'undefined' && params.target.value.length === 0;

            if (is_empty_allowed) {
                return result;
            }

            for (var i = 0, l = params.rules.length; i < l; i++) {
                result_item = self.executeItem({
                    element: params.target,
                    rule: params.rules[i],
                    form: params.form
                });

                if (result_item !== true) {
                    result.status = false;
                    result.data = result_item;
                    break;
                }
            }

            return result;
        };

        this.executeItem = function(params) {
            var rule_name = typeof params.rule === 'string' ? params.rule :
                typeof params.rule === 'object' ? params.rule.name : null;

            var status;
            var message;
            var custom_result;

            if (typeof params.rule !== 'function') {
                status = this.list[rule_name].execute.call(params.element, params.rule.value, params);
                message = getMessage(params);
            } else if (typeof params.rule === 'function') {
                custom_result = params.rule.call(params.element);

                if (typeof custom_result === 'boolean') {
                    status = custom_result;
                    message = getMessage(null);

                    console.error('Custom validation function without message');
                } else if (typeof custom_result === 'object') {
                    status = custom_result.status;
                    message = custom_result.message || getMessage(null);
                }
            }

            return status ? status : {
                rule_name: rule_name,
                message: message
            }
        };

        function checkDependencies(params) {
            if (!params.dependencies) {
                return true;
            }

            if (typeof params.dependencies === 'object') {
                return checkDependenciesItem(params.dependencies);
            } else {
                for (var i = 0, l = params.dependencies.length; i < l; i++) {
                    if (!checkDependenciesItem(params.dependencies[i])) {
                        return false;
                    }
                }
            }
        }

        function checkDependenciesItem(params) {
            var element = document.querySelectorAll('[name="' + params.element + '"]');

            if (element[0] && element[0].type === 'radio') {
                element = document.querySelector('[name="' + params.element + '"]:checked');
            } else {
                element = element[0];
            }

            return element && !element.disabled ? element.value == params.value : false;
        }

        function getMessage(params) {
            var default_message = 'Not valid value';
            var rule_name = typeof params.rule === 'string' ? params.rule :
                typeof params.rule === 'object' ? params.rule.name : null;

            if (params.rule && params.rule.message) {
                return params.rule.message;
            } else if (typeof self.list[rule_name].message === 'string') {
                return self.list[rule_name].message;
            } else if (typeof self.list[rule_name].message === 'function') {
                return self.list[rule_name].message.call(params.element, params.rule.value);
            } else {
                return default_message;
            }
        }
    }

    function View(options) {
        options = options || {};

        var self = this;

        var defaults = {
            target_fail_class: 'form_validation_error',
            target_label_class: 'label_validation_error',
            message_class: 'validation_error',
            message_tag: 'span',
            message_prevent_attr: 'messageless',
            toggles: ['class', 'label', 'message']
        };

        this.options = $.extend(true, {}, defaults, options);

        /**
         * @param {Object} params
         * @param {HTMLElement} params.form
         * @param {HTMLElement} params.target
         * @param {Boolean} params.status
         * @param {Array} [params.toggles]
         */
        this.set = function(params) {
            params.form = params.form || document;
            var toggles = params.toggles || self.options.toggles;

            // Iterate toggles and execute.
            for (var i = 0, l = toggles.length; i < l; i++) {
                if (typeof toggles[i] === 'string' && self.toggles_list[toggles[i]]) {

                    // Execute action from built-in toggles by name.
                    self.toggles_list[toggles[i]][params.status ? 'success' : 'fail'].call(self, params);
                }
            }
        };
    }

    View.prototype.toggles_list = {
        class: {
            success: function(params) {
                params.target.classList.remove(this.options.target_fail_class);
            },
            fail: function(params) {
                params.target.classList.add(this.options.target_fail_class);
            }
        },
        label: {
            getElements: function(params) {
                var search_labels_elements;
                var labels_elements = [];
                var labels_list;

                var is_multiple = /\[]$/.test(params.target.name);
                var target_index = is_multiple ? $('[name="' + params.target.name + '"]').index(params.target) : null;

                search_labels_elements = params.form.querySelectorAll('[data-label*="' + params.target.name + '"]');

                if (target_index !== null && search_labels_elements[target_index]) {
                    return [search_labels_elements[target_index]];
                }

                for (var i = 0, l = search_labels_elements.length; i < l; i++) {
                    if (!search_labels_elements[i].dataset.label) {
                        continue;
                    }

                    labels_list = search_labels_elements[i].dataset.label.split(' ');

                    if (labels_list.indexOf(params.target.name) >= 0) {
                        labels_elements.push(search_labels_elements[i]);
                    }
                }

                return labels_elements;
            },
            fail: function(params) {
                var labels_elements = this.toggles_list.label.getElements(params);

                for (var i = 0, l = labels_elements.length; i < l; i++) {
                    labels_elements[i].classList.add(this.options.target_label_class);
                    labels_elements[i].dataset.labelFailedTarget = params.target.name;
                }
            },
            success: function(params) {
                var labels_elements = this.toggles_list.label.getElements.call(this, params);

                for (var i = 0, l = labels_elements.length; i < l; i++) {
                    if (labels_elements[i].dataset.labelFailedTarget === params.target.name) {
                        labels_elements[i].classList.remove(this.options.target_label_class);
                    }
                }
            }
        },
        message: {
            createElement: function(target) {
                var message_element = document.createElement(this.options.message_tag);
                message_element.classList.add(this.options.message_class);

                target.parentNode.insertBefore(message_element, target.nextSibling);

                return message_element;
            },
            getElement: function(target) {
                var is_next_element_message = (target.nextElementSibling &&
                target.nextElementSibling.classList.contains(this.options.message_class));

                var element_by_data_attr = target.parentNode.querySelector('[data-message-for="' + target.name + '"]');
                var element_by_class = target.parentNode.getElementsByClassName(this.options.message_class)[0];

                return is_next_element_message ? target.nextElementSibling :
                    (element_by_data_attr || element_by_class || null);
            },
            fail: function(params) {
                if (params.target.dataset.hasOwnProperty(this.options.message_prevent_attr)) {
                    return;
                }

                var message_element = this.toggles_list.message.getElement.call(this, params.target) ||
                    this.toggles_list.message.createElement.call(this, params.target);

                message_element.innerHTML = params.data.message;
                message_element.style.display = '';
            },
            success: function(params) {
                var message_element = this.toggles_list.message.getElement.call(this, params.target);

                if (message_element) {
                    message_element.style.display = 'none';
                }
            }
        }
    };

    Rules.prototype.list = {
        not_empty: {
            execute: function() {
                var is_only_spaces = /^[\s\n]+$/.test(this.value);
                var is_select_null_value = this.tagName.toLowerCase() === 'select' ?
                this.value.toLowerCase() === 'null' : false;

                return !is_select_null_value && !is_only_spaces && this.value.length !== 0;
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
    Rules.prototype.defaults.forms = {};

    Rules.prototype.defaults.elements = {
        username: ['not_empty', {name: 'min', value: 8}, {name: 'max', value: 100}],
        password: ['not_empty', {name: 'min', value: 6}, {name: 'max', value: 100}],
        domain: ['not_empty', {name: 'min', value: 3}, {name: 'max', value: 255} , 'is_domain'],
        bulk_domains: ['not_empty', 'is_bulk_domains'],

        // profile info
        first_name: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 255}, 'has_no_quotes'],
        last_name: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 255}, 'has_no_quotes'],
        address: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 255}],
        city: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 255}],
        country: ['not_empty'],
        state: ['not_empty', {name: 'max', value: 255}],
        post_code: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 15}, 'abc_123_space'],
        phone: ['not_empty', 'is_phone'],
        email: ['not_empty', 'is_email'],

        business_name: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 255}],
        business_name_id_au: 'business_name_id_au',
        business_number: ['not_empty', {name: 'min', value: 2}, {name: 'max', value: 255}],

        username_login: ['not_empty', 'is_existing_member'],

        new_password: 'password',
        old_password: 'password',

        card_number: ['not_empty', {name: 'min', value: 14}, {name: 'max', value: 23}, 'credit_card_number'],
        card_exp_month: ['not_empty', 'is_number'],
        card_exp_year: ['not_empty', 'is_number'],
        card_cvv: ['not_empty', {name: 'max', value: 4}, 'is_number']
    };

    window.Validation = Validation;
})();