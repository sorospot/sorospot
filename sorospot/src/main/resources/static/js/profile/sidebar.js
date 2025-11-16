document.addEventListener('DOMContentLoaded', function () {
    const openStatsBtn = document.getElementById('openStats');
    const backBtn = document.getElementById('backToDetails');
    const openActions = document.getElementById('openActions');
    const userName = document.getElementById('userName');
    const userCPF = document.getElementById('userCPF');
    const userEmail = document.getElementById('userEmail');
    const userTelephone = document.getElementById('userTelephone');
    // wrapper element for edit buttons (kept for future use if needed)
    // const btnEditProfile = document.getElementById('btnEditProfile');
    const statsPanel = document.querySelector('.stats-panel');
    const actionsPanel = document.querySelector('.actions-panel');
    const profilePhoto = document.querySelector('.profile-photo');

    // Add photo edit UI: overlay pencil icon and hidden file input (hidden until edit mode)
    let photoInput = null;
    let editIcon = null;
    if (profilePhoto) {
        profilePhoto.style.position = 'relative';
        editIcon = document.createElement('button');
        editIcon.type = 'button';
        editIcon.className = 'photo-edit-icon';
        editIcon.title = 'Alterar foto de perfil';
        editIcon.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        editIcon.style.position = 'absolute';
        editIcon.style.right = '8px';
        editIcon.style.bottom = '4px'; // a bit lower
        editIcon.style.background = 'var(--primary, #1a73e8)';
        editIcon.style.color = 'white';
        editIcon.style.border = 'none';
        editIcon.style.borderRadius = '50%';
        editIcon.style.width = '40px';
        editIcon.style.height = '40px';
        editIcon.style.display = 'none'; // hidden until edit mode
        editIcon.style.alignItems = 'center';
        editIcon.style.justifyContent = 'center';
        editIcon.style.cursor = 'pointer';
        editIcon.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';

        photoInput = document.createElement('input');
        photoInput.type = 'file';
        photoInput.accept = 'image/*';
        photoInput.style.display = 'none';

        editIcon.addEventListener('click', function (ev) {
            ev.preventDefault();
            photoInput.click();
        });

        profilePhoto.appendChild(editIcon);
        profilePhoto.appendChild(photoInput);

        photoInput.addEventListener('change', async function (ev) {
            const f = photoInput.files && photoInput.files[0];
            if (!f) return;
            if (!window.profileService || !window.profileService.uploadPhoto) {
                return alert('Serviço de upload indisponível');
            }
            try {
                editIcon.disabled = true;
                editIcon.style.opacity = '0.7';
                const res = await window.profileService.uploadPhoto(f);
                if (res && res.photo) {
                    // update image src
                    const img = profilePhoto.querySelector('img');
                    if (img) img.src = '/images/' + res.photo;
                    try { window.SOROSPOT_CURRENT_USER_PHOTO = res.photo; } catch (e) {}
                    alert('Foto atualizada com sucesso');
                }
            } catch (e) {
                const msg = (e && e.message) ? e.message : e;
                alert('Erro ao enviar imagem: ' + msg);
            } finally {
                editIcon.disabled = false;
                editIcon.style.opacity = '1';
                photoInput.value = '';
            }
        });
    }

    function showStats() {
        if (userName) userName.style.display = 'none';
        if (userCPF) userCPF.style.display = 'none';
        if (userEmail) userEmail.style.display = 'none';
        if (userTelephone) userTelephone.style.display = 'none';
        if (profilePhoto) profilePhoto.style.display = 'none';
        if (btnEditProfile) btnEditProfile.style.display = 'none';
        if (actionsPanel) actionsPanel.style.display = 'none';
        if (statsPanel) statsPanel.style.display = 'flex';
    }

    function showDetails() {
        if (userName) userName.style.display = '';
        if (userCPF) userCPF.style.display = '';
        if (userEmail) userEmail.style.display = '';
        if (userTelephone) userTelephone.style.display = '';
        if (profilePhoto) profilePhoto.style.display = '';
        if (btnEditProfile) btnEditProfile.style.display = '';
        if (statsPanel) statsPanel.style.display = '';
        if (actionsPanel) actionsPanel.style.display = 'none';
    }

    function showActions() {
        if (userName) userName.style.display = 'none';
        if (userCPF) userCPF.style.display = 'none';
        if (userEmail) userEmail.style.display = 'none';
        if (userTelephone) userTelephone.style.display = 'none';
        if (profilePhoto) profilePhoto.style.display = 'none';
        if (btnEditProfile) btnEditProfile.style.display = 'none';
        if (statsPanel) statsPanel.style.display = 'none';
        if (actionsPanel) actionsPanel.style.display = 'flex';
    }

    if (openStatsBtn) openStatsBtn.addEventListener('click', showStats);
    if (backBtn) backBtn.addEventListener('click', showDetails);
    if (openActions) openActions.addEventListener('click', showActions);

    // If the profile page has the 'Meus Pins' stat-card, wire it to open the modal.
    const openMyPinsCard = document.getElementById('openMyPins');
    if (openMyPinsCard) {
        openMyPinsCard.addEventListener('click', function (ev) {
            ev.preventDefault();
            // Prefer existing global implementation (map.js defines openMyPinsModal)
            if (typeof openMyPinsModal === 'function') {
                openMyPinsModal();
                return;
            }

            // Fallback: open the modal and load items (lightweight, same API as map.js)
            const modal = document.getElementById('myPinsModal');
            const list = document.getElementById('myPinsList');
            if (!modal || !list) {
                // As a last resort, trigger header button click which may be wired elsewhere
                const headerBtn = document.getElementById('myPinsBtn');
                if (headerBtn) headerBtn.click();
                return;
            }

            list.innerHTML = 'Carregando...';
            modal.classList.toggle('open');
            fetch('/api/maps/my-occurrences', {
                headers: { 'X-User-Email': window.SOROSPOT_CURRENT_USER_EMAIL },
            })
                .then((r) => r.json())
                .then((arr) => {
                    if (!arr || !arr.length) {
                        list.innerHTML = '<div>Nenhum pin encontrado</div>';
                        return;
                    }
                    list.innerHTML = '';
                    arr.forEach((item) => {
                        const row = document.createElement('div');
                        row.style.display = 'flex';
                        row.style.justifyContent = 'space-between';
                        row.style.alignItems = 'center';
                        row.style.padding = '6px 0';

                        const title = document.createElement('div');
                        const strong = document.createElement('strong');
                        strong.textContent = item.title || 'Sem título';
                        title.appendChild(strong);
                        if (item.description) {
                            const desc = document.createElement('div');
                            desc.style.fontSize = '0.9em';
                            desc.textContent = item.description;
                            title.appendChild(desc);
                        }

                        const actions = document.createElement('div');
                        actions.style.display = 'flex';
                        actions.style.gap = '6px';

                        const del = document.createElement('button');
                        del.textContent = 'Excluir';
                        del.addEventListener('click', function () {
                            if (!confirm('Confirma excluir este pin?')) return;
                            fetch('/api/maps/markers/' + item.id, {
                                method: 'DELETE',
                                headers: { 'X-User-Email': window.SOROSPOT_CURRENT_USER_EMAIL },
                            }).then((r) => {
                                if (r.status === 204) {
                                    // refresh by re-clicking
                                    openMyPinsCard.click();
                                } else r.text().then((t) => alert('Erro: ' + t));
                            });
                        });

                        const goto = document.createElement('button');
                        goto.textContent = 'Ir para';
                        goto.addEventListener('click', function () {
                            // Redirect to mapa where map.js will handle focusing if needed
                            window.location.href = '/mapa';
                        });

                        actions.appendChild(del);
                        actions.appendChild(goto);

                        row.appendChild(title);
                        row.appendChild(actions);
                        list.appendChild(row);
                    });
                })
                .catch((e) => {
                    list.innerHTML = 'Erro: ' + e;
                });
        });
    }

    // Profile edit mode
    const editBtn = document.getElementById('editProfileBtn');
    const pwdBtn = document.getElementById('passwordBtn');
    const infoRows = {
        name: document.getElementById('userName'),
        email: document.getElementById('userEmail'),
        cpf: document.getElementById('userCPF'),
        telephone: document.getElementById('userTelephone')
    };

    let editing = false;

    function toInput(row, key) {
        if (!row) return;
        const p = row.querySelector('p');
        if (!p) return;
        const val = p.textContent.trim();
        const input = document.createElement('input');
        input.type = 'text';
        input.value = val;
        input.className = 'profile-input';
        input.dataset.original = val;
        // name and email and telephone editable; cpf handled separately
        row.replaceChild(input, p);
    }

    function toText(row) {
        if (!row) return;
        const input = row.querySelector('input.profile-input');
        if (!input) return;
        const p = document.createElement('p');
        p.textContent = input.value;
        row.replaceChild(p, input);
    }

    function enableEditMode() {
        if (!infoRows.name) return;
        editing = true;
        // convert fields to inputs except CPF
        toInput(infoRows.name);
        toInput(infoRows.email);
        // cpf - visually mark as readonly
        if (infoRows.cpf) {
            const p = infoRows.cpf.querySelector('p');
            if (p) p.title = 'CPF não pode ser editado';
        }
        toInput(infoRows.telephone);

        // change buttons
        if (editBtn) {
            editBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Salvar';
            editBtn.classList.add('saving');
        }
        if (pwdBtn) {
            pwdBtn.innerHTML = '<span class="material-symbols-outlined">close</span> Cancelar';
            pwdBtn.classList.add('cancel');
        }
        // show photo edit icon when editing
        try { if (typeof editIcon !== 'undefined' && editIcon) editIcon.style.display = 'flex'; } catch (e) {}
    }

    function disableEditMode(restore) {
        editing = false;
        // revert inputs back to texts
        if (infoRows.name) {
            if (restore) {
                const inp = infoRows.name.querySelector('input.profile-input');
                if (inp) inp.value = inp.dataset.original || '';
            }
            toText(infoRows.name);
        }
        if (infoRows.email) {
            if (restore) {
                const inp = infoRows.email.querySelector('input.profile-input');
                if (inp) inp.value = inp.dataset.original || '';
            }
            toText(infoRows.email);
        }
        if (infoRows.telephone) {
            if (restore) {
                const inp = infoRows.telephone.querySelector('input.profile-input');
                if (inp) inp.value = inp.dataset.original || '';
            }
            toText(infoRows.telephone);
        }
        // restore cpf title
        if (infoRows.cpf) {
            const p = infoRows.cpf.querySelector('p');
            if (p) p.title = '';
        }

        if (editBtn) {
            editBtn.innerHTML = '<span class="material-symbols-outlined">edit</span> Alterar Cadastro';
            editBtn.classList.remove('saving');
        }
        if (pwdBtn) {
            pwdBtn.innerHTML = '<span class="material-symbols-outlined">key</span> Redefinir Senha';
            pwdBtn.classList.remove('cancel');
        }
        // hide photo edit icon when not editing
        try { if (typeof editIcon !== 'undefined' && editIcon) editIcon.style.display = 'none'; } catch (e) {}
    }

    async function saveProfile() {
        // collect values and only send changed ones
        const payload = {};
        const nameInput = infoRows.name && infoRows.name.querySelector('input.profile-input');
        const emailInput = infoRows.email && infoRows.email.querySelector('input.profile-input');
        const telInput = infoRows.telephone && infoRows.telephone.querySelector('input.profile-input');

        if (nameInput && nameInput.value !== nameInput.dataset.original) payload.name = nameInput.value.trim();
        if (emailInput && emailInput.value !== emailInput.dataset.original) payload.email = emailInput.value.trim();
        if (telInput && telInput.value !== telInput.dataset.original) payload.telephone = telInput.value.trim();

        if (Object.keys(payload).length === 0) {
            disableEditMode(false);
            return;
        }

        try {
            // delegate to profileService wrapper
            if (!window.profileService || !window.profileService.saveProfile) {
                throw new Error('Serviço indisponível');
            }

            const updated = await window.profileService.saveProfile(payload);

            // close edit mode (this will convert inputs back to text)
            disableEditMode(false);

            // apply updated values to DOM (if present)
            if (updated.name && infoRows.name) {
                const p = infoRows.name.querySelector('p'); if (p) p.textContent = updated.name;
            }
            if (updated.email && infoRows.email) {
                const p = infoRows.email.querySelector('p'); if (p) p.textContent = updated.email;
                // if email changed, update global var so subsequent calls use correct value
                window.SOROSPOT_CURRENT_USER_EMAIL = updated.email;
            }
            if (updated.telephone && infoRows.telephone) {
                const p = infoRows.telephone.querySelector('p'); if (p) p.textContent = updated.telephone;
            }

            alert('Dados salvos com sucesso');
            // after finishing editing, log the user out as requested
            try {
                window.location.href = '/logout';
            } catch (e) {
                console.warn('Não foi possível redirecionar para logout', e);
            }
        } catch (e) {
            const msg = (e && e.message) ? e.message : e;
            alert('Erro ao salvar: ' + msg);
        }
    }

    if (editBtn) {
        editBtn.addEventListener('click', function (ev) {
            ev.preventDefault();
            if (!editing) {
                enableEditMode();
            } else {
                // save
                saveProfile();
            }
        });
    }

    if (pwdBtn) {
        pwdBtn.addEventListener('click', function (ev) {
            ev.preventDefault();
            if (!editing) {
                // open change password modal
                openChangePasswordModal();
            } else {
                // cancel edit
                if (confirm('Cancelar alterações?')) {
                    disableEditMode(true);
                }
            }
        });
    }

    // Change password modal handling
    function openChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (!modal) return alert('Modal de senha indisponível');
        modal.classList.add('open');

        const form = document.getElementById('changePwdForm');
        const cancel = document.getElementById('cancelChangePwd');

        const submitHandler = async function (ev) {
            ev.preventDefault();
            const pwd = document.getElementById('changePwd').value || '';
            const conf = document.getElementById('changePwdConfirm').value || '';

            // clear previous errors
            const errBox = document.getElementById('changePwdErrors');
            const errList = document.getElementById('changePwdErrorsList');
            if (errList) errList.innerHTML = '';
            if (errBox) errBox.style.display = 'none';

            const errors = [];
            if (!pwd) errors.push('A senha é obrigatória');
            if (!conf) errors.push('A confirmação de senha é obrigatória');
            if (pwd && pwd.length < 6) errors.push('A senha deve ter pelo menos 6 caracteres');
            if (pwd && pwd !== conf) errors.push('As senhas não coincidem');
            // check strength: at least one upper, one lower, one digit
            if (pwd && pwd.length >= 6) {
                const hasUpper = /[A-Z]/.test(pwd);
                const hasLower = /[a-z]/.test(pwd);
                const hasDigit = /[0-9]/.test(pwd);
                if (!(hasUpper && hasLower && hasDigit)) {
                    errors.push('A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número');
                }
            }

            if (errors.length > 0) {
                if (errBox && errList) {
                    errList.innerHTML = errors.map(e=>'<li>'+e+'</li>').join('');
                    errBox.style.display = '';
                } else {
                    alert(errors.join('\n'));
                }
                return;
            }

            try {
                const res = await fetch('/api/profile/password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Email': window.SOROSPOT_CURRENT_USER_EMAIL
                    },
                    body: JSON.stringify({ password: pwd, confirmPassword: conf })
                });

                if (!res.ok) {
                    // try to parse JSON array of errors or plain text
                    let text = await res.text();
                    try {
                        const parsed = JSON.parse(text);
                        if (Array.isArray(parsed)) {
                            if (errBox && errList) {
                                errList.innerHTML = parsed.map(e=>'<li>'+e+'</li>').join('');
                                errBox.style.display = '';
                            } else alert(parsed.join('\n'));
                            return;
                        }
                    } catch (e) {
                        // not JSON
                    }
                    throw new Error(text || ('Status ' + res.status));
                }

                alert('Senha atualizada com sucesso');
                modal.classList.remove('open');
            } catch (e) {
                const msg = (e && e.message) ? e.message : e;
                if (errBox && errList) {
                    errList.innerHTML = '<li>' + msg + '</li>';
                    errBox.style.display = '';
                } else {
                    alert('Erro ao alterar senha: ' + msg);
                }
            }
        };

        const cancelHandler = function () {
            // hide modal and clear handlers/fields/errors
            modal.classList.remove('open');
            form.removeEventListener('submit', submitHandler);
            cancel.removeEventListener('click', cancelHandler);
            // clear fields
            document.getElementById('changePwd').value = '';
            document.getElementById('changePwdConfirm').value = '';
            // clear errors box
            const errBox = document.getElementById('changePwdErrors');
            const errList = document.getElementById('changePwdErrorsList');
            if (errList) errList.innerHTML = '';
            if (errBox) errBox.style.display = 'none';
        };

        form.addEventListener('submit', submitHandler, { once: true });
        cancel.addEventListener('click', cancelHandler, { once: true });
        modal.addEventListener('click', function hideOnOutside(ev) {
            const inner = modal.querySelector('.panel');
            if (!inner.contains(ev.target)) {
                modal.classList.remove('open');
                form.removeEventListener('submit', submitHandler);
                cancel.removeEventListener('click', cancelHandler);
                document.removeEventListener('click', hideOnOutside);
            }
        }, { once: true });
    }
});
