{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:8080/Testcase/5857c1c3a06e111d24af399e',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		params: {
			name: 'testcase 01',
			test_report_dir: 'output',
			pkt_sizes: 64,
			tests: '01_port_fwd',
			tolerated_loss: 0.001,
			test_duration: 60,
			test_precision: 0.1,
			level: 'INFO',
			rte_target: 'x86_64-native-linuxapp-gcc'
		},
		created_date: new Date(),
		updated_date: new Date(),
		status: 0
	}
}

{
	des: 'Run testcase',
	method: 'POST',
	url: 'http://localhost:8080/Testcase/run/5857c2c8651b911060c25aac',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {}
}

{
	des: 'Get list',
	method: 'GET',
	url: 'http://localhost:8080/Testcase'
}

{
	des: 'Update',
	method: 'PUT',
	url: 'http://localhost:8080/Testcase/ITEM_ID',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		params: {},
		created_date: new Date(),
		updated_date: new Date(),
		status: 0
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:8080/Testcase/ITEM_ID'
}

{
	des: 'Delete',
	method: 'DELETE',
	url: 'http://localhost:8080/Testcase/5857c2c8651b911060c25aac'
}