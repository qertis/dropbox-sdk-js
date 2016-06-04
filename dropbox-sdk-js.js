export class Dropbox {

  /**
   * Конструктор
   * @param config {Object}
   */
  constructor(config) {
    this.config = config;
    this._hashTrack();
  }

  /**
   * Ссылка на хост
   * @returns {string}
   */
  get hostAPI() {
    return 'https://api.dropboxapi.com';
  }

  /**
   * Ссылка на контент
   * @returns {string}
   */
  get hostContent() {
    return 'https://content.dropboxapi.com';
  }

  /**
   * Установка токена
   * @param _token {string}
   */
  set token(_token) {
    localStorage.setItem('__db_token', _token);
  }

  /**
   * Извлечение токена
   * @returns {*}
   */
  get token() {

    const dbToken = localStorage.getItem('__db_token');
    if (dbToken) {
      return dbToken;
    } else {
      return null;
    }

  }

  /**
   * Аутентификация
   * @return {Promise}
   * @public
   */
  authenticate() {

    return new Promise((resolve, reject) => {

      const self = this;
      const clientId = this.config.appKey;
      const redirectUri = this.config.redirectUri;
      let authWindow;

      localStorage.removeItem('__db_token');

      const link = `https://www.dropbox.com/1/oauth2/authorize` +
        `?client_id=${ encodeURIComponent(clientId) }` +
        `&redirect_uri=${ encodeURIComponent(redirectUri) }` +
        `&response_type=token`;

      const windowProperties = 'location=no,toolbar=no';

      // if cordova available use InAppBrowser
      // else use location change
      if (window.cordova && typeof window.cordova === 'object' && cordova.InAppBrowser) {
        authWindow = cordova.InAppBrowser.open(link, '_blank', windowProperties);
      } else {
        authWindow = window.open(link, '_blank', windowProperties);
      }

      authWindow.addEventListener('loadstart', loadstart);

      function loadstart(e) {
        const url = e.url;

        if (url) {
          const tokenMatch = /access_token=(.+)&token_type/.exec(e.url);

          if (tokenMatch) {
            authWindow.removeEventListener('loadstart', loadstart);
            self._tokenMatch(tokenMatch, authWindow);
            resolve(self.token);
          } else {
            reject();
          }
        } else {
          reject();
        }
      }

    });

  }

  /**
   * Установка токена и закрытие окна
   * @param tokenMatch {Array}
   * @param _window {Window}
   * @private
   */
  _tokenMatch(tokenMatch, _window) {
    this.token = tokenMatch[1];
    _window.close();
  }

  /**
   * Отзыв токена
   * @returns {Promise.<T>}
   */
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

  /**
   * Загрузка файлов
   * @param path
   * @param rev
   * @returns {Promise.<T>}
   */
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

  /**
   * Выгрузка файлов
   * @param body
   * @param path
   * @param mode
   * @param autorename
   * @param client_modified
   * @param mute
   * @returns {Promise.<T>}
   */
  filesUpload(body, path, mode, autorename, client_modified, mute) {

    return this.request({
      host: this.hostContent,
      query: '/2/files/upload',
      method: 'POST',
      body,
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

  /**
   * Генерация хедеров для запроса
   * @param _headers {Object}
   * @returns {Object}
   * @private
   */
  _generateHeadersFrom(_headers = {}) {
    const accept = 'Accept';
    const authorization = 'Authorization';
    const contentType = 'Content-Type';
    const dropboxAPIArg = 'Dropbox-API-Arg';

    let headers = {};
    headers[accept] = 'application/json';
    headers[authorization] = `Bearer ${ this.token }`;

    if (_headers.type) {
      headers[contentType] = _headers.type;
    }

    if (_headers.arg) {
      headers[dropboxAPIArg] = JSON.stringify(_headers.arg);
    }

    return headers;
  }

  /**
   * Генерация тела запроса
   * @param body
   * @returns {*|null}
   * @private
   */
  _generateBodyFrom(body) {
    return body || null;
  }

  /**
   * Генерация метода запроса
   * @param method {string}
   * @returns {string}
   */
  _generateMethodFrom(method) {
    return method || 'POST';
  }

  /**
   * Генерация урла
   * @param params {Object]
   * @returns {string}
   * @private
   */
  _generateRequestURIFrom(params) {
    return `${ params.host }${ params.query }`;
  }

  /**
   * Трекинг хэша для извлечения токена
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
        window.removeEventListener('hashchange', onhashchange);
        self._tokenMatch(tokenMatch, window);
      }

    }

  }

  /**
   * Запрос
   * @param params {Object}
   * @returns {Promise.<T>}
   */
  request(params = {}) {
    const requestURI = this._generateRequestURIFrom(params);
    const method = this._generateMethodFrom(params.method);
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
