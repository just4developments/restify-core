{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:9001/Wallet',
	requestHeader: {
		'content-type': 'application/json',
		'token': '586b55c48a1b181fa80d39a5-586b56038a1b181fa80d39a8-586b561a8a1b181fa80d39a9'
	},
	requestBody: {
		icon: 'icon vi',
		name: 'vi 05',
		money: 15000,
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