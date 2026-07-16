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

// Captura de elementos DOM - Autenticación y Desbloqueo
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

// LÓGICA DE INICIO DE SESIÓN SIMULADA (Para cada Amigurumi)
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const clave = loginPasswordInput.value.trim();

        if (clave === 'juanita123') {
            // DESBLOQUEAR EL SANTUARIO DE JUANITA (ABUELITA)
            santuarioDesbloqueado = true;
            loginModal.style.display = 'none';
            alert("¡Acceso concedido al Santuario de la Abuelita Juanita!");

            // Modificaciones visuales en vivo
            santuarioBodyContent.style.opacity = '1';
            santuarioBodyContent.style.pointerEvents = 'auto';
            santuarioLockIcon.className = "fa-solid fa-lock-open";
            santuarioLockIcon.style.color = "#8E7AB5";
            santuarioDisplayTitle.innerText = "Santuario de Juanita";
            santuarioDisplaySubtitle.innerText = "Un espacio privado para tus recuerdos más preciados.";
            santuarioAvatar.innerText = "👵";
            santuarioProfileName.innerText = "Juanita (Abuelita)";
            btnAddMemory.style.display = 'block'; // Mostrar botón de agregar recuerdo

            // Fechas y familia específicas del amigurumi de Juanita
            santuarioDates.innerHTML = `
                <li><i class="fa-solid fa-calendar"></i> 15 de Agosto - Nacimiento</li>
                <li><i class="fa-solid fa-calendar"></i> 02 de Noviembre - Día de Difuntos</li>
            `;
            santuarioFamily.innerHTML = `
                <li>👤 María (Familiar) <span class="badge">Acceso</span></li>
                <li>👤 Carlos (Familiar) <span class="badge">Acceso</span></li>
            `;

            renderMemories('todos'); // Renderizar contenido real
        } else if (clave === 'pedro123') {
            // EJEMPLO DE OTRO AMIGURUMI (Abuelo Pedro)
            santuarioDesbloqueado = true;
            loginModal.style.display = 'none';
            alert("¡Acceso concedido al Santuario del Abuelo Pedro!");

            santuarioBodyContent.style.opacity = '1';
            santuarioBodyContent.style.pointerEvents = 'auto';
            santuarioLockIcon.className = "fa-solid fa-lock-open";
            santuarioLockIcon.style.color = "#8E7AB5";
            santuarioDisplayTitle.innerText = "Santuario de Pedro";
            santuarioDisplaySubtitle.innerText = "Honrando la vida del abuelo Pedro.";
            santuarioAvatar.innerText = "👴";
            santuarioProfileName.innerText = "Pedro (Abuelo)";
            btnAddMemory.style.display = 'block';

            santuarioDates.innerHTML = `
                <li><i class="fa-solid fa-calendar"></i> 10 de Mayo - Nacimiento</li>
            `;
            santuarioFamily.innerHTML = `
                <li>👤 Luis (Hijo) <span class="badge">Acceso</span></li>
            `;

            renderMemories('todos');
        } else {
            alert("Código de amigurumi incorrecto. Por favor, revisa la tarjeta física de tu ALLINYAY.");
        }
        loginForm.reset();
    });
}

// CARGAR RECUERDOS DESDE SUPABASE
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

            if (recuerdo.tipo === 'foto' && recuerdo.url_contenido && (recuerdo.url_contenido.startsWith('http://') || recuerdo.url_contenido.startsWith('https://'))) {
                mediaContent = `<img src="${recuerdo.url_contenido}" alt="${recuerdo.titulo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
            } else {
                let icon = '📝';
                if (recuerdo.tipo === 'foto') icon = '📸';
                if (recuerdo.tipo === 'video') icon = '🎥';
                if (recuerdo.tipo === 'audio') icon = '🎵';
                if (recuerdo.tipo === 'mensaje') icon = '✉️';
                mediaContent = icon;
            }

            const card = document.createElement('div');
            card.className = 'memory-card';
            card.innerHTML = `
                <div class="memory-media">${mediaContent}</div>
                <p>${recuerdo.titulo}</p>
                <span>${recuerdo.fecha || 'Reciente'}</span>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.warn("Fallo temporal de conexión con Supabase. Usando respaldo local...", err);
        showLocalMockMemories(filterType);
    }
}

// Datos locales interactivos en caso de fallo
function showLocalMockMemories(filterType) {
    const mockData = [
        { tipo: 'foto', titulo: 'Almuerzo familiar', url_contenido: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500', fecha: 'Familiar' },
        { tipo: 'video', titulo: 'Video de cumpleaños', icon: '🎥', fecha: 'Familiar' },
        { tipo: 'audio', titulo: 'Risa de la abuela', icon: '🎵', fecha: 'Emocional' },
        { tipo: 'mensaje', titulo: 'Carta de bienvenida', icon: '✉️', fecha: 'Escrito' }
    ];

    container.innerHTML = '';
    const filtered = filterType === 'todos' ? mockData : mockData.filter(m => m.tipo === filterType);

    filtered.forEach(recuerdo => {
        let mediaContent = '';
        if (recuerdo.tipo === 'foto' && recuerdo.url_contenido) {
            mediaContent = `<img src="${recuerdo.url_contenido}" alt="${recuerdo.titulo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
        } else {
            mediaContent = recuerdo.icon || '📝';
        }

        const card = document.createElement('div');
        card.className = 'memory-card';
        card.innerHTML = `
            <div class="memory-media">${mediaContent}</div>
            <p>${recuerdo.titulo}</p>
            <span>${recuerdo.fecha}</span>
        `;
        container.appendChild(card);
    });
}

// Control de Filtros Laterales
function clearActiveFilterButtons() {
    const buttons = document.querySelectorAll('.sidebar-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
}

if(filterTodos) filterTodos.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.classList.add('active'); renderMemories('todos'); });
if(filterFoto) filterFoto.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('foto'); });
if(filterVideo) filterVideo.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('video'); });
if(filterAudio) filterAudio.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('audio'); });
if(filterMensaje) filterMensaje.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('mensaje'); });

// Ventana de Agregar Recuerdos
if(btnAddMemory) {
    btnAddMemory.addEventListener('click', () => {
        modal.style.display = 'flex';
    });
}

if(closeModal) {
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
    if (e.target === loginModal) loginModal.style.display = 'none';
});

// ENVIAR Y GUARDAR NUEVO RECUERDO EN SUPABASE (100% Real)
if(memoryForm) {
    memoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const type = document.getElementById('type').value;
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;

        if (databaseClient) {
            try {
                // Inserta directamente en la tabla 'recuerdos' de Supabase
                const { data, error } = await databaseClient
                    .from('recuerdos')
                    .insert([
                        { tipo: type, titulo: title, url_contenido: content, fecha: 'Hace un momento' }
                    ])
                    .select(); // El .select() obliga a Supabase a confirmar el registro

                if (error) throw error;
                
                alert("¡Recuerdo guardado con éxito en tu base de datos de Supabase!");
            } catch (err) {
                alert("Ocurrió un error al intentar guardar en Supabase. Revisa las políticas RLS.");
                console.error("Error al insertar en Supabase:", err);
            }
        } else {
            alert("Modo prueba: Recuerdo simulado correctamente.");
        }

        renderMemories('todos');
        memoryForm.reset();
        modal.style.display = 'none';
    });
}

// Carga Inicial (Santuario bloqueado por defecto)
window.onload = () => {
    renderMemories('todos');
};
