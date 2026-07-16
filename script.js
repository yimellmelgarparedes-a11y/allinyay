// CREDENCIALES DE TU PROYECTO SUPABASE
const SUPABASE_URL = "https://shdedodplnfcnfrhdcmo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_V8YTCDiexjek5DYK4WkZCg_MqriIiCI";

let databaseClient = null;
let santuarioDesbloqueado = false;

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

// Inputs dinámicos del modal de recuerdos
const memoryTypeSelect = document.getElementById('type');
const fileUploadGroup = document.getElementById('file-upload-group');
const textMessageGroup = document.getElementById('text-message-group');
const fileInput = document.getElementById('file-input');
const textContentInput = document.getElementById('content');
const btnSubmitMemory = document.getElementById('btn-submit-memory');

// Captura de elementos DOM - Autenticación
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

// Filtros
const filterTodos = document.getElementById('btn-filter-todos');
const filterFoto = document.getElementById('btn-filter-foto');
const filterVideo = document.getElementById('btn-filter-video');
const filterAudio = document.getElementById('btn-filter-audio');
const filterMensaje = document.getElementById('btn-filter-mensaje');

// Cambiar la vista del formulario dependiendo del tipo de recuerdo elegido
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
            
            // Ajustar los tipos de archivo permitidos
            if (val === 'foto') fileInput.accept = 'image/*';
            if (val === 'video') fileInput.accept = 'video/*';
            if (val === 'audio') fileInput.accept = 'audio/*';
        }
    });
}

// Manejo de Modales de Autenticación
if (btnAccesoSantuario) {
    btnAccesoSantuario.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
}

if (closeLoginModal) {
    closeLoginModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
}

// LÓGICA DE INICIO DE SESIÓN SIMULADA
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const clave = loginPasswordInput.value.trim();

        if (clave === 'juanita123') {
            santuarioDesbloqueado = true;
            loginModal.style.display = 'none';
            alert("¡Acceso concedido al Santuario de la Abuelita Juanita!");

            santuarioBodyContent.style.opacity = '1';
            santuarioBodyContent.style.pointerEvents = 'auto';
            santuarioLockIcon.className = "fa-solid fa-lock-open";
            santuarioLockIcon.style.color = "#8E7AB5";
            santuarioDisplayTitle.innerText = "Santuario de Juanita";
            santuarioDisplaySubtitle.innerText = "Un espacio privado para tus recuerdos más preciados.";
            santuarioAvatar.innerText = "👵";
            santuarioProfileName.innerText = "Juanita (Abuelita)";
            btnAddMemory.style.display = 'block';

            santuarioDates.innerHTML = `
                <li><i class="fa-solid fa-calendar"></i> 15 de Agosto - Nacimiento</li>
                <li><i class="fa-solid fa-calendar"></i> 02 de Noviembre - Día de Difuntos</li>
            `;
            santuarioFamily.innerHTML = `
                <li>👤 María (Familiar) <span class="badge">Acceso</span></li>
                <li>👤 Carlos (Familiar) <span class="badge">Acceso</span></li>
            `;

            renderMemories('todos');
        } else {
            alert("Código de amigurumi incorrecto. Por favor, intenta de nuevo.");
        }
        loginForm.reset();
    });
}

// CARGAR RECUERDOS DESDE SUPABASE Y DIBUJARLOS
async function renderMemories(filterType = 'todos') {
    if (!santuarioDesbloqueado) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#888;">Introduce la contraseña en "Acceso a tu Santuario" para ver los recuerdos.</p>';
        return;
    }

    container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#8E7AB5;">Cargando recuerdos del santuario...</p>';
    
    if (!databaseClient) {
        showLocalMockMemories(filterType);
        return;
    }

    try {
        let query = databaseClient.from('recuerdos').select('*').order('id', { ascending: false });
        
        if (filterType !== 'todos') {
            query = query.eq('tipo', filterType);
        }

        let { data: recuerdos, error } = await query;

        if (error) throw error;

        container.innerHTML = '';

        if (!recuerdos || recuerdos.length === 0) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#888;">No hay recuerdos guardados en esta categoría aún.</p>`;
            return;
        }

        recuerdos.forEach(recuerdo => {
            let mediaContent = '';
            const url = recuerdo.url_contenido;

            // Renderizado inteligente según el tipo de archivo real
            if (recuerdo.tipo === 'foto' && url) {
                mediaContent = `<img src="${url}" alt="${recuerdo.titulo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
            } else if (recuerdo.tipo === 'video' && url) {
                mediaContent = `<video src="${url}" controls style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"></video>`;
            } else if (recuerdo.tipo === 'audio' && url) {
                mediaContent = `
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; width:100%; background:#F3EDF7; padding: 10px; border-radius:8px;">
                        <span style="font-size:1.8rem; margin-bottom:5px;">🎵</span>
                        <audio src="${url}" controls style="width:100%; max-height:30px;"></audio>
                    </div>`;
            } else {
                // Mensaje de texto simple
                mediaContent = `
                    <div style="display:flex; align-items:center; justify-content:center; height:100%; width:100%; background:#FFF; border:1px dashed #DBCDF0; border-radius:8px; padding:12px; font-size:0.85rem; color:#4A3E3D; overflow-y:auto; font-style:italic;">
                        "${url}"
                    </div>`;
            }

            const card = document.createElement('div');
            card.className = 'memory-card';
            
            // Si es un audio o texto largo, le damos un poco más de alto a la tarjeta para que quepan los controles
            if (recuerdo.tipo === 'audio' || recuerdo.tipo === 'mensaje') {
                card.style.height = 'auto';
                card.style.minHeight = '160px';
            }

            card.innerHTML = `
                <div class="memory-media" style="${recuerdo.tipo === 'audio' || recuerdo.tipo === 'mensaje' ? 'height:90px;' : ''}">${mediaContent}</div>
                <p style="font-weight:bold; margin-top:8px;">${recuerdo.titulo}</p>
                <span>${recuerdo.fecha || 'Reciente'}</span>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.warn("Error cargando base de datos:", err);
        showLocalMockMemories(filterType);
    }
}

// Datos de respaldo locales
function showLocalMockMemories(filterType) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#888;">Modo demostración local.</p>`;
}

// Control de Filtros
function clearActiveFilterButtons() {
    const buttons = document.querySelectorAll('.sidebar-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
}

if(filterTodos) filterTodos.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.classList.add('active'); renderMemories('todos'); });
if(filterFoto) filterFoto.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('foto'); });
if(filterVideo) filterVideo.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('video'); });
if(filterAudio) filterAudio.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('audio'); });
if(filterMensaje) filterMensaje.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('mensaje'); });

// Ventanas Modales
if(btnAddMemory) btnAddMemory.addEventListener('click', () => { modal.style.display = 'flex'; });
if(closeModal) closeModal.addEventListener('click', () => { modal.style.display = 'none'; });

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
    if (e.target === loginModal) loginModal.style.display = 'none';
});

// SUBIR ARCHIVO REAL AL STORAGE Y LUEGO GUARDAR EN LA TABLA
if(memoryForm) {
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

        if (databaseClient) {
            try {
                if (type !== 'mensaje') {
                    // 1. OBTENER ARCHIVO FÍSICO SELECCIONADO
                    const file = fileInput.files[0];
                    if (!file) {
                        alert("Por favor, selecciona un archivo.");
                        btnSubmitMemory.disabled = false;
                        btnSubmitMemory.innerText = "Subir al Santuario";
                        return;
                    }

                    // Creamos un nombre único para evitar que archivos con el mismo nombre choquen
                    const fileExtension = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

                    // 2. SUBIR EL ARCHIVO AL STORAGE BUCKET DE SUPABASE
                    const { data: uploadData, error: uploadError } = await databaseClient
                        .storage
                        .from('archivos-santuario')
                        .upload(fileName, file);

                    if (uploadError) throw uploadError;

                    // 3. OBTENER LA URL PÚBLICA DEL ARCHIVO QUE ACABAMOS DE SUBIR
                    const { data: urlData } = databaseClient
                        .storage
                        .from('archivos-santuario')
                        .getPublicUrl(fileName);

                    finalContent = urlData.publicUrl; // Esta URL es la que guardaremos en la tabla
                } else {
                    // Si es un mensaje simple, solo tomamos el texto escrito
                    finalContent = textContentInput.value;
                }

                // 4. INSERTAR EN LA TABLA DE RECUERDOS USANDO LA URL REAL DE SUPABASE STORAGE
                const { error: insertError } = await databaseClient
                    .from('recuerdos')
                    .insert([
                        { 
                            tipo: type, 
                            titulo: title, 
                            url_contenido: finalContent, 
                            fecha: fechaActual 
                        }
                    ]);

                if (insertError) throw insertError;
                
                alert("¡Recuerdo real subido y guardado con éxito!");
            } catch (err) {
                alert("Hubo un error al subir el recuerdo. Asegúrate de haber creado el bucket 'archivos-santuario' como público en tu Storage de Supabase.");
                console.error("Error completo:", err);
            }
        } else {
            alert("Modo simulación: guardado localmente.");
        }

        btnSubmitMemory.disabled = false;
        btnSubmitMemory.innerText = "Subir al Santuario";
        renderMemories('todos');
        memoryForm.reset();
        modal.style.display = 'none';
        
        // Resetear visualmente los grupos del formulario
        fileUploadGroup.style.display = 'block';
        textMessageGroup.style.display = 'none';
    });
}

// Carga Inicial
window.onload = () => {
    renderMemories('todos');
};
