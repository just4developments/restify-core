{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:9001/TypeSpendings',
	requestHeader: {
		'content-type': 'application/json',
		'token': '586bb85baa5bdf0644e494da-586bb875aa5bdf0644e494dd-586bbaac0d542f33cc82015c'
	},
	requestBody: {
		name: 'thuong',
		icon: 'icon luong',
		type: -1,
		parent_id: '586bbaf305309404e44bad8c'
	}
}

{
	des: 'Get list',
	method: 'GET',
	requestHeader: {
		'content-type': 'application/json',
		'token': '586bb85baa5bdf0644e494da-586bb875aa5bdf0644e494dd-586bbaac0d542f33cc82015c'
	},
	url: 'http://localhost:9001/TypeSpendings'
}

{
	des: 'Update',
	method: 'PUT',
	url: 'http://localhost:9001/TypeSpendings/58669832abe1642ad85fa5d6',
	requestHeader: {
		'content-type': 'application/json',
		'token': '5866861fb439a60c787bff3b-5866894cd0b26a265843c378-58668956d0b26a265843c379'
	},
	requestBody: {
		name: 'di hoc update 1',
		icon: 'icon hoc update 1',
		type: -1,
		parent_id: '58669821abe1642ad85fa5d5'
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:9001/TypeSpendings/586730e9d4b88d2550c8e99d',
	requestHeader: {
		'content-type': 'application/json',
		'token': '5866861fb439a60c787bff3b-5866894cd0b26a265843c378-58668956d0b26a265843c379'
	},
}

{
	des: 'Delete',
	method: 'DELETE',
	requestHeader: {
		'content-type': 'application/json',
		'token': '586bb85baa5bdf0644e494da-586bb875aa5bdf0644e494dd-586bbaac0d542f33cc82015c'
	},
	url: 'http://localhost:9001/TypeSpendings/586bbbe705309404e44bad92'
}