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

	var formApp = function(){

		var User = Backbone.Model.extend({
			url:'/api/users',
	       	defaults: {
	       		first_name: 'new in model  first name',
	            last_name: 'new in model no last name',
				country: COUNTRY,
				vehicle1: null,
				vehicle2: true,
				gender: 'female'
	       	},
	       	initialize: function(){
	            console.log('user model initialized');

				// this.on('change', function(){
				// 	//if(this.hasChanged('first_name')){
				// 		console.log('- Values for this model have changed - trigger from base class, first name');
				// 		userData.render();
				// 	//}
				// });

				this.on('change', function(model){
					console.log('saved');
				});

				this.on("invalid", function(model, error){
					console.log(error);
				});
	       	},
	       	validate: function(attributes){
	       		_.each(attributes, min, this);
	       	}
		});

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
			saveData: function(){
				var self = this;
				var register_new_user = new this.model;
				var dom_val = '';
				var getValFromDom = function(val, key){
					register_new_user.set(key, this.$el.find('[name='+key+']').val());
				};

				_.each(register_new_user.attributes, getValFromDom, this);

				register_new_user.save();
				console.log(register_new_user);
			},
			render: function(model){
				this.$el.html(this.template({data:model.attributes}));
				return this;		
			}
		});


		var user = new User({});
		var registerUser = new RegisterCustomerForm({});
	};

	window.formApp = formApp;
	formApp();


	/** classes --------------- */

		// var UsersList = Backbone.Collection.extend({
		// 	model: User,
		// 	url: '/register_get_all'
		// });

		// var users_list = new UsersList();

	/** common func --------------- */	

		var registerAjax = function($dom, success){
			var data = $dom.serialize();

			$.ajax({
				method: 'POST',
				dataType: 'json',
				url: 'http://localhost:8080/register',
				data: data,
				success: function(result){
					
					var server_data = result.data;

					success(server_data);
				},
				error: function (jqXHR, textStatus, errorThrown) {
			    	console.log(jqXHR);
			    	console.log(textStatus);
			    	console.log(errorThrown);
			    }
			});
		};

	/** views --------------- */

		// var UserDataList = Backbone.View.extend({
		// 	initialize: function(){
		// 		this.model_list.fetch();
		//         this.render();
		//     },
		// 	el: '#post_data',
		// 	template: _.template($(user_from_server_template).html()),
		// 	model: user,
		// 	model_list: users_list,
		// 	render: function(){
		// 		var user_list_view = this;
		// 		this.model_list.forEach(function(model){
		// 			user_list_view.$el.html(user_list_view.template({d:model.attributes}));
		// 		});
		// 		return this;
		// 	}
		// });

		// var userData = new UserDataList();

});




















































