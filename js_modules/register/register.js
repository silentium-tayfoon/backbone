var $ = require('./../../frameworks/jquery.js');
var _ = require('imports?$=jquery!./../../frameworks/underscore.js');
var Backbone = require('imports?$=jquery&_=underscore!./../../frameworks/backbone.js');
var vendor_update = require('imports?$=jquery&_=underscore!./../../frameworks/vendor_update.js');
var Validate = require('./../../frameworks/set_validate.js');

require('imports?$=jquery!./../../frameworks/global.js');


var register_form_template = require('html!./../../tpl/register_form_template.tpl');
var register_template = require('html!./../../tpl/register_template.tpl');

module.exports = function(){

	console.log('JQUERY = '+$.fn.jquery);
	console.log('underscore = '+_.VERSION);
	console.log('Backbone = '+Backbone.VERSION);
	console.log(Backbone.sync);
	console.log(Validate.VERSION);

	var showErrors = function (errors, form_dom) {

		var validation_element_dom,
			validation_input_dom,
			validation_title_dom,
			validation_error_dom;

		for (var error in errors) {

			validation_input_dom = form_dom.querySelector('[name=' + error + ']');

			if(validation_input_dom){
				// there is such element, find all other elements

				validation_element_dom = Global.helpers.findParent(validation_input_dom, 'validation_element');

				if(validation_element_dom){
					// there is container for all other fields

					validation_title_dom = validation_element_dom.querySelector('.validation_title');
					validation_error_dom = validation_element_dom.querySelector('.validation_error');

					if (validation_title_dom && validation_error_dom) {
						// there is all needed elements, to show error

						// 1) red border for input
						validation_input_dom.classList.add(Global.predefine_values.class.ERROR_HIGHLIGHT_CLASS);

						// 2) red color for title
						validation_title_dom.classList.add(Global.predefine_values.class.ERROR_LABEL_CLASS);

						// 3) put text and remove hidden class
						validation_error_dom.innerHTML = errors[error];
						validation_error_dom.classList.remove(Global.predefine_values.class.HIDDEN);

					} else {

						console.error('validation error - can\'t find dom some of element: validation_title_dom or validation_error_dom');
					}

				} else {

					console.error('validation error - can\'t find dom parent of element: '+ error);
				}
			} else {

				console.error('validation error - no such element in dom: '+ error);
			}
		}
	};

	var handleErrors = function (attr) {

		/**
		 * error: [
				 {
					 key: 'first_name',
					 value: 'not valid from server'
				 },
				 {
					 key: 'some_error',
					 value: 'API say\'s we are in trouble'
				 },
				 {
					 key: 'bulk_error',
					 value: [
						 {
							 key: 'somedomenname',
							 value: 'this domen is already registered'
						 },
						 {
							 key: 'somedomenname2',
							 value: 'cna\'t register this one'
						 }
					 ]
				 }
		 	]
		 * */

		var error = attr[1].error;
		var model = attr[1].model;

	};

	/**
	 * compare attributes in objects to_server & from_server
	 * function handle only situation for the attributes which was passed to server
	 * and was changed on server and returned to user
	 *
	 * function do not handle situation when amount of attributes are changed on server;
	 *
	 */

	var checkServerChanges = function (to_server, from_server) {

		var do_not_match = [];
		var string_to_server, string_from_server;

		var is_match = _.isMatch(to_server, from_server);

		if(is_match === false){

			for(var key_to_server in to_server){
				if(to_server.hasOwnProperty(key_to_server) && from_server.hasOwnProperty(key_to_server)){

					// compare stings, because false == 'false' ==> != true
					string_to_server = to_server[key_to_server] + '';
					string_from_server = from_server[key_to_server] + '';

					if(string_to_server != string_from_server){
						do_not_match.push({
							key: key_to_server,
							to_server: to_server[key_to_server],
							from_server: from_server[key_to_server]
						});
					}
				}
			}

			if(do_not_match.length > 0){
				return do_not_match;
			}else{
				return false;
			}
		} else {
			// is_match === true
			return true;
		}
	};


	$(function(){

	/** dom links --------------- */

		var COUNTRY = 'UA';
		var post_data = document.getElementById('post_data');
		//var register_template = document.getElementById('register_template');
		//var register_form_template = document.getElementById('register_form_template');
		var save_data = document.querySelector('.save_data');
		var navbar = document.querySelector('.navbar');

		var User = Backbone.Model.extend({
			url:'/api/users',
	       	defaults: {
	       		first_name: 'new in model no first name',
				last_name: 'new in model no last name',
				country: COUNTRY,
				vehicle1: null,
				vehicle2: true,
				acc_type: 'personal',
				business_name: '',
				gender: 'female'
	       	},
	       	initialize: function(options){

				// this.on('change', function(model){
				// 	console.log('saved');
				// });

				this.validate = function(attr,options){
					return Validate.check_valid.call(Validate, attr, options );
				};
	       	}
		});

		var UsersList = Backbone.Collection.extend({
			model: User,
			url: '/api/users/',
			initialize: function(){
				var self = this;
				this.on('add', function(self){
					console.log('save');
					console.log(self);
				});
			}
		});	

		var users_list = new UsersList();

		users_list.fetch();

		window.users_list = users_list;

		var Button = Backbone.View.extend({
			initialize: function(){
				this.listenTo(this.model, 'invalid', function(){
					console.log('BUTTON invalid');
					this.$el.removeClass('btn-danger').addClass('btn-default');
				});
				this.listenTo(this.model, 'request', function(){
					console.log('BUTTON request');
					this.$el.removeClass('btn-default').addClass('btn-danger');
				});
				this.listenTo(this.model, 'sync', function(){
					console.log('BUTTON sync');
					this.$el.removeClass('btn-danger').addClass('btn-default');
				});
			},
			model: null,
			el: null,
			reinit: function(model){
				this.model = model;
				this.initialize();
			}
		});

		var RegisterCustomerForm = Backbone.View.extend({
			initialize: function(){
				var self = this;

				this.new_user = new this.model({});

				this.render();

				this.$el.change(function(e){
					var data = {};
					data[e.target.name] = e.target.value;
					if(e.target.type === 'button' || e.target.type === 'checkbox' || e.target.type === 'radio'){
						self.new_user.set(data);
					}else{
						self.new_user.set(data, {validate:true, target_dom:e.target, field: data});
					}
				});

				var $acc_type_toggle = this.$el.find('.acc_type_toggle');

				this.new_user.on('change:acc_type', function(){
						if(this.changed.acc_type === 'personal'){
							$acc_type_toggle.addClass('hidden');
						}else{
							$acc_type_toggle.removeClass('hidden');
						}
					});

				window.b = this.button = new Button({
		        					'model': this.new_user,
		        					'el': this.$el.find('[name="Submit"]')
		        				});

				this.listenTo(this.new_user, 'invalid', function(){
		        	console.log('INVALID VALIDATION');
		        	console.log(arguments);
		        } );
		    },
		    model: User,
			el: '#registerCustomerForm',
			template: _.template(register_form_template),
			form_links: {},
			events: {
				'click .save_data': 'saveData'
			},
			getValFromDom: function(attributes){ // this.new_user.attributes {key:value}

				var dom_data = {};
				var keys = _.keys(attributes);
				var i;
				var $domElement;
				var checked;

				for (i = 0; i<keys.length; i++) {

					$domElement = this.$el.find('[name='+keys[i]+']');

					if($domElement){

						checked = 'false';

						if($domElement.attr('type') === 'radio'){

							// find checked radio and get it value
							dom_data[keys[i]] = this.$el.find('[name='+keys[i]+']:checked').val();

						} else if($domElement.attr('type') === 'checkbox'){

							// check if element checked
							checked = ($domElement.is(':checked')) ? 'true' : 'false';
							dom_data[keys[i]] = checked;

						} else {

							// simply put set value
							dom_data[keys[i]] = $domElement.val();

						}
					} else {
						console.error('No such element in dom: '+keys[i]);
					}
				}

				return dom_data; // {key:value}
			},
			collection: users_list,
			saveData: function(){

				var list_view = this;

				var data_from_dom = this.getValFromDom(this.new_user.attributes);

				//window.new_user = this.new_user;
				// window.new_user.on('error', function () {
				// 	debugger;
				// });
                //
				// window.new_user.on('change', function () {
				// 	debugger;
				// });


				this.new_user.save(data_from_dom,{
						success: function(){

							var send_received_different = checkServerChanges(data_from_dom, arguments[0].attributes);

							if(send_received_different){
								// re render template with new data!
							}


							console.log('-----different-----');
							console.log(send_received_different);

							// simply create new user for form field
								list_view.collection.add(list_view.new_user);
								// set .isNew to false by set id
								if(!list_view.new_user.attributes.id){
									console.log('set id:' + list_view.collection.length);
									list_view.new_user.set('id', list_view.collection.length);
								}
								// add new empty user
								list_view.new_user = new list_view.model({});
								list_view.button.reinit(list_view.new_user);
								//list_view.$el.find('[name="Submit"]').removeClass('btn-danger').addClass('btn-default');
						},
						error: function(){
							debugger;

							if(arguments[1].responseJSON.hasOwnProperty('error')){
								handleErrors(arguments);
							}

							console.log('Save new user on server FAILL');
						},
						wait: true,
						validate:true,
						target_dom: this.el
					});
			},
			render: function(){
				this.$el.html(this.template({data: this.new_user.attributes}));
				return this;		
			}
		});

		var user = new User({});
		var registerUser = new RegisterCustomerForm({});

		var UserDataListDeleteAll = Backbone.View.extend({
			initialize: function(){
				this.listenTo(this.model, 'add', this.render);

				var lazy_render = _.debounce(this.render, 300);

				this.listenTo(this.model, 'destroy', lazy_render);
			},
			events: {
				click : function(){
					this.deleteAll();
				}
			},
			el: '#clear_all',
			template: 'clear all',
			model: users_list,
			render: function(){

				console.log('re count - '+this.model.length);
				this.$el.empty().text(this.template + ' ( ' + this.model.length + ' )');
			},
			deleteAll: function(){
				var self = this;
				console.log('deleteAll run');
				this.model.models.forEach(function(model){

						//HACK
						if(model.isNew()){
							model.set('id', model.get('_id'), {silent:true});
						}

					var destroyed = model.destroy({
							success: function(model, response) {
								if(response && response.id){
									console.log('deleted id: ' + response.id);		
								}else{
									console.log('deleted id: NO ID');
								}
							},
							error: function(model){
								console.log('error'); //' cant delete model '+model.get('_id')
							},
							wait: true,
							url: '/api/users/'+model.get('_id')
						});
					//console.log('destroyed id: ' + model.get('_id') + ' = ' + destroyed);
				});
			}
		});

		var deleteAllButton = new UserDataListDeleteAll();

		var UserDataList = Backbone.View.extend({
			initialize: function(){
				this.listenTo(users_list, 'add', this.render);
				this.listenTo(users_list, 'destroy', this.remove);
		    },
			el: '#post_data',
			template: _.template(register_template),
			model: users_list,
			render: function(){
				console.log('render');
				var user_list_view = this;
				var all_elements = '';
				this.$el.empty();
				user_list_view.model.models.forEach(function(model){
					all_elements = all_elements + user_list_view.template({d:model.attributes});
				});

				user_list_view.$el.append(all_elements);

				return this;
			},
			remove: function(){
				this.$el.empty();
				this.model.reset();
			}
		});

		var userData = new UserDataList();

	});
};