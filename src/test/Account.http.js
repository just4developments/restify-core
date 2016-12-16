{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:9000/Account/5853b1dba72a0b1dec45853c',
	requestHeader: {
		'content-type': 'multipart/form-data'
	},
	requestBody: {
		username: 'thanh',
		password: '123',
		status: 1,
		email: 'doanthuanthanh88@gmail.com',
		birth_day: new Date(1988, 10, 6),
		'file:avatar': 'D:\\logo.png'
	}
}

{
	des: 'Get list',
	method: 'GET',
	url: 'http://localhost:9000/Account'
}

{
	des: 'Add role',
	method: 'PUT',
	url: 'http://localhost:9000/Account/5853b1dba72a0b1dec45853c/5853b9c5512fb445fc0ed682/Role',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		roles: [
			1,2,3
		]
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:9000/Account/ITEM_ID'
}

{
	des: 'Delete',
	method: 'DELETE',
	url: 'http://localhost:9000/Account/ITEM_ID'
}