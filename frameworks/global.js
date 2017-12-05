(function($, DebugLog){
    'use strict';

    var Global = window.Global || {};

    window.setGlobal = function(value) {
        return value || null;
    };

    /** Add GLOBAL OBJECT to extend it, and pass data not from window */
    $.extend(true, Global, {
        helpers:{},
        paths: {},
        validation:{},
        predefine_values:{},
        init_objects:{},
        old_function:{},
        select2LateInit: [],
        safeDefineData: function (value, data, value_name) {
            /** get data from server in Sigma variable 'data', where store all what we need,
             *  so we fix the problem when there is no Sigma variable and in result we have :
             *  var define_some_variable =  ; // error here;
             *
             *  usage example:window.Global.safeDefineData(Global.predefine_values, '{num_domains}', 'num_domains');
             *
             * @param {object} value
             * @param {object} data - can be present or not
             * @param {string} value_name
             * */

            value[value_name] = data || null;
        }
    });

    Global.predefine_values['class'] = {
        ERROR_HIGHLIGHT_CLASS: 'form_validation_error',
        ERROR_MESSAGE_CLASS: 'validation_error',
        ERROR_LABEL_CLASS: 'label_validation_error',
        HIDDEN: 'hidden'
    };

    Global.predefine_values['month'] = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'];

    Global.predefine_values['chartColors'] = {
        colors: [
            '#0DA2D0',
            '#1FBFF1',
            '#4FCDF4',
            '#7FDAF7',
            '#AFE8FA',
            '#DFF6FD'
        ],
        special: "#FF962A"
    };

    /**
     * Decode HTMLEntities
     * replace current currency symbol with decoded
     *
     * usage: for example to convert currency symbol in script to pass it to further render
     */
    Global.helpers['decodeEntities'] = (function() {
        // this prevents any overhead from creating the object each time
        var element = document.createElement('div');

        function decodeHTMLEntities(str) {
            if (str && typeof str === 'string') {
                // strip script/html tags
                str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
                str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
                element.innerHTML = str;
                str = element.textContent;
                element.textContent = '';
            }

            return str;
        }

        return decodeHTMLEntities;
    })();


    /**
     * CORPORATE STYLE ( $1,946,369.58 )
     *
     *  1946369.58 => 1,946,369.58
     *  */
    Global.helpers['addCommas'] = function(value) {
        if (!value) {
            return value;
        }

        // Value must be a number.
        value = +value;

        // Remove dot if there are no decimal numbers.
        value = value.toFixed(2);

        // Adding commas every three chars.
        value = value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

        return value;
    };

    if(window.hasOwnProperty('Global')) {
        debug.error('Global is duplicated!!!');
    }

    window.Global = Global;

    Object.defineProperty(window.Global,'name',{'value':'reseller'});

    /**
     * view for tooltip
     * */
    window.Global.predefine_values['tooltip'] = {
        'domain': {
            skin: 'custom',
            closeButton: true,
            background: {color: '#FFFFFF'},
            maxWidth: '450',
            border: {size: 2, color: '#eee'},
            radius: {size: 0, position: 'border'},
            shadow: false
        }
    };

    /** Detect touch device by touch event */
    Global.helpers.isTouchDevice = function() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    };

    /** get from underscore.js
     * usage:
     *      var nameFunctionToRun = Global.helpers.debounce(func, wait);
     *      nameFunctionToRun();
     * */
    Global.helpers['debounce'] = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };


    /** Add GLOBAL Flag current mobile device */
    window.is_mobile = (navigator.userAgent.match(/Windows Phone/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/Android/i) || Global.helpers.isTouchDevice())? true: false;
    $(function(){
        if(window.is_mobile === true){
            document.querySelector('body').classList.add('is_mobile');
        }
    });

    /** animate scroll to target
     * @param {object} $scrollHere - jquery link to dom to where need to scroll;
     * */
    Global.helpers.scrollTo = function($scrollHere){
        $('body').animate({
            scrollTop: $scrollHere.offset().top
        }, 800);
    };

    /** check on tld  '.com, .au ...'
     * @param {string} domain_name
     * @return {boolean}
     * */
    window.Global.validation.checkOnlyTld = function (domain_name) {
        var domain_name_sp = domain_name.split('.');
        return domain_name.indexOf(".") > 0 && /^[a-zA-Z]{2,}$/.test(domain_name_sp[domain_name_sp.length - 1]);
    };

    /** find nearest parent which contains needed class
     * @param {object} el - dom element
     * @param {string} cls - class to find
     * @return {object} / null
     * */
    window.Global.helpers.findParent = function (el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    };

    /** when click on <tr> checkbox is toggled */
    window.Global.helpers.toggle_checkbox_js = function() {

        $('.toggle_checkbox_js').not('.select2').off('click').on('click', function (event) {

            //console.log(event.target.tagName);
            if(event.target.tagName === 'INPUT' || event.target.tagName === 'LABEL'){
                /** do not need to react on this elements */
                return;
            }

            /** delegate working */

            if(event.target.className.match('select2') || event.target.className.match('link_no_toggle')) {
                return;
            }

            var checkbox = $(this).find('input[type="checkbox"]:not(.not_toggle)')[0];
            var    radio = $(this).find('input[type="radio"]:not(.not_toggle)')[0];

            if (checkbox && !checkbox.disabled) {
                checkbox.click(); /** need click - so other events can trigger; */
                //checkbox.checked = !checkbox.checked;
            } else if(radio && !radio.checked) {
                //radio.checked = !radio.checked;
                radio.click();
            }

        });
    };

    /**
     * Update block button toggle for any page
     * toggle_button_js argument - DOMElement || NodeList || Selector
     * MUST HAVE data-type = type
     * Toggle Block selector className[type + '_toggle_js']
     */
    window.Global.helpers.toggle_button_js = function(toggle_button_js) {
        var toggle_buttons = document.querySelectorAll(toggle_button_js);
        var callback = function() {
            var type = this.getAttribute('data-type');

            $('[data-type="' + type + '"]').show();
            $(this).hide();
            $('.' + type + '_toggle_js').toggle();
        };

        Array.prototype.forEach.call(toggle_buttons, function(elem) {
            elem.trigger = callback;
            elem.addEventListener('click', callback);
        });
    };

    /**
     * Add className loading on click
     */
    window.Global.helpers.with_loading = function(elem) {
        $(elem).on('click', function() {
            if(!this.classList.contains('_loading')) {
                this.classList.add('_loading');
                this.classList.remove('with_loading');
            }
        });
    };

    window.Global.helpers.portletScroll = {
        value: 189,
        run: function() {
            $(window).off('scroll').on('scroll', function() {
                var portletScroll = window.Global.helpers.portletScroll.value,
                    portlet = $('.portlet'),
                    condition,
                    e;

                if(typeof portletScroll === 'function') {
                    e = portletScroll();
                } else {
                    e = portletScroll;
                }

                condition = portlet.hasClass("heading-fixed") && $(window).scrollTop() > e;

                portlet.toggleClass("_fixed", condition);
            });
        }
    };

    /** taken from bottom.tpl */
    $(".btn").mouseup(function(){
        $(this).blur();
    });

    window.Global.helpers['tipped'] = function() {
        $('div[id^="inline_tooltip_"].globalTip').each(function(index, element) {
            var max_width = $(this).hasClass('cvvBox') ? 500 : 320;
            window.Tipped.create(element.id.replace('inline_', '.'), element.id, { inline: true, closeButton: true, skin: 'custom', background: { color: '#FFFFFF' }, maxWidth: max_width, border: { size: 2, color: '#cacdcf' }, radius: { size: 0, position: 'border' }, shadow: false });
        });
    };

    /** add commas every three chars */
    window.Global.helpers['priceFormat'] = function(value) {
        if (!value) {
            return value;
        }

        value = parseFloat(value);
        // Remove dot if there are no decimal numbers.
        value = value.toFixed(2);
        // Adding commas every three chars.
        value = value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

        return value;
    };

    /** simply takes all data from form, serialize and send ajax,
     * send/false info push in toastr message; */
    window.Global.helpers['popupOnclickAjax'] = function (button, callbackBefore) {

        var goOn = true;

        if(typeof(callbackBefore) === 'function'){
            goOn = callbackBefore(button.form);
        }
        if(goOn){
            button.classList.add('_loading');
            var closeIcon = button.form.querySelector('.closeCrazyPopup');
            var ajaxWorking = false;
            var data = {
                type:         'POST',
                url:           button.form.action,
                data:          $(button.form).serialize(),
                success: function(response){
                    ajaxWorking = false;
                    button.classList.remove('_loading');
                    closeIcon.click();
                    if(response.status === true){
                        toastr.success(response.message);
                    }else{
                        toastr.error(response.message);
                    }
                },
                error: function(xhr,status,error){
                    ajaxWorking = false;
                    button.classList.remove('_loading');
                    closeIcon.click();
                    console.error('windows.Global.helpers.onclickAjax(), ajax error : '+error);
                }
            };

            if(ajaxWorking === false){
                ajaxWorking = true;
                $.ajax(data);
            }
        }
    };

    Global['ajax_token'] = '1234567890';

})(window.jQuery, window.DebugLog);




(function(Global, $) {
    'use strict';

    /* ----------------------- set_action, generateSearchResultDiv ----------------------- */
    /**
     *	show to user ajax result from search field
     *	@param {object} json_data - response from server JSON converted to object
     * */

    function generateSearchResultDiv(json_data){
        /**
         * count elements in object
         * @param {object} obj - object in which need to count
         * @param {array} don't - array with name of parameters which should not be counted
         * @return {integer} i - value of how many elements was counted
         *
         * todo:maybe better to extend base object, or put it to some global var?
         * */
        var c,
            $body = $("body"),
            $main_div,
            $search_box = $body.find("#search_box"),
            showAllResult,
            saved_json_data = json_data.data; // needed for view all;

        var count = function(obj, dont){
            /* dont - array with strings which should not be counted */
            var i = 0, l = 0, key,
                dont_match = function(dont,key){
                    var j, f = true;
                    for(j = 0; j<dont.length; j++){
                        f = key !== dont[j];
                    }
                    return f;
                };

            for (key in obj) {
                if(dont){
                    if(dont_match(dont,key) === true && obj.hasOwnProperty(key)){
                        i++;
                    }
                    l++;
                }else{
                    if (obj.hasOwnProperty(key)) {
                        i++;
                    }
                }
            }
            return i-1; /* minus 1 because count start's from zero */
        };

        var i, j, ul, li, hideli, info,
            fields = ['domain','product','customer'],
            conformity = {'domain':'domains','product':'hosting','customer':'username'},
            main_div = '<div class="search-box-dropdown show">',
            main_div_empty_results = '<div class="search-box-dropdown show">';

        if(count(json_data.data) > 0){
            for(i=0; i<fields.length; i++){
                c = json_data.data[fields[i]].total_results;
                ul = '';
                if( c ){
                    if(c > 10){c = 10; /* max result is 10 */}
                    ul = '<ul class="search-results '+conformity[fields[i]]+'">';
                    li = '';
                    for (j = 0; j < c; j++) {
                        info = '';
                        if(j > 2){hideli = '_hide';}else{hideli = "";}
                        if(fields[i] === 'product') {
                            info = json_data.data[fields[i]][j].result + '<div class="sub-info _text-truncate"> ' + json_data.data[fields[i]][j].add_info + '</div>';
                        } else if(fields[i] === 'customer'){
                            info = json_data.data[fields[i]][j].add_info +'<div class="sub-info _text-truncate"> '+json_data.data[fields[i]][j].result+'</div>';
                        }else{
                            info = json_data.data[fields[i]][j].result;
                        }
                        li = li + '<li class="search-results-item '+hideli+'"><a class="search-results-link" href="'+location.origin+json_data.data[fields[i]][j].link+'">'+info+'</a></li>';
                    }
                    if(json_data.data[fields[i]].showmore === "true"){
                        li = li + '<li class="show-more _align-center">'+
                            '<a href="'+location.origin+json_data.data[fields[i]].link+'" class="show-more-link icon-angle-down-search" data-show-more="'+fields[i]+'" data-show="'+conformity[fields[i]]+'">Show More</a>'+
                            '</li>';
                    }
                    ul = ul + li + '</ul>';
                }
                main_div = main_div + ul;
            }
            if(main_div_empty_results === main_div){
                main_div = '<div class="search-box-dropdown no-results" >No results.</div>';
            }else{
                main_div = main_div + '</div>';
            }

        }

        $('#search_box .search-box-dropdown').remove();

        c = 0;
        $main_div = $(main_div);
        showAllResult = function(e){
            var toShow = e.target.getAttribute('data-show');
            var toShowMore = e.target.getAttribute('data-show-more');
            var $show,
                $showMoreLink,
                $toHide;

            if(toShow && toShow.length !== 0) {
                e.preventDefault();
                $show = $main_div.find('.' + toShow);
                $showMoreLink = $show.find('.show-more .show-more-link');
                $toHide = $main_div.find('.search-results').not('.' + toShow);
                $show.find('li').removeClass('_hide');
                $showMoreLink.removeClass('icon-angle-down-search');
                $showMoreLink.text('View All ('+ saved_json_data[toShowMore].total_results +')');
                $toHide.addClass('_hide');

                if (c > 0) {
                    window.location.href = $showMoreLink.attr('href');
                }
                c++;
            }else if(e.target.name === 'menu_search_keyword'){
                $search_box.addClass('open');
                $main_div.addClass('show');
            }else{
                $search_box.removeClass('open');
                $main_div.removeClass('show');
            }
        };

        $body.off("click",showAllResult);
        $body.on("click",showAllResult);
        $search_box.addClass('open');
        $('#search_box').append($main_div);
    }

    /**
     *  set_action  - search all possible info for domains, and show short result to user;
     *  for now it's typically present in window because it runs from .tpl like
     *  onsubmit="javascript: return set_action();"
     * */
    window.Global.helpers.set_action = function (e) {
        var	$searchBox = $('#search_box'),
            $searchForm = $searchBox.find("#menu_form"),
            $inp = $searchForm.find('#menu_search_keyword'),
            keyword = $inp.val(),
            $search = $searchBox.find(".icon-magnifier"),
            $preloader = $searchBox.find(".preloader");

        e.preventDefault();
        if (keyword !== '') {
            $search.addClass('_hide');
            $preloader.removeClass('_hide');
            $.ajax({
                type: 'POST',
                url: '/reseller/ajax/general/full_search/',
                data: 'search_slug=' + keyword,
                dataType: 'json',
                complete: function (response) {
                    if(response.responseText) {
                        response = $.parseJSON(response.responseText);
                    }

                    $preloader.addClass('_hide');
                    $search.removeClass('_hide');

                    if(response.status === true) {
                        generateSearchResultDiv(response);
                    } else {
                        window.toastr.error(response.message);
                    }
                }
            });

        } else {
            $inp.focus();
            //console.log('Keyword may not be blank');
        }

        return false;
    };

    /** remove onclick from main.tpl */
    $(document).ready(function(){
        var quick_search_form = $('#menu_form'),
            magnifying_glass = $('#search_box .submit_search');

        quick_search_form.keyup(function(e){
            if(e.keyCode === 13){
                window.Global.helpers.set_action(e);
            }
        });
        magnifying_glass.on('click',function(e){
            window.Global.helpers.set_action(e);
        });
    });

    /* ----------------------- END set_action, generateSearchResultDiv ----------------------- */
})(window.Global, window.jQuery);

/**
 * Show error message.
 * Message can Array.
 * @param errors
 */
function showError(errors) {
    'use strict';

    var is_object = errors instanceof Object,
        msg = '',
        key;
    errors = errors || 'No errors from Server!';

    if(is_object && errors) {
        for(key in errors){
            msg = msg + errors[key] + '<br/>';
        }
    } else {
        msg += errors;
    }

    window.toastr.error(msg, '',{timeOut:'300000'});
}

/**
 * Toggle target block on click event
 * @param selector
 * @constructor
 */
var ToggleExpandableRow = function(selector){
    'use strict';

    var self = this;

    /**
     * Toggle elements list
     * @type {NodeList}
     */
    this.elements = document.querySelectorAll(selector);

    /**
     * Toggle elements list block.
     * Hide all blocks, then show current
     */
    this.eventCallback = function() {
        var elem = this;
        var target = document.getElementById(elem.getAttribute('data-target'));

        if(target){
            if(!target.classList.contains('open') && self.allow_close_all) {
                self.closeAll();
            }

            elem.classList.toggle('open');
            target.classList.toggle('open');
            target.style.display = target.style.display === 'none' ? '' : 'none';
        }
    };

    this.allow_close_all = true;

    /**
     * Hide elements list blocks.
     */
    this.closeAll = function() {
        Array.prototype.forEach.call(self.elements, function(row) {
            var target_block = document.getElementById(row.getAttribute('data-target'));
            row.classList.remove('open');
            if (target_block) {
                target_block.classList.remove('open');
                target_block.style.display = 'none';
            }
        });
    };

    if(self.elements.length) {
        for (var i = 0; i < self.elements.length; i++) {
            self.elements[i].addEventListener("click", self.eventCallback);
        }
    }
};

/**
 * Alternative navigation with select.
 */

var clickOnSelect = function (element, $selected_item) {
    if (element.classList.contains('nav_type_location')) {
        window.location = $selected_item.prop('href');
    }

    if (element.classList.contains('nav_type_func')) {
        $selected_item.trigger('click');
    }
};

$(function() {
    var nav_tabs = document.querySelector('.nav-tabs');
    var $nav_by_links = $(nav_tabs).find('a');
    var count_links = $nav_by_links.length;
    var $nav_location_by_select = $('.nav_by_select');
    var tabbable_line = document.querySelector('.tabbable-line');
    var nav_value = $nav_location_by_select.find('.active').val();

    nav_value = nav_value || encodeURI(window.location.hash.substr(1));

    if (!$nav_location_by_select[0]) {
        return;
    }

    if(count_links > 5){
        //nav_tabs.style.display = 'none';
        tabbable_line.classList.add('over_5');
    }

    $nav_location_by_select.find('option[data-count="0"]').remove();

    if ($nav_location_by_select[0].classList.contains('select2-hidden-accessible')) {
        $nav_location_by_select.select2('val', nav_value);
    }

    $nav_location_by_select
        .on('change', setLocationByLink)
        .val(nav_value);

    function setLocationByLink() {
        var $selected_item = $nav_by_links.eq(this.selectedIndex);

        if (count_links > 5) {
            tabbable_line.classList.add('over_5');
            clickOnSelect(this, $selected_item);
        } else if(window.innerWidth < 769){ /** FIX - HACK -
         need to change value of select but when change this function triggering so have a loop,
         so add this check and it will work only for mobile*/
        clickOnSelect(this, $selected_item);
        }
    }
});

