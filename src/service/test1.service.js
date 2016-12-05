{
    des: 'Add',
    method: 'POST',
    url: 'http://localhost:9000/test1',
    requestHeader: {
        'content-type': 'multipart/form-data'
    },
    requestBody: {
        YOUR_DATA
    }
}

{
    des: 'Get list',
    method: 'GET',
    url: 'http://localhost:9000/test1'
}

{
    des: 'Update',
    method: 'PUT',
    url: 'http://localhost:9000/test1/ITEM_ID',
    requestHeader: {
        'content-type': 'multipart/form-data'
    },
    requestBody: {
        
    }
}

{
    des: 'Get detail',
    method: 'GET',
    url: 'http://localhost:9000/test1/ITEM_ID'
}

{
    des: 'Delete',
    method: 'DELETE',
    url: 'http://localhost:9000/test1/ITEM_ID'
}