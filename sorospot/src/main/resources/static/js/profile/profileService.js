// Simple profile service wrapper for saving profile changes
(function () {
    window.profileService = {
        async saveProfile(payload) {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': window.SOROSPOT_CURRENT_USER_EMAIL
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const text = await res.text();
                const err = new Error(text || ('Status ' + res.status));
                err.status = res.status;
                throw err;
            }

            return res.json();
        }
        ,
        async uploadPhoto(file) {
            const fd = new FormData();
            fd.append('image', file);

            const res = await fetch('/api/profile/photo', {
                method: 'POST',
                headers: {
                    'X-User-Email': window.SOROSPOT_CURRENT_USER_EMAIL
                },
                body: fd
            });

            if (!res.ok) {
                const text = await res.text();
                const err = new Error(text || ('Status ' + res.status));
                err.status = res.status;
                throw err;
            }

            return res.json();
        }
    };
})();
