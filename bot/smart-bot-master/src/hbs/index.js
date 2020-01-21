const fs = require('fs');
const path = require('path');

const compileHbsTemplates = (Handlebars) => {
	var files = {};
	fs.readdirSync(path.join(__dirname)).forEach(fileName => {
		if (fileName.split('.').pop() === 'hbs')
			files[fileName.split('.hbs')[0]] = Handlebars.compile(fs.readFileSync(path.join(__dirname, fileName)).toString());
	});
	return files;
};

module.exports = compileHbsTemplates;