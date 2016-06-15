
$(function(){

	var registerCustomerForm = document.getElementById('registerCustomerForm');
	var post_data = document.getElementById('post_data');
	var sendAjaxForm = document.querySelector('.sendAjaxForm');



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
					post_data.innerHTML = server_data.first_name + '<br>' + server_data.last_name;
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
