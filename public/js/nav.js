// This is a Model-View-Controller -structured approach to 
// building a responsive site navigation generated from 
// JSON content. 
//
// After the view renders initially, user interactions
// rely on the value of model.navState
//
// kate edmundson 3/18/15

(function () {

  var model = { 

    navUrl: '/api/nav.json',

    navState: 'inactive',

    init: function() {
      this.getNavData();
    },

    getNavData: function() {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {
            // Success
            var result = JSON.parse(this.responseText);
            // Send JSON to the controller to deal with.
            controller.parseData(result.items);
          } else {
            console.log('Error retrieving data.');
          }
        }
      }
      request.open('GET', this.navUrl, true);
      request.send();
    }

  };

  var controller = {

    init: function() {
      model.init();
      view.init();
    },

    parseData: function(items) {
      // Make a fragment to hold all the contents of the nav.
      var outerUlFrag = document.createDocumentFragment(),
          li;

      for (var i = 0; i < items.length; i++) {
        // For each primary nav item, go create a <li> with all
        // the right bells and whistles. Then add it to the fragment. 
        li = this.liFactory(items[i]);
        outerUlFrag.appendChild(li);
      }
      // Send the finished fragment to the view.
      view.render(outerUlFrag);
    },

    liFactory: function(item) {
      var li = document.createElement('li'),
          a = document.createElement('a'),
          text = document.createTextNode(item.label),
          innerUl;

      // If this item is on the primary menu level and it has sub-items,
      // add a special class + state. Then go make the secondary menu.
      if (item.items && item.items.length) {
        li.setAttribute('class', 'has-menu');
        li.setAttribute('data-state', 'inactive');
        innerUl = this.innerUlFactory(item);
        li.appendChild(innerUl);
      }

      a.setAttribute('href', item.url);
      a.appendChild(text);
      li.insertBefore(a, li.childNodes[0]);
      return li;
    },

    innerUlFactory: function(item) {
      var innerUl = document.createElement('ul'),
          innerLi;

      for (var j = 0; j < item.items.length; j++) {
        // Put each item of this sub-menu thru the same <li> creation steps.
        innerLi = this.liFactory(item.items[j]);
        innerUl.appendChild(innerLi);
      }
      return innerUl;
    },

    getState: function() {
      return model.navState;
    },

    setState: function(state) {
      if (this.getState !== state) {
        model.navState = state;
      }
      return model.navState;
    },

    toggleState: function() {
      model.navState = model.navState === 'inactive' ? 'active' : 'inactive';
      return model.navState;
    }

  };

  var view = {

    init: function() {
      SELF = this;
      SELF.navListEl = document.getElementById('primary-nav');
      SELF.toggleEl = document.getElementById('toggle-nav');
      SELF.navSelector = 'body > nav';
      SELF.navEl = document.querySelector(SELF.navSelector);
      SELF.maskEl = document.getElementById('mask');

      SELF.toggleEl.addEventListener('click', SELF.toggleNav);
      SELF.maskEl.addEventListener('click', SELF.closeAllNavs);
    },

    render: function(frag) {
      SELF.navListEl.appendChild(frag);
      // Now that navListEl is populated, find the sub-menus and listen for clicks:
      SELF.subNavEls = document.querySelectorAll('.has-menu > a');
      SELF.listenForSubNavs();
    },

    setNavAttr: function(state) {
      SELF.navEl.setAttribute('data-state', state);
    },

    listenForSubNavs: function() {
      // Add an event listener for every nav item that has a sub-menu.
      for (var i = 0; i < SELF.subNavEls.length; i++) {
        SELF.subNavEls[i].addEventListener('click', function(e) {
          if (screen.width >= 768) {
            // On desktop view, set the main navState to active when a
            // sub-menu-containing item is clicked. 
            SELF.setNavAttr(controller.setState('active'));
          }
          SELF.toggleSubNav(e);
        });
      }
    },

    toggleNav: function(e) {
      e.preventDefault();
      SELF.setNavAttr(controller.toggleState());
    },

    toggleSubNav: function(e) {
      // Open this sub-menu or close it if it's open.
      e.preventDefault();
      if (e.target.parentNode.getAttribute('data-state') === 'active') {
        // It's open; close it.
        e.target.parentNode.setAttribute('data-state', 'inactive');
      } else {
        // It's closed; close the others and open this one.
        SELF.closeSubNavs();
        e.target.parentNode.setAttribute('data-state', 'active');
      }
    },

    closeAllNavs: function(e) {
      SELF.setNavAttr(controller.setState('inactive'));
      SELF.closeSubNavs();
    },

    closeSubNavs: function() {
      for (var i = 0; i < SELF.subNavEls.length; i++) {
        SELF.subNavEls[i].parentNode.setAttribute('data-state', 'inactive');
      }
    }

  };

  controller.init();

})();
