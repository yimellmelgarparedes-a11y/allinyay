// CREDENCIALES DE TU PROYECTO
const SUPABASE_URL = "https://shdedodplnfcnfrhdcmo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_V8YTCDiexjek5DYK4WkZCg_MqriIiCI";

let databaseClient = null;

// Inicializar Supabase de forma segura para evitar ReferenceError
try {
    if (typeof window.supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
        databaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.error("Error inicializando Supabase Client:", e);
}

// Captura de elementos DOM
const container = document.getElementById('memories-container');
const modal = document.getElementById('memory-modal');
const btnAddMemory = document.getElementById('btn-add-memory');
const closeModal = document.getElementById('close-modal');
const memoryForm = document.getElementById('memory-form');

const filterTodos = document.getElementById('btn-filter-todos');
const filterFoto = document.getElementById('btn-filter-foto');
const filterVideo = document.getElementById('btn-filter-video');
const filterAudio = document.getElementById('btn-filter-audio');
const filterMensaje = document.getElementById('btn-filter-mensaje');

// Cargar recuerdos en pantalla
async function renderMemories(filterType = 'todos') {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#8E7AB5;">Cargando recuerdos del santuario...</p>';
    
    // Si falla Supabase o no está listo, cargamos recuerdos interactivos simulados para evitar congelamientos
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
            let icon = '📝';
            if (recuerdo.tipo === 'foto') icon = '📸';
            if (recuerdo.tipo === 'video') icon = '🎥';
            if (recuerdo.tipo === 'audio') icon = '🎵';
            if (recuerdo.tipo === 'mensaje') icon = '✉️';

            const card = document.createElement('div');
            card.className = 'memory-card';
            card.innerHTML = `
                <div class="memory-media">${icon}</div>
                <p>${recuerdo.titulo}</p>
                <span>${recuerdo.fecha || 'Reciente'}</span>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.warn("Fallo temporal de base de datos. Entrando en modo interactivo local de respaldo...", err);
        showLocalMockMemories(filterType);
    }
}

// Datos interactivos locales para que la página NUNCA se congele
function showLocalMockMemories(filterType) {
    const mockData = [
        { tipo: 'foto', titulo: 'Almuerzo familiar', icon: '📸', fecha: 'Familiar' },
        { tipo: 'video', titulo: 'Video de cumpleaños', icon: '🎥', fecha: 'Familiar' },
        { tipo: 'audio', titulo: 'Risa de la abuela', icon: '🎵', fecha: 'Emocional' },
        { tipo: 'mensaje', titulo: 'Carta de bienvenida', icon: '✉️', fecha: 'Escrito' }
    ];

    container.innerHTML = '';
    const filtered = filterType === 'todos' ? mockData : mockData.filter(m => m.tipo === filterType);

    filtered.forEach(recuerdo => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.innerHTML = `
            <div class="memory-media">${recuerdo.icon}</div>
            <p>${recuerdo.titulo}</p>
            <span>${recuerdo.fecha}</span>
        `;
        container.appendChild(card);
    });
}

// Navegación de filtros laterales
function clearActiveFilterButtons() {
    const buttons = document.querySelectorAll('.sidebar-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
}

if(filterTodos) filterTodos.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.classList.add('active'); renderMemories('todos'); });
if(filterFoto) filterFoto.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('foto'); });
if(filterVideo) filterVideo.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('video'); });
if(filterAudio) filterAudio.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('audio'); });
if(filterMensaje) filterMensaje.addEventListener('click', (e) => { clearActiveFilterButtons(); e.target.closest('button').classList.add('active'); renderMemories('mensaje'); });

// Ventana Modal
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
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Guardado del formulario
if(memoryForm) {
    memoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const type = document.getElementById('type').value;
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;

        if (databaseClient) {
            try {
                const { error } = await databaseClient
                    .from('recuerdos')
                    .insert([
                        { tipo: type, titulo: title, url_contenido: content, fecha: 'Hace un momento' }
                    ]);

                if (error) throw error;
                
                alert("¡Excelente! Recuerdo guardado con éxito en tu base de datos de Supabase.");
            } catch (err) {
                alert("Hubo un error de guardado en la base de datos.");
                console.error(err);
            }
        } else {
            alert("No hay conexión con Supabase. Funcionando en modo de prueba local.");
        }

        renderMemories('todos');
        memoryForm.reset();
        modal.style.display = 'none';
    });
}

// Carga Inicial
window.onload = () => {
    renderMemories('todos');
};