document.addEventListener('DOMContentLoaded', () => {

    // 1. Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.classList.contains('stat-item')) {
                    animateValue(entry.target.querySelector('.stat-value'));
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Specific observer for How It Works steps to handle the connecting line effect more dynamically
    const stepObserverOptions = {
        threshold: 0.5,
        rootMargin: "0px 0px -100px 0px"
    };

    const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, stepObserverOptions);

    const stepItems = document.querySelectorAll('.step-item');
    stepItems.forEach(el => {
        stepObserver.observe(el);
    });

    // Add reveal class to elements we want to animate
    const revealElements = document.querySelectorAll('.feature-card, .stat-item, .roadmap-item, .hero-title span, .hero-subtitle, .hero-actions, .terminal-window, .cta-content');
    revealElements.forEach((el, index) => {
        el.classList.add('reveal-up');
        // Stagger effect only for siblings in grid/flex containers
        if (el.parentElement.classList.contains('grid-container') ||
            el.parentElement.classList.contains('stats-grid') ||
            el.parentElement.classList.contains('roadmap-grid')) {
            // Calculate index relative to parent
            const siblings = Array.from(el.parentElement.children);
            const relativeIndex = siblings.indexOf(el);
            el.style.transitionDelay = `${relativeIndex * 0.1}s`;
        }
        observer.observe(el);
    });

    // 2. Number Counter Animation
    function animateValue(obj) {
        const target = parseInt(obj.getAttribute('data-target'));
        const duration = 2000;
        let startTimestamp = null;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Easing function for smooth deceleration
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);

            obj.innerHTML = Math.floor(easeOutQuart * target).toLocaleString();

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }

    // 3. Typewriter Effect
    const textToType = "CONSENSUS";
    const typeWriterElement = document.getElementById('typewriter');
    let typeIndex = 0;

    function typeWriter() {
        if (typeIndex < textToType.length) {
            typeWriterElement.innerHTML += textToType.charAt(typeIndex);
            typeIndex++;
            setTimeout(typeWriter, 150);
        }
    }

    // Start typing after a small delay
    setTimeout(typeWriter, 1000);

    // 4. Glitch Text Effect
    const glitchTargets = document.querySelectorAll('.glitch-effect');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

    glitchTargets.forEach(target => {
        const originalText = target.getAttribute('data-text');

        target.addEventListener('mouseover', () => {
            let iterations = 0;
            const interval = setInterval(() => {
                target.innerText = originalText.split('')
                    .map((letter, index) => {
                        if (index < iterations) {
                            return originalText[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');

                if (iterations >= originalText.length) {
                    clearInterval(interval);
                }

                iterations += 1 / 3;
            }, 30);
        });
    });

    // 5. Network Animation (Adapted from root script.js)
    const canvas = document.getElementById('particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const hero = document.getElementById('hero');
        let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        let w = 0;
        let h = 0;
        let particles = [];
        let grid = new Map();
        let mouse = { x: 0, y: 0, active: false };
        let lastClick = 0;

        function resize() {
            const rect = hero.getBoundingClientRect();
            w = Math.floor(rect.width);
            h = Math.floor(rect.height);
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function rand(min, max) { return Math.random() * (max - min) + min; }

        function createParticles() {
            particles = [];
            const area = w * h;
            const density = Math.min(280, Math.max(90, Math.floor(area / 9000)));
            for (let i = 0; i < density; i++) {
                particles.push({
                    x: rand(0, w),
                    y: rand(0, h),
                    vx: rand(-0.25, 0.25),
                    vy: rand(-0.25, 0.25),
                    r: rand(1.2, 2.4),
                    glow: rand(0.5, 1),
                });
            }
        }

        function buildGrid(cell) {
            grid.clear();
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const gx = Math.floor(p.x / cell);
                const gy = Math.floor(p.y / cell);
                const key = gx + "," + gy;
                let bucket = grid.get(key);
                if (!bucket) { bucket = []; grid.set(key, bucket); }
                bucket.push(i);
            }
        }

        function update() {
            const attract = 0.035;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (mouse.active) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const d2 = dx * dx + dy * dy + 0.0001;
                    const f = Math.min(2.2, 140 / Math.sqrt(d2)) * attract;
                    p.vx += dx / Math.sqrt(d2) * f;
                    p.vy += dy / Math.sqrt(d2) * f;
                }
                p.vx *= 0.995;
                p.vy *= 0.995;
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;
                if (p.y < -10) p.y = h + 10;
                if (p.y > h + 10) p.y = -10;
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            const linkDist = 88;
            const cell = linkDist;
            buildGrid(cell);
            const highlightR = 120;

            // links via spatial grid
            for (const [key, bucket] of grid.entries()) {
                const [gx, gy] = key.split(",").map(Number);
                for (let i = 0; i < bucket.length; i++) {
                    const aIdx = bucket[i];
                    const a = particles[aIdx];
                    for (let oy = -1; oy <= 1; oy++) {
                        for (let ox = -1; ox <= 1; ox++) {
                            const nbrKey = (gx + ox) + "," + (gy + oy);
                            const nbrBucket = grid.get(nbrKey);
                            if (!nbrBucket) continue;
                            for (let j = 0; j < nbrBucket.length; j++) {
                                const bIdx = nbrBucket[j];
                                if (bIdx <= aIdx) continue;
                                const b = particles[bIdx];
                                const dx = a.x - b.x;
                                const dy = a.y - b.y;
                                const d2 = dx * dx + dy * dy;
                                if (d2 < linkDist * linkDist) {
                                    const alpha = 0.05 + (1 - d2 / (linkDist * linkDist)) * 0.18;
                                    ctx.strokeStyle = `rgba(255, 161, 0, ${alpha})`; // Orange accent
                                    ctx.lineWidth = 1;
                                    ctx.beginPath();
                                    ctx.moveTo(a.x, a.y);
                                    ctx.lineTo(b.x, b.y);
                                    ctx.stroke();
                                }
                            }
                        }
                    }
                }
            }

            // nodes
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                let r = p.r;
                if (mouse.active) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < highlightR * highlightR) r = Math.min(3.2, p.r + 0.9);
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 180, 80, ${0.85})`; // Orange tint
                ctx.shadowColor = 'rgba(255,120,0,0.6)';
                ctx.shadowBlur = 6 * p.glow;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        function burst(x, y) {
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const dx = x - p.x;
                const dy = y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy) + 0.0001;
                if (dist < 160) {
                    const f = (160 - dist) * 0.08;
                    p.vx -= dx / dist * f;
                    p.vy -= dy / dist * f;
                }
            }
        }

        function loop() {
            update();
            draw();
            requestAnimationFrame(loop);
        }

        function pointerMove(e) {
            const rect = canvas.getBoundingClientRect();
            if (e.touches && e.touches.length) {
                mouse.x = e.touches[0].clientX - rect.left;
                mouse.y = e.touches[0].clientY - rect.top;
            } else {
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            }
            mouse.active = true;
        }

        function pointerLeave() { mouse.active = false; }

        function pointerDown(e) {
            const now = Date.now();
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX ?? 0) - rect.left;
            const y = (e.clientY ?? 0) - rect.top;
            if (now - lastClick > 250) burst(x, y);
            lastClick = now;
        }

        function init() {
            resize();
            createParticles();
            loop();
        }

        window.addEventListener('resize', () => { resize(); createParticles(); });
        hero.addEventListener('mousemove', pointerMove);
        hero.addEventListener('mouseleave', pointerLeave);
        hero.addEventListener('touchmove', pointerMove, { passive: true });
        hero.addEventListener('touchend', pointerLeave);
        hero.addEventListener('click', pointerDown);

        init();
    }

    // 6. System Logs Simulation
    const terminalOutput = document.getElementById('terminal-output');
    const logMessages = [
        { type: 'info', text: 'New market created: BTC/USD > 100k' },
        { type: 'success', text: 'Trade executed: 5000 shares [YES] @ 0.45' },
        { type: 'info', text: 'Oracle verification pending for Market #882' },
        { type: 'warn', text: 'High volatility detected in sector: POLITICS' },
        { type: 'success', text: 'Liquidity added: 100 ETH to pool #12' },
        { type: 'info', text: 'User 0x7a...f9 connected' },
        { type: 'success', text: 'Market #881 resolved: OUTCOME_YES' },
        { type: 'info', text: 'Syncing with L2 node...' }
    ];

    function addLogEntry() {
        if (!terminalOutput) return;

        const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
        const now = new Date();
        const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;

        const logLine = document.createElement('div');
        logLine.className = 'log-line';
        logLine.innerHTML = `<span class="log-time">${timeString}</span> <span class="log-${msg.type}">${msg.type.toUpperCase()}</span> ${msg.text}`;

        terminalOutput.appendChild(logLine);

        // Keep only last 8 lines
        if (terminalOutput.children.length > 8) {
            terminalOutput.removeChild(terminalOutput.firstChild);
        }
    }

    if (terminalOutput) {
        setInterval(addLogEntry, 2000);
    }

});
