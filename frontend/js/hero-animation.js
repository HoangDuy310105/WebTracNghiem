// Three.js Animated Particles Background for Hero Section
(function() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true,
        antialias: true 
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.position.z = 50;

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    // Random positions and colors
    for(let i = 0; i < particlesCount * 3; i += 3) {
        // Position
        posArray[i] = (Math.random() - 0.5) * 100;
        posArray[i + 1] = (Math.random() - 0.5) * 100;
        posArray[i + 2] = (Math.random() - 0.5) * 100;

        // Colors (gradient: blue to purple to gold)
        const colorVariant = Math.random();
        if (colorVariant < 0.33) {
            // Blue
            colors[i] = 0.4;
            colors[i + 1] = 0.5;
            colors[i + 2] = 0.9;
        } else if (colorVariant < 0.66) {
            // Purple
            colors[i] = 0.5;
            colors[i + 1] = 0.3;
            colors[i + 2] = 0.6;
        } else {
            // Gold
            colors[i] = 1.0;
            colors[i + 1] = 0.8;
            colors[i + 2] = 0.2;
        }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    // Particle mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create connecting lines
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.1 
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    document.addEventListener('mousemove', (event) => {
        targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation loop
    let frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);
        frameCount++;

        // Smooth mouse follow
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Rotate particles
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x = mouseY * 0.2;
        particlesMesh.rotation.y += mouseX * 0.001;

        // Animate individual particles
        const positions = particlesGeometry.attributes.position.array;
        for(let i = 0; i < positions.length; i += 3) {
            // Wave motion
            positions[i + 1] += Math.sin(frameCount * 0.01 + positions[i] * 0.1) * 0.02;
            
            // Boundary check and reset
            if (positions[i + 1] > 50) positions[i + 1] = -50;
            if (positions[i + 1] < -50) positions[i + 1] = 50;
        }
        particlesGeometry.attributes.position.needsUpdate = true;

        // Update connecting lines every 5 frames
        if (frameCount % 5 === 0) {
            updateLines();
        }

        renderer.render(scene, camera);
    }

    // Update connecting lines between nearby particles
    function updateLines() {
        const positions = particlesGeometry.attributes.position.array;
        const linePositions = [];
        const maxDistance = 10;

        for(let i = 0; i < positions.length; i += 3) {
            for(let j = i + 3; j < positions.length; j += 3) {
                const dx = positions[i] - positions[j];
                const dy = positions[i + 1] - positions[j + 1];
                const dz = positions[i + 2] - positions[j + 2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < maxDistance) {
                    linePositions.push(
                        positions[i], positions[i + 1], positions[i + 2],
                        positions[j], positions[j + 1], positions[j + 2]
                    );
                }
            }
        }

        lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Scroll parallax effect
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        particlesMesh.position.y = scrollY * 0.05;
    });
})();
