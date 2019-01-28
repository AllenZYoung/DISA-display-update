class DisaMain extends Polymer.Element {
  
    static get is() { return 'disa-main'; }
  
    get properties() {
      return {
        options: Array,
        newOptions: Array,
        newOptionsName: String,
        route: Object,
        draftEntries: Array,
        internalEntries: Array,
        publicEntries: Array
      }
    }
  
    static get observers() {
      return [
        '__routeChanged(route)',
        '__entriesChanged(draftEntries, internalEntries, publicEntries)'
      ]
    }
  
    __entriesChanged(draftEntries, internalEntries, publicEntries) {
      // this.set('unsortedDraftEntries', draftEntries);
      // this.set('unsortedInternalEntries', internalEntries);
      // this.set('unsortedPublicEntries', publicEntries);
    }
  
    constructor() {
      super();
      let self = this;
      
      // defaults
      this.set('apiHost', "http://api.disa.forkinthecode.com");
  
      // event listeners
      this.addEventListener('sign-in', function(e) {
        e.preventDefault();
        self.onSignIn(e.detail.jwt, e.detail.response);
        return false;
      });
  
      this.addEventListener('sign-out', function(e) {
        e.preventDefault();
        self.onSignOut();
        return false;
      });
  
      this.addEventListener('save-options', function(e) {
        // this check probably won't happen any more, because the entire admin page is behind a similar check
        if (!Utils.isAdmin()) {
          // There is also server-side authentication, so any client side tricks you try to do will be for naught.
          alert("You are not an admin. You cannot edit the options. If you need another choice for the options dropdown, please email Professor Fisher. In the mean time, put the desired information in the researchers' notes field.");
          return;
        }
        let newOptions = e.detail.options;
        let deduppedValues = [...new Set(newOptions)];
        newOptions = deduppedValues;
        this.set('newOptions', newOptions);
        this.set('newOptionsName', e.detail.key);
        this.$.saveOptionsAjax.generateRequest(); 
      });
  
      this.addEventListener('reload-needed', function(e) {
        e.preventDefault();
        this.loadEntries();
        return false;
      });
    }
  
    connectedCallback() {
      super.connectedCallback();
  
      this.set('signedIn', Utils.isSignedIn());
  
      let self = this;
      if (this.signedIn) {
        // validate token
        let jwt = localStorage.getItem('jwt');
        Utils.validateToken(this.apiHost + '/signin', jwt, function(validTokenResponse) {
          if (validTokenResponse.error) {
            self.onSignOut();
          } else {
            self.successfulSignin();
            self.startRefresh(validTokenResponse);
            self.loadEntries();
          }
          return;
        });
      } else {
        this.onSignOut();
      }
  
      this.$.getOptionsAjax.generateRequest();
    }
  
    draftEntriesReceived(e) {
      let response = e.detail.response;
      if (!response) {
        alert("Oh no! Something terrible went wrong. Stop all work and inform Cole ASAP!");
      } else if (response.error) {
        alert(response.error);
      } else {
        this.set('draftEntries', response);
      }
    }
  
    internalEntriesReceived(e) {
      let response = e.detail.response;
      if (!response) {
        alert("Oh no! Something terrible went wrong. Stop all work and inform Cole ASAP!");
      } else if (response.error) {
        alert(response.error);
      } else {
        this.set('internalEntries', response);
      }
    }
  
    publicEntriesReceived(e) {
      let response = e.detail.response;
      if (!response) {
        alert("Oh no! Something terrible went wrong. Stop all work and inform Cole ASAP!");
      } else if (response.error) {
        alert(response.error);
      } else {
        this.set('publicEntries', response);
      }
    }
    
    // edit this function to change the content of dropdown options card
    optionsReceived(e) {
      let response = e.detail.response;
      console.log(response);
      if (!response) {
        console.log("Oh no! Something terrible went wrong. Stop all work and inform Cole ASAP!");
      } else if (response.error) {
        console.log(response.error);
      } else { // TODO
        // console.log(response)
        console.log(response[3]['typeKindOfEnslavement']);
        let res = response[3]['typeKindOfEnslavement'];
        for (let i = 0; i < res.length; i++) {
            if (res[i] === 'Man servant') {
              res[i] = 'Servant*';
            } else if (res[i] === 'Man slave') {
              res[i] = 'Slave*';
            }
        }
        this.set('options', response);
      }
    }
  
    saveOptionsResponseReceived(e) {
      let response = e.detail.response;
      if (!response.error) {
        let clonedOptions = [];
        Utils.cloneArray(clonedOptions, this.options);
  
        let key = response.optionsName;
        for (let i = 0; i < clonedOptions.length; ++i) {
          if (Utils.__key(clonedOptions[i]) == key) {
            clonedOptions[i][key] = response.options;
            break;
          }
        }
        this.set('options', clonedOptions);
      } else {
        alert(response.error);
      }
    }
  
    __routeChanged(route) {
      if (!Utils.isSignedIn()) {
        this.onSignOut();
        return;
      }
      if (this.isInvalidRoute(route)) {
        this.set('route.path', '/dashboard');
      }
      if (route && (route.path == '/admin' || route.path.startsWith('/edit'))) {
        this.$.getOptionsAjax.generateRequest();
      }
    }
  
    loadEntries() {
      this.$.getDraftAjax.generateRequest();
      this.$.getInternalAjax.generateRequest();
      this.$.getPublicAjax.generateRequest();
    }
  
    // BEGIN Auth
    onSignIn(jwt, response) {
      this.set('signedIn', true);
      localStorage.setItem('jwt', jwt);
      localStorage.setItem('role', response.role);
      localStorage.setItem('givenName', response.givenName);
      this.successfulSignin();
      this.startRefresh(response);
      this.loadEntries();
    }
  
    successfulSignin() {
      this.set('givenName', localStorage.getItem('givenName'));
  
      this.set('headers', {
        "Authorization": `Bearer ${localStorage.getItem("jwt")}`
      });
  
      if (this.isInvalidRoute(this.route)) {
        this.set('route.path', '/dashboard');
      }
    }
  
    startRefresh(response) {
      let initialTimeout = (response.payload.exp * 1000 - new Date()) - (1000 * 60);
      if (initialTimeout < 1000 * 60) {
        initialTimeout = 0;
      }
      let self = this;
      let refresh = function() {
        let googleUser = gapi && gapi.auth2 && gapi.auth2.getAuthInstance() && gapi.auth2.getAuthInstance().currentUser.get();
        if (!googleUser) {
          console.error("No google");
          return;
        }
        googleUser.reloadAuthResponse()
        self.refreshed(googleUser);
      }
      window.setTimeout(function() {
        refresh();
        self.refresh = window.setInterval(refresh, 1000 * 60 * 55);
      }, initialTimeout); 
    }
  
    refreshed(googleUser) {
      localStorage.setItem('jwt', googleUser.getAuthResponse().id_token);
      this.successfulSignin();
    }
  
    stopRefresh() {
      this.refresh && window.clearInterval(this.refresh);
    }
  
    onSignOut() {
      this.set('signedIn', false);
      this.stopRefresh();
      Utils.clearAndSignout();
      this.set('route.path', '/');
    }
    // END auth
  
    isInvalidRoute(route) {
      return route &&
        route.path !== '/dashboard' &&
        route.path !== '/admin' &&
        !route.path.startsWith('/edit');
    }
  }
  
  window.customElements.define(DisaMain.is, DisaMain);
  
  // export the onSignIn method into global space
  function onSignIn(googleUser) {
    let id_token = googleUser.getAuthResponse().id_token;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', `http://api.disa.forkinthecode.com/signin`);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
      let response = JSON.parse(xhr.responseText);
      if (response.error) {
        alert(response.error);
        return;
      } else {
        document.getElementsByTagName('disa-main')[0].dispatchEvent(
          new CustomEvent('sign-in', {
            bubbles: false,
            detail: {
              jwt: id_token,
              response: response
            }
          })
        );
        return;
      }
    };
    xhr.send('idtoken=' + id_token);
  }
  