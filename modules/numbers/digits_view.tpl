<div id="prompt" class="row _hide">hint</div>
<table class="table table-bordered table-striped">
    <tbody>
    <% for (let i=0; i< digits.length; i++) { %>
        <tr>
            <% for (let j=0; j< width; j++) { %>
                <td><%=digits[i][j]%></td>
            <% } %>
        </tr>
    <% } %>
    </tbody>
</table>
