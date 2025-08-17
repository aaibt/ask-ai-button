"use strict";

(function(){
  const init = () => {
    const isMobile = window.innerWidth < 600;
    
    // Get configs
    const projectId = window.aaibSettings.id;
    const development = window.aaibSettings.development || false;
    const opened = window.aaibSettings.opened || window.location.hash.includes('aaib');
    
    const iframeBaseUrl = development ? 'http://localhost:6890/' : 'https://aaib-embed-app.vercel.app/';
  
    // Add button
    const buttonDiv = document.createElement('div');
    buttonDiv.className = `aaib aaib-dark`;
    buttonDiv.style.position = 'fixed';
    buttonDiv.style.right = '5%';
    buttonDiv.style.bottom = '0';
    buttonDiv.style.zIndex = '9999';
    document.body.appendChild(buttonDiv);

    // Create iframe
    var iframe = document.createElement('iframe');
    iframe.allowTransparency = true;
    iframe.src = `${iframeBaseUrl}/${projectId}`;
    iframe.style.maxWidth = '100%';
    iframe.style.maxHeight = '100%';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.frameBorder = 'none';
    iframe.style.zIndex = 1000001;
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.right = `0`;
    iframe.style.bottom = `0`;
    iframe.style.backgroundColor = 'transparent';
    iframe.style.display = 'none';
    iframe.style.borderRadius = '0';
    iframe.style.border = '0px';
    iframe.style.colorScheme = 'light';
    document.body.appendChild(iframe);

    let originalBodyOverflow = document.body.style.overflow;
    
    // Create global state
    window['aaib_' + projectId] = {
      state: {
        opened: false
      },

      openComponent (params = {}) {
        aaibObj.state.opened = true;
        sendCommand('openComponent');
        iframe.style.display = 'block';
        buttonDiv.style.display = 'none';

        if (isMobile) {
          document.body.style.overflow = 'hidden';
        }

        if (window.plausible) {
          window.plausible('open_docs_chat');
          console.debug('open_docs_chat');
        }
      },

      closeComponent() {
        aaibObj.state.opened = false;
        sendCommand('closeComponent');
        iframe.style.display = 'none';
        buttonDiv.style.display = 'block';

        if (isMobile) {
          document.body.style.overflow = originalBodyOverflow;
        }
      }
    };
    const aaibObj = window['aaib_' + projectId];
    window.openChat = aaibObj.openComponent;
    window.closeChat = aaibObj.closeComponent;
    window.createButtons = createButtons;
  
    const sendCommand = (command, payload) => {
      iframe.contentWindow.postMessage(JSON.stringify({ 
        command, 
        payload: payload ? JSON.stringify(payload) : '{}' 
      }), '*');
    }
  
    // Set handlers
    window.addEventListener('message', function(event) {
      try {
        const { command, payload: rawPayload, projectId: messageProjectId } = JSON.parse(event.data);
        const payload = rawPayload ? JSON.parse(rawPayload) : {};
  
        console.log(`event`, command, payload, messageProjectId);
  
        if (messageProjectId != projectId) {
          return;
        }
        
        if (command === 'openComponent') {
          aaibObj.openComponent();
        } else if (command === 'closeComponent') {
          aaibObj.closeComponent();
        } else if (command === 'handleSendMessage') {
          if (window.plausible) {
            window.plausible('activate_docs_chat');
            console.debug('activate_docs_chat');
          }
        }
      } catch(err) {}
    });

    // Create buttons in containers with class="aaib"
    function createButtons() {
      [buttonDiv].forEach(container => {
        // Get all class names that container has
        const inDarkMode = document.documentElement.classList.contains('dark');
        
        // Remove existing button if it exists
        if (container.querySelector('.aaib-button')) {
          console.debug('Removing existing button', inDarkMode);
          container.querySelector('.aaib-button').remove();
        }
        
        // Create button
        const button = document.createElement('button');
        button.className = 'aaib-button';
        button.textContent = 'Ask AI';

        const iconSvg = `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 64 64" width="64px" height="64px"><path fill="#da7f62" d="M 26.222656 3.8691406 C 25.308656 3.8691406 24.394656 4.3789844 23.972656 5.3964844 L 21.697266 10.878906 C 19.732266 15.613906 16.068844 19.3935 11.464844 21.4375 L 5.4746094 24.097656 C 3.5086094 24.969656 3.5086094 27.828172 5.4746094 28.701172 L 11.658203 31.447266 C 16.146203 33.439266 19.745141 37.083109 21.744141 41.662109 L 23.990234 46.808594 C 24.530234 48.044844 25.802187 48.508281 26.890625 48.199219 C 27.543688 48.013781 28.131078 47.550344 28.455078 46.808594 L 30.701172 41.662109 C 32.700172 37.083109 36.298109 33.439266 40.787109 31.447266 L 46.970703 28.701172 C 47.462203 28.483172 47.830422 28.142672 48.076172 27.738281 C 48.199047 27.536086 48.292078 27.317299 48.353516 27.091797 C 48.414953 26.866295 48.445312 26.633672 48.445312 26.400391 C 48.445312 26.167109 48.414953 25.932564 48.353516 25.707031 C 48.169203 25.030432 47.707953 24.425031 46.970703 24.097656 L 40.980469 21.4375 C 36.376469 19.3935 32.713047 15.613906 30.748047 10.878906 L 28.472656 5.3964844 C 28.050656 4.3789844 27.136656 3.8691406 26.222656 3.8691406 z M 49.75 39.640625 C 49.26 39.640625 48.770922 39.913484 48.544922 40.458984 L 47.894531 42.023438 C 46.787531 44.693438 44.722953 46.825516 42.126953 47.978516 L 40.289062 48.794922 C 39.237062 49.261922 39.237063 50.791766 40.289062 51.259766 L 42.234375 52.125 C 44.765375 53.25 46.795875 55.304719 47.921875 57.886719 L 48.552734 59.335938 C 48.842109 59.998438 49.523857 60.245703 50.107422 60.080078 C 50.457561 59.980703 50.772062 59.733438 50.945312 59.335938 L 51.578125 57.886719 C 52.704125 55.304719 54.732672 53.25 57.263672 52.125 L 59.210938 51.259766 C 59.474187 51.143016 59.671109 50.960563 59.802734 50.744141 C 59.868547 50.63593 59.918266 50.519115 59.951172 50.398438 C 60.016984 50.157082 60.016984 49.899621 59.951172 49.658203 C 59.885359 49.416785 59.752125 49.190699 59.554688 49.015625 C 59.455969 48.928088 59.342562 48.853422 59.210938 48.794922 L 57.373047 47.978516 C 56.399547 47.545766 55.500857 46.975572 54.699219 46.291016 C 54.432006 46.06283 54.174469 45.823031 53.929688 45.570312 C 53.195344 44.812156 52.566889 43.945994 52.064453 42.998047 C 51.896975 42.682064 51.743844 42.357062 51.605469 42.023438 L 50.955078 40.458984 C 50.729078 39.913484 50.24 39.640625 49.75 39.640625 z"/></svg>
        `)}`;

        const defaultBackgroundColor = inDarkMode ? '#28282d' : '#444343';
        const defaultBackgroundHoverColor = inDarkMode ? '#2e2e33' : '#363636';
        
        // Style the button
        button.style.background = `url(${iconSvg}) no-repeat left 12px top 12px`;
        button.style.backgroundSize = '16px 16px, cover';
        button.style.backgroundColor = defaultBackgroundColor;
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.padding = '8px 12px 8px 36px';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        button.style.cursor = 'pointer';
        button.style.borderRadius = '7px 7px 0 0';
        button.style.transition = '0.2s';
        
        // Add hover effect
        button.addEventListener('mouseenter', () => {
          button.style.backgroundColor = defaultBackgroundHoverColor;
          button.style.paddingBottom = '10px';
        });
        button.addEventListener('mouseleave', () => {
          button.style.backgroundColor = defaultBackgroundColor;
          button.style.paddingBottom = '8px';
        });
        
        // Add click handler
        button.addEventListener('click', () => {
          aaibObj.openComponent();
        });
        
        // Append button to container
        container.appendChild(button);
      });
    };

    // Create buttons
    createButtons();

    // Also watch for new containers being added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.classList && node.classList.contains('aaib')) {
                createButtons();
              }
              // Also check children
              const childContainers = node.querySelectorAll('.aaib');
              if (childContainers.length > 0) {
                createButtons();
              }
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Observer for dark mode changes
    const darkModeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // Check if the 'dark' class was added or removed
          const oldClassList = mutation.oldValue ? mutation.oldValue.split(' ') : [];
          const newClassList = mutation.target.classList;
          
          const hadDark = oldClassList.includes('dark');
          const hasDark = newClassList.contains('dark');
          
          if (hadDark !== hasDark) {
            console.debug('Dark mode changed:', hasDark ? 'enabled' : 'disabled');
            createButtons();
          }
        }
      });
    });

    // Start observing the html element for class changes
    darkModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['class']
    });
  
    if (opened) {
      setTimeout(() => {
        aaibObj.openComponent();
      }, 1000);
    }
  };

  // Run everything after DOM is ready
  const runWhenReady = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runWhenReady);
    } else {
      // Repeatably check aaibSettings
      if (!window.aaibSettings) {
        const checkingInterval = setInterval(() => {
          if (window.aaibSettings) {
            clearInterval(checkingInterval);
            init();
          }
        }, 1000);
        return;
      }
      init();
    }
  };

  runWhenReady();
})();