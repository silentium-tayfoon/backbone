<div class="entry">
	<span>User № <%= d._id %></span>
	<ul class="list-group">
		<li class="list-group-item">
			First name : <%= d.first_name %>
		</li>	
		<li class="list-group-item">
			Last name : <%= d.last_name %>
		</li>
		<li class="list-group-item">
			Transport : <%= (d.vehicle1) ? "bike" : '' 
						%><%= (d.vehicle1 && d.vehicle2) ? ", " : '' 
						%><%= (d.vehicle2) ? "car" : '' %>
		</li>
		<li class="list-group-item">
			Gender : <%= d.gender %>
		</li>
		<li class="list-group-item">
			Country : <%= d.country %>
		</li>
	</ul>
</div>