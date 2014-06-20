/*jsio('import lib.PubSub as PubSub');
jsio('from util.browser import $');
jsio('from util.underscore import _');
jsio('import std.js as JS');

function shallowCopy(p) {
	var o = {};
	for(var i in p) {
		if(p.hasOwnProperty(i)) {
			o[i] = p[i];
		}
	}
	return o;
}

*/

// for backwards compatibility'

var widgetNames = [
	'Widget',
	'CheckBox',
	'Button',
	'TextButton',
	'SubmitButton',
	'TextInput',
	'PasswordInput',
	'TextArea',
	'TextLimitArea',
	'Form'
]

for (var i = 0, name; name = widgetNames[i]; ++i) {
	logger.info('import .' + name);
	jsio('import .' + name, { context: exports });
}

jsio('from .global import *', { context: exports })
logger.info('exports!', exports);
