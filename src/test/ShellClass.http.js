{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:8080/ShellClass',
	requestHeader: {
		'content-type': 'multipart/form-data'
	},
	requestBody: {
		name: '',
		des: null,
		mano: '',
		yaml: '',
		input: [params: ''
			label: ''
			type: ''
			default: ''
			component: ''
		],
		testing: {
			tasks: []
			params: []
			testcases: []
		},
		path: '',
		created_date: new Date(),
		updated_date: new Date(),
		status: 0,
		'file:avatar': ''
	}
}

{
	des: 'Get list',
	method: 'GET',
	url: 'http://localhost:8080/ShellClass'
}

{
	des: 'Update',
	method: 'PUT',
	url: 'http://localhost:8080/ShellClass/ITEM_ID',
	requestHeader: {
		'content-type': 'multipart/form-data'
	},
	requestBody: {
		name: '',
		des: null,
		mano: '',
		yaml: '',
		input: [params: ''
			label: ''
			type: ''
			default: ''
			component: ''
		],
		testing: {
			tasks: []
			params: []
			testcases: []
		},
		path: '',
		created_date: new Date(),
		updated_date: new Date(),
		status: 0,
		'file:avatar': ''
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:8080/ShellClass/58579be6aa483b1230288d00'
}

{
	des: 'Delete',
	method: 'DELETE',
	url: 'http://localhost:8080/ShellClass/ITEM_ID'
}