{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:9001/ExpensiveNote',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		user_id: ,
		wallets: [_id:
			icon: ''
			name: ''
			money: 0
			type: 0
		],
		type_spendings: [_id:
			name: ''
			icon: ''
			type: 0
			parent_id:
		],
		spendings: [_id:
			money: 0
			input_date: new Date()
			des: ''
			type_spending_id:
			wallet_id:
			is_bookmark: false
		]
	}
}

{
	des: 'Get list',
	method: 'GET',
	url: 'http://localhost:9001/ExpensiveNote'
}

{
	des: 'Update',
	method: 'PUT',
	url: 'http://localhost:9001/ExpensiveNote/ITEM_ID',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		user_id: ,
		wallets: [_id:
			icon: ''
			name: ''
			money: 0
			type: 0
		],
		type_spendings: [_id:
			name: ''
			icon: ''
			type: 0
			parent_id:
		],
		spendings: [_id:
			money: 0
			input_date: new Date()
			des: ''
			type_spending_id:
			wallet_id:
			is_bookmark: false
		]
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:9001/ExpensiveNote/ITEM_ID'
}

{
	des: 'Delete',
	method: 'DELETE',
	url: 'http://localhost:9001/ExpensiveNote/ITEM_ID'
}