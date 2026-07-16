const db = window.supabase.createClient("https://shdedodplnfcnfrhdcmo.supabase.co", "sb_publishable_V8YTCDiexjek5DYK4WkZCg_MqriIiCI");

document.getElementById('btn-open-admin').onclick = () => document.getElementById('admin-modal').style.display = 'flex';

function validarAdmin() {
    if(document.getElementById('admin-password').value === 'adminallinyay') {
        document.getElementById('admin-login-view').style.display = 'none';
        document.getElementById('admin-form-view').style.display = 'block';
    }
}

document.getElementById('form-nuevo-santuario').onsubmit = async (e) => {
    e.preventDefault();
    let avatar = document.getElementById('selected-avatar-val').value;
    const file = document.getElementById('admin-avatar-file').files[0];
    if (file) {
        const { data } = await db.storage.from('archivos-santuario').upload(`avatars/${Date.now()}`, file);
        const { data: urlData } = db.storage.from('archivos-santuario').getPublicUrl(data.path);
        avatar = urlData.publicUrl;
    }
    await db.from('santuarios').insert([{ id: document.getElementById('admin-santuario-id').value, nombre_perfil: document.getElementById('admin-nombre').value, avatar: avatar }]);
    alert("Santuario creado.");
};

function setAvatar(val) { document.getElementById('selected-avatar-val').value = val; }

document.getElementById('btn-acceso-santuario').onclick = () => {
    const code = prompt("Código del Santuario:");
    if (!code) return;
    db.from('santuarios').select('*').eq('id', code).single().then(({data}) => {
        if(data) {
            const cont = document.getElementById('santuario-avatar-container');
            cont.innerHTML = data.avatar.startsWith('http') ? `<img src="${data.avatar}" style="width:100px; height:100px; border-radius:50%;">` : `<div style="font-size:60px;">${data.avatar}</div>`;
            document.getElementById('santuario-display-title').innerText = data.nombre_perfil;
        } else alert("Código no encontrado.");
    });
};
