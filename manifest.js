var fs = require('fs');

function mkmanifest(params){

	var aFileList = [];
	var traverseFileSystem = function (currentPath) {
		var files = fs.readdirSync(currentPath);

		files.forEach(function(item){
			//exclude .git files
			//if(currentPath.indexOf(".git")==-1 && item.indexOf(".git")==-1) {
			var currentFile = currentPath + '/' + item;
			var stats = fs.statSync(currentFile);
			if (stats.isFile()) {
				aFileList.push(currentFile.split(params.path)[1]);
			} else if (stats.isDirectory()) {
				traverseFileSystem(currentFile);
			}
			//}
		});
	};

	traverseFileSystem(params.path);
	var contents = "CACHE MANIFEST\n";
	contents += "# version " + params.version + "\n\n";
	//Cache section
	contents += "CACHE:\n";
	if(params.exclude) {
		aFileList = aFileList.filter(function(item) { return params.exclude.indexOf(item) == -1; });
	}
	aFileList.forEach(function(item){ contents += item + "\n"; });

	//Network section
	if(params.network) {
		contents += "\nNETWORK:\n"
		params.network.forEach(function(item){ contents += item + "\n"; });
	}

	//Fallback section
	if(params.fallback) {
		contents += "\nFALLBACK:\n"
		params.fallback.forEach(function(item){ contents += item + "\n"; });
	}

	fs.writeFile(params.path + '/' + params.filename + '.manifest', contents, function (err) {
		if (err)
			throw err;
	});

	fs.writeFile(params.path + '/' + ".htaccess", "AddType text/cache-manifest .manifest", function (err) {
		if (err)
			throw err;
	});

	console.log("Cache manifest file generated : " + params.filename + ".manifest\n");
	console.log('You have to update <html> tag : <html manifest="/' + params.filename + '.manifest">')
	console.log(contents);

}

exports.mkmanifest = mkmanifest;