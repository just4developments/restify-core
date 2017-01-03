{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:9001/Wallet',
	requestHeader: {
		'content-type': 'application/json',
		'token': '586bb85baa5bdf0644e494da-586bb875aa5bdf0644e494dd-586bbaac0d542f33cc82015c'
	},
	requestBody: {
		icon: 'icon vi 2',
		name: 'vi 02',
		money: 1000,
		type: 1
	}
}

{
	des: 'Get list',
	method: 'GET',
	url: 'http://localhost:9001/Wallet',
	requestHeader: {
		'content-type': 'application/json',
		'token': '5866861fb439a60c787bff3b-5866894cd0b26a265843c378-58668956d0b26a265843c379'
	},
}

{
	des: 'Update',
	method: 'PUT',
	url: 'http://localhost:9001/Wallet/58668c22e955e61a00c2bb75',
	requestHeader: {
		'content-type': 'application/json',
		'token': '5866861fb439a60c787bff3b-5866894cd0b26a265843c378-58668956d0b26a265843c379'
	},
	requestBody: {
		icon: 'icon a',
		name: 'name a',
		money: 0,
		type: 0
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:9001/Wallet/586730e9d4b88d2550c8e99c',
	requestHeader: {
		'content-type': 'application/json',
		'token': '5866861fb439a60c787bff3b-5866894cd0b26a265843c378-58668956d0b26a265843c379'
	}
}

{
	des: 'Delete',
	method: 'DELETE',
	requestHeader: {
		'content-type': 'application/json',
		'token': '5866861fb439a60c787bff3b-5866894cd0b26a265843c378-58668956d0b26a265843c379'
	},
	url: 'http://localhost:9001/Wallet/58672b44d78aa801d41f4a49'
}