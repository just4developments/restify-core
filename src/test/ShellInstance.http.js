{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:8080/ShellInstance',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		input_data: {},
		created_date: new Date(),
		updated_date: new Date(),
		status: 0
	}
}

{
	des: 'Get list',
	method: 'GET',
	url: 'http://localhost:8080/ShellInstance'
}

{
	des: 'Update',
	method: 'PUT',
	url: 'http://localhost:8080/ShellInstance/ITEM_ID',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		input_data: {},
		created_date: new Date(),
		updated_date: new Date(),
		status: 0
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:8080/ShellInstance/ITEM_ID'
}

{
	des: 'Delete',
	method: 'DELETE',
	url: 'http://localhost:8080/ShellInstance/ITEM_ID'
}