/**
 * Основная функция для совершения запросов
 * на сервер.
 * */
const createRequest = (options = {}) => {
    let { url, data, method, callback } = options;

    const xhr = new XMLHttpRequest;
    const formData = new FormData();
    xhr.responseType = "json";

    if (method === 'GET') {
        url = createURL(url, data);
    } else {
        for (let key in data) {
            formData.append(key, data[key]);
        }
    }

    try {
        xhr.open( method, url );
        if (method === 'GET') {
            xhr.send();
        } else {
            xhr.send( formData );
        }
    } catch ( e ) {
        // перехват сетевой ошибки
        callback( e );
    }

    xhr.addEventListener('load', () => {
		let err = null;
		if(!xhr.response.success) {
			err = xhr.response.error;
		} 

		callback(err, xhr.response);

	})
};


// формирование ссылки с подстановкой параметров для метода GET
function createURL(url, params) {
    let i = 1;
    url += '?';

    for (let key in params) {
        url += `${key}=${params[key]}`;
        if (i < Object.keys(params).length) {
            url += '&';
        }
        i++;
    }

    return url;
}
