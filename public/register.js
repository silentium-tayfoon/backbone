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

				this.on('sync', function(){
					console.log('SYNC');
					users_list.add(this);
				});

				// this.on('change', function(model){
				// 	console.log('saved');
				// });

				this.on("invalid", function(model, error){
					console.log(error);
				});
	       	},
	       	validate: function(attributes){
	       		//_.each(attributes, min, this);
	       	}
		});
		window.U = User;


		var UsersList = Backbone.Collection.extend({
			model: User,
			url: '/register_get_all',
			initialize: function(){
				var self = this;
				this.on('add', function(self){
					console.log('save');
					console.log(self);
				});
				this.on('change', function(){
					console.log('change in collection');
				});
			}
		});	

		var users_list = new UsersList({});

		var RegisterCustomerForm = Backbone.View.extend({
			initialize: function(){
		        this.render(user);
		    },
		    model: User,
			el: '#registerCustomerForm',
			template: _.template($(register_customer_form_template).html()),
			events: {
				'click .save_data': 'saveData'
			},
			getValFromDom: function(val, key){

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
			new_user:'',
			collection: users_list,
			saveData: function(){

				window.user = this.new_user = new this.model({});

				_.each(this.new_user.attributes, this.getValFromDom, this);

				this.new_user.save(); 
			},
			render: function(model){
				this.$el.html(this.template({data:model.attributes}));
				return this;		
			}
		});

		var user = new User({});
		var registerUser = new RegisterCustomerForm({});

		var UserDataList = Backbone.View.extend({
			initialize: function(){
				//this.model_list.fetch();
		        //this.render();
		        var list_view = this;
		        this.listenTo(users_list, 'add', function(){
					list_view.render();
				});
		    },
			el: '#post_data',
			template: _.template($(user_from_server_template).html()),
			model: users_list,
			render: function(){
				var user_list_view = this;
				this.$el.empty();
				user_list_view.model.forEach(function(model){
					user_list_view.$el.append(user_list_view.template({d:model.attributes}));
				});
				return this;
			}
		});

		var userData = new UserDataList();

});




















































