$(function(){

	/** dom links --------------- */

		var COUNTRY = 'UA';
		var post_data = document.getElementById('post_data');
		var register_customer_form_template = document.getElementById('register_customer_form_template');
		var user_from_server_template = document.getElementById('user_from_server_template');
		var save_data = document.querySelector('.save_data');
		var navbar = document.querySelector('.navbar');

		var min = function(val){
			var pass = false;
			if(val.length && val.length > 1){
				pass = true;
			}
			return pass;
		};

		var User = Backbone.Model.extend({
			url:'/api/users',
	       	defaults: {
	       		first_name: 'new in model no first name',
	            last_name: 'new in model no last name',
				country: COUNTRY,
				vehicle1: null,
				vehicle2: true,
				gender: 'female'
	       	},
	       	initialize: function(){

				// this.on('change', function(model){
				// 	console.log('saved');
				// });

				this.on("invalid", function(model, error){
					console.log(error);
				});
	       	},
	       	validate: function(attributes){
	       		if(attributes.first_name.length < 10){
	       			return 'name length < 10';
	       		}
	       		//_.each(attributes, min, this);
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

				this.new_user = new this.model({});

		        this.render();

		        window.b = this.button = new Button({
		        					'model': this.new_user,
		        					'el': this.$el.find('[name="Submit"]')
		        				});

		        this.listenTo(this.new_user, 'invalid', function(){
		        	console.log('INVALID VALIDATION');
		        } );
		    },
		    model: User,
			el: '#registerCustomerForm',
			template: _.template($(register_customer_form_template).html()),
			events: {
				'click .save_data': 'saveData'
			},
			getValFromDom: function(val, key){

				if(!key){debugger;}
				var $domElement = this.$el.find('[name='+key+']');
				var checked = 'false';

				if($domElement.attr('type') === 'radio'){

					// find checked radio and get it value
					this.new_user.set(key, this.$el.find('[name='+key+']:checked').val());	

				} else if($domElement.attr('type') === 'checkbox'){

					// check if element checked	
					checked = ($domElement.is(':checked')) ? 'true' : 'false';
					this.new_user.set(key, checked);

				} else {

					// simply put set value
					this.new_user.set(key, $domElement.val());	
				}
			},
			collection: users_list,
			saveData: function(){
				//this.$el.find('[name="Submit"]').removeClass('btn-default').addClass('btn-danger');

				var list_view = this;

				//window.user = this.new_user = new this.model({});

				console.log('save new user - ' + this.new_user.cid + '  ' + this.new_user);

				_.each(this.new_user.attributes, this.getValFromDom, this);

				this.new_user.save('','',{
						success: function(){
							console.log('!!!!! all good');

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
							console.log('Save new user on server FAILL');
						},
						wait: true
					}); 
			},
			render: function(){
				this.$el.html(this.template({data:this.new_user.attributes}));
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
			template: _.template($(user_from_server_template).html()),
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




















































