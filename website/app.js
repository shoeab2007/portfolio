// Frontend Orchestrator for Shoeab Shaikh Portfolio
let projects = [];
let activeFilter = 'all';
let searchQuery = '';
let viewMode = '3d'; // '3d' or '2d'
let selectedProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setupUIEventListeners();
    await fetchProjects();
    
    // Initialize Three.js gallery with callback for project click
    initThree('canvas-container', onProjectSelected);
    
    // Initial load in Three.js
    updateGalleryViews();
}

// Fetch database from server
async function fetchProjects() {
    try {
        const response = await fetch(`/website/projects.json?t=${Date.now()}`);
        if (!response.ok) throw new Error("Failed to load projects database");
        projects = await response.json();
        
        // Update badges & counts
        updateCategoryCounts();
        
        // Refresh 2D grid if currently visible
        if (viewMode === '2d') {
            render2DGrid();
        }
    } catch (err) {
        console.error("Error loading portfolio projects:", err);
        projects = [];
    }
}

// Update category count numbers on filter buttons
function updateCategoryCounts() {
    const totalCount = projects.length;
    const assetCountEl = document.getElementById('asset-count');
    if (assetCountEl) assetCountEl.innerText = totalCount;
    
    const countAll = document.getElementById('count-all');
    if (countAll) countAll.innerText = totalCount;
    
    const countGig = document.getElementById('count-gig');
    if (countGig) countGig.innerText = projects.filter(p => p.category === 'Gig Posters').length;
    
    const countCampaigns = document.getElementById('count-campaigns');
    if (countCampaigns) countCampaigns.innerText = projects.filter(p => p.category === 'Campaigns & Promos').length;
    
    const countCalendars = document.getElementById('count-calendars');
    if (countCalendars) countCalendars.innerText = projects.filter(p => p.category === 'Event Calendars').length;
    
    const countBrochures = document.getElementById('count-brochures');
    if (countBrochures) countBrochures.innerText = projects.filter(p => p.category === 'Brochures').length;
    
    const countUploads = document.getElementById('count-uploads');
    if (countUploads) countUploads.innerText = projects.filter(p => p.category === 'Uploads' || !p.is_default).length;
}

// Get filtered & searched list of projects
function getFilteredProjects() {
    return projects.filter(p => {
        let matchesCategory = false;
        if (activeFilter === 'all') {
            matchesCategory = true;
        } else if (activeFilter === 'Uploads') {
            matchesCategory = (p.category === 'Uploads' || !p.is_default);
        } else {
            matchesCategory = (p.category === activeFilter);
        }
        
        if (!matchesCategory) return false;
        
        if (!searchQuery) return true;
        
        const q = searchQuery.toLowerCase();
        return (
            (p.title && p.title.toLowerCase().includes(q)) ||
            (p.client && p.client.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q)) ||
            (p.subfolder && p.subfolder.toLowerCase().includes(q)) ||
            (p.tech && p.tech.toLowerCase().includes(q)) ||
            (p.role && p.role.toLowerCase().includes(q))
        );
    });
}

// Refresh both views
function updateGalleryViews() {
    const currentSet = getFilteredProjects();
    loadProjects(currentSet);
    if (viewMode === '2d') {
        render2DGrid();
    }
}

// Setup Event Listeners
function setupUIEventListeners() {
    // Mode Toggles
    const btn3d = document.getElementById('toggle-3d-btn');
    const btn2d = document.getElementById('toggle-2d-btn');
    const container3d = document.getElementById('3d-container');
    const container2d = document.getElementById('2d-container');
    
    btn3d.addEventListener('click', () => {
        if (viewMode === '3d') return;
        viewMode = '3d';
        
        btn3d.classList.add('bg-accent', 'text-black');
        btn2d.classList.remove('bg-accent', 'text-black');
        
        container3d.classList.remove('hidden');
        container2d.classList.add('hidden');
        
        onWindowResize();
    });
    
    btn2d.addEventListener('click', () => {
        if (viewMode === '2d') return;
        viewMode = '2d';
        
        btn2d.classList.add('bg-accent', 'text-black');
        btn3d.classList.remove('bg-accent', 'text-black');
        
        container2d.classList.remove('hidden');
        container3d.classList.add('hidden');
        
        render2DGrid();
    });
    
    // Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('bg-accent', 'text-black', 'font-bold');
            });
            
            btn.classList.add('bg-accent', 'text-black', 'font-bold');
            
            const filter = btn.getAttribute('data-filter');
            activeFilter = filter;
            
            updateGalleryViews();
        });
    });
    
    // 3D Style Switcher Buttons
    const style3dBtns = document.querySelectorAll('.style-3d-btn');
    style3dBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            style3dBtns.forEach(b => {
                b.classList.remove('bg-accent', 'text-black');
                b.classList.add('text-white');
            });
            
            btn.classList.add('bg-accent', 'text-black');
            btn.classList.remove('text-white');
            
            const style = btn.getAttribute('data-style');
            set3DStyle(style);
        });
    });
    
    // Search Input
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            if (clearSearchBtn) {
                if (searchQuery) {
                    clearSearchBtn.classList.remove('hidden');
                } else {
                    clearSearchBtn.classList.add('hidden');
                }
            }
            updateGalleryViews();
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.classList.add('hidden');
            updateGalleryViews();
        });
    }
    
    // Admin Drawer Open/Close
    const adminDrawer = document.getElementById('admin-drawer');
    const drawerContent = document.getElementById('drawer-content');
    const openAdminBtn = document.getElementById('open-admin-btn');
    const closeAdminBtn = document.getElementById('close-admin-btn');
    
    openAdminBtn.addEventListener('click', () => {
        adminDrawer.classList.remove('hidden');
        setTimeout(() => {
            adminDrawer.classList.remove('opacity-0');
            drawerContent.classList.remove('translate-x-full');
        }, 50);
        document.body.style.overflow = 'hidden';
    });
    
    const closeAdmin = () => {
        adminDrawer.classList.add('opacity-0');
        drawerContent.classList.add('translate-x-full');
        setTimeout(() => {
            adminDrawer.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    };
    
    closeAdminBtn.addEventListener('click', closeAdmin);
    adminDrawer.addEventListener('click', (e) => {
        if (e.target === adminDrawer) closeAdmin();
    });
    
    // Project Form Submission
    const uploadForm = document.getElementById('upload-form');
    const submitBtn = document.getElementById('submit-form-btn');
    
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin">sync</span> Publishing...`;
        
        const formData = new FormData(uploadForm);
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errMsg = await response.text();
                throw new Error(errMsg || "Failed to publish project");
            }
            
            const result = await response.json();
            if (result.success) {
                await fetchProjects();
                updateGalleryViews();
                uploadForm.reset();
                closeAdmin();
                alert(`Successfully uploaded "${result.project.title}"!`);
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Error uploading artwork: " + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span class="material-symbols-outlined">publish</span> Publish Artwork`;
        }
    });
    
    // Delete Project Button
    const deleteBtn = document.getElementById('delete-project-btn');
    deleteBtn.addEventListener('click', async () => {
        if (!selectedProjectId) return;
        
        const confirmDelete = confirm("Are you sure you want to permanently delete this artwork from the local disk?");
        if (!confirmDelete) return;
        
        try {
            const response = await fetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedProjectId })
            });
            
            if (!response.ok) {
                const errMsg = await response.text();
                throw new Error(errMsg || "Delete failed");
            }
            
            const result = await response.json();
            if (result.success) {
                await fetchProjects();
                updateGalleryViews();
                closeModal();
                alert("Artwork deleted successfully!");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete artwork: " + err.message);
        }
    });
    
    // Project Modal Close
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal');
    
    const closeModal = () => {
        modal.classList.add('opacity-0');
        modalContent.classList.add('translate-y-8');
        
        const modalMedia = document.getElementById('modal-media-container');
        const video = modalMedia.querySelector('video');
        if (video) video.pause();
        
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            modalMedia.innerHTML = '';
        }, 300);
    };
    
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Export JSON Backup
    document.getElementById('export-db-btn').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "projects_backup.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
    
    // Import DB Info
    document.getElementById('import-db-btn-trigger').addEventListener('click', () => {
        alert("To import/restore a backup, you can directly replace the projects.json file inside the 'website/' directory in your workspace folder, then refresh the server.\n\nAlternatively, copy-paste your backup contents directly into the projects.json file.");
    });
}

// Render the Brutalist 2D Gallery Grid
function render2DGrid() {
    const grid = document.getElementById('gallery-grid');
    const emptyState = document.getElementById('empty-state');
    grid.innerHTML = '';
    
    const filtered = getFilteredProjects();
    
    if (filtered.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    grid.classList.remove('hidden');
    
    filtered.forEach(proj => {
        const card = document.createElement('div');
        card.className = "project-item cursor-pointer border-b-2 border-r-2 border-white relative group overflow-hidden bg-black p-4 flex flex-col justify-between h-[480px]";
        
        let mediaHtml = '';
        if (proj.type === 'video') {
            mediaHtml = `<video src="${proj.media}" class="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100" muted loop playsinline></video>`;
        } else if (proj.type === 'pdf') {
            mediaHtml = `
                <div class="absolute inset-0 w-full h-full bg-darkgray group-hover:bg-accent/10 transition-colors flex flex-col justify-center items-center border border-white/10">
                    <span class="material-symbols-outlined text-6xl text-accent group-hover:scale-110 transition-transform duration-300">picture_as_pdf</span>
                    <span class="font-mono text-xs text-white/50 mt-4 tracking-widest uppercase">Click to open document</span>
                </div>
            `;
        } else {
            mediaHtml = `<img src="${proj.media}" alt="${proj.title}" class="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100">`;
        }
        
        card.innerHTML = `
            ${mediaHtml}
            <div class="relative z-10 flex justify-between items-start w-full">
                <span class="font-mono text-accent uppercase font-bold bg-black px-2.5 py-1 border-2 border-accent text-xs">${proj.category}</span>
                <span class="font-mono text-white/80 uppercase font-bold bg-black/80 px-2 py-0.5 border border-white/30 text-xs">${proj.year || '2025'}</span>
            </div>
            <div class="relative z-10 flex flex-col gap-1">
                <span class="font-mono text-xs text-accent uppercase font-bold bg-black/90 inline-block px-2 py-0.5 max-w-max">${proj.client || 'Shoeab Shaikh'}</span>
                <h3 class="font-black uppercase leading-tight break-words bg-black text-white inline-block px-2 border-2 border-white group-hover:bg-accent group-hover:text-black group-hover:border-accent transition-colors tracking-widest text-2xl">${proj.title}</h3>
            </div>
        `;
        
        if (proj.type === 'video') {
            card.addEventListener('mouseenter', () => {
                const vid = card.querySelector('video');
                if (vid) vid.play().catch(() => {});
            });
            card.addEventListener('mouseleave', () => {
                const vid = card.querySelector('video');
                if (vid) {
                    vid.pause();
                    vid.currentTime = 0;
                }
            });
        }
        
        card.addEventListener('click', () => {
            onProjectSelected(proj);
        });
        
        grid.appendChild(card);
    });
}

// Callback triggered when a project is selected (clicked in 2D or 3D)
function onProjectSelected(proj) {
    selectedProjectId = proj.id;
    
    document.getElementById('modal-title').innerText = proj.title;
    document.getElementById('modal-category').innerText = proj.category;
    document.getElementById('modal-role').innerText = proj.role || 'Art Director';
    document.getElementById('modal-client').innerText = proj.client || 'Confidential';
    document.getElementById('modal-year').innerText = proj.year || '2026';
    document.getElementById('modal-strategy').innerText = proj.strategy || '';
    
    const techContainer = document.getElementById('modal-tech-container');
    techContainer.innerHTML = '';
    const tools = proj.tech ? proj.tech.split(',') : [];
    tools.forEach(t => {
        const tag = document.createElement('span');
        tag.className = "border-2 border-accent text-accent px-4 py-1.5 uppercase rounded-full bg-accent/5 font-bold text-xs";
        tag.innerText = t.trim();
        techContainer.appendChild(tag);
    });
    
    const mediaContainer = document.getElementById('modal-media-container');
    mediaContainer.innerHTML = '';
    
    if (proj.type === 'video') {
        const video = document.createElement('video');
        video.src = proj.media;
        video.controls = true;
        video.loop = true;
        video.autoplay = true;
        video.className = "w-full h-full object-contain max-h-[500px] lg:max-h-[600px]";
        mediaContainer.appendChild(video);
    } else if (proj.type === 'pdf') {
        const iframe = document.createElement('iframe');
        iframe.src = proj.media;
        iframe.className = "w-full h-full min-h-[500px] border-none";
        mediaContainer.appendChild(iframe);
    } else {
        const img = document.createElement('img');
        img.src = proj.media;
        img.alt = proj.title;
        img.className = "w-full h-full object-contain max-h-[500px] lg:max-h-[600px]";
        mediaContainer.appendChild(img);
    }
    
    const deleteBtn = document.getElementById('delete-project-btn');
    if (proj.is_default) {
        deleteBtn.classList.add('hidden');
    } else {
        deleteBtn.classList.remove('hidden');
    }
    
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');
    
    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modal.classList.remove('opacity-0');
    modalContent.classList.remove('translate-y-8');
    document.body.style.overflow = 'hidden';
}
