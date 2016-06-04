# Dropbox SDK for JavaScript
> unofficial dropbox sdk js for green browsers

```js
import Dropbox from './dropbox-sdk-js.js';

// Make instance config and first call 
const dropboxConfig = {
  folderName: 'ProstoDiary',
  appKey: 'p106c7q518z3pbd',
  redirectUri: 'http://localhost:8080'
};
const dropbox = new Dropbox(dropboxConfig);
```

```js
// Show authenticate dialog and get token (token autosave to localStorage in '__db_token' key)
dropbox.authenticate().then(token => {
  console.log(token);
});
```

```js
// Call request API. Example get_space_usage
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
===

The API have not run on old browsers have not support:

* fetch API
* Promise API
* Classes declaration
* ES6 modules
