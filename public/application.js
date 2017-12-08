import MainView from 'base/modules/numbers/main_view';
import HelpView from 'base/modules/help/help_view';

require("!style!css!base/modules/style.css");

export default function () {
	new MainView();
	new HelpView();
};