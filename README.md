# Dropbox SDK for JavaScript
> Unofficial Dropbox SDK for green browsers based on using ES6 syntax

## Install

```bash
npm install dbox-sdk --save
```

## Example
```js
import Dropbox from './dropbox-sdk.js';

// Make instance config and first call 
const dropboxConfig = {
  folderName: 'YOUR_FOLDER_NAME',
  appKey: 'YOUR_APP_KEY',
  redirectUri: 'YOUR_APP_REDIRECT_URI'//example: http://localhost:8000
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
