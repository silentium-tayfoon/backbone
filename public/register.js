$(function(){

	/** dom links --------------- */

		var registerCustomerForm = document.getElementById('registerCustomerForm');
		var post_data = document.getElementById('post_data');
		var sendAjaxForm = document.querySelector('.sendAjaxForm');
		var navbar = document.querySelector('.navbar');

	/** classes --------------- */
	
		var User = Backbone.Model.extend({
			initialize: function(){
	           console.log('user model created');
	       	},
	       	defaults: {
	           first_name: 'no first name',
	            last_name: 'no last name',
	       	}
		});

	/** models --------------- */

		var user = new User({});

		/** add events to user model */
		_.extend(user, Backbone.Events);



		user.on("change", function(msg) {
			if(user.hasChanged(['first_name'])){
				changeUserView();
				console.log(user.previous("first_name")+' vs '+user.get('first_name')) ;
			}
		  	console.log("user changed - "+msg);
		});

	/** func --------------- */
		var changeUserView = function(){

			var first_name = user.get('first_name');
			var last_name = user.get('last_name');

			post_data.innerHTML =  first_name + '<br>' + last_name;
		};	

	/** events --------------- */

		$(sendAjaxForm).on('click', function(){
			var data = $(registerCustomerForm).serialize();

			$.ajax({
				method: 'POST',
				dataType: 'json',
				url: 'http://localhost:8080/register',
				data: data,
				success: function(result){
					
					var server_data = result.data;

					if(result.status){
						user.set({ 
							first_name: server_data.first_name, 
							last_name: server_data.last_name
						});

						/** trigger event if need to do it directly */
						//user.trigger('userChange');
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
			    	console.log(jqXHR);
			    	console.log(textStatus);
			    	console.log(errorThrown);
			    }
			});
		});

});