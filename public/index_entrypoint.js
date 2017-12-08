
import View from 'base/modules/numbers/view';

$(function() {
	// no back button in the browser!
	// window.location.hash="no-back-button";
	// window.location.hash="Again-No-back-button";//again because google chrome don't insert first hash into history
	// window.onhashchange=function(){window.location.hash="no-back-button";};

	new View();
});