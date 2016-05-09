'use strict';
class Dropbox {

  constructor(config) {
    this.config = config;
    this._hashTrack();
  }

  get hostAPI() {
    return 'https://api.dropboxapi.com';
  }

  get hostContent() {
    return 'https://content.dropboxapi.com';
  }

  set token(_token) {
    localStorage.setItem('__db_token', _token);
  }

  get token() {

    const dbToken = localStorage.getItem('__db_token');
    if (dbToken) {
      return dbToken;
    } else {
      return null;
    }

  }

  authenticate() {
    localStorage.removeItem('__db_token');

    const clientId = this.config.appKey;
    const redirectUri = this.config.redirectUri;

    const link = `https://www.dropbox.com/1/oauth2/authorize` +
      `?client_id=${ encodeURIComponent(clientId) }` +
      `&redirect_uri=${ encodeURIComponent(redirectUri) }` +
      `&response_type=token`;

    window.open(link, '_blank', 'width=540,height=960,left=0,top=0,menubar=yes,toolbar=no,scrollbars=yes');
  }

  revokeToken() {

    return this.request({
      host: this.hostAPI,
      query: '/2/auth/token/revoke',
      method: 'POST',
      body: 'null',
      headers: {
        type: 'application/json'
      }
    });

  }

  filesDownload(path, rev = null) {

    return this.request({
      host: this.hostContent,
      query: '/2/files/download',
      method: 'POST',
      type: Blob,
      headers: {
        arg: {
          path,
          rev
        }
      }
    });

  }

  filesUpload(file, path, mode, autorename, client_modified, mute) {

    return this.request({
      host: this.hostContent,
      query: '/2/files/upload',
      method: 'POST',
      body: file,
      type: Blob,
      headers: {
        type: 'application/octet-stream',
        arg: {
          path,
          mode,
          autorename,
          client_modified,
          mute
        }
      }
    });

  }

  _generateHeadersFrom(_headers = {}) {

    const headers = new window.Headers();
    headers.set('Accept', 'application/json');
    headers.set('Authorization', 'Bearer ' + this.token);

    if (_headers.type) {
      headers.set('Content-Type', _headers.type);
    }

    if (_headers.arg) {
      headers.set('Dropbox-API-Arg', JSON.stringify(_headers.arg));
    }

    return headers;
  }

  _generateBodyFrom(body) {
    return body || null;
  }

  generateMethodFrom(method) {
    return method || 'POST';
  }

  _generateRequestURIFrom(params) {
    return `${ params.host }${ params.query }`;
  }

  /**
   * TODO: Сделать проверку на ошибку
   * @private
   */
  _hashTrack() {

    const self = this;
    onhashchange();

    window.addEventListener('hashchange', onhashchange);

    function onhashchange(e) {
      const hash = (e && e.target.hash) || location.hash;
      const params = hash.split('&');
      const tokenMatch = params[0].match(/token=(.+)$/);

      if (tokenMatch) {
        // var tokenType = params[1].match(/type=(.+)/);
        // var uid = params[2].match(/uid=(.+)/);
        // localStorage.setItem('__db_token_type', tokenType[1]);
        // localStorage.setItem('__db_uid', uid[1]);

        self.token = tokenMatch[1];
        window.close();
      }

    }

  }

  /**
   *
   * @param params {Object}
   * @returns {Promise.<T>}
   */
  request(params = {}) {
    const requestURI = this._generateRequestURIFrom(params);
    const method = this.generateMethodFrom(params.method);
    const body = this._generateBodyFrom(params.body);
    const headers = this._generateHeadersFrom(params.headers);

    return fetch(requestURI, {
      method,
      headers,
      body
    })
      .then(data => {

        if (!data.ok) {
          throw data.statusText;
        }

        switch (params.type) {
          case Blob:
            return data.blob();

          case JSON:
            return data.json();

          case ArrayBuffer:
            return data.arrayBuffer();

          default:
            return data.text();
        }

      })
      .then(data => Promise.resolve(data))
      .catch(error => {
        console.log(error);
        return Promise.reject(error);
      });
  }

}
