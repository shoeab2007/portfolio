// Three.js 3D Multi-Style Visual Gallery Engine for Shoeab Shaikh
let scene, camera, renderer, controls;
let projectsData = [];
let panelMeshes = [];
let hoveredMesh = null;
let currentFilter = 'all';
let currentStyle = 'rotunda'; // 'rotunda' | 'museum' | 'coverflow' | 'helix' | 'matrix'
let canvasContainer;
let onProjectSelectCallback = null;

// Environment objects
let particles;
let gridFloor, gridCeiling;
let mainPointLight, ambientLight, dirLight;
let museumPillars = [];

// Coverflow active index & drag tracking
let coverflowIndex = 0;
let isDraggingCoverflow = false;
let startDragX = 0;

function initThree(containerId, onProjectSelect) {
    canvasContainer = document.getElementById(containerId);
    if (!canvasContainer) return;
    
    onProjectSelectCallback = onProjectSelect;
    
    // Scene Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    
    // Camera Setup
    const width = canvasContainer.clientWidth || window.innerWidth || 1200;
    const height = canvasContainer.clientHeight || 650;
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 3, 20);
    
    // Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(renderer.domElement);
    
    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 55;
    controls.minDistance = 2;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.minPolarAngle = Math.PI / 12;
    controls.target.set(0, 0, 0);
    
    // Lighting
    ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(15, 25, 20);
    scene.add(dirLight);
    
    mainPointLight = new THREE.PointLight(0x00ff00, 2.5, 50);
    mainPointLight.position.set(0, 8, 0);
    scene.add(mainPointLight);
    
    // Floors
    gridFloor = new THREE.GridHelper(150, 100, 0x00ff00, 0x1a1a1a);
    gridFloor.position.y = -5.5;
    scene.add(gridFloor);

    gridCeiling = new THREE.GridHelper(150, 100, 0x00ff00, 0x0d0d0d);
    gridCeiling.position.y = 12;
    scene.add(gridCeiling);
    
    // Floating cyber particles
    createParticles();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    setupInteractions();
    
    // Animation loop
    animate();
}

function createParticles() {
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 80;
        positions[i+1] = (Math.random() - 0.3) * 40;
        positions[i+2] = (Math.random() - 0.5) * 80;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x00ff00,
        size: 0.12,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createPDFTexture(title) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 512, 320);
    
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 502, 310);
    
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 30px "Space Mono", monospace';
    ctx.fillText('DOCUMENT PROFILE', 36, 60);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 36px "Hanken Grotesk", sans-serif';
    
    const words = title.split(' ');
    let line = '';
    let y = 140;
    for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > 440 && i > 0) {
            ctx.fillText(line, 36, y);
            line = words[i] + ' ';
            y += 44;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, 36, y);
    
    ctx.fillStyle = '#888888';
    ctx.font = '16px "Space Mono", monospace';
    ctx.fillText('PDF BROCHURE • CLICK TO VIEW', 36, 275);
    
    return new THREE.CanvasTexture(canvas);
}

function loadProjects(projects) {
    projectsData = projects;
    clearGallery();
    
    const textureLoader = new THREE.TextureLoader();
    const count = projectsData.length;
    
    if (count === 0) return;
    
    projectsData.forEach((proj, idx) => {
        // Plane geometry
        const artGeo = new THREE.PlaneGeometry(3.2, 2.0);
        let artMaterial;
        let videoEl = null;
        
        if (proj.type === 'video') {
            videoEl = document.createElement('video');
            videoEl.src = proj.media;
            videoEl.loop = true;
            videoEl.muted = true;
            videoEl.playsInline = true;
            videoEl.crossOrigin = 'anonymous';
            videoEl.preload = 'metadata';
            
            const videoTex = new THREE.VideoTexture(videoEl);
            videoTex.minFilter = THREE.LinearFilter;
            videoTex.magFilter = THREE.LinearFilter;
            
            artMaterial = new THREE.MeshBasicMaterial({ 
                map: videoTex, 
                side: THREE.FrontSide 
            });
            artGeo.userData = { videoElement: videoEl };
        } else if (proj.type === 'pdf') {
            const pdfTex = createPDFTexture(proj.title);
            artMaterial = new THREE.MeshBasicMaterial({ 
                map: pdfTex, 
                side: THREE.FrontSide 
            });
        } else {
            const imageTex = textureLoader.load(proj.media);
            imageTex.minFilter = THREE.LinearFilter;
            artMaterial = new THREE.MeshBasicMaterial({ 
                map: imageTex, 
                side: THREE.FrontSide 
            });
        }
        
        const artMesh = new THREE.Mesh(artGeo, artMaterial);
        artMesh.position.set(0, 0, 0.02);
        
        // Brutalist black backboard frame
        const backGeo = new THREE.PlaneGeometry(3.34, 2.14);
        const backMat = new THREE.MeshStandardMaterial({ 
            color: 0x0d0d0d, 
            roughness: 0.8, 
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        const backMesh = new THREE.Mesh(backGeo, backMat);
        backMesh.add(artMesh);
        
        // Neon green / white outline
        const outlineGeo = new THREE.EdgesGeometry(backGeo);
        const outlineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const outline = new THREE.LineSegments(outlineGeo, outlineMat);
        outline.position.set(0, 0, 0.01);
        backMesh.add(outline);
        
        backMesh.userData = { 
            project: proj, 
            artMesh: artMesh,
            outline: outline,
            videoElement: videoEl,
            index: idx
        };
        
        scene.add(backMesh);
        panelMeshes.push(backMesh);
    });
    
    // Apply selected layout
    applyLayout(currentStyle, false);
}

// Layout Calculators
function calculateLayoutTargets(style, count) {
    const targets = [];
    
    if (style === 'rotunda') {
        // 3-tier 360-degree cylinder
        const tiers = count > 36 ? 3 : (count > 16 ? 2 : 1);
        const itemsPerTier = Math.ceil(count / tiers);
        const radius = Math.min(18, Math.max(9, itemsPerTier * 0.9));
        
        for (let idx = 0; idx < count; idx++) {
            const tierIndex = idx % tiers;
            const indexInTier = Math.floor(idx / tiers);
            const countInThisTier = Math.ceil(count / tiers);
            const angle = (indexInTier / countInThisTier) * Math.PI * 2 + (tierIndex * 0.2);
            
            const x = radius * Math.sin(angle);
            const z = radius * Math.cos(angle);
            let y = 0;
            if (tiers === 3) {
                y = (tierIndex === 0) ? 0 : ((tierIndex === 1) ? 2.8 : -2.8);
            } else if (tiers === 2) {
                y = (tierIndex === 0) ? 1.6 : -1.6;
            }
            
            targets.push({
                x, y, z,
                rotX: 0,
                rotY: angle + Math.PI,
                rotZ: 0,
                camPos: { x: 0, y: 2, z: radius + 7 },
                camTarget: { x: 0, y: 0, z: 0 }
            });
        }
    } else if (style === 'museum') {
        // Long monolithic exhibition runway
        const spacing = 3.6;
        const hallWidth = 4.8;
        
        for (let idx = 0; idx < count; idx++) {
            const isLeft = (idx % 2 === 0);
            const row = Math.floor(idx / 2);
            const z = -row * spacing;
            const x = isLeft ? -hallWidth : hallWidth;
            const y = 0;
            const rotY = isLeft ? Math.PI / 2 : -Math.PI / 2;
            
            targets.push({
                x, y, z,
                rotX: 0,
                rotY: rotY,
                rotZ: 0,
                camPos: { x: 0, y: 0.5, z: 6 },
                camTarget: { x: 0, y: 0, z: -10 }
            });
        }
    } else if (style === 'coverflow') {
        // Curved kinetic carousel ribbon
        for (let idx = 0; idx < count; idx++) {
            const diff = idx - coverflowIndex;
            let x, z, rotY, y = 0;
            
            if (diff === 0) {
                x = 0;
                z = 0;
                rotY = 0;
            } else if (diff < 0) {
                x = diff * 2.8 - 2.0;
                z = -Math.abs(diff) * 1.8;
                rotY = Math.PI / 4.5;
            } else {
                x = diff * 2.8 + 2.0;
                z = -Math.abs(diff) * 1.8;
                rotY = -Math.PI / 4.5;
            }
            
            targets.push({
                x, y, z,
                rotX: 0,
                rotY: rotY,
                rotZ: 0,
                camPos: { x: 0, y: 0.2, z: 8.5 },
                camTarget: { x: 0, y: 0, z: 0 }
            });
        }
    } else if (style === 'helix') {
        // Ascending spiral tower
        const radius = 9.5;
        const angleStep = 0.45;
        const heightStep = 1.1;
        
        for (let idx = 0; idx < count; idx++) {
            const angle = idx * angleStep;
            const x = radius * Math.sin(angle);
            const z = radius * Math.cos(angle);
            const y = (idx - count / 2) * heightStep;
            
            targets.push({
                x, y, z,
                rotX: 0,
                rotY: angle + Math.PI,
                rotZ: 0,
                camPos: { x: 0, y: 0, z: radius + 10 },
                camTarget: { x: 0, y: 0, z: 0 }
            });
        }
    } else if (style === 'matrix') {
        // Spatial concave amphitheater wall
        const cols = Math.min(8, Math.ceil(Math.sqrt(count * 1.6)));
        const colWidth = 3.9;
        const rowHeight = 2.7;
        
        for (let idx = 0; idx < count; idx++) {
            const col = (idx % cols) - (cols - 1) / 2;
            const row = Math.floor(idx / cols);
            const totalRows = Math.ceil(count / cols);
            const rowOffset = row - (totalRows - 1) / 2;
            
            const x = col * colWidth;
            const y = -rowOffset * rowHeight;
            // Concave curve
            const z = -(col * col + rowOffset * rowOffset) * 0.15;
            
            targets.push({
                x, y, z,
                rotX: rowOffset * 0.04,
                rotY: -col * 0.05,
                rotZ: 0,
                camPos: { x: 0, y: 0, z: Math.max(12, totalRows * 2.2 + 8) },
                camTarget: { x: 0, y: 0, z: 0 }
            });
        }
    }
    
    return targets;
}

function applyLayout(style, animate = true) {
    currentStyle = style;
    const count = panelMeshes.length;
    if (count === 0) return;
    
    const targets = calculateLayoutTargets(style, count);
    if (!targets || targets.length === 0) return;
    
    // Environment visual tuning per style
    if (style === 'museum') {
        gridFloor.position.y = -3.2;
        gridFloor.material.color.setHex(0x333333);
        gridCeiling.visible = false;
        mainPointLight.color.setHex(0xffffff);
        mainPointLight.intensity = 2.0;
        ambientLight.intensity = 0.9;
    } else if (style === 'coverflow') {
        gridFloor.position.y = -3.0;
        gridFloor.material.color.setHex(0x00ff00);
        gridCeiling.visible = false;
        mainPointLight.color.setHex(0x00ff00);
        mainPointLight.intensity = 2.0;
        ambientLight.intensity = 0.7;
    } else if (style === 'helix') {
        gridFloor.position.y = -(count * 0.6) - 5;
        gridFloor.material.color.setHex(0x00ff00);
        gridCeiling.visible = true;
        gridCeiling.position.y = (count * 0.6) + 8;
        mainPointLight.color.setHex(0x00ff00);
        mainPointLight.intensity = 2.5;
        ambientLight.intensity = 0.6;
    } else if (style === 'matrix') {
        gridFloor.position.y = -10;
        gridFloor.material.color.setHex(0x00ff00);
        gridCeiling.visible = false;
        mainPointLight.color.setHex(0x00ff00);
        mainPointLight.intensity = 2.0;
        ambientLight.intensity = 0.7;
    } else { // rotunda
        gridFloor.position.y = -5.5;
        gridFloor.material.color.setHex(0x00ff00);
        gridCeiling.visible = true;
        gridCeiling.position.y = 12;
        mainPointLight.color.setHex(0x00ff00);
        mainPointLight.intensity = 2.5;
        ambientLight.intensity = 0.6;
    }
    
    panelMeshes.forEach((mesh, idx) => {
        const target = targets[idx];
        if (!target) return;
        
        mesh.userData.originalPos = new THREE.Vector3(target.x, target.y, target.z);
        mesh.userData.originalRot = new THREE.Euler(target.rotX, target.rotY, target.rotZ);
        
        if (animate) {
            gsap.to(mesh.position, {
                x: target.x,
                y: target.y,
                z: target.z,
                duration: 1.1,
                stagger: 0.008,
                ease: "power3.inOut"
            });
            gsap.to(mesh.rotation, {
                x: target.rotX,
                y: target.rotY,
                z: target.rotZ,
                duration: 1.1,
                stagger: 0.008,
                ease: "power3.inOut"
            });
            gsap.to(mesh.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.8,
                ease: "power2.out"
            });
        } else {
            mesh.position.set(target.x, target.y, target.z);
            mesh.rotation.set(target.rotX, target.rotY, target.rotZ);
            mesh.scale.set(1, 1, 1);
        }
    });
    
    // Animate Camera to preset starting point
    const firstTarget = targets[0];
    if (firstTarget && firstTarget.camPos) {
        if (animate) {
            gsap.to(camera.position, {
                x: firstTarget.camPos.x,
                y: firstTarget.camPos.y,
                z: firstTarget.camPos.z,
                duration: 1.4,
                ease: "power2.inOut",
                onUpdate: () => controls.update()
            });
            gsap.to(controls.target, {
                x: firstTarget.camTarget.x,
                y: firstTarget.camTarget.y,
                z: firstTarget.camTarget.z,
                duration: 1.4,
                ease: "power2.inOut",
                onUpdate: () => controls.update()
            });
        } else {
            camera.position.set(firstTarget.camPos.x, firstTarget.camPos.y, firstTarget.camPos.z);
            controls.target.set(firstTarget.camTarget.x, firstTarget.camTarget.y, firstTarget.camTarget.z);
            controls.update();
        }
    }
}

function set3DStyle(style) {
    if (style === currentStyle) return;
    applyLayout(style, true);
}

function setFilter(category) {
    if (category === currentFilter) return;
    currentFilter = category;
    
    if (panelMeshes.length > 0) {
        gsap.to(panelMeshes.map(m => m.scale), {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.3,
            stagger: 0.01,
            ease: "power2.in",
            onComplete: () => {
                loadProjects(projectsData);
            }
        });
    } else {
        loadProjects(projectsData);
    }
}

function clearGallery() {
    panelMeshes.forEach(mesh => {
        if (mesh.userData) {
            if (mesh.userData.videoElement) {
                mesh.userData.videoElement.pause();
                mesh.userData.videoElement.src = '';
                mesh.userData.videoElement.load();
            }
            if (mesh.userData.artMesh) {
                const art = mesh.userData.artMesh;
                if (art.material.map) art.material.map.dispose();
                art.geometry.dispose();
                art.material.dispose();
            }
        }
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
        } else {
            mesh.material.dispose();
        }
        scene.remove(mesh);
    });
    panelMeshes = [];
}

function setupInteractions() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isMouseDown = false;
    let mouseDownPos = { x: 0, y: 0 };
    
    window.addEventListener('mousemove', (event) => {
        if (!canvasContainer || !renderer) return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(panelMeshes, true);
        
        let intersectedPanel = null;
        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj && obj.parent !== scene) {
                obj = obj.parent;
            }
            intersectedPanel = obj;
        }
        
        if (intersectedPanel) {
            if (hoveredMesh !== intersectedPanel) {
                if (hoveredMesh) unhoverPanel(hoveredMesh);
                hoveredMesh = intersectedPanel;
                hoverPanel(hoveredMesh);
                document.body.style.cursor = 'pointer';
            }
        } else {
            if (hoveredMesh) {
                unhoverPanel(hoveredMesh);
                hoveredMesh = null;
                document.body.style.cursor = 'default';
            }
        }
    });
    
    window.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        mouseDownPos = { x: event.clientX, y: event.clientY };
    });
    
    window.addEventListener('mouseup', (event) => {
        if (!isMouseDown) return;
        isMouseDown = false;
        
        const dragDist = Math.hypot(event.clientX - mouseDownPos.x, event.clientY - mouseDownPos.y);
        if (dragDist > 7) return; // Ignore drag
        
        if (hoveredMesh) {
            focusOnPanel(hoveredMesh);
        }
    });
    
    // Mouse wheel support for Coverflow navigation
    canvasContainer.addEventListener('wheel', (e) => {
        if (currentStyle === 'coverflow') {
            if (Math.abs(e.deltaY) > 15) {
                const delta = e.deltaY > 0 ? 1 : -1;
                coverflowIndex = Math.max(0, Math.min(panelMeshes.length - 1, coverflowIndex + delta));
                applyLayout('coverflow', true);
            }
        }
    }, { passive: true });
}

function hoverPanel(mesh) {
    gsap.to(mesh.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.25, ease: "power2.out" });
    
    if (mesh.userData && mesh.userData.outline) {
        mesh.userData.outline.material.color.setHex(0x00ff00);
    }
    
    if (mesh.userData && mesh.userData.videoElement) {
        mesh.userData.videoElement.play().catch(() => {});
    }
}

function unhoverPanel(mesh) {
    gsap.to(mesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.25, ease: "power2.out" });
    
    if (mesh.userData && mesh.userData.outline) {
        mesh.userData.outline.material.color.setHex(0xffffff);
    }
    
    if (mesh.userData && mesh.userData.videoElement) {
        mesh.userData.videoElement.pause();
    }
}

function focusOnPanel(mesh) {
    const proj = mesh.userData.project;
    const pos = mesh.position;
    
    let targetCamX = pos.x;
    let targetCamY = pos.y;
    let targetCamZ = pos.z + 4.2;
    
    // Calculate normal if in rotunda or matrix
    if (currentStyle === 'rotunda' || currentStyle === 'helix') {
        const normal = new THREE.Vector3(pos.x, 0, pos.z).normalize();
        targetCamX = pos.x + normal.x * 4.0;
        targetCamZ = pos.z + normal.z * 4.0;
    } else if (currentStyle === 'museum') {
        const isLeft = pos.x < 0;
        targetCamX = isLeft ? pos.x + 3.2 : pos.x - 3.2;
        targetCamZ = pos.z;
    } else if (currentStyle === 'coverflow') {
        coverflowIndex = mesh.userData.index;
        applyLayout('coverflow', true);
    }
    
    controls.enabled = false;
    
    const timeline = gsap.timeline({
        onComplete: () => {
            controls.enabled = true;
            if (onProjectSelectCallback) {
                onProjectSelectCallback(proj);
            }
        }
    });
    
    timeline.to(controls.target, {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        duration: 1.0,
        ease: "power2.inOut"
    }, 0);
    
    timeline.to(camera.position, {
        x: targetCamX,
        y: targetCamY,
        z: targetCamZ,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => controls.update()
    }, 0);
}

function onWindowResize() {
    if (!canvasContainer || !renderer || !camera) return;
    const width = canvasContainer.clientWidth || window.innerWidth || 1200;
    const height = canvasContainer.clientHeight || 650;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (particles && currentStyle !== 'museum') {
        particles.rotation.y += 0.0003;
        particles.rotation.x += 0.00015;
    }
    
    if (controls && controls.enabled) {
        controls.update();
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}
