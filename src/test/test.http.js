{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:8080/test',
	requestHeader: {
		'content-type': 'multipart/form-data'
	},
	requestBody: {
		name: null,
		age: null,
		date: null,
		bol: null,
		obj: {
			class: "test",
			num: 10
		},
		arr: [1, 2, 3],
		'file:images': '',
		'file:avatar': ''
	}
}

{
	des: 'Get list',
	method: 'GET',
	url: 'http://localhost:8080/test'
}

{
	des: 'Update',
	method: 'PUT',
	url: 'http://localhost:8080/test/ITEM_ID',
	requestHeader: {
		'content-type': 'multipart/form-data'
	},
	requestBody: {
		name: null,
		age: null,
		date: null,
		bol: null,
		obj: {
			class: "test",
			num: 10
		},
		arr: [1, 2, 3],
		'file:images': '',
		'file:avatar': ''
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:8080/test/ITEM_ID'
}

{
	des: 'Delete',
	method: 'DELETE',
	url: 'http://localhost:8080/test/ITEM_ID'
}