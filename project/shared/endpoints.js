(function() {
  var apiConfig = {
    "resource": {
      "version": "1.0",
      
      "endpoints": [
        {
          "name": "getUserProfile",
          "method": "GET",
          "url": "/api/v1/user/profile",
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer {{token}}"
          }
        },
        {
          "name": "updateUserProfile", 
          "method": "PUT",
          "url": "/api/v1/user/profile",
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer {{token}}"
          }
        },
        {
          "name": "getProducts",
          "method": "GET", 
          "url": "/api/v1/products",
          "params": {
            "page": "1",
            "limit": "10",
            "category": "{{category}}"
          }
        },
        {
          "name": "createOrder",
          "method": "POST",
          "url": "/api/v1/orders",
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer {{token}}"
          }
        },
        {
          "name": "getOrderStatus",
          "method": "GET",
          "url": "/api/v1/orders/{{orderId}}/status",
          "headers": {
            "Authorization": "Bearer {{token}}"
          }
        },
        {
          "name": "uploadFile",
          "method": "POST",
          "url": "/api/v1/files/upload",
          "headers": {
            "Authorization": "Bearer {{token}}"
          },
          "contentType": "multipart/form-data"
        },
        {
          "name": "searchContent",
          "method": "GET",
          "url": "/api/v1/search",
          "params": {
            "q": "{{query}}",
            "type": "{{searchType}}",
            "page": "1"
          }
        }
      ],

      "functions": [
        {
          "name": "getBaseUrl",
          "execute": function() {
            return window.location.protocol + '//' + window.location.host;
          }
        },
        {
          "name": "getAuthToken", 
          "execute": function() {
            return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
          }
        },
        {
          "name": "getUserAgent",
          "execute": function() {
            return navigator.userAgent;
          }
        },
        {
          "name": "getCurrentUrl",
          "execute": function() {
            return window.location.href;
          }
        },
        {
          "name": "getQueryParam",
          "execute": function(paramName) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(paramName);
          }
        },
        {
          "name": "interpolateTemplate",
          "execute": function(template, variables) {
            return template.replace(/\{\{(\w+)\}\}/g, function(match, key) {
              return variables[key] || match;
            });
          }
        }
      ]
    }
  };

  function ApiLoader() {
    this.config = apiConfig;
    this.baseUrl = this.executeFunction('getBaseUrl');
  }

  ApiLoader.prototype.executeFunction = function(functionName, ...args) {
    const func = this.config.resource.functions.find(f => f.name === functionName);
    return func ? func.execute.apply(this, args) : null;
  };

  ApiLoader.prototype.getEndpoint = function(name) {
    return this.config.resource.endpoints.find(endpoint => endpoint.name === name);
  };

  ApiLoader.prototype.buildUrl = function(endpoint, variables = {}) {
    variables = variables || {};
    let url = this.baseUrl + endpoint.url;
    
    url = this.executeFunction('interpolateTemplate', url, variables);
    
    if (endpoint.params) {
      const params = new URLSearchParams();
      for (let key in endpoint.params) {
        let value = endpoint.params[key];
        value = this.executeFunction('interpolateTemplate', value, variables);
        if (value && !value.includes('{{')) {
          params.append(key, value);
        }
      }
      if (params.toString()) {
        url += '?' + params.toString();
      }
    }
    
    return url;
  };

  ApiLoader.prototype.buildHeaders = function(endpoint, variables = {}) {
    const headers = {};
    
    if (endpoint.headers) {
      for (let key in endpoint.headers) {
        let value = endpoint.headers[key];
        
        if (value.includes('{{token}}')) {
          const token = this.executeFunction('getAuthToken');
          value = value.replace('{{token}}', token || '');
        }
        
        value = this.executeFunction('interpolateTemplate', value, variables);
        
        if (value && !value.includes('{{')) {
          headers[key] = value;
        }
      }
    }
    
    return headers;
  };

  ApiLoader.prototype.call = function(endpointName, options = {}) {
    const endpoint = this.getEndpoint(endpointName);
    if (!endpoint) {
      return Promise.reject(new Error(`Endpoint '${endpointName}' not found`));
    }

    const { variables = {}, data = null, ...fetchOptions } = options;
    
    const url = this.buildUrl(endpoint, variables);
    const headers = this.buildHeaders(endpoint, variables);

    const requestConfig = {
      method: endpoint.method,
      headers: headers,
      ...fetchOptions
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase())) {
      if (endpoint.contentType !== 'multipart/form-data') {
        requestConfig.body = JSON.stringify(data);
      } else {
        delete headers['Content-Type'];
        requestConfig.body = data;
      }
    }

    return fetch(url, requestConfig)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error(`API call failed for ${endpointName}:`, error);
        throw error;
      });
  };
  window.apiLoader = new ApiLoader();
