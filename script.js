// CREDENCIALES DE TU PROYECTO SUPABASE
const SUPABASE_URL = "https://shdedodplnfcnfrhdcmo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_V8YTCDiexjek5DYK4WkZCg_MqriIiCI";

let databaseClient = null;
let currentSantuarioId = null;

// Inicializar Supabase de forma segura
try {
    if (typeof window.supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
        databaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.error("Error inicializando Supabase Client:", e);
}

// Captura de elementos DOM - Generales
const container = document.getElementById('memories-container');
const modal = document.getElementById('memory-modal');
const btnAddMemory = document.getElementById('btn-add-memory');
const closeModal = document.getElementById('close-modal');
const memoryForm = document.getElementById('memory-form');

const memoryTypeSelect = document.getElementById('type');
const fileUploadGroup = document.getElementById('file-upload-group');
const textMessageGroup = document.getElementById('text-message-group');
const fileInput = document.getElementById('file-input');
const textContentInput = document.getElementById('content');
const btnSubmitMemory = document.getElementById('btn-submit-memory');

// Captura de elementos DOM - Autenticación de Cliente
const btnAccesoSantuario = document.getElementById('btn-acceso-santuario');
const loginModal = document.getElementById('login-modal');
const closeLoginModal = document.getElementById('close-login-modal');
const loginForm = document.getElementById('login-form');
const loginPasswordInput = document.getElementById('login-password');

// Elementos dinámicos del Santuario
const santuarioBodyContent = document.getElementById('santuario-body-content');
const santuarioLockIcon = document.getElementById('santuario-lock-icon');
const santuarioDisplayTitle = document.getElementById('santuario-display-title');
const santuarioDisplaySubtitle = document.getElementById('santuario-display-subtitle');
const santuarioAvatar = document.getElementById('santuario-avatar');
const santuarioProfileName = document.getElementById('santuario-profile-name');
const santuarioDates = document.getElementById('santuario-dates');
const santuarioFamily = document.getElementById('santuario-family');
const santuarioPhrase = document.getElementById('santuario-phrase');
const santuarioQrContainer = document.getElementById('santuario-qr-container');

// Elementos de Administración
const btnOpenAdmin = document.getElementById('btn-open-admin');
const adminModal = document.getElementById('admin-modal');
const closeAdminModal = document.getElementById('close-admin-modal');
const adminLoginForm = document.getElementById('admin-login-form');
const adminPasswordInput = document.getElementById('admin-password');
const adminLoginSection = document.getElementById('admin-login-section');
const adminDashboardSection = document.getElementById('admin-dashboard-section');
const createSantuarioForm = document.getElementById('create-santuario-form');
const qrResultSection = document.getElementById('qr-result-section');
const adminGeneratedLink = document.getElementById('admin-generated-link');
const adminQrcodeDiv = document.getElementById('admin-qrcode');

// Elementos del Lightbox (Pantalla Completa)
const lightboxVisor = document.getElementById('lightbox-visor');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxVideo = document.getElementById('lightbox-video');
const closeLightbox = document.getElementById('close-lightbox');

// Filtros
const filterTodos = document.getElementById('btn-filter-todos');
const filterFoto = document.getElementById('btn-filter-foto');
const filterVideo = document.getElementById('btn-filter-video');
const filterAudio = document.getElementById('btn-filter-audio');
const filterMensaje = document.getElementById('btn-filter-mensaje');

// ==========================================
// 1. CONTROL DE ACCESO AUTOMÁTICO (POR ENLACE / QR)
// ==========================================
async function checkUrlParamsForSantuario() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');

    if (idParam) {
        const success = await unlockSantuario(idParam);
        if (!success) {
            alert("No se pudo encontrar el Santuario solicitado. Por favor ingresa el código manualmente.");
        }
    }
}

// Función central de desbloqueo de perfiles desde Supabase
async function unlockSantuario(santuarioId) {
    if (!databaseClient) return false;

    try {
        const { data: santuario, error } = await databaseClient
            .from('santuarios')
            .select('*')
            .eq('id', santuarioId.trim())
            .single();

        if (error || !santuario) return false;

        currentSantuarioId = santuario.id;

        // Cambios Visuales y Habilitación de la Interfaz
        santuarioBodyContent.style.opacity = '1';
        santuarioBodyContent.style.pointerEvents = 'auto';
        santuarioLockIcon.className = "fa-solid fa-lock-open";
        santuarioLockIcon.style.color = "#8E7AB5";
        santuarioDisplayTitle.innerText = `Santuario de ${santuario.nombre_perfil}`;
        santuarioDisplaySubtitle.innerText = "Un espacio privado para tus recuerdos más preciados.";
        santuarioAvatar.innerText = santuario.avatar || "👵";
        santuarioProfileName.innerText = santuario.nombre_perfil;
        santuarioPhrase.innerText = `"${santuario.frase || 'Los recuerdos en el corazón nunca se pierden.'}"`;
        btnAddMemory.style.display = 'block';

        // Renderizar fechas importantes
        if (santuario.fechas) {
            santuarioDates.innerHTML = santuario.fechas.split(',').map(f => `<li><i class="fa-solid fa-calendar"></i> ${f.trim()}</li>`).join('');
        } else {
            santuarioDates.innerHTML = `<li><i class="fa-solid fa-calendar"></i> Sin fechas registradas</li>`;
        }

        // Renderizar miembros de la familia
        if (santuario.familia) {
            santuarioFamily.innerHTML = santuario.familia.split(',').map(fam => `<li>👤 ${fam.trim()} <span class="badge">Acceso</span></li>`).join('');
        } else {
            santuarioFamily.innerHTML = `<li>👤 Familiares <span class="badge">Acceso</span></li>`;
        }

        // Insertar QR dinámico lateral de acceso directo
        santuarioQrContainer.innerHTML = "";
        const cleanUrl = window.location.origin + window.location.pathname + `?id=${santuario.id}`;
        new QRCode(santuarioQrContainer, {
            text: cleanUrl,
            width: 250,
            height: 250,
            colorDark: "#4A3E3D",
            colorLight: "#ffffff"
        });

        // Cargar recuerdos vinculados a este santuario
        renderMemories('todos');
        return true;

    } catch (err) {
        console.error("Error al desbloquear Santuario:", err);
        return false;
    }
}

// Formulario de login de cliente manual
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = loginPasswordInput.value.trim();
        const success = await unlockSantuario(password);

        if (success) {
            loginModal.style.display = 'none';
        } else {
            alert("Código de Santuario incorrecto o no registrado.");
        }
        loginForm.reset();
    });
}

if (btnAccesoSantuario) {
    btnAccesoSantuario.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
}

// ==========================================
// 2. PANEL DE ADMINISTRACIÓN (DUEÑO DE ALLINYAY)
// ==========================================
if (btnOpenAdmin) {
    btnOpenAdmin.addEventListener('click', () => {
        adminModal.style.display = 'flex';
        adminLoginSection.style.display = 'block';
        adminDashboardSection.style.display = 'none';
        qrResultSection.style.display = 'none';
    });
}

if (closeAdminModal) {
    closeAdminModal.addEventListener('click', () => {
        adminModal.style.display = 'none';
    });
}

// Validar clave de administrador (adminallinyay)
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = adminPasswordInput.value.trim();
        if (pwd === 'adminallinyay') {
            adminLoginSection.style.display = 'none';
            adminDashboardSection.style.display = 'block';
        } else {
            alert("Clave de administrador incorrecta.");
        }
        adminLoginForm.reset();
    });
}

// Crear un nuevo perfil de Santuario en Supabase
if (createSantuarioForm) {
    createSantuarioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('admin-santuario-id').value.trim();
        const nombre = document.getElementById('admin-nombre').value.trim();
        const avatar = document.getElementById('admin-avatar').value.trim();
        const frase = document.getElementById('admin-frase').value.trim();
        const fechas = document.getElementById('admin-fechas').value.trim();
        const familia = document.getElementById('admin-familia').value.trim();

        if (databaseClient) {
            try {
                const { error } = await databaseClient
                    .from('santuarios')
                    .insert([{ id, nombre_perfil: nombre, avatar, frase, fechas, familia }]);

                if (error) throw error;

                // Generar Link y QR para el amigurumi
                const accessUrl = window.location.origin + window.location.pathname + `?id=${id}`;
                adminGeneratedLink.innerText = accessUrl;

                adminQrcodeDiv.innerHTML = "";
                new QRCode(adminQrcodeDiv, {
                    text: accessUrl,
                    width: 150,
                    height: 150
                });

                qrResultSection.style.display = 'block';
                alert("¡Perfil de Santuario creado correctamente en la base de datos!");
                createSantuarioForm.reset();

            } catch (err) {
                alert(`Error al registrar el Santuario: ${err.message}`);
                console.error(err);
            }
        }
    });
}

// ==========================================
// 3. CARGA DE RECUERDOS Y COMENTARIOS
// ==========================================
async function renderMemories(filterType = 'todos') {
    if (!currentSantuarioId) return;

    container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#8E7AB5;">Cargando tus recuerdos...</p>';

    try {
        let query = databaseClient
            .from('recuerdos')
            .select('*')
            .eq('santuario_id', currentSantuarioId)
            .order('id', { ascending: false });
        
        if (filterType !== 'todos') {
            query = query.eq('tipo', filterType);
        }

        const { data: recuerdos, error } = await query;

        if (error) throw error;

        container.innerHTML = '';

        if (!recuerdos || recuerdos.length === 0) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#888;">No hay recuerdos guardados en esta categoría aún.</p>`;
            return;
        }

        for (const recuerdo of recuerdos) {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.setAttribute('data-id', recuerdo.id);

            let mediaContent = '';
            const url = recuerdo.url_contenido;

            // Renderizado multimedia interactivo
            if (recuerdo.tipo === 'foto' && url) {
                mediaContent = `<img class="clickable-media" src="${url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; cursor: pointer;">`;
            } else if (recuerdo.tipo === 'video' && url) {
                mediaContent = `
                    <div style="position:relative; width:100%; height:100%;">
                        <video src="${url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"></video>
                        <div class="video-play-overlay clickable-media" style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.2); cursor:pointer; color:#fff; font-size:2rem;"><i class="fa-solid fa-play"></i></div>
                    </div>`;
            } else if (recuerdo.tipo === 'audio' && url) {
                mediaContent = `
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; width:100%; background:#F3EDF7; padding: 10px; border-radius:8px;">
                        <span style="font-size:1.8rem; margin-bottom:5px;">🎵</span>
                        <audio src="${url}" controls style="width:100%; max-height:30px;"></audio>
                    </div>`;
            } else {
                mediaContent = `
                    <div style="display:flex; align-items:center; justify-content:center; height:100%; width:100%; background:#FFF; border:1px dashed #DBCDF0; border-radius:8px; padding:12px; font-size:0.85rem; color:#4A3E3D; font-style:italic; overflow-y:auto; max-height:100px;">
                        "${url}"
                    </div>`;
            }

            // Estructura de Tarjeta con Sección de Comentarios
            card.innerHTML = `
                <div class="memory-media" style="${recuerdo.tipo === 'audio' || recuerdo.tipo === 'mensaje' ? 'height:auto; min-height:80px;' : ''}">${mediaContent}</div>
                <div class="memory-card-body" style="padding:10px 0 0 0;">
                    <p style="font-weight:bold; margin-bottom: 2px;">${recuerdo.titulo}</p>
                    <span style="font-size:0.75rem; color:#888;">${recuerdo.fecha || 'Reciente'}</span>
                </div>
                
                <div class="comments-section" style="margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
                    <button class="btn-comment-toggle" style="background:none; border:none; color:#8E7AB5; font-size:0.8rem; cursor:pointer; font-weight:bold; padding:0;"><i class="fa-solid fa-comments"></i> Familia y Comentarios (<span class="comment-count">0</span>)</button>
                    <div class="comments-collapsible" style="display:none; margin-top:10px;">
                        <div class="comments-list" style="max-height:150px; overflow-y:auto; margin-bottom:8px; display:flex; flex-direction:column; gap:5px;"></div>
                        <form class="comment-form" style="display:flex; gap:5px;">
                            <input type="text" class="comment-author-input" placeholder="Nombre" style="width:30%; font-size:0.75rem;" required>
                            <input type="text" class="comment-text-input" placeholder="Escribe un mensaje de apoyo..." style="width:55%; font-size:0.75rem;" required>
                            <button type="submit" style="width:15%; background:#8E7AB5; color:#fff; border:none; border-radius:4px; font-size:0.75rem; cursor:pointer;"><i class="fa-solid fa-paper-plane"></i></button>
                        </form>
                    </div>
                </div>
            `;

            container.appendChild(card);

            // Cargar comentarios en tiempo real para esta tarjeta
            loadComments(recuerdo.id, card);
            setupMediaViewer(card, recuerdo);
        }

    } catch (err) {
        console.error("Error al renderizar recuerdos:", err);
    }
}

// Cargar comentarios de Supabase
async function loadComments(recuerdoId, cardElement) {
    const commentsList = cardElement.querySelector('.comments-list');
    const commentCountSpan = cardElement.querySelector('.comment-count');
    const toggleBtn = cardElement.querySelector('.btn-comment-toggle');
    const collapsible = cardElement.querySelector('.comments-collapsible');
    const form = cardElement.querySelector('.comment-form');

    // Desplegar/Colapsar sección de comentarios
    toggleBtn.onclick = () => {
        collapsible.style.display = collapsible.style.display === 'none' ? 'block' : 'none';
    };

    try {
        const { data: comentarios, error } = await databaseClient
            .from('comentarios')
            .select('*')
            .eq('recuerdo_id', recuerdoId)
            .order('id', { ascending: true });

        if (error) throw error;

        commentCountSpan.innerText = comentarios.length;
        commentsList.innerHTML = '';

        comentarios.forEach(com => {
            const comDiv = document.createElement('div');
            comDiv.style.background = "#F9F6FC";
            comDiv.style.padding = "6px";
            comDiv.style.borderRadius = "4px";
            comDiv.style.fontSize = "0.75rem";
            comDiv.innerHTML = `<strong style="color:#8E7AB5;">${com.autor}:</strong> <span style="color:#4A3E3D;">${com.texto}</span>`;
            commentsList.appendChild(comDiv);
        });

    } catch (err) {
        console.error("Error al cargar comentarios:", err);
    }

    // Registrar un nuevo comentario familiar
    form.onsubmit = async (e) => {
        e.preventDefault();
        const authorInput = form.querySelector('.comment-author-input');
        const textInput = form.querySelector('.comment-text-input');

        try {
            const { error } = await databaseClient
                .from('comentarios')
                .insert([{
                    recuerdo_id: recuerdoId,
                    autor: authorInput.value.trim(),
                    texto: textInput.value.trim()
                }]);

            if (error) throw error;

            textInput.value = '';
            loadComments(recuerdoId, cardElement); // Recargar comentarios en vivo

        } catch (err) {
            alert("No se pudo publicar el comentario.");
            console.error(err);
        }
    };
}

// ==========================================
// 4. VISOR PREMIUM (PANTALLA COMPLETA - LIGHTBOX)
// ==========================================
function setupMediaViewer(cardElement, recuerdo) {
    const clickable = cardElement.querySelector('.clickable-media');
    if (!clickable) return;

    clickable.addEventListener('click', () => {
        lightboxVisor.style.display = 'flex';
        if (recuerdo.tipo === 'foto') {
            lightboxImg.src = recuerdo.url_contenido;
            lightboxImg.style.display = 'block';
            lightboxVideo.style.display = 'none';
        } else if (recuerdo.tipo === 'video') {
            lightboxVideo.src = recuerdo.url_contenido;
            lightboxVideo.style.display = 'block';
            lightboxImg.style.display = 'none';
            lightboxVideo.play();
        }
    });
}

if (closeLightbox) {
    closeLightbox.addEventListener('click', () => {
        lightboxVisor.style.display = 'none';
        lightboxImg.src = '';
        lightboxVideo.src = '';
        lightboxVideo.pause();
    });
}

// ==========================================
// 5. REGISTRAR UN NUEVO RECUERDO (CON FILE STORAGE)
// ==========================================
if (memoryTypeSelect) {
    memoryTypeSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'mensaje') {
            fileUploadGroup.style.display = 'none';
            textMessageGroup.style.display = 'block';
            fileInput.removeAttribute('required');
            textContentInput.setAttribute('required', 'true');
        } else {
            fileUploadGroup.style.display = 'block';
            textMessageGroup.style.display = 'none';
            fileInput.setAttribute('required', 'true');
            textContentInput.removeAttribute('required');
            
            if (val === 'foto') fileInput.accept = 'image/*';
            if (val === 'video') fileInput.accept = 'video/*';
            if (val === 'audio') fileInput.accept = 'audio/*';
        }
    });
}

if (memoryForm) {
    memoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        btnSubmitMemory.disabled = true;
        btnSubmitMemory.innerText = "Subiendo archivo...";

        const type = memoryTypeSelect.value;
        const title = document.getElementById('title').value;
        let finalContent = "";

        const fechaActual = new Date().toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'short'
        });

        if (databaseClient && currentSantuarioId) {
            try {
                if (type !== 'mensaje') {
                    const file = fileInput.files[0];
                    if (!file) {
                        alert("Por favor selecciona un archivo.");
                        btnSubmitMemory.disabled = false;
                        btnSubmitMemory.innerText = "Subir al Santuario";
                        return;
                    }

                    const fileExtension = file.name.split('.').pop();
                    const fileName = `${currentSantuarioId}/${Date.now()}.${fileExtension}`;

                    // Subida a Storage
                    const { error: uploadError } = await databaseClient
                        .storage
                        .from('archivos-santuario')
                        .upload(fileName, file);

                    if (uploadError) throw uploadError;

                    // Obtener URL
                    const { data: urlData } = databaseClient
                        .storage
                        .from('archivos-santuario')
                        .getPublicUrl(fileName);

                    finalContent = urlData.publicUrl;
                } else {
                    finalContent = textContentInput.value;
                }

                // Guardado vinculándolo al Santuario ID actual
                const { error: insertError } = await databaseClient
                    .from('recuerdos')
                    .insert([{ 
                        tipo: type, 
                        titulo: title, 
                        url_contenido: finalContent, 
                        fecha: fechaActual,
                        santuario_id: currentSantuarioId
                    }]);

                if (insertError) {
                     throw insertError;
                }
                
                alert("¡Recuerdo guardado con éxito!");

            } catch (err) {
                alert(`Hubo un error al subir el recuerdo. Asegúrate de haber creado el bucket 'archivos-santuario' como público en tu Storage de Supabase.`);
                console.error(err);
            }
        }

        btnSubmitMemory.disabled = false;
        btnSubmitMemory.innerText = "Subir al Santuario";
        renderMemories('todos');
        memoryForm.reset();
        modal.style.display = 'none';
        fileUploadGroup.style.display = 'block';
        textMessageGroup.style.display = 'none';
    });
}

// Filtros de navegación lateral
function clearActiveFilterButtons() {
    const buttons = document.querySelectorAll('.sidebar-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
}

if(filterTodos) filterTodos.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.classList.add('active'); renderMemories('todos'); });
if(filterFoto) filterFoto.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('foto'); });
if(filterVideo) filterVideo.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('video'); });
if(filterAudio) filterAudio.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('audio'); });
if(filterMensaje) filterMensaje.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('mensaje'); });

// Controladores visuales de modales
if(btnAddMemory) btnAddMemory.addEventListener('click', () => { modal.style.display = 'flex'; });
if(closeModal) closeModal.addEventListener('click', () => { modal.style.display = 'none'; });
if(closeLoginModal) closeLoginModal.addEventListener('click', () => { loginModal.style.display = 'none'; });

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === adminModal) adminModal.style.display = 'none';
});

// Carga Inicial de la Plataforma
window.onload = () => {
    checkUrlParamsForSantuario();
};
// Función adicional para el avatar - Solo se agrega
function setupAvatarSelector() {
    const avatarType = document.getElementById('admin-avatar-type');
    if (avatarType) {
        avatarType.addEventListener('change', function() {
            const emojiGroup = document.getElementById('avatar-emoji-group');
            const fileGroup = document.getElementById('avatar-file-group');
            
            if (this.value === 'emoji') {
                emojiGroup.style.display = 'block';
                fileGroup.style.display = 'none';
            } else {
                emojiGroup.style.display = 'none';
                fileGroup.style.display = 'block';
            }
        });
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', setupAvatarSelector);