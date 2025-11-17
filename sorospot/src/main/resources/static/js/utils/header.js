document.addEventListener('DOMContentLoaded', function () {
  try {
    const path = window.location.pathname || '';
    const searchBar = document.querySelector('.searchBar');
    const centerBtn = document.getElementById('centerBtn');
    const myPinsBtn = document.getElementById('myPinsBtn');
    const accountBtn = document.getElementById('accountBtn');
    

    // Only adjust when on /mapa
    if (path.startsWith('/perfil')) {
      // hide search input / navbar area but keep buttons visible
      if (searchBar) searchBar.style.display = 'none';

      // ensure any disabled attributes are removed so buttons become clickable
      try {
        if (centerBtn) centerBtn.disabled = false;
      } catch (e) {}
      try {
        if (myPinsBtn) myPinsBtn.disabled = false;
      } catch (e) {}
      // also enable search input/button if present (harmless even if hidden)
      try {
        const addr = document.getElementById('address');
        if (addr) addr.disabled = false;
      } catch (e) {}
      try {
        const sbtn = document.getElementById('searchBtn');
        if (sbtn) sbtn.disabled = false;
      } catch (e) {}

      // centerBtn should act as "Ir ao Mapa" (navigate to /mapa)
      if (centerBtn) {
        centerBtn.innerHTML = 'Ir ao Mapa <span class="material-symbols-outlined" id="locationIcon">map</span>';
        centerBtn.onclick = function () {
          window.location.href = '/mapa';
        };
      }

      // accountBtn becomes logout
      if (accountBtn) {
        accountBtn.innerHTML = 'Sair <span class="material-symbols-outlined" id="accountIcon">logout</span>';
        accountBtn.onclick = function () {
          window.location.href = '/logout';
        };
      }

      // myPinsBtn should open the My Pins modal if that function exists (map page defines openMyPinsModal)
      if (myPinsBtn) {
        myPinsBtn.onclick = function (ev) {
          ev.preventDefault();
          if (typeof openMyPinsModal === 'function') {
            openMyPinsModal();
          } else {
            // fallback: try to trigger click on any element that may open the modal
            const fallback = document.getElementById('openMyPins');
            if (fallback) fallback.click();
          }
        };
      }

      
    }
  } catch (e) {
    // silent
    console.error('header.js error', e);
  }
});
