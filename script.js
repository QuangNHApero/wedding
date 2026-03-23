/**
 * Wedding Invitation - Garden Map
 * Interactive butterfly guide with auto-scroll
 */

// ===== Configuration =====
const CONFIG = {
    weddingDate: new Date('2026-06-15T18:00:00'),
    idleTimeout: 6000, // 6 seconds before auto-scroll
    scrollSpeed: 2000, // ms per station
    butterflySpeed: 0.1,
    leafCount: 15,
    leafInterval: 3000
};

// ===== State =====
const state = {
    currentStation: 0,
    totalStations: 7,
    isAutoScrolling: false,
    autoScrollEnabled: false,
    idleTimer: null,
    lastInteraction: Date.now(),
    butterflyTarget: { x: 0, y: 0 },
    butterflyPos: { x: window.innerWidth / 2, y: 100 },
    isScrolling: false
};

// ===== DOM Elements =====
const butterfly = document.getElementById('butterfly');
const butterflyHint = document.getElementById('butterflyHint');
const floatingLeaves = document.getElementById('floatingLeaves');
const gardenContainer = document.getElementById('gardenContainer');
const stationNav = document.getElementById('stationNav');
const autoScrollToggle = document.getElementById('autoScrollToggle');
const stations = document.querySelectorAll('.station');
const navDots = document.querySelectorAll('.nav-dot');

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initButterfly();
    initLeaves();
    initCountdown();
    initObserver();
    initNavigation();
    initAutoScroll();
    initRSVPForm();
    showInitialHint();
});

// ===== Butterfly =====
function initButterfly() {
    // Position butterfly at center top initially
    state.butterflyPos = {
        x: window.innerWidth / 2 - 25,
        y: 80
    };
    state.butterflyTarget = { ...state.butterflyPos };
    
    updateButterflyPosition();
    
    // Animate butterfly
    requestAnimationFrame(animateButterfly);
    
    // Track mouse/touch for butterfly to follow
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('touchmove', onTouchMove);
}

function onPointerMove(e) {
    if (!state.isAutoScrolling) {
        state.butterflyTarget = {
            x: e.clientX - 25,
            y: e.clientY - 40
        };
    }
    resetIdleTimer();
}

function onTouchMove(e) {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        if (!state.isAutoScrolling) {
            state.butterflyTarget = {
                x: touch.clientX - 25,
                y: touch.clientY - 40
            };
        }
    }
    resetIdleTimer();
}

function animateButterfly() {
    // Smooth interpolation towards target
    const dx = state.butterflyTarget.x - state.butterflyPos.x;
    const dy = state.butterflyTarget.y - state.butterflyPos.y;
    
    state.butterflyPos.x += dx * CONFIG.butterflySpeed;
    state.butterflyPos.y += dy * CONFIG.butterflySpeed;
    
    // Add slight floating motion
    const floatY = Math.sin(Date.now() / 500) * 5;
    const floatX = Math.sin(Date.now() / 700) * 3;
    
    updateButterflyPosition(floatX, floatY);
    
    // Rotate butterfly based on movement direction
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        butterfly.style.transform = `rotate(${angle + 90}deg)`;
    }
    
    requestAnimationFrame(animateButterfly);
}

function updateButterflyPosition(floatX = 0, floatY = 0) {
    butterfly.style.left = `${state.butterflyPos.x + floatX}px`;
    butterfly.style.top = `${state.butterflyPos.y + floatY}px`;
}

function moveButterflyToStation(stationIndex) {
    const station = stations[stationIndex];
    if (!station) return;
    
    const rect = station.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2 - 25;
    const targetY = rect.top + 100;
    
    state.butterflyTarget = { x: targetX, y: Math.max(50, targetY) };
}

// ===== Floating Leaves =====
function initLeaves() {
    // Create initial leaves
    for (let i = 0; i < CONFIG.leafCount; i++) {
        setTimeout(() => createLeaf(), i * 500);
    }
    
    // Continuously create new leaves
    setInterval(createLeaf, CONFIG.leafInterval);
}

function createLeaf() {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.textContent = Math.random() > 0.5 ? '🍃' : '🌿';
    
    // Random starting position
    leaf.style.left = `${Math.random() * 100}%`;
    leaf.style.animationDuration = `${15 + Math.random() * 15}s`;
    leaf.style.animationDelay = `${Math.random() * 5}s`;
    leaf.style.fontSize = `${16 + Math.random() * 16}px`;
    
    floatingLeaves.appendChild(leaf);
    
    // Remove leaf after animation
    setTimeout(() => leaf.remove(), 35000);
}

// ===== Countdown Timer =====
function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    const diff = CONFIG.weddingDate - now;
    
    if (diff <= 0) {
        document.getElementById('countdown-days').textContent = '🎉';
        document.getElementById('countdown-hours').textContent = '';
        document.getElementById('countdown-minutes').textContent = '';
        document.getElementById('countdown-seconds').textContent = '';
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('countdown-days').textContent = String(days).padStart(2, '0');
    document.getElementById('countdown-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('countdown-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('countdown-seconds').textContent = String(seconds).padStart(2, '0');
}

// ===== Intersection Observer =====
function initObserver() {
    const options = {
        root: null,
        rootMargin: '-30% 0px -30% 0px',
        threshold: 0.3
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                const stationIndex = parseInt(entry.target.dataset.station);
                if (!isNaN(stationIndex)) {
                    state.currentStation = stationIndex;
                    updateNavDots();
                    
                    // Move butterfly to current station when auto-scrolling
                    if (state.isAutoScrolling) {
                        moveButterflyToStation(stationIndex);
                    }
                }
            }
        });
    }, options);
    
    stations.forEach(station => observer.observe(station));
}

// ===== Navigation =====
function initNavigation() {
    navDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetStation = parseInt(dot.dataset.target);
            scrollToStation(targetStation);
            resetIdleTimer();
        });
    });
}

function updateNavDots() {
    navDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === state.currentStation);
    });
}

function scrollToStation(index) {
    const station = stations[index];
    if (!station) return;
    
    state.isScrolling = true;
    
    station.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    
    setTimeout(() => {
        state.isScrolling = false;
    }, 1000);
}

// ===== Auto Scroll =====
function initAutoScroll() {
    // Toggle button
    autoScrollToggle.addEventListener('click', () => {
        state.autoScrollEnabled = !state.autoScrollEnabled;
        autoScrollToggle.classList.toggle('active', state.autoScrollEnabled);
        
        if (state.autoScrollEnabled) {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
    });
    
    // Track user interaction
    document.addEventListener('scroll', () => {
        if (!state.isAutoScrolling) {
            resetIdleTimer();
        }
    });
    
    document.addEventListener('click', resetIdleTimer);
    document.addEventListener('touchstart', resetIdleTimer);
}

function resetIdleTimer() {
    state.lastInteraction = Date.now();
    
    // If auto-scrolling was active, pause it
    if (state.isAutoScrolling) {
        pauseAutoScroll();
    }
    
    // Clear existing timer
    if (state.idleTimer) {
        clearTimeout(state.idleTimer);
    }
    
    // Set new timer if auto-scroll is enabled
    if (state.autoScrollEnabled) {
        state.idleTimer = setTimeout(() => {
            if (state.autoScrollEnabled) {
                resumeAutoScroll();
            }
        }, CONFIG.idleTimeout);
    }
}

function startAutoScroll() {
    state.isAutoScrolling = true;
    autoScrollToNext();
}

function stopAutoScroll() {
    state.isAutoScrolling = false;
    if (state.idleTimer) {
        clearTimeout(state.idleTimer);
    }
}

function pauseAutoScroll() {
    state.isAutoScrolling = false;
    butterfly.classList.add('resting');
}

function resumeAutoScroll() {
    state.isAutoScrolling = true;
    butterfly.classList.remove('resting');
    autoScrollToNext();
}

function autoScrollToNext() {
    if (!state.autoScrollEnabled || !state.isAutoScrolling) return;
    
    const nextStation = (state.currentStation + 1) % state.totalStations;
    
    // Move butterfly first
    moveButterflyToStation(nextStation);
    
    // Then scroll after a short delay
    setTimeout(() => {
        if (state.isAutoScrolling) {
            scrollToStation(nextStation);
            
            // Schedule next auto-scroll
            setTimeout(() => {
                if (state.isAutoScrolling && state.autoScrollEnabled) {
                    autoScrollToNext();
                }
            }, CONFIG.scrollSpeed);
        }
    }, 500);
}

// ===== Initial Hint =====
function showInitialHint() {
    setTimeout(() => {
        butterflyHint.classList.add('visible');
        
        setTimeout(() => {
            butterflyHint.classList.remove('visible');
        }, 4000);
    }, 2000);
}

// ===== RSVP Form =====
function initRSVPForm() {
    const form = document.getElementById('rsvpForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('guestName').value,
            count: document.getElementById('guestCount').value,
            wish: document.getElementById('guestWish').value
        };
        
        // Here you would send to a backend
        console.log('RSVP Submitted:', formData);
        
        // Show success feedback
        const btn = form.querySelector('.submit-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>Đã gửi! ✓</span>';
        btn.style.background = 'linear-gradient(135deg, #4A7C59, #2F4F4F)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            form.reset();
        }, 3000);
    });
}

// ===== Utility Functions =====
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ===== Window Events =====
window.addEventListener('resize', () => {
    // Recalculate butterfly bounds
    state.butterflyPos.x = clamp(state.butterflyPos.x, 0, window.innerWidth - 50);
    state.butterflyPos.y = clamp(state.butterflyPos.y, 0, window.innerHeight - 50);
});

// Prevent scroll while auto-scrolling
let ticking = false;
window.addEventListener('wheel', (e) => {
    if (state.isAutoScrolling) {
        pauseAutoScroll();
    }
}, { passive: true });
