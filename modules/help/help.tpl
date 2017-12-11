<div class="prompt row _hide">hint</div>
<div class="btn-group-vertical mr-2 help_navigation_js" role="group" aria-label="navigation">
    <button type="button" class="btn btn-secondary" value="0">0</button>
    <button type="button" class="btn btn-secondary" value="0.25">25</button>
    <button type="button" class="btn btn-secondary" value="0.5">50</button>
    <button type="button" class="btn btn-secondary" value="0.75">75</button>
    <button type="button" class="btn btn-secondary" value="1">00</button>
</div>
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