$(function(){

	/** dom links --------------- */

		// var registerCustomerForm = document.getElementById('registerCustomerForm');
		// var post_data = document.getElementById('post_data');
		// var sendAjaxForm = document.querySelector('.sendAjaxForm');
		// var navbar = document.querySelector('.navbar');

	/** classes --------------- */
	
		var Task_list = Backbone.Model.extend({

			initialize: function(){
	           console.log('Task list model created');
	       	},
	       	defaults: {
	           	task: 'todo list',
	            todo_list: [
		            {
		            		   name: 'default name',
		            	description: 'default description'
		            }
	            ]
	       	}
		});

	/** models --------------- */

		var list = new Task_list({});

		_.extend(list, Backbone.Events);

		// list.on("change", function(msg) {
		// 	if(user.hasChanged(['first_name'])){
		// 		changeUserView();
		// 		console.log(user.previous("first_name")+' vs '+user.get('first_name')) ;
		// 	}
		//   	console.log("user changed - "+msg);
		// });


	/** view --------------- */

		var render = new ObjectRender({
			renderData: {
				source: 'task_list_template',
				target: '.task_list_target',
				action: 'append'
			}
		});


		var Task_list_view = Backbone.View.extend({
			el: '#click_buttons',
			initialize: function(){
	           console.log('Task_list_view created');

	       	},
			events: {
				"click #show_list": "showList",
				"click .show_list":  "openEditDialog",
				"click .show_alert": "show_alert"
			},
			render: function() {
				var data = list.attributes;
					render.render({
		                data: data
		            });
			},
			showList : function () {
				this.render();
			},
			show_alert : function () {
				console.log(this);
			}

		});

		var list_view = new Task_list_view();
});		