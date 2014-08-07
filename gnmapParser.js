var fs = require('fs');

/*
    gnmapParser by Dani Martinez - @dan1t0
    18/07/2014

*/

var hosts = [];
var ports_list = [];
var ips_list = [];
var gnmapFile = process.argv[2];

//vars for parse input
var arg_json = false;
var arg_list = false;
var arg_human = false;
var arg_all = false;
var output = false;
var out_ok = false;


//TESTING INPUT
if ((process.argv.indexOf('-h') != -1)) {
    output = true;
    help(output);

} else {
    if (process.argv.length != 4) 
        help(output);
}


if (process.argv.length === 4) {
    if ((process.argv.indexOf('-json')!= -1)) {
        arg_json = true;
        out_ok = true;
    }
    if ((process.argv.indexOf('-list')!= -1)) {
        arg_list = true;
        out_ok = true;
    }
    if ((process.argv.indexOf('-human')!= -1)) {
        arg_human = true;
        out_ok = true;
    }
    if ((process.argv.indexOf('-all')!= -1)) {
        arg_all = true;
        out_ok = true;
    }
    if (!out_ok)
        help(output);
};
//TESTING INPUT END




function help(output) {
    console.error('Usage: '+process.argv[0]+' '+process.argv[1]+' file.gnmap'+' -[json, human, list, all]');
    
    if (!output)
        console.error('       Type -h for more info about output formats');
    else {
        console.error('**AVAILABLE OUTPUTS**');
        console.error('-> -json :  json formatted output with information such as: open ports, protocols and IPs');
        console.error('-> -human : human-readable format including the IPs and ports');
        console.error('-> -list : outputs two lists: one with the ports information and the other with the unique open ports on all the IPs');
        console.error('-> -all : all of the aforementioned outputs combined in a single parameter');
    }

    console.log();
    process.exit(1);
}



function incioLectura(file_nmap, callback) {

    fs.readFile(file_nmap, { encoding: 'utf-8' }, function (err, data) {
        if (err) {
            console.error("Error reading file: "+gnmapFile);
            process.exit(1);
        }

        /* split string by newlines and parse them */
        var lines = data.split('\n');
        lines.forEach(parseLine);

        callback();

    });


}



function parseLine(line)
{

	if (line.indexOf("Ports:") != -1) {
		var field = line.split('Ports:');
		var ip_ = line.split(" ");
		var ip = ip_[1];

        var host = {
            ip: '',
            ports: [{
                number:'',prot:'',info:''
            }]
        }

		host.ip = (ip);
		var port_open = field[1];
		var port_dummy = port_open.split('Ignored');
		var port_dummy2 = port_dummy[0];
		var port_list = port_dummy2.split(',');


        for (x=0; x<port_list.length; x++) {
            parsePort(port_list[x], host)
        }

        hosts.push(host);

	}

}



function parsePort(port,host) {
	var port = port.replace(/\/+/g,'/');
	var port_list = port.split('/');

    host.ports.push({
        "number": port_list[0].replace(' ',''),
        "prot": port_list[2],
        "info": port_list[3]
        });
}




incioLectura(gnmapFile, function() {

    if ((arg_json) || (arg_all))
        console.log(JSON.stringify(hosts, null, 2));



    if ((arg_list) || (arg_all)) {
        for (var i=0; i < hosts.length; i++) {
            ips_list.push(hosts[i].ip);
            for (var ii=0; ii < hosts[i].ports.length; ii++) {
                var pedo = ports_list.indexOf(hosts[i].ports[ii].number);
                if ( (hosts[i].ports[ii].number != '') && (pedo == -1)) {
                    ports_list.push(hosts[i].ports[ii].number);
                }

            }
        }
    
        console.log('-> Puertos abiertos ('+ports_list.length+'): '+ ports_list.toString());
        console.log('');
        console.log('-> IPs ('+ips_list.length+'): '+ ips_list.toString());
        console.log('');
    }



    if ((arg_human) || (arg_all)) {
        for (var i=0; i < hosts.length; i++) {
            console.log('- '+hosts[i].ip);
            
            for (var ii=0; ii < hosts[i].ports.length; ii++) {
                var pedo = ports_list.indexOf(hosts[i].ports[ii].number);
               
                if ( (hosts[i].ports[ii].number != '') ){
                    console.log('+- '+hosts[i].ports[ii].number+'/'+hosts[i].ports[ii].prot+'\t'+hosts[i].ports[ii].info);
                }

            } console.log('');
    }
}

});
