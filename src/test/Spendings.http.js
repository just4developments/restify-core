{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:9001/Spendings',
	requestHeader: {
		'content-type': 'application/json',
		'token': '5866861fb439a60c787bff3b-5866894cd0b26a265843c378-58668956d0b26a265843c379'
	},
	requestBody: {
		money: 100000,
		input_date: new Date(2016, 11, 10),
		des: 'sinh nhat',
		type_spending_id: '58673106d4b88d2550c8e9a0',
		wallet_id: '586730f5d4b88d2550c8e99e',
		is_monitor: false
	}
}

{
	des: 'Get list',
	method: 'GET',
	requestHeader: {
		'content-type': 'application/json',
		'token': '586bb85baa5bdf0644e494da-586bb875aa5bdf0644e494dd-586bbaac0d542f33cc82015c'
	},
	url: 'http://localhost:9001/Spendings'
}

{
	des: 'Update',
	method: 'PUT',
	url: 'http://localhost:9001/Spendings/5869377cdc355d1f5c49c964',
	requestHeader: {
		'content-type': 'application/json',
		'token': '5866861fb439a60c787bff3b-5866894cd0b26a265843c378-58668956d0b26a265843c379'
	},
	requestBody: {
		money: 100000,
		input_date: new Date(),
		des: 'mua toi',
		type_spending_id: '586730e9d4b88d2550c8e99d',
		wallet_id: '586730e9d4b88d2550c8e99c',
		is_monitor: true
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:9001/Spendings/ITEM_ID'
}

{
	des: 'Delete',
	method: 'DELETE',
	requestHeader: {
		'content-type': 'application/json',
		'token': '586bb85baa5bdf0644e494da-586bb875aa5bdf0644e494dd-586bbaac0d542f33cc82015c'
	},
	url: 'http://localhost:9001/Spendings/586bbbe705309404e44bad92'
}

{
	des: 'Delete',
	method: 'DELETE',
	requestHeader: {
		'content-type': 'application/json',
		'token': '5866861fb439a60c787bff3b-5866894cd0b26a265843c378-58668956d0b26a265843c379'
	},
	url: 'http://localhost:9001/Spendings/586a095147f64a12e8678539'
}