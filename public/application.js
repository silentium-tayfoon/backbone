
import {Router} from './router';

import NumbersView from 'base/modules/numbers/numbers_view';
import HelpView from 'base/modules/help/help_view';

require("!style!css!base/modules/style.css");

export default function () {
	new NumbersView();
	new HelpView();

	new Router();
	Backbone.history.start();
};