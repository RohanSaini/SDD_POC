/**
 * Registers all handlebars helpers to be used in app.
 * Define any new helpers inside this function.
 * 
 * @param Handlebars - The Handlebars object
 */
const registerHbsHelpers = (Handlebars) => {
	// Helper "ifCond" - checks equality of lhs & rhs objects
	Handlebars.registerHelper('ifCond', function (lhs, rhs, options) {
		if (lhs === rhs) return options.fn(this);
		return options.inverse(this);
	});
};

module.exports = registerHbsHelpers;