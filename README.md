# Dropbox SDK for JavaScript
> unofficial dropbox sdk js for green browsers

```js
// Step 1: make instance config and first call 
var dropboxConfig = {
  folderName: 'ProstoDiary',
  appKey: 'p106c7q518z3pbd',
  redirectUri: 'http://localhost:8080'
};
var dropbox = new Dropbox(dropboxConfig);
```

```js
// Step 2: show authenticate dialog and get token (save localStorage in '__db_token')
dropbox.authenticate().then(token => {
  console.log(token);
});
```

```js
// Step 3: call request API. Example get_space_usage
dropbox.request({
  host: 'https://api.dropboxapi.com',
  query: '/2/users/get_space_usage',
  method: 'POST',
  type: String,
  body: 'null',
  headers: {
    type: 'application/json'
  }
})
.then(data => console.log(data))
```


Warning!

The API have not run on old browsers have not support:

* fetch API
* Promise API
* Classes declaration
* ES6 modules
