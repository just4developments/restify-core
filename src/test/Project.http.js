{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:9000/Project',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		name: 'Project 02',
		status: 1
	}
}

{
	des: 'Get list',
	method: 'GET',
	url: 'http://localhost:9000/Project'
}

{
	des: 'Update',
	method: 'PUT',
	url: 'http://localhost:9000/Project/ITEM_ID',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		name: '',
		status: 0,
		created_at: new Date(),
		updated_at: new Date(),
		accounts: [_id:
			username: ''
			password: ''
			status: 0
			email: ''
			birth_day: new Date()
			'file:avatar': null
			created_at: new Date()
			updated_at: new Date()
		]
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:9000/Project/ITEM_ID'
}

{
	des: 'Delete',
	method: 'DELETE',
	url: 'http://localhost:9000/Project/ITEM_ID'
}