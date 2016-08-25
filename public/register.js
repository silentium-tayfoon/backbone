$(function(){

	/** dom links --------------- */

		
		var post_data = document.getElementById('post_data');
		var register_customer_form_template = document.getElementById('register_customer_form_template');
		var user_from_server_template = document.getElementById('user_from_server_template');
		var send_ajax_form = document.querySelector('.send_ajax_form');
		var navbar = document.querySelector('.navbar');

	/** classes --------------- */
	
		var User = Backbone.Model.extend({
	       	defaults: {
	       			   id: 'not set',
	           first_name: 'new in model  first name',
	            last_name: 'new in model no last name'
	   			// country: req.body.country,
				// vehicle1: req.body.vehicle1,
				// vehicle2: req.body.vehicle2,
				// gender: req.body.gender
	       	},
	       	initialize: function(){
	            console.log('user model initialized');

				this.on('change', function(){
					//if(this.hasChanged('first_name')){
						console.log('- Values for this model have changed - trigger from base class, first name');
						userData.render();
					//}
				});

				this.on("invalid", function(model, error){
					console.log(error);
				});
	       	},
	       	validate: function(some_attributes){
	       		if(some_attributes.hasOwnProperty('first_name')){
	       			some_attributes.first_name = some_attributes.first_name.trim();
	       			var is_number = /^[\d\s]+$/;
	       			if(is_number.test(some_attributes.first_name)){
	       				return 'no number are allowed!';	
	       			}
	       		}
	       	}
		});

		var user = new User({});


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

		var RegisterCustomerForm = Backbone.View.extend({
			initialize: function(){
		        this.render();
		    },
			el: '#registerCustomerForm',
			events: {
				'click .send_ajax_form': 'sendReciveAjax'
			},
			template: _.template($(register_customer_form_template).html()),
			model: user,
			sendReciveAjax: function(){
				var self = this;
				var success = function(server_data){
					self.model.set({
						id: server_data.id,
						first_name: server_data.first_name, 
						last_name: server_data.last_name,
						country: server_data.country,
						vehicle1: server_data.vehicle1,
						vehicle2: server_data.vehicle2,
						gender: server_data.gender
					});	
				}

				registerAjax(this.$el, success);
			},
			render: function(){
				this.$el.html(this.template({data:this.model.attributes}));
				return this;		
			}
		});

		var registerUser = new RegisterCustomerForm({});

		var UserDataList = Backbone.View.extend({
			el: '#post_data',
			template: _.template($(user_from_server_template).html()),
			model: user,
			render: function(){
				this.$el.html(this.template({d:this.model.attributes}));
				return this;
			}
		});

		var userData = new UserDataList();

});




















































