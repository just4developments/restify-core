{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:8080/ExecutingLogs',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		event_type: '',
		status: 0,
		title: '',
		started_time: new Date()
	}
}

{
	des: 'Get list',
	method: 'GET',
	url: 'http://localhost:8080/ExecutingLogs'
}

{
	des: 'Update',
	method: 'PUT',
	url: 'http://localhost:8080/ExecutingLogs/ITEM_ID',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		event_type: '',
		status: 0,
		title: '',
		started_time: new Date()
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:8080/ExecutingLogs/ITEM_ID'
}

{
	des: 'Delete',
	method: 'DELETE',
	url: 'http://localhost:8080/ExecutingLogs/ITEM_ID'
}