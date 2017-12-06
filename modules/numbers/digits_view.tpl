<table class="table table-bordered">
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
