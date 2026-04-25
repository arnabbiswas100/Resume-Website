// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const themeOverlay = document.getElementById('theme-overlay');
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
htmlEl.setAttribute('data-theme', savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        // Enable smooth color transitions during switch
        document.body.classList.add('theme-transitioning');

        // Calculate ripple origin from button position
        if (themeOverlay) {
            const rect = themeToggle.getBoundingClientRect();
            const x = ((rect.left + rect.width / 2) / window.innerWidth * 100).toFixed(1);
            const y = ((rect.top + rect.height / 2) / window.innerHeight * 100).toFixed(1);
            themeOverlay.style.setProperty('--ripple-x', x + '%');
            themeOverlay.style.setProperty('--ripple-y', y + '%');

            themeOverlay.classList.add('active');
            setTimeout(() => themeOverlay.classList.remove('active'), 600);
        }

        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.setAttribute('aria-label',
            newTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'
        );

        updateLeafColors(newTheme);

        // Remove transitioning class after animation completes
        setTimeout(() => document.body.classList.remove('theme-transitioning'), 700);
    });
}


// ===== FALLING AUTUMN LEAVES (MONOCHROME) =====
const canvas = document.getElementById('leaves-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let leaves = [];
const LEAF_COUNT = window.innerWidth <= 480 ? 12 : 25;

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function getLeafColors(theme) {
    if (theme === 'dark') {
        return ['#555', '#666', '#777', '#888', '#444'];
    }
    return ['#999', '#aaa', '#bbb', '#888', '#777'];
}

let leafColors = getLeafColors(savedTheme);

function updateLeafColors(theme) {
    leafColors = getLeafColors(theme);
    leaves.forEach(leaf => {
        leaf.color = leafColors[Math.floor(Math.random() * leafColors.length)];
    });
}

// Leaf shape paths (drawn with canvas path operations)
function drawLeaf(ctx, leaf) {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rotation);
    ctx.scale(leaf.scale, leaf.scale);
    ctx.globalAlpha = leaf.opacity;

    ctx.beginPath();

    // Leaf shape — an elegant maple-inspired silhouette
    if (leaf.shape === 0) {
        // Simple pointed leaf
        ctx.moveTo(0, -12);
        ctx.bezierCurveTo(-6, -8, -10, 0, -4, 8);
        ctx.bezierCurveTo(-2, 12, 2, 12, 4, 8);
        ctx.bezierCurveTo(10, 0, 6, -8, 0, -12);
    } else if (leaf.shape === 1) {
        // Rounded oak-like leaf
        ctx.moveTo(0, -10);
        ctx.bezierCurveTo(-8, -6, -8, 4, -3, 10);
        ctx.lineTo(0, 12);
        ctx.lineTo(3, 10);
        ctx.bezierCurveTo(8, 4, 8, -6, 0, -10);
    } else {
        // Small oval leaf
        ctx.ellipse(0, 0, 4, 9, 0, 0, Math.PI * 2);
    }

    ctx.fillStyle = leaf.color;
    ctx.fill();

    // Leaf vein (center line)
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    ctx.strokeStyle = leaf.color;
    ctx.globalAlpha = leaf.opacity * 0.3;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
}

function createLeaf() {
    return {
        x: Math.random() * (canvas ? canvas.width : window.innerWidth),
        y: -20 - Math.random() * 100,
        scale: 0.6 + Math.random() * 1.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: 0.4 + Math.random() * 0.8,
        swaySpeed: 0.005 + Math.random() * 0.01,
        swayOffset: Math.random() * Math.PI * 2,
        opacity: 0.3 + Math.random() * 0.5,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        shape: Math.floor(Math.random() * 3),
        time: 0
    };
}

function initLeaves() {
    if (!canvas) return;
    leaves = [];
    for (let i = 0; i < LEAF_COUNT; i++) {
        const leaf = createLeaf();
        // Spread initial leaves across the screen
        leaf.y = Math.random() * canvas.height;
        leaves.push(leaf);
    }
}

function animateLeaves() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    leaves.forEach((leaf, index) => {
        leaf.time += 1;

        // Gentle swaying motion
        leaf.x += leaf.speedX + Math.sin(leaf.time * leaf.swaySpeed + leaf.swayOffset) * 0.5;
        leaf.y += leaf.speedY;
        leaf.rotation += leaf.rotationSpeed;

        // Add occasional gusts
        if (Math.random() < 0.002) {
            leaf.speedX += (Math.random() - 0.5) * 0.5;
        }

        // Dampen horizontal speed
        leaf.speedX *= 0.999;

        drawLeaf(ctx, leaf);

        // Reset leaf when it falls off screen
        if (leaf.y > canvas.height + 30 || leaf.x < -50 || leaf.x > canvas.width + 50) {
            leaves[index] = createLeaf();
        }
    });

    requestAnimationFrame(animateLeaves);
}

// Start leaves
resizeCanvas();
initLeaves();
animateLeaves();

window.addEventListener('resize', () => {
    resizeCanvas();
});


// ===== TOAST ON LOAD =====
window.addEventListener("load", () => {
    const toast = document.getElementById("toast");

    if (toast) {
        toast.textContent = "Welcome to my Resume Website!";
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }
});


// ===== SCROLL FADE-IN ANIMATIONS =====
const faders = document.querySelectorAll(".fade-in");

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px"
});

faders.forEach(el => observer.observe(el));


// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href"))
            ?.scrollIntoView({ behavior: "smooth" });
    });
});


// ===== DEV EASTER EGG =====
console.log(`
╔═══════════════════════════════╗
║   Welcome, Fellow Developer   ║
║   If you're reading this...   ║
║   we should probably talk.    ║
╚═══════════════════════════════╝
`);


// ===== TYPING EFFECT WITH CURSOR =====
const subtitle = document.querySelector(".subtitle");

if (subtitle) {
    const text = "Full-Stack Developer · Node.js · Express · PostgreSQL · Scalable Web Apps";
    subtitle.textContent = "";

    // Add blinking cursor
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    subtitle.appendChild(cursor);

    let i = 0;
    const typing = setInterval(() => {
        // Insert character before cursor
        subtitle.insertBefore(document.createTextNode(text[i]), cursor);
        i++;

        if (i >= text.length) {
            clearInterval(typing);
            // Remove cursor after typing finishes (optional — keep for aesthetic)
            setTimeout(() => {
                cursor.style.animation = 'blink 0.8s 3 forwards';
                setTimeout(() => cursor.remove(), 2500);
            }, 1000);
        }
    }, 55);
}


// ===== PARALLAX-LIKE TILT ON MOUSE MOVE (desktop only) =====
const isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (isHoverDevice) {
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.project');
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;

            // Only apply tilt to cards near the viewport center
            if (centerY > 0 && centerY < window.innerHeight) {
                const intensity = 2;
                card.style.transform =
                    `perspective(1000px) rotateY(${mouseX * intensity}deg) rotateX(${-mouseY * intensity}deg)`;
            }
        });
    });

    // Reset transforms on mouse leave
    document.addEventListener('mouseleave', () => {
        document.querySelectorAll('.project').forEach(card => {
            card.style.transform = '';
        });
    });
}