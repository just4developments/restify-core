# (ShopKeeper-Web)

Basic useful feature list:

 * Auto build and livereload page
 * Auto minify and concat many files into a file (css, js, html)
 * Auto compile sass to css
 * Easy to dev and package before deploy it to server


#### For development

It will auto start webserver to http://localhost:4100

```sh
gulp dev
OR 
npm start
```

#### To deploy to server

1. Build website (minify, concat, optimize files). After build, it will be export to "dist" folder

```sh
gulp package
```

2. Start server

npm run dev 
then 
npm start

```sh
node index
```

## Command Line Tools
Create component which generate at public/components/foldername (auto refesh route when add new component)
```sh
npm run create foldername component-name
```
Refesh route when add new component (Manual create component or move component)
```sh
npm run route
```
