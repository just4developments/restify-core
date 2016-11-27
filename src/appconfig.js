module.exports = {
    listen: 9000,
    staticUrl: 'http://localhost:9000',
    db: {
        url: 'mongodb://localhost:27017/nanacloset01'
    },
    app: {
        imageResize: {
			product: [
                {w: -1000 }, // Auto resize origin when width > 1000. If width < 1000 do nothing
                {w: 110, h: 55, ext: 'small'}, // in menu
                {w: 100, h: 100, ext: 'middle'}, // details
                {w: 180, h: 180, ext: 'large'} // update
			]
        }
    }
}