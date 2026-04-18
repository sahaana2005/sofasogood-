const { useState, useEffect, useRef, useCallback } = React;

const CATALOG = [
    { id: 'sofa', label: 'sofa', emoji: '🛋️', w: 160, h: 65, color: '#8B7D4A', h3d: 0.85, price: 25000 },
    { id: 'cupboard', label: 'cupboard', emoji: '🗄️', w: 80, h: 120, color: '#6B5B3A', h3d: 1.9, price: 12000 },
    { id: 'wardrobe', label: 'wardrobe', emoji: '🚪', w: 100, h: 130, color: '#5C4A2E', h3d: 1.9, price: 18000 },
    { id: 'bed', label: 'bed', emoji: '🛏️', w: 150, h: 110, color: '#C4884A', h3d: 0.55, price: 22000 },
    { id: 'desk', label: 'desk', emoji: '🖥️', w: 120, h: 60, color: '#D4C68E', h3d: 0.52, price: 8500 },
    { id: 'bookshelf', label: 'bookshelf', emoji: '📚', w: 70, h: 120, color: '#7A6438', h3d: 1.9, price: 9500 },
    { id: 'tv_unit', label: 'tv unit', emoji: '📺', w: 140, h: 50, color: '#3A3020', h3d: 0.52, price: 11000 },
    { id: 'armchair', label: 'armchair', emoji: '💺', w: 80, h: 75, color: '#C9A84C', h3d: 0.85, price: 8000 },
    { id: 'plant', label: 'plant', emoji: '🌿', w: 50, h: 65, color: '#5A8A3A', h3d: 1.0, price: 1500 },
    { id: 'lamp', label: 'lamp', emoji: '💡', w: 45, h: 110, color: '#F5F0E8', h3d: 1.65, price: 2500 },
    { id: 'rug', label: 'rug', emoji: '🟫', w: 160, h: 90, color: '#8B6B2A', h3d: 0.05, price: 6000 },
    { id: 'dining', label: 'dining', emoji: '🍽️', w: 130, h: 85, color: '#6B4420', h3d: 0.52, price: 15000 },
    { id: 'coffee', label: 'coffee', emoji: '☕', w: 100, h: 55, color: '#9A8C6A', h3d: 0.52, price: 5500 },
    { id: 'sideboard', label: 'sideboard', emoji: '🪵', w: 130, h: 55, color: '#5A4A2E', h3d: 0.52, price: 10000 },
    { id: 'dining_chair', label: 'chair', emoji: '🪑', w: 50, h: 50, color: '#8B5E3C', h3d: 0.95, price: 4500 },
    { id: 'nightstand', label: 'nightstand', emoji: '🗃️', w: 50, h: 40, color: '#5A4A2E', h3d: 0.55, price: 3500 },
    { id: 'ottoman', label: 'ottoman', emoji: '🛋️', w: 80, h: 60, color: '#C9A84C', h3d: 0.4, price: 4000 }
];

const ROOM_TYPES = ['Living Room', 'Bedroom', 'Kitchen', 'Home Office', 'Dining Room'];
const SWATCHES = ['#D4C68E', '#F5F0E8', '#C4884A', '#8B7D4A', '#C9A84C', '#5A8A3A', '#6B4420', '#3A3020', '#8B6B2A', '#5C4A2E', '#9A8C6A', '#C45A3A', '#7A6438', '#5A4A2E'];

// Math Helpers for 3D
function normalize(v) {
    const mag = Math.hypot(v.x, v.y, v.z);
    return mag === 0 ? { x: 0, y: 0, z: 0 } : { x: v.x / mag, y: v.y / mag, z: v.z / mag };
}
function cross(a, b) { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }

function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

// ===== EXPORT TO PDF =====
function exportToPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 0;

    // --- Clean Header ---
    doc.setFillColor(35, 35, 35);
    doc.rect(0, 0, pageW, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('SOFA, SO GOOD!', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('Interior Design Quotation', margin, 20);

    const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text(dateStr, pageW - margin, 12, { align: 'right' });

    y = 38;

    // --- Room type ---
    if (data.rt) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Room:', margin, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(data.rt, margin + 16, y);
        y += 12;
    }

    // --- Thin separator ---
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // --- Group items by catalog id, count quantities ---
    const grouped = {};
    data.items.forEach(it => {
        if (!grouped[it.id]) {
            grouped[it.id] = { ...it, qty: 0 };
        }
        grouped[it.id].qty += 1;
    });
    const rows = Object.values(grouped);
    const grandTotal = data.items.reduce((s, it) => s + (it.price || 0), 0);

    // --- Items Table ---
    const tableBody = rows.map((r, i) => [
        (i + 1).toString(),
        r.label.charAt(0).toUpperCase() + r.label.slice(1),
        formatCurrency(r.price || 0),
        r.qty.toString(),
        formatCurrency((r.price || 0) * r.qty)
    ]);

    doc.autoTable({
        startY: y,
        margin: { left: margin, right: margin },
        head: [['#', 'Item', 'Unit Price', 'Qty', 'Line Total']],
        body: tableBody,
        theme: 'striped',
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [50, 50, 50],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'left',
            lineColor: [200, 200, 200],
            lineWidth: 0.3
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [40, 40, 40],
            cellPadding: 5,
            lineColor: [230, 230, 230],
            lineWidth: 0.15
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 },
            1: { halign: 'left', cellWidth: 60 },
            2: { halign: 'right', cellWidth: 38 },
            3: { halign: 'center', cellWidth: 18 },
            4: { halign: 'right', cellWidth: 42 }
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        styles: {
            font: 'helvetica',
            overflow: 'linebreak'
        }
    });

    y = doc.lastAutoTable.finalY + 2;

    // --- Grand Total Row (clean) ---
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Grand Total', margin, y);
    doc.text(formatCurrency(grandTotal), pageW - margin, y, { align: 'right' });

    y += 4;
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.8);
    doc.line(pageW - margin - 50, y, pageW - margin, y);

    // --- Footer ---
    const footerY = pageH - 12;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 6, pageW - margin, footerY - 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text('Sofa, So Good! — Interior Design Quotation', margin, footerY);
    doc.text('Page 1', pageW - margin, footerY, { align: 'right' });

    // Open in a new tab instead of silent download so the user can actually see their receipt!
    window.open(doc.output('bloburl'), '_blank');
}

// Expose to window for the App component
window.exportToPDF = exportToPDF;

// ===== MODERN BUDGET HUD =====
function StickyBudgetBar({ items }) {
    const total = items.reduce((s, it) => s + (it.price || 0), 0);
    return (
        <div className="budget-hud anim-slide-down" style={{ zIndex: 90 }}>
            <div className="budget-hud-inner">
                <div className="flex" style={{ gap: 40, alignItems: 'center' }}>
                    <div className="flex col">
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: 1 }}>PROJECT VALUE</span>
                        <span style={{ fontSize: 18, fontWeight: 800 }}>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex col">
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>ASSET COUNT</span>
                        <span style={{ fontSize: 18, fontWeight: 800 }}>{items.length} Units</span>
                    </div>
                </div>
                <div className="flex" style={{ gap: 12 }}>
                    <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.05)', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>Active Workspace</div>
                </div>
            </div>
        </div>
    );
}

// ===== MODERN UTILITIES =====
function ModernStatus({ label, value, icon }) {
    return (
        <div className="flex center" style={{ gap: 12, padding: '12px 20px', background: 'white', borderRadius: 16, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 24 }}>{icon}</span>
            <div className="col">
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 800 }}>{value}</span>
            </div>
        </div>
    );
}

function ModernProgress({ pct }) {
    return (
        <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 10, overflow: 'hidden', marginTop: 12 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }} />
        </div>
    );
}

// ===== FLOATING FURNITURE SYSTEM (Blast Animation) =====
function FloatingFurniture() {
    const canvasRef = useRef(null);
    const furnitureRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let frame;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            furnitureRef.current = Array.from({ length: 15 }).map(() => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: 40 + Math.random() * 40,
                opacity: 0.05 + Math.random() * 0.1,
                emoji: ['🪴', '🪑', '🛋️', '🛋️'][Math.floor(Math.random() * 4)]
            }));
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            furnitureRef.current.forEach(f => {
                f.x += f.vx;
                f.y += f.vy;
                if (f.x < -100) f.x = canvas.width + 100;
                if (f.x > canvas.width + 100) f.x = -100;
                if (f.y < -100) f.y = canvas.height + 100;
                if (f.y > canvas.height + 100) f.y = -100;

                ctx.save();
                ctx.globalAlpha = f.opacity;
                ctx.font = `${f.size}px serif`;
                ctx.fillText(f.emoji, f.x, f.y);
                ctx.restore();
            });
            frame = requestAnimationFrame(render);
        };

        window.addEventListener('resize', resize);
        resize();
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(frame);
        };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

// ===== SCROLL REVEAL HOOK =====
function useScrollReveal() {
    useEffect(() => {
        const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        els.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);
}

// ===== ANIMATED COUNTER =====
function AnimatedCounter({ target, suffix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !started.current) {
                started.current = true;
                const duration = 1800;
                const startTime = performance.now();
                const step = (now) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.round(eased * target));
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target]);

    return <span ref={ref}>{count}{suffix}</span>;
}

// ===== STAR SVG =====
function StarSVG({ style }) {
    return (
        <div className="star-deco" style={style}>
            <svg viewBox="0 0 24 24"><path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41Z"/></svg>
        </div>
    );
}

// ===== STAGE 1: LANDING PAGE =====
function Stage1({ onNext }) {
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [navScrolled, setNavScrolled] = useState(false);
    const [uploadedPhoto, setUploadedPhoto] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useScrollReveal();

    useEffect(() => {
        document.body.classList.remove('no-scroll');
        const handleScroll = () => {
            setNavScrolled(window.scrollY > 60);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.body.classList.add('no-scroll');
        };
    }, []);

    const handleUpload = (file) => {
        if (!file) return;
        setLoading(true);
        const objUrl = URL.createObjectURL(file);
        setUploadedPhoto(objUrl);
        setLoading(false);
    };

    const startCamera = async () => {
        setUploadedPhoto(null);
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error(err);
            alert("Camera access denied or unavailable.");
            setShowCamera(false);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgUrl = canvas.toDataURL('image/png');
        stopCamera();
        setUploadedPhoto(imgUrl);
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setShowCamera(false);
    };

    const scrollToUpload = () => {
        document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const projectImages = [
        { url: 'images/living-room.png', title: 'Contemporary Lounge', type: 'Living Room' },
        { url: 'images/bedroom.png', title: 'Serene Retreat', type: 'Bedroom' },
        { url: 'images/dining.png', title: 'Dining Studio', type: 'Dining Room' },
        { url: 'images/render-1.png', title: 'Creative Workshop', type: 'Home Office' },
        { url: 'images/render-2.png', title: 'Nordic Kitchen', type: 'Kitchen' },
        { url: 'images/render-3.png', title: 'Grand Suite', type: 'Bedroom' }
    ];

    return (
        <div style={{ width: '100%', minHeight: '100vh', overflow: 'auto' }}>
            {/* === NAVIGATION === */}
            <nav className={`landing-nav ${navScrolled ? 'scrolled' : ''}`}>
                <div className="logo">SOFA, <em>SO GOOD!</em></div>
                <div className="nav-links">
                    <a href="#about">About</a>
                    <a href="#process">Process</a>
                    <a href="#projects">Projects</a>
                    <a href="#testimonials">Reviews</a>
                    <a href="#upload-section" className="nav-cta" onClick={(e) => { e.preventDefault(); scrollToUpload(); }}>Start Designing</a>
                </div>
            </nav>

            {/* === HERO SECTION === */}
            <section className="hero-section" id="hero">
                <StarSVG style={{ top: '12%', left: '15%', animationDelay: '0s' }} />
                <StarSVG style={{ top: '25%', right: '48%', animationDelay: '1s' }} />
                <StarSVG style={{ bottom: '30%', left: '30%', animationDelay: '2s' }} />

                <div className="hero-badge">
                    <span className="dot"></span>
                    Welcome to Sofa, So Good!
                </div>
                <h1 className="hero-title">
                    WE CRAFT <span className="accent-word">SPACES</span> & LIVING EXPERIENCES
                </h1>
                <p className="hero-description">
                    Elevate your room's character with our AI-powered interior design engine.
                    From spatial scans to photorealistic 3D renders, we bring your vision to life.
                </p>
                <div className="hero-actions">
                    <button className="hero-btn-primary" onClick={scrollToUpload}>
                        Let's Design
                        <span className="arrow">→</span>
                    </button>
                    <button className="hero-btn-secondary" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
                        Learn More
                    </button>
                </div>
                <div className="hero-stats">
                    <div className="hero-stat">
                        <div className="number"><AnimatedCounter target={250} suffix="+" /></div>
                        <div className="label">Rooms Designed</div>
                    </div>
                    <div className="hero-stat">
                        <div className="number"><AnimatedCounter target={40} suffix="%" /></div>
                        <div className="label">Satisfaction Increase</div>
                    </div>
                    <div className="hero-stat">
                        <div className="number"><AnimatedCounter target={14} suffix="" /></div>
                        <div className="label">Furniture Categories</div>
                    </div>
                    <div className="hero-stat">
                        <div className="number"><AnimatedCounter target={3} suffix="D" /></div>
                        <div className="label">Real-Time Preview</div>
                    </div>
                </div>

                {/* Floating cards */}
                <div className="hero-float-area">
                    <div className="hero-float-card">
                        <img src="images/living-room.png" alt="Living Room" />
                    </div>
                    <div className="hero-float-card">
                        <img src="images/bedroom.png" alt="Bedroom" />
                    </div>
                    <div className="hero-float-card">
                        <img src="images/dining.png" alt="Dining" />
                    </div>
                </div>
            </section>

            {/* === MARQUEE STRIP === */}
            <div className="marquee-section">
                <div className="marquee-track">
                    {[...Array(2)].map((_, setIdx) => (
                        <React.Fragment key={setIdx}>
                            {['AI-Powered Design', '3D Visualization', 'Smart Layouts', 'Precision Planning', 'PDF Quotations', 'Real-Time Rendering', 'Drag & Drop', 'Budget Tracking'].map((item, i) => (
                                <div className="marquee-item" key={`${setIdx}-${i}`}>
                                    <span className="sep"></span>
                                    {item}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* === ABOUT SECTION === */}
            <section className="about-section" id="about">
                <div className="about-left reveal-left">
                    <div className="section-label">About Us</div>
                    <h2 className="section-title">Meet Sofa, So Good! Your Design Partners</h2>
                    <p className="section-desc">
                        We're not just a tool — we're your creative co-pilot. Sofa, So Good! combines
                        cutting-edge AI vision with an intuitive spatial editor. From analyzing your room's
                        architecture to generating photorealistic 3D renders, we transform how you imagine
                        and design your living spaces.
                    </p>
                    <div className="about-stat-card">
                        <div className="big-num"><AnimatedCounter target={40} suffix="%" /></div>
                        <div className="sub">Increased design confidence reported by our users</div>
                    </div>
                    <div className="service-tags stagger-children">
                        <span className="service-tag">Room Design</span>
                        <span className="service-tag">AI Analysis</span>
                        <span className="service-tag">3D Preview</span>
                        <span className="service-tag">Smart Budgeting</span>
                        <span className="service-tag">PDF Quotation</span>
                        <span className="service-tag">Spatial Planning</span>
                    </div>
                </div>
                <div className="about-right reveal-right">
                    <div className="about-image-grid">
                        <div className="img-card">
                            <img src="images/render-1.png" alt="Design Process" />
                        </div>
                        <div className="img-card">
                            <img src="images/render-3.png" alt="Styled Room" />
                        </div>
                    </div>
                </div>
            </section>

            {/* === HOW IT WORKS === */}
            <section className="how-section" id="process">
                <div className="reveal">
                    <div className="section-label">How We Work</div>
                    <h2 className="section-title">Let us show you how we drive<br/>your space to new heights</h2>
                </div>
                <div className="how-cards stagger-children">
                    <div className="how-card">
                        <div className="step-icon">📸</div>
                        <div className="step-num">01</div>
                        <div className="step-title">Upload</div>
                        <div className="step-desc">Drag & drop a photo of your room or upload a floorplan. Our AI instantly starts its spatial analysis.</div>
                    </div>
                    <div className="how-card">
                        <div className="step-icon">🧠</div>
                        <div className="step-num">02</div>
                        <div className="step-title">Analyze</div>
                        <div className="step-desc">Our vision engine detects architectural features, lighting zones, and suggests optimal furniture placement.</div>
                    </div>
                    <div className="how-card">
                        <div className="step-icon">🎨</div>
                        <div className="step-num">03</div>
                        <div className="step-title">Design</div>
                        <div className="step-desc">Place furniture from our curated catalog. Resize, reposition, and customize every piece on an interactive canvas.</div>
                    </div>
                    <div className="how-card">
                        <div className="step-icon">✨</div>
                        <div className="step-num">04</div>
                        <div className="step-title">Render</div>
                        <div className="step-desc">Generate stunning 3D visualizations and photorealistic AI renders. Export professional PDF quotations instantly.</div>
                    </div>
                </div>
            </section>

            {/* === PROJECTS SHOWCASE === */}
            <section className="projects-section" id="projects">
                <div className="reveal">
                    <div className="section-label" style={{ color: 'var(--accent)' }}>Portfolio</div>
                    <h2 className="section-title">Explore our most successful projects</h2>
                    <p className="section-desc">Every design is unique. Here's a sample of AI-generated room transformations.</p>
                </div>
                <div className="projects-grid stagger-children">
                    {projectImages.map((proj, i) => (
                        <div className="project-card" key={i}>
                            <img src={proj.url} alt={proj.title} loading="lazy" />
                            <div className="project-overlay">
                                <div className="proj-title">{proj.title}</div>
                                <div className="proj-type">{proj.type}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* === TESTIMONIALS === */}
            <section className="testimonials-section" id="testimonials">
                <div className="reveal">
                    <div className="section-label">Testimonials</div>
                    <h2 className="section-title">Here's what people say about our tool</h2>
                </div>
                <div className="testimonials-grid stagger-children">
                    {[
                        { quote: "Sofa, So Good! completely transformed how I plan my living space. The AI suggestions were spot-on and the 3D preview blew my mind!", name: "Priya M.", role: "Interior Enthusiast", initials: "PM" },
                        { quote: "As an interior designer, this tool saves me hours. The budget tracking and PDF quotation export are game changers for client presentations.", name: "Arjun K.", role: "Professional Designer", initials: "AK" },
                        { quote: "I was skeptical about AI design tools, but the spatial analysis and furniture recommendations were incredibly accurate. Highly recommend!", name: "Sneha R.", role: "Home Owner", initials: "SR" }
                    ].map((t, i) => (
                        <div className="testimonial-card" key={i}>
                            <div className="quote">"{t.quote}"</div>
                            <div className="author">
                                <div className="avatar">{t.initials}</div>
                                <div>
                                    <div className="author-name">{t.name}</div>
                                    <div className="author-role">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* === CTA / UPLOAD SECTION === */}
            <section className="cta-section" id="upload-section">
                <div className="reveal">
                    <div className="section-label" style={{ textAlign: 'center' }}>Get Started</div>
                    <h2 className="section-title">Let's start designing your dream space</h2>
                    <p className="section-desc" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
                        Upload a photo of your room and let our AI engine work its magic.
                    </p>
                </div>
                <div style={{ position: 'relative' }}>
                    {showCamera ? (
                        <div className="anim-slide-down" style={{ textAlign: 'center', margin: '20px auto', maxWidth: 800, padding: 40, background: 'var(--surface)', border: '4px solid var(--border)', borderRadius: 16 }}>
                            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#000', marginBottom: 24, boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
                                <video ref={videoRef} style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} playsInline autoPlay muted />
                            </div>
                            <div className="flex center" style={{ gap: 16 }}>
                                <button className="btn-outline" onClick={stopCamera}>Cancel</button>
                                <button className="btn-modern" onClick={capturePhoto}>Take Photo 📸</button>
                            </div>
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </div>
                    ) : !uploadedPhoto ? (
                        <div 
                            className={`upload-zone reveal-scale ${dragging ? 'dragging' : ''}`}
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files[0]); }}
                        >
                            <input id="file-upload" type="file" accept="image/*" hidden onChange={e => handleUpload(e.target.files[0])} />
                            <div className="upload-icon">📸</div>
                            <h3>Initialize Spatial Scan</h3>
                            <p>Drag & drop your floorplan, browse files, or capture from camera</p>
                            <div className="flex center" style={{ gap: 16, marginTop: 24 }}>
                                <button className="upload-btn" onClick={() => document.getElementById('file-upload').click()}>Browse Local Files</button>
                                <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 32px', fontSize: 13 }} onClick={startCamera}>
                                    <span>📸</span> Use Camera
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="anim-fade" style={{ textAlign: 'center', margin: '40px auto 20px', maxWidth: 800 }}>
                            <div style={{ padding: 8, background: 'rgba(255,255,255,0.05)', border: '2px solid var(--gold)', borderRadius: 16, display: 'inline-block', marginBottom: 24, boxShadow: '0 0 30px rgba(212,175,55,0.1)' }}>
                                <img src={uploadedPhoto} alt="Uploaded Room" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, display: 'block', objectFit: 'contain' }} />
                            </div>
                            <div className="flex center" style={{ gap: 16 }}>
                                <button className="btn-outline" onClick={() => setUploadedPhoto(null)}>⟲ Replace Photo</button>
                                <button className="btn-modern" style={{ padding: '16px 32px', fontSize: 13 }} onClick={() => onNext({ photo: uploadedPhoto, rt: 'Living Room' })}>Confirm Spatial Scan ✦</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex center" style={{ marginTop: 32, gap: 40 }}>
                    <div className="flex center" style={{ gap: 10 }}>
                        <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>AI Precision</span>
                    </div>
                    <div className="flex center" style={{ gap: 10 }}>
                        <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>Real-Time 3D</span>
                    </div>
                    <div className="flex center" style={{ gap: 10 }}>
                        <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>PDF Export</span>
                    </div>
                </div>
            </section>

            {/* === FOOTER === */}
            <footer className="landing-footer">
                <div className="footer-logo">SOFA, <em>SO GOOD!</em></div>
                <div className="footer-links">
                    <a href="#about">About</a>
                    <a href="#process">Process</a>
                    <a href="#projects">Projects</a>
                    <a href="#testimonials">Reviews</a>
                </div>
                <div className="footer-copy">© 2026 Sofa, So Good! All rights reserved.</div>
            </footer>

            {/* Loading overlay */}
            {loading && (
                <div className="landing-loading">
                    <div style={{ width: 48, height: 48, border: '4px solid #eee', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: '#999', letterSpacing: 1 }}>ANALYZING SPATIAL DATA...</div>
                </div>
            )}
        </div>
    );
}

// ===== STAGE 1.5: AESTHETIC QUESTIONNAIRE =====
function Stage1_5({ data, onNext }) {
    const questions = [
        { q: "DESIGN AESTHETIC", opts: ["Modern Minimalist", "Bohemian", "Industrial", "Mid-Century Modern", "Scandinavian", "Eclectic"] },
        { q: "PRIMARY FUNCTION", opts: ["Relaxation", "Focus / Work", "Entertainment", "Storage Heavy"] },
        { q: "COLOR PALETTE", opts: ["Earthy & Warm", "Cool & Calming", "High Contrast Dark", "Vibrant Accents"] },
        { q: "LIGHTING TARGET", opts: ["Bright Natural", "Moody & Atmospheric", "Warm & Cozy", "Dynamic Glow"] },
        { q: "MATERIAL FINISH", opts: ["Natural Wood & Stone", "Sleek Metal & Glass", "Soft Plush Fabrics", "Raw / Unfinished"] },
        { q: "PROJECT BUDGET LIMIT", opts: null } // Handled with an input field
    ];
    const [answers, setAnswers] = useState(Array(6).fill(""));
    const [step, setStep] = useState(0);
    const [qAnim, setQAnim] = useState("q-in");
    const [budgetInput, setBudgetInput] = useState('');

    const handleSelect = (opt) => {
        if (qAnim === "q-out") return; // Prevent spam clicking

        const newAns = [...answers];
        newAns[step] = opt;
        setAnswers(newAns);
        setQAnim("q-out");

        setTimeout(() => {
            if (step < 5) {
                setStep(step + 1);
                setQAnim("q-in");
            } else {
                onNext({ prefs: newAns.slice(0, 5), budget: Number(newAns[5]) || 0 });
            }
        }, 350);
    };

    const progress = (step / 6) * 100;

    return (
        <div className="flex center fh fw rel anim-fade" style={{ 
            backgroundImage: `linear-gradient(rgba(35, 30, 20, 0.85), rgba(35, 30, 20, 0.95)), url(${data.photo})`, 
            backgroundSize: 'cover', backgroundPosition: 'center', overflowY: 'auto', padding: 40 
        }}>
            <style>{`
                @keyframes q-slide-in {
                    from { opacity: 0; transform: translateX(60px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes q-slide-out {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(-60px); }
                }
                .q-in { animation: q-slide-in 0.35s cubic-bezier(0.1, 0.7, 0.3, 1) forwards; }
                .q-out { animation: q-slide-out 0.35s cubic-bezier(0.7, 0.1, 0.9, 0.3) forwards; }
                .opt-btn {
                    padding: 16px 24px; font-size: 11px; cursor: pointer; font-family: inherit;
                    background: var(--card); color: var(--text-primary);
                    border: 4px solid var(--border); transition: 0.15s;
                    box-shadow: 6px 6px 0px var(--dark);
                    text-transform: uppercase; font-weight: 800; letter-spacing: 1px;
                }
                .opt-btn:hover {
                    background: var(--gold); color: var(--dark);
                    transform: translateY(-4px); box-shadow: 10px 10px 0px var(--dark);
                }
                .opt-btn:active {
                    transform: translateY(2px); box-shadow: 0px 0px 0px var(--dark);
                }
            `}</style>
            
            <div className="col" style={{ maxWidth: 740, width: '100%', background: 'var(--surface)', padding: 64, border: '4px solid var(--border)', boxShadow: '12px 12px 0px var(--dark)', overflow: 'hidden' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: 2, marginBottom: 8 }}>PLAYER STYLE PROFILE</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Configure parameters for the AI Engine</div>
                </div>

                <div style={{ width: '100%', height: 12, background: 'var(--card)', border: '4px solid var(--dark)', marginBottom: 48, position: 'relative' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gold)', transition: 'width 0.4s cubic-bezier(0.1, 0.7, 0.3, 1)' }}></div>
                </div>

                <div className={`col ${qAnim}`} style={{ minHeight: 220, justifyContent: 'center' }}>
                    {step < 6 && (
                        <React.Fragment>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32 }}>
                                QUESTION {step + 1} OF 6 <br/><br/><span style={{ color: 'var(--gold)', fontSize: 24 }}>{questions[step].q}</span>
                            </div>
                            
                            {step === 5 ? (
                                <div className="flex" style={{ gap: 16, justifyContent: 'center' }}>
                                    <input 
                                        type="number" 
                                        placeholder="Enter limit in ₹ (or 0 for unlimited)"
                                        value={budgetInput}
                                        onChange={(e) => setBudgetInput(e.target.value)}
                                        style={{ padding: '16px 24px', fontSize: 16, width: 320, background: 'var(--card)', color: 'var(--text-primary)', border: '4px solid var(--border)', textAlign: 'center', outline: 'none' }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSelect(budgetInput || "0");
                                            }
                                        }}
                                    />
                                    <button className="opt-btn" onClick={() => handleSelect(budgetInput || "0")}>CONFIRM</button>
                                </div>
                            ) : (
                                <div className="flex" style={{ gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {questions[step].opts.map(opt => (
                                        <button key={opt} className="opt-btn" onClick={() => handleSelect(opt)}>{opt}</button>
                                    ))}
                                </div>
                            )}
                        </React.Fragment>
                    )}
                </div>
            </div>
        </div>
    );
}

// ===== STAGE 2: AI ANALYSIS =====
function Stage2({ data, onNext }) {
    const [pct, setPct] = useState(0);
    const [lbl, setLbl] = useState("Initializing vision engine...");
    const [findings, setFindings] = useState([]);

    useEffect(() => {
        let p = 0;
        const i = setInterval(() => {
            p += Math.random() * 8 + 2;
            if (p > 100) p = 100;
            setPct(p);
            if (p >= 28 && p < 58) setLbl("LEVEL 1: Aesthetic Analysis...");
            else if (p >= 58 && p < 88) setLbl("LEVEL 2: Sourcing Geometries...");
            else if (p >= 88 && p < 100) setLbl("LEVEL 3: Finalizing Architecture...");

            if (p >= 100) {
                clearInterval(i);
                setTimeout(() => onNext({
                    obs: ["Deep walnut architectural textures", "Neutral beige surfaces with matte finish", "Natural lateral lighting from multiple zones", "Open-concept modern living plan"],
                    sugs: [{ id: 'sofa', reason: 'High-impact focal point for the main lounge' }, { id: 'rug', reason: 'Defines the central seating area' }, { id: 'plant', reason: 'Injects organic visual depth' }]
                }), 800);
            }
        }, 120);

        const to1 = setTimeout(() => setFindings(f => [...f, "Space: " + data.rt]), 400);
        const to2 = setTimeout(() => setFindings(f => [...f, "Lighting: Dual Zone Ambient"]), 1000);
        const to3 = setTimeout(() => setFindings(f => [...f, "Style Target: Contemporary Luxury"]), 1600);

        return () => { clearInterval(i); clearTimeout(to1); clearTimeout(to2); clearTimeout(to3); };
    }, [data, onNext]);

    return (
        <div className="flex center fh fw rel anim-fade" style={data.photo ? { 
            backgroundImage: `linear-gradient(rgba(45, 38, 25, 0.85), rgba(45, 38, 25, 0.95)), url(${data.photo})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
        } : { background: 'var(--bg)' }}>
            <div className="col" style={{ width: 440, background: 'var(--surface)', padding: 48, border: '4px solid var(--border)', boxShadow: '8px 8px 0px var(--dark)' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: 2, marginBottom: 8 }}>AI VISION ENGINE</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lbl}</div>
                </div>

                <ModernProgress pct={pct} />
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textAlign: 'right', marginTop: 8 }}>{Math.round(pct)}% COMPLETE</div>

                <div className="col" style={{ marginTop: 40, gap: 16 }}>
                    {findings.map((f, i) => (
                        <div key={i} className="flex" style={{ alignItems: 'center', gap: 16, fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                            <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }} />
                            {f}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ===== STAGE 3: DESIGN CANVAS =====
function Stage3({ data, nextStage, onItemsChange, onBudgetChange }) {
    const [items, setItems] = useState([]);
    const [sirenActive, setSirenActive] = useState(false);
    const [sirenAlertData, setSirenAlertData] = useState(null);
    const [sel, setSel] = useState(null);
    const [tab, setTab] = useState('items');
    const [hints, setHints] = useState(true);
    const [toast, setToast] = useState('');
    const wrapRef = useRef();

    const [cvSize, setCvSize] = useState({ w: 800, h: 600 });
    const [showCad, setShowCad] = useState(false);

    useEffect(() => {
        const updateSize = () => {
            if (wrapRef.current) setCvSize({ w: wrapRef.current.clientWidth, h: wrapRef.current.clientHeight });
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [wrapRef.current]);

    useEffect(() => {
        let audio;
        if (sirenActive) {
            audio = new Audio('../fah.mp3');
            audio.loop = true;
            audio.play().catch(e => console.error("Audio play failed:", e));
        }
        
        return () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, [sirenActive]);

    const addItem = (catItem) => {
        const currentTotal = items.reduce((s, it) => s + (it.price || 0), 0);
        if (data.budget > 0 && currentTotal + catItem.price > data.budget) {
            if (!sirenActive) {
                setSirenActive(true);
                setSirenAlertData(`Cannot add ${catItem.label}! Budget limit of ${formatCurrency(data.budget)} will be exceeded.`);
            }
            return;
        }
        const w = wrapRef.current ? wrapRef.current.clientWidth : 800;
        const h = wrapRef.current ? wrapRef.current.clientHeight : 600;
        const it = {
            uid: Math.random().toString(36).substr(2, 9),
            ...catItem,
            x: w / 2 - catItem.w / 2 + (Math.random() * 40 - 20),
            y: h / 2 - catItem.h / 2 + (Math.random() * 40 - 20),
        };
        setItems(prev => [...prev, it]);
        setSel(it.uid);
    };

    const delItem = (uid) => { setItems(prev => prev.filter(i => i.uid !== uid)); if (sel === uid) setSel(null); };
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    // Sync items to App whenever they change
    useEffect(() => {
        if (onItemsChange) onItemsChange(items);
    }, [items, onItemsChange]);

    const [drag, setDrag] = useState(null);

    useEffect(() => {
        const move = (e) => {
            if (!drag) return;
            if (drag.type === 'move') {
                setItems(prev => prev.map(i => {
                    if (i.uid !== drag.uid) return i;
                    let nx = drag.initX + (e.clientX - drag.startX);
                    let ny = drag.initY + (e.clientY - drag.startY);
                    return { ...i, x: nx, y: ny };
                }));
            } else if (drag.type === 'resize') {
                setItems(prev => prev.map(i => {
                    if (i.uid !== drag.uid) return i;
                    let nw = Math.max(40, drag.initW + (e.clientX - drag.startX));
                    let nh = Math.max(30, drag.initH + (e.clientY - drag.startY));
                    return { ...i, w: nw, h: nh };
                }));
            }
        };
        const up = () => setDrag(null);
        if (drag) {
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', up);
        }
        return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    }, [drag]);

    const [layoutImg, setLayoutImg] = useState(null);

    const generateLayoutImage = useCallback(() => {
      if (!wrapRef.current || items.length === 0) {
        showToast('Place furniture blocks first ⛏️');
        return;
      }
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const rect = wrapRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      // Draw background photo if available
      if (data.photo) {
        const bg = new Image();
        bg.crossOrigin = 'anonymous';
        bg.onload = () => {
          ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
          // Draw furniture
          items.forEach(it => {
            ctx.fillStyle = it.color;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillRect(it.x, it.y, it.w, it.h);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.font = `${Math.min(it.w, it.h) * 0.6}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText(it.emoji, it.x + it.w/2, it.y + it.h/2);
          });
          setLayoutImg(canvas.toDataURL('image/png'));
          showToast('Layout image ready for AI 🎨');
        };
        bg.src = data.photo;
      } else {
        ctx.fillStyle = '#2a2318';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ... draw furniture as above
        items.forEach(it => {
          ctx.fillStyle = it.color;
          ctx.fillRect(it.x, it.y, it.w, it.h);
          ctx.font = `${Math.min(it.w, it.h) * 0.6}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#fff';
          ctx.fillText(it.emoji, it.x + it.w/2, it.y + it.h/2);
        });
        setLayoutImg(canvas.toDataURL('image/png'));
        showToast('Layout image ready for AI 🎨');
      }
    }, [items, data.photo]);

    const curItem = items.find(i => i.uid === sel);


    return (
        <div className="flex fw fh col anim-fade" style={data.photo ? { 
            backgroundImage: `linear-gradient(rgba(240, 230, 200, 0.8), rgba(240, 230, 200, 0.9)), url(${data.photo})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
        } : { background: 'var(--bg)' }}>
            <style>{`
                @keyframes emergency-siren {
                    0% { box-shadow: inset 0 0 100px rgba(255, 0, 0, 0.8); background-color: rgba(255, 0, 0, 0.4); }
                    50% { box-shadow: inset 0 0 20px rgba(255, 0, 0, 0.2); background-color: rgba(255, 0, 0, 0.1); }
                    100% { box-shadow: inset 0 0 100px rgba(255, 0, 0, 0.8); background-color: rgba(255, 0, 0, 0.4); }
                }
                .siren-overlay {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 99998;
                    animation: emergency-siren 0.5s infinite;
                }
                @keyframes popup-drop {
                    from { transform: translateY(-50px) scale(0.9); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
            {sirenActive && <div className="siren-overlay"></div>}
            
            {sirenAlertData && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', pointerEvents: 'auto' }}>
                    <div style={{ background: 'var(--surface)', border: '4px solid #EF4444', padding: '32px 48px', borderRadius: 16, boxShadow: '0 0 40px rgba(239, 68, 68, 0.5)', animation: 'popup-drop 0.4s cubic-bezier(0.1,0.7,0.3,1)', maxWidth: 500, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🚨</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#EF4444', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>BUDGET EXCEEDED</div>
                        <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 32, fontWeight: 500 }}>{sirenAlertData}</div>
                        <button className="btn-modern fw" style={{ background: '#EF4444', color: '#fff', fontSize: 14, padding: 16 }} onClick={() => { setSirenActive(false); setSirenAlertData(null); }}>ACKNOWLEDGE</button>
                    </div>
                </div>
            )}

            <div className="flex flex-1" style={{ minHeight: 0 }}>
                <div className="viewport flex-1 rel" ref={wrapRef} onMouseDown={(e) => { if (e.target === wrapRef.current) setSel(null); }} style={data.photo ? { backgroundImage: `url(${data.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                    {!data.photo && <div className="cv-grid"></div>}
                    {data.photo && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', pointerEvents: 'none' }}></div>}
                    
                    {/* Ghost hints */}
                    {hints && data.sugs.slice(0, 2).map((s, i) => {
                        const cat = CATALOG.find(c => c.id === s.id);
                        if (!cat) return null;
                        return (
                            <div key={i} style={{ position: 'absolute', left: 200 + i * 200, top: 200 + i * 100, width: cat.w, height: cat.h, border: '2px dashed var(--accent)', opacity: 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>AI: {cat.label}</div>
                            </div>
                        );
                    })}

                    {/* Items */}
                    {items.map(it => (
                        <div key={it.uid} 
                            style={{ 
                                position: 'absolute', left: it.x, top: it.y, width: it.w, height: it.h, 
                                background: it.color, cursor: 'grab', zIndex: sel === it.uid ? 100 : 5,
                                border: sel === it.uid ? '3px solid var(--accent)' : '1px solid rgba(0,0,0,0.1)',
                                boxShadow: sel === it.uid ? 'var(--shadow-lg)' : 'var(--shadow)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 4
                            }}
                            onMouseDown={(e) => { e.stopPropagation(); setSel(it.uid); setTab('props'); setDrag({ type: 'move', uid: it.uid, startX: e.clientX, startY: e.clientY, initX: it.x, initY: it.y }); }}>
                            <div style={{ fontSize: 24, userSelect: 'none' }}>{it.emoji}</div>
                            {sel === it.uid && (
                                <div style={{ position: 'absolute', bottom: -10, right: -10, width: 24, height: 24, background: 'var(--accent)', cursor: 'nwse-resize', borderRadius: '50%', border: '3px solid white' }}
                                    onMouseDown={(e) => { e.stopPropagation(); setDrag({ type: 'resize', uid: it.uid, startX: e.clientX, startY: e.clientY, initW: it.w, initH: it.h }); }} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="sb" style={{ minWidth: 380, width: 380, flexShrink: 0, borderLeft: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1 }}>BUDGET LIMIT:</span>
                        <div className="flex" style={{ alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>₹</span>
                            <input 
                                type="number" 
                                value={data.budget || ''} 
                                onChange={e => { if(onBudgetChange) onBudgetChange(Number(e.target.value)); }} 
                                placeholder="No limit"
                                style={{ width: 100, padding: '4px 8px', fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
                            />
                        </div>
                    </div>
                    <div className="tab-row">
                        {['items', 'ideas', 'blueprint', 'props'].map(t => (
                            <div key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                                {t === 'items' ? 'Catalog' : t === 'ideas' ? 'AI Guide' : t === 'blueprint' ? 'Sketch' : 'Edit'}
                            </div>
                        ))}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                        {tab === 'items' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {CATALOG.map(cat => {
                                    const added = items.some(i => i.id === cat.id);
                                    return (
                                        <div key={cat.id} className="product-card" onClick={() => addItem(cat)}>
                                            <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.emoji}</div>
                                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{cat.label}</div>
                                            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{formatCurrency(cat.price)}</div>
                                            {added && <div className="abs" style={{ top: 8, right: 8, color: 'var(--accent)', fontSize: 12 }}>✓</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {tab === 'ideas' && (
                            <div className="col" style={{ gap: 20 }}>
                                <div className="control-group">
                                    <label className="control-label">AI SPATIAL ANALYSIS</label>
                                    {data.obs.map((o, i) => <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>▸ {o}</p>)}
                                </div>
                                {data.sugs.map((s, i) => {
                                    const c = CATALOG.find(cat => cat.id === s.id);
                                    if (!c) return null;
                                    return (
                                        <div key={i} className="product-card" style={{ flexDirection: 'row', textAlign: 'left', padding: 12, gap: 16 }}>
                                            <div style={{ fontSize: 24 }}>{c.emoji}</div>
                                            <div className="flex-1">
                                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{c.label}</div>
                                                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 10px' }}>{s.reason}</p>
                                                <button className="btn-modern" style={{ padding: '6px 12px', fontSize: 10 }} onClick={() => addItem(c)}>Add Item</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {tab === 'blueprint' && (
                            <div>
                                <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <label className="control-label" style={{ marginBottom: 0 }}>📏 AutoCAD Technical View</label>
                                    <button className="btn-outline" style={{ padding: '4px 12px', fontSize: 9 }} onClick={() => setShowCad(true)}>⤢ ENLARGE</button>
                                </div>
                                <div style={{ width: '100%', height: 320, background: '#111827', borderRadius: 16, overflow: 'hidden', border: '1px solid #1F2937', cursor: 'pointer' }} onClick={() => setShowCad(true)}>
                                    <svg width="100%" height="100%" viewBox={`0 0 ${cvSize.w} ${cvSize.h}`}>
                                        <rect x="10" y="10" width={cvSize.w - 20} height={cvSize.h - 20} fill="none" stroke="#374151" strokeWidth="2" strokeDasharray="6" opacity="0.5" />
                                        {items.map(it => (
                                            <g key={it.uid} transform={`translate(${it.x}, ${it.y})`}>
                                                <rect width={it.w} height={it.h} fill="rgba(176,141,87,0.1)" stroke="var(--accent)" strokeWidth="1.5" />
                                                <text x={it.w/2} y={it.h/2} textAnchor="middle" fill="#9CA3AF" fontSize="10">{it.label.toUpperCase()}</text>
                                            </g>
                                        ))}
                                    </svg>
                                </div>
                            </div>
                        )}

                        {tab === 'props' && (
                            <div>
                                {!curItem ? (
                                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 40, fontSize: 13 }}>Select an object to customize</div>
                                ) : (
                                    <div className="col" style={{ gap: 32 }}>
                                        <div style={{ textAlign: 'center', fontSize: 64, marginBottom: 12 }}>{curItem.emoji}</div>
                                        <div>
                                            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 11, fontWeight: 700 }}>WIDTH</span><span style={{ fontSize: 11 }}>{Math.round(curItem.w)}cm</span></div>
                                            <input type="range" style={{ width: '100%' }} min="40" max="280" value={curItem.w} onChange={e => setItems(prev => prev.map(i => i.uid === sel ? { ...i, w: parseInt(e.target.value) } : i))} />
                                        </div>
                                        <div>
                                            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 11, fontWeight: 700 }}>DEPTH</span><span style={{ fontSize: 11 }}>{Math.round(curItem.h)}cm</span></div>
                                            <input type="range" style={{ width: '100%' }} min="30" max="200" value={curItem.h} onChange={e => setItems(prev => prev.map(i => i.uid === sel ? { ...i, h: parseInt(e.target.value) } : i))} />
                                        </div>
                                        <div>
                                            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 11, fontWeight: 700 }}>MATERIAL COLOR</span></div>
                                            <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
                                                {['#1a1a1a', '#e5e5e5', '#8B5E3C', '#EF4444', '#3B82F6', '#EAB308', '#22C55E'].map(c => (
                                                    <div key={c} onClick={() => setItems(prev => prev.map(i => i.uid === sel ? { ...i, color: c } : i))}
                                                        style={{ width: 28, height: 28, borderRadius: 6, background: c, border: curItem.color === c ? '2px solid var(--accent)' : '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }} />
                                                ))}
                                                <input type="color" value={curItem.color || '#000000'} onChange={e => setItems(prev => prev.map(i => i.uid === sel ? { ...i, color: e.target.value } : i))} style={{ width: 28, height: 28, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 6 }} />
                                            </div>
                                        </div>
                                        <button className="btn-modern" style={{ background: '#EF4444', width: '100%' }} onClick={() => delItem(sel)}>Delete Object</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ padding: 24, borderTop: '1px solid var(--border)' }}>
                        <button className="btn-modern fw" style={{ padding: 14 }} onClick={() => nextStage({ items })}>Generate 3D Preview →</button>
                        <button className="btn-outline fw" style={{ marginTop: 12, padding: 12 }} onClick={() => nextStage({ items, skip3D: true })}>Skip Visualization</button>
                    </div>
                </div>
            </div>
            {toast && <div className="abs anim-fade" style={{ bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'white', padding: '12px 24px', borderRadius: 100, fontSize: 13, zIndex: 1000 }}>{toast}</div>}

            {showCad && ReactDOM.createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(20, 18, 15, 0.95)', display: 'flex', flexDirection: 'column', padding: 40 }} className="anim-fade">
                    <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
                        <div style={{ color: 'var(--gold)', fontSize: 18, letterSpacing: 2 }}>📐 AUTOCAD BLUEPRINT (FULL SCREEN)</div>
                        <button className="btn-outline" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }} onClick={() => setShowCad(false)}>X CLOSE</button>
                    </div>
                    <div className="flex-1 rel" style={{ border: '4px solid var(--gold)', boxShadow: '0 0 20px rgba(139, 105, 20, 0.5)', background: '#111827', overflow: 'hidden' }}>
                        <svg width="100%" height="100%" viewBox={`0 0 ${cvSize.w} ${cvSize.h}`}>
                            <rect x="10" y="10" width={cvSize.w - 20} height={cvSize.h - 20} fill="none" stroke="#374151" strokeWidth="2" strokeDasharray="6" opacity="0.5" />
                            {items.map(it => (
                                <g key={it.uid} transform={`translate(${it.x}, ${it.y})`}>
                                    <rect width={it.w} height={it.h} fill="rgba(176,141,87,0.1)" stroke="var(--accent)" strokeWidth="1.5" />
                                    <text x={it.w/2} y={it.h/2} textAnchor="middle" fill="#9CA3AF" fontSize="12" fontWeight="700" letterSpacing="2">{it.label.toUpperCase()}</text>
                                </g>
                            ))}
                        </svg>
                    </div>
                    <div className="flex center" style={{ marginTop: 32 }}>
                        <button className="btn-modern fw" style={{ maxWidth: 400, padding: 20 }} onClick={() => { setShowCad(false); nextStage({ items }); }}>CONFIRM & GENERATE 3D PREVIEW →</button>
                    </div>
                </div>, 
                document.body
            )}
        </div>
    );
}

// ===== STAGE 4A: 3D PREVIEW =====
function Stage4a({ data, nextStage, onBack, isPreviewMode }) {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const wallRef = useRef([]);
    const floorRef = useRef(null);
    const curtainsRef = useRef({}); // Multiple curtains
    const lightsRef = useRef({});
    
    const [lights, setLights] = useState({ ambient: true, daylight: false, warm: true });
    const [config, setConfig] = useState({ 
        wallColor: '#EF4444', 
        floorType: 'walnut', 
        showLeftCurtain: true,
        showBackCurtain: false,
        curtainColor: '#f5f0e8'
    });

    useEffect(() => {
        if (!mountRef.current || !window.THREE) return;

        const W = mountRef.current.clientWidth || window.innerWidth;
        const H = mountRef.current.clientHeight || window.innerHeight;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color('#EDE8DE');

        const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
        camera.position.set(0, 5, 9);

        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        mountRef.current.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';

        let controls = null;
        const OC = THREE.OrbitControls || window.OrbitControls;
        if (OC) {
            controls = new OC(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.maxPolarAngle = Math.PI / 2 - 0.05;
        }

        // Lighting
        const hemiLight = new THREE.HemisphereLight(0xfff5e6, 0x443322, 0.4);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);
        lightsRef.current.ambient = hemiLight;

        const dirLight = new THREE.DirectionalLight(0xfff0dd, 1.5);
        dirLight.position.set(5, 8, -5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 25;
        dirLight.shadow.camera.left = -10; dirLight.shadow.camera.right = 10;
        dirLight.shadow.camera.top = 10; dirLight.shadow.camera.bottom = -10;
        dirLight.shadow.bias = -0.0005;
        scene.add(dirLight);
        lightsRef.current.daylight = dirLight;

        const pointLight = new THREE.PointLight(0xffab5e, 2, 20);
        pointLight.position.set(0, 3.5, 0);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 1024;
        pointLight.shadow.mapSize.height = 1024;
        pointLight.shadow.bias = -0.001;
        scene.add(pointLight);
        lightsRef.current.warm = pointLight;

        const RM_W = 12, RM_D = 10, RM_H = 4;

        // Floor
        const floorGeo = new THREE.PlaneGeometry(RM_W, RM_D);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0xc4966a, roughness: 0.8 });
        const texLoader = new THREE.TextureLoader();
        const loadTex = (url) => texLoader.load(url,
            (tex) => {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(4, 4);
                if (url.includes('diffuse')) tex.encoding = THREE.sRGBEncoding;
            },
            undefined,
            () => console.warn("Texture fallback:", url)
        );

        const diffTex = loadTex('https://threejs.org/examples/textures/hardwood2_diffuse.jpg');
        const bumpTex = loadTex('https://threejs.org/examples/textures/hardwood2_bump.jpg');
        const roughTex = loadTex('https://threejs.org/examples/textures/hardwood2_roughness.jpg');

        floorMat.map = diffTex;
        floorMat.bumpMap = bumpTex;
        floorMat.bumpScale = 0.02;
        floorMat.roughnessMap = roughTex;

        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);
        floorRef.current = floor;

        const handleResize = () => {
            const w = mountRef.current.clientWidth || W;
            const h = mountRef.current.clientHeight || H;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };

        const ro = new ResizeObserver(handleResize);
        ro.observe(mountRef.current);
        handleResize();

        const wallMat = new THREE.MeshStandardMaterial({ color: config.wallColor });
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(RM_W, RM_H), wallMat);
        backWall.position.set(0, RM_H / 2, -RM_D / 2);
        backWall.receiveShadow = true;
        scene.add(backWall);
        wallRef.current.push(backWall);

        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(RM_D, RM_H), wallMat);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-RM_W / 2, RM_H / 2, 0);
        leftWall.receiveShadow = true;
        scene.add(leftWall);
        wallRef.current.push(leftWall);

        // --- Curtains & Windows ---
        function addCurtain(x, z, rot, key) {
            const group = new THREE.Group();
            const mat = new THREE.MeshStandardMaterial({ color: config.curtainColor, roughness: 0.8, side: THREE.DoubleSide });
            const h = RM_H * 0.95;
            const fds = 10;
            const fw = 0.15;
            for (let i = 0; i < fds; i++) {
                const g = new THREE.CylinderGeometry(fw, fw, h, 8, 1, true, 0, Math.PI);
                const m = new THREE.Mesh(g, mat);
                m.position.set(0, h/2, - (fds * fw / 2) + i * (fw * 1.1));
                m.rotation.y = Math.PI / 2;
                group.add(m);
            }
            group.position.set(x, 0, z);
            group.rotation.y = rot;
            group.visible = key === 'left' ? config.showLeftCurtain : config.showBackCurtain;
            scene.add(group);
            curtainsRef.current[key] = group;
        }

        addCurtain(-RM_W/2 + 0.1, 0, 0, 'left');
        addCurtain(0, -RM_D/2 + 0.1, Math.PI/2, 'back');

        const winGeo = new THREE.PlaneGeometry(3, 2);
        const winMat = new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff', emissiveIntensity: 2, transparent: true, opacity: 0.8 });
        
        const winL = new THREE.Mesh(winGeo, winMat);
        winL.rotation.y = Math.PI / 2;
        winL.position.set(-RM_W / 2 + 0.01, 2, 0);
        scene.add(winL);

        const winB = new THREE.Mesh(winGeo, winMat);
        winB.position.set(0, 2, -RM_D / 2 + 0.01);
        scene.add(winB);

        // --- Procedural 3D Furniture Builder ---
        function buildFurniture3D(id, color, tw, td) {
            const group = new THREE.Group();
            const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.55, metalness: 0.05 });
            const matDark = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.7), roughness: 0.6 });
            const matLight = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.3), roughness: 0.4 });
            const white = new THREE.MeshStandardMaterial({ color: '#f5f0e8', roughness: 0.5 });
            const fabric = new THREE.MeshStandardMaterial({ color: '#c9a84c', roughness: 0.8 });

            const addBox = (w, h, d, x, y, z, m) => {
                const g = new THREE.BoxGeometry(w, h, d);
                const mesh = new THREE.Mesh(g, m || mat);
                mesh.position.set(x, y, z);
                mesh.castShadow = true; mesh.receiveShadow = true;
                group.add(mesh);
                return mesh;
            };

            switch(id) {
                case 'sofa': {
                    const sw = Math.max(tw, 1.5), sd = Math.max(td, 0.7);
                    addBox(sw, 0.35, sd, 0, 0.175, 0, mat);          // seat base
                    addBox(sw, 0.45, 0.1, 0, 0.575, -sd/2+0.05, mat); // back rest
                    addBox(0.12, 0.3, sd, -sw/2+0.06, 0.5, 0, mat);   // left arm
                    addBox(0.12, 0.3, sd, sw/2-0.06, 0.5, 0, mat);    // right arm
                    addBox(sw*0.85, 0.08, sd*0.7, 0, 0.38, 0.05, fabric); // cushion
                    break;
                }
                case 'bed': {
                    const bw = Math.max(tw, 1.8), bd = Math.max(td, 1.2);
                    addBox(bw, 0.28, bd, 0, 0.14, 0, mat);             // base frame
                    addBox(bw, 0.55, 0.08, 0, 0.415, -bd/2+0.04, matDark); // headboard
                    addBox(bw*0.92, 0.12, bd*0.88, 0, 0.34, 0.03, white);  // mattress
                    addBox(bw*0.4, 0.06, 0.28, 0, 0.43, -bd/2+0.22, matLight); // pillow
                    break;
                }
                case 'desk': {
                    const dw = Math.max(tw, 1.0), dd = Math.max(td, 0.5);
                    addBox(dw, 0.04, dd, 0, 0.72, 0, mat);           // top
                    addBox(0.05, 0.7, 0.05, -dw/2+0.06, 0.35, -dd/2+0.06, matDark); // leg FL
                    addBox(0.05, 0.7, 0.05, dw/2-0.06, 0.35, -dd/2+0.06, matDark);  // leg FR
                    addBox(0.05, 0.7, 0.05, -dw/2+0.06, 0.35, dd/2-0.06, matDark);  // leg BL
                    addBox(0.05, 0.7, 0.05, dw/2-0.06, 0.35, dd/2-0.06, matDark);   // leg BR
                    break;
                }
                case 'cupboard': {
                    const cw = Math.max(tw, 0.7), cd = Math.max(td, 0.4);
                    addBox(cw, 1.5, cd, 0, 0.75, 0, mat);            // body
                    addBox(0.02, 0.3, 0.02, -0.08, 0.9, cd/2+0.01, matDark); // handle L
                    addBox(0.02, 0.3, 0.02, 0.08, 0.9, cd/2+0.01, matDark);  // handle R
                    addBox(cw*0.95, 0.02, cd*0.9, 0, 0.75, 0, matDark);  // middle shelf line
                    break;
                }
                case 'wardrobe': {
                    const ww = Math.max(tw, 0.9), wd = Math.max(td, 0.5);
                    addBox(ww, 1.8, wd, 0, 0.9, 0, mat);            // body
                    addBox(0.01, ww > 0.6 ? 1.78 : 1.5, 0.01, 0, 0.9, wd/2+0.005, matDark); // center line
                    addBox(0.02, 0.2, 0.02, -0.1, 1.0, wd/2+0.01, matDark); // handle L
                    addBox(0.02, 0.2, 0.02, 0.1, 1.0, wd/2+0.01, matDark);  // handle R
                    break;
                }
                case 'bookshelf': {
                    const bsw = Math.max(tw, 0.6), bsd = Math.max(td, 0.3);
                    addBox(bsw, 1.6, bsd, 0, 0.8, 0, mat);          // frame
                    for (let i = 0; i < 4; i++) {
                        addBox(bsw*0.88, 0.02, bsd*0.85, 0, 0.25 + i*0.38, 0, matDark); // shelves
                        if (i < 3) {
                            const bkW = 0.04 + Math.random()*0.04;
                            const bkH = 0.18 + Math.random()*0.08;
                            const bkColor = ['#8B4513', '#A0522D', '#6B4420', '#5C4A2E', '#D4A574'][i % 5];
                            const bkMat = new THREE.MeshStandardMaterial({ color: bkColor, roughness: 0.7 });
                            for (let j = 0; j < 3; j++) {
                                addBox(bkW, bkH, bsd*0.6, -bsw*0.3 + j*0.15, 0.27 + i*0.38 + bkH/2, 0, bkMat);
                            }
                        }
                    }
                    break;
                }
                case 'tv_unit': {
                    const tvw = Math.max(tw, 1.2), tvd = Math.max(td, 0.35);
                    addBox(tvw, 0.4, tvd, 0, 0.2, 0, mat);          // cabinet
                    addBox(tvw*0.7, 0.5, 0.03, 0, 0.65, -tvd/2+0.1, new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.2, metalness: 0.5 })); // TV screen
                    break;
                }
                case 'armchair': {
                    const aw = Math.max(tw, 0.6), ad = Math.max(td, 0.6);
                    addBox(aw, 0.3, ad, 0, 0.15, 0, mat);           // seat
                    addBox(aw, 0.4, 0.08, 0, 0.5, -ad/2+0.04, mat);  // back
                    addBox(0.1, 0.25, ad, -aw/2+0.05, 0.4, 0, mat);   // arm L
                    addBox(0.1, 0.25, ad, aw/2-0.05, 0.4, 0, mat);    // arm R
                    addBox(aw*0.75, 0.06, ad*0.7, 0, 0.33, 0.03, fabric); // cushion
                    break;
                }
                case 'plant': {
                    const potMat = new THREE.MeshStandardMaterial({ color: '#8B5E3C', roughness: 0.8 });
                    const leafMat = new THREE.MeshStandardMaterial({ color: '#3A7A20', roughness: 0.7 });
                    addBox(0.2, 0.25, 0.2, 0, 0.125, 0, potMat);    // pot
                    const leafGeo = new THREE.SphereGeometry(0.25, 8, 6);
                    const leaves = new THREE.Mesh(leafGeo, leafMat);
                    leaves.position.set(0, 0.5, 0);
                    leaves.scale.set(1, 1.3, 1);
                    leaves.castShadow = true;
                    group.add(leaves);
                    const leafGeo2 = new THREE.SphereGeometry(0.18, 8, 6);
                    const leaves2 = new THREE.Mesh(leafGeo2, leafMat);
                    leaves2.position.set(0.1, 0.7, 0.05);
                    leaves2.castShadow = true;
                    group.add(leaves2);
                    break;
                }
                case 'lamp': {
                    const poleMat = new THREE.MeshStandardMaterial({ color: '#333333', roughness: 0.3, metalness: 0.6 });
                    const shadeMat = new THREE.MeshStandardMaterial({ color: '#F5F0E8', roughness: 0.6, side: THREE.DoubleSide });
                    addBox(0.2, 0.02, 0.2, 0, 0.01, 0, poleMat);      // base
                    addBox(0.03, 1.3, 0.03, 0, 0.66, 0, poleMat);     // pole
                    const shadeGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.25, 8, 1, true);
                    const shade = new THREE.Mesh(shadeGeo, shadeMat);
                    shade.position.set(0, 1.38, 0);
                    shade.castShadow = true;
                    group.add(shade);
                    break;
                }
                case 'rug': {
                    const rw = Math.max(tw, 1.5), rd = Math.max(td, 1.0);
                    const rugMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.9 });
                    addBox(rw, 0.02, rd, 0, 0.01, 0, rugMat);
                    const borderMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.6), roughness: 0.9 });
                    addBox(rw, 0.025, 0.04, 0, 0.013, -rd/2+0.02, borderMat);
                    addBox(rw, 0.025, 0.04, 0, 0.013, rd/2-0.02, borderMat);
                    addBox(0.04, 0.025, rd, -rw/2+0.02, 0.013, 0, borderMat);
                    addBox(0.04, 0.025, rd, rw/2-0.02, 0.013, 0, borderMat);
                    break;
                }
                case 'dining': {
                    const dtw = Math.max(tw, 1.2), dtd = Math.max(td, 0.8);
                    addBox(dtw, 0.04, dtd, 0, 0.74, 0, mat);       // top
                    addBox(0.06, 0.7, 0.06, -dtw/2+0.1, 0.35, -dtd/2+0.1, matDark);
                    addBox(0.06, 0.7, 0.06, dtw/2-0.1, 0.35, -dtd/2+0.1, matDark);
                    addBox(0.06, 0.7, 0.06, -dtw/2+0.1, 0.35, dtd/2-0.1, matDark);
                    addBox(0.06, 0.7, 0.06, dtw/2-0.1, 0.35, dtd/2-0.1, matDark);
                    break;
                }
                case 'coffee': {
                    const ctw = Math.max(tw, 0.8), ctd = Math.max(td, 0.5);
                    addBox(ctw, 0.03, ctd, 0, 0.42, 0, mat);       // top
                    addBox(0.04, 0.4, 0.04, -ctw/2+0.08, 0.2, -ctd/2+0.08, matDark);
                    addBox(0.04, 0.4, 0.04, ctw/2-0.08, 0.2, -ctd/2+0.08, matDark);
                    addBox(0.04, 0.4, 0.04, -ctw/2+0.08, 0.2, ctd/2-0.08, matDark);
                    addBox(0.04, 0.4, 0.04, ctw/2-0.08, 0.2, ctd/2-0.08, matDark);
                    break;
                }
                case 'sideboard': {
                    const sbw = Math.max(tw, 1.2), sbd = Math.max(td, 0.35);
                    addBox(sbw, 0.65, sbd, 0, 0.325, 0, mat);
                    addBox(sbw*0.95, 0.02, 0.01, 0, 0.65, sbd/2+0.005, matDark); // top edge
                    for (let i = 0; i < 3; i++) {
                        addBox(0.02, 0.12, 0.02, -sbw*0.3 + i*sbw*0.3, 0.35, sbd/2+0.01, matDark); // handles
                    }
                    break;
                }
                case 'dining_chair': {
                    const cw = Math.max(tw, 0.4); const cd = Math.max(td, 0.4);
                    addBox(cw, 0.05, cd, 0, 0.45, 0, mat); // seat
                    addBox(cw, 0.5, 0.05, 0, 0.725, -cd/2+0.02, mat); // backrest
                    addBox(0.04, 0.42, 0.04, -cw/2+0.05, 0.21, -cd/2+0.05, matDark);
                    addBox(0.04, 0.42, 0.04, cw/2-0.05, 0.21, -cd/2+0.05, matDark);
                    addBox(0.04, 0.42, 0.04, -cw/2+0.05, 0.21, cd/2-0.05, matDark);
                    addBox(0.04, 0.42, 0.04, cw/2-0.05, 0.21, cd/2-0.05, matDark);
                    break;
                }
                case 'nightstand': {
                    const nw = Math.max(tw, 0.4); const nd = Math.max(td, 0.3);
                    addBox(nw, 0.4, nd, 0, 0.2, 0, mat); // body
                    addBox(nw*0.9, 0.15, 0.02, 0, 0.3, nd/2+0.01, matDark); // drawer
                    addBox(0.02, 0.02, 0.02, 0, 0.3, nd/2+0.03, mat); // knob
                    break;
                }
                case 'ottoman': {
                    const ow = Math.max(tw, 0.5); const od = Math.max(td, 0.5);
                    addBox(ow, 0.3, od, 0, 0.2, 0, fabric);
                    addBox(0.04, 0.05, 0.04, -ow/2+0.05, 0.025, -od/2+0.05, matDark);
                    addBox(0.04, 0.05, 0.04, ow/2-0.05, 0.025, -od/2+0.05, matDark);
                    addBox(0.04, 0.05, 0.04, -ow/2+0.05, 0.025, od/2-0.05, matDark);
                    addBox(0.04, 0.05, 0.04, ow/2-0.05, 0.025, od/2-0.05, matDark);
                    break;
                }
                default: {
                    const h = 0.8;
                    addBox(tw, h, td, 0, h/2, 0, mat);
                }
            }
            return group;
        }

        // --- Place furniture using actual canvas dimensions ---
        const canvasW = W;
        const canvasH = H;

        data.items.forEach(it => {
            const cx = (it.x + it.w / 2) / canvasW * RM_W - RM_W / 2;
            const cz = (it.y + it.h / 2) / canvasH * RM_D - RM_D / 2;
            const targetW = Math.max((it.w / canvasW) * RM_W, 0.3);
            const targetD = Math.max((it.h / canvasH) * RM_D, 0.3);

            const furnitureGroup = buildFurniture3D(it.id, it.color, targetW, targetD);
            furnitureGroup.position.set(cx, 0, cz);
            scene.add(furnitureGroup);
        });

        const vigPlane = new THREE.PlaneGeometry(20, 20);
        const vigCnv = document.createElement('canvas');
        vigCnv.width = 512; vigCnv.height = 512;
        const vCtx = vigCnv.getContext('2d');
        const grad = vCtx.createRadialGradient(256, 256, 100, 256, 256, 350);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.8)');
        vCtx.fillStyle = grad; vCtx.fillRect(0, 0, 512, 512);
        const vigTex = new THREE.CanvasTexture(vigCnv);
        const vigMat = new THREE.MeshBasicMaterial({ map: vigTex, transparent: true, depthWrite: false });
        const vig = new THREE.Mesh(vigPlane, vigMat);
        vig.position.z = -1;
        camera.add(vig);
        scene.add(camera);

        let frameId;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            if (controls) controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frameId);
            ro.disconnect();
            ro.disconnect();
            if (mountRef.current && renderer.domElement.parentNode === mountRef.current) mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, [data.items]); // Excluded config from dependencies to prevent WebGL refresh glitches!

    useEffect(() => {
        if (!lightsRef.current) return;
        if (lightsRef.current.ambient) lightsRef.current.ambient.intensity = lights.ambient ? 0.6 : 0.1;
        if (lightsRef.current.daylight) lightsRef.current.daylight.intensity = lights.daylight ? 0.8 : 0;
        if (lightsRef.current.warm) lightsRef.current.warm.intensity = lights.warm ? 1 : 0;
    }, [lights]);

    useEffect(() => {
        if (wallRef.current.length > 0) {
            wallRef.current.forEach(w => w.material.color.set(config.wallColor));
        }
        if (floorRef.current) {
            floorRef.current.material.color.set(config.floorType === 'walnut' ? '#ffffff' : config.floorType === 'light' ? '#e8dCC4' : '#5c4033');
        }
        if (curtainsRef.current.left) {
            curtainsRef.current.left.visible = config.showLeftCurtain;
            curtainsRef.current.left.children.forEach(c => c.material.color.set(config.curtainColor));
        }
        if (curtainsRef.current.back) {
            curtainsRef.current.back.visible = config.showBackCurtain;
            curtainsRef.current.back.children.forEach(c => c.material.color.set(config.curtainColor));
        }
    }, [config]);


    return (
        <div className="flex fw fh anim-fade" style={{ background: 'var(--bg)', position: 'relative' }}>
            <div className="flex-1 rel" ref={mountRef} style={{ cursor: 'grab', background: '#EDE8DE', overflow: 'hidden' }}>
                <div className="abs" style={{ top: 32, left: 32, zIndex: 100 }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '20px 32px', borderRadius: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>3D PERSPECTIVE</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Orbit established • PBR Materials Active</div>
                        {!isPreviewMode && <button className="btn-outline" style={{ marginTop: 24, fontSize: 11, padding: '8px 16px' }} onClick={onBack}>← Back to Blueprint</button>}
                    </div>
                </div>
            </div>

            {!isPreviewMode && (
                <div className="sb" style={{ padding: '24px 32px', borderLeft: '1px solid var(--border)', background: 'var(--surface)', minWidth: 380, width: 380, flexShrink: 0 }}>
                    <div className="col" style={{ gap: 28, flex: 1, overflowY: 'auto' }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>🔆 Scene Illumination</div>
                            <div className="col" style={{ gap: 16 }}>
                                {[
                                    { id: 'ambient', label: 'Ambient Soft Glow', icon: '☁️' },
                                    { id: 'daylight', label: 'Daylight Entry', icon: '☀️' },
                                    { id: 'warm', label: 'Copper Warmth', icon: '🔥' }
                                ].map(l => (
                                    <div key={l.id} className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="flex" style={{ gap: 12, alignItems: 'center' }}>
                                            <span style={{ fontSize: 18 }}>{l.icon}</span>
                                            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{l.label}</span>
                                        </div>
                                        <div className={`switch-premium ${lights[l.id] ? 'active' : ''}`} onClick={() => setLights(p => ({ ...p, [l.id]: !p[l.id] }))}>
                                            <div className="thumb" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>🎨 Structural Finish</div>
                            <div className="col" style={{ gap: 24 }}>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>Architectural Wall Palette</div>
                                    <div className="flex" style={{ flexWrap: 'wrap', gap: 8 }}>
                                        {['#EF4444', '#3B82F6', '#EAB308', '#EC4899', '#22C55E'].map(c => (
                                            <div key={c} onClick={() => setConfig(p => ({...p, wallColor: c}))} 
                                                style={{ width: 28, height: 28, borderRadius: 8, background: c, border: config.wallColor === c ? '2px solid var(--accent)' : '1px solid var(--border)', cursor: 'pointer', transition: '0.2s' }} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>Hardwood Selection</div>
                                    <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
                                        {[
                                            { id: 'light', col: '#e8dCC4', label: 'Oak' },
                                            { id: 'walnut', col: '#8B5E3C', label: 'Walnut' },
                                            { id: 'dark', col: '#5c4033', label: 'Ebony' },
                                            { id: 'cherry', col: '#903C22', label: 'Cherry' },
                                            { id: 'ash', col: '#C1B5A9', label: 'Ash' }
                                        ].map(f => (
                                            <div key={f.id} onClick={() => setConfig(p => ({...p, floorType: f.id}))} 
                                                style={{ 
                                                    flex: '1 1 30%', padding: '12px 6px', borderRadius: 12, fontSize: 11, fontWeight: 700, textAlign: 'center', background: f.col, color: '#fff',
                                                    border: config.floorType === f.id ? '2px solid var(--accent)' : '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', transition: '0.2s'
                                                }}>{f.label}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>🏢 Interior Architecture</div>
                            <div className="col" style={{ gap: 16 }}>
                                <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>Left Wall Curtains</span>
                                    <div className={`switch-premium ${config.showLeftCurtain ? 'active' : ''}`} onClick={() => setConfig(p => ({ ...p, showLeftCurtain: !p.showLeftCurtain }))}>
                                        <div className="thumb" />
                                    </div>
                                </div>
                                <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>Back Wall Curtains</span>
                                    <div className={`switch-premium ${config.showBackCurtain ? 'active' : ''}`} onClick={() => setConfig(p => ({ ...p, showBackCurtain: !p.showBackCurtain }))}>
                                        <div className="thumb" />
                                    </div>
                                </div>
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>Curtain Fabric Color</div>
                                    <div className="flex" style={{ gap: 8 }}>
                                        {['#f5f0e8', '#4A5568', '#1E40AF', '#B91C1C', '#047857'].map(c => (
                                            <div key={c} onClick={() => setConfig(p => ({...p, curtainColor: c}))} 
                                                style={{ width: 28, height: 28, borderRadius: 8, background: c, border: config.curtainColor === c ? '2px solid var(--accent)' : '1px solid var(--border)', cursor: 'pointer', transition: '0.2s' }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 24 }}>
                        <button className="btn-modern fw" style={{ padding: 20, fontSize: 14 }} onClick={() => nextStage()}>Finalize Project View ✦</button>
                        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-secondary)', marginTop: 12 }}>Real-time spatial synchronization active.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ===== STAGE 4B: FINAL RENDER =====
function Stage4b({ data, reset }) {
    const [load, setLoad] = useState(true);
    const [desc, setDesc] = useState(null);
    const [view3d, setView3d] = useState(false);
    const [imgState, setImgState] = useState('loading'); // loading | loaded | error
    const [fullScreen, setFullScreen] = useState(null); // 'photo' | 'render'

    useEffect(() => {
        if (desc) setImgState('loading');
    }, [desc]);

    useEffect(() => {
        const uniqueItems = [...new Set(data.items.map(it => it.label))];
        const itemCounts = uniqueItems.map(label => {
            const count = data.items.filter(it => it.label === label).length;
            return count > 1 ? `${count}x ${label}` : label;
        }).join(", ");
        const roomType = data.rt || "Living Room";
        const designStyle = data.prefs ? data.prefs.join(", ") : "luxurious modern";

        // Keep prompt SHORT for Pollinations URL to work, but inject user's exact preferences!
        const prompt = `${roomType} interior, ${designStyle}, ${itemCounts}, photorealistic, 8k, architectural lighting`;

        setTimeout(() => {
            setDesc({
                text: `${roomType} with ${itemCounts || 'curated furnishings'}, themed around ${designStyle}. Designed for comfort and style.`,
                prompt: prompt
            });
            setLoad(false);
        }, 2500);
    }, [data.items, data.obs, data.rt]);

    return (
        <div className="flex col fw fh anim-fade" style={{ background: 'var(--bg)', overflowY: 'auto' }}>
            <div className="flex flex-1" style={{ minHeight: 0 }}>
                <div className="flex-1" style={{ padding: 48, overflowY: 'auto' }}>
                    {load ? (
                        <div className="flex center col fh" style={{ minHeight: 400 }}>
                            <div style={{ width: 64, height: 64, border: '4px solid #eee', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
                            <div style={{ marginTop: 24, fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: 2 }}>GENERATING HIGH-RESOLUTION ASSETS...</div>
                        </div>
                    ) : (
                        <div className="anim-fade" style={{ maxWidth: 1100, margin: '0 auto' }}>
                            <div className="flex" style={{ gap: 24, height: 440, marginBottom: 32 }}>
                                <div className="flex-1 col">
                                    <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <label className="control-label" style={{ marginBottom: 0 }}>📷 YOUR ROOM</label>
                                        <button className="btn-outline" style={{ padding: '4px 12px', fontSize: 9 }} onClick={() => setFullScreen('photo')}>⤢ ENLARGE</button>
                                    </div>
                                    <div className="fw fh" style={{ overflow: 'hidden', boxShadow: 'var(--shadow)', border: '2px solid var(--border)', cursor: 'pointer' }} onClick={() => setFullScreen('photo')}>
                                        {data.photo ? <img src={data.photo} className="fw fh" style={{ objectFit: 'cover' }} /> : <div className="fw fh" style={{ background: 'var(--card)' }} />}
                                    </div>
                                </div>
                                <div className="flex-1 col">
                                    <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <label className="control-label" style={{ marginBottom: 0 }}>🎨 AI RENDER</label>
                                        <div className="flex" style={{ gap: 8 }}>
                                            <button className="btn-outline" style={{ padding: '4px 12px', fontSize: 9 }} onClick={() => setView3d(!view3d)}>{view3d ? "Static" : "3D View"}</button>
                                            <button className="btn-modern" style={{ padding: '4px 12px', fontSize: 9 }} onClick={() => setFullScreen('render')}>⤢ ENLARGE</button>
                                        </div>
                                    </div>
                                    <div className="fw fh" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--border)', position: 'relative', background: 'var(--card)', cursor: 'pointer' }} onClick={(e) => { if(e.target.tagName !== 'CANVAS') setFullScreen('render') }}>
                                        {view3d ? <Stage4a data={data} isPreviewMode={true} /> : (
                                            <React.Fragment>
                                                <img 
                                                    src={`https://pollinations.ai/p/${encodeURIComponent(desc.prompt)}?width=800&height=600&nologo=true&seed=42`}
                                                    className="fw fh" 
                                                    style={{ objectFit: 'cover', opacity: imgState === 'loaded' ? 1 : 0, transition: 'opacity 0.3s' }}
                                                    onLoad={() => setImgState('loaded')}
                                                    onError={() => setImgState('error')}
                                                />
                                                {imgState !== 'loaded' && (
                                                    <div className="flex center col fh fw" style={{ position: 'absolute', inset: 0, background: 'var(--card)', zIndex: 10 }}>
                                                        {imgState === 'loading' ? (
                                                            <React.Fragment>
                                                                <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 1s linear infinite' }}></div>
                                                                <div style={{ marginTop: 12, fontSize: 7, color: 'var(--text-secondary)', letterSpacing: 1 }}>GENERATING AI RENDER...</div>
                                                            </React.Fragment>
                                                        ) : (
                                                            <React.Fragment>
                                                                <img src="images/render-2.png" className="fw fh" style={{ objectFit: 'cover', position: 'absolute', inset: 0 }} />
                                                            </React.Fragment>
                                                        )}
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--surface)', border: '2px solid var(--border)', padding: 24, boxShadow: 'var(--shadow)', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 12, marginBottom: 8 }}>DESIGN SUMMARY</h2>
                                <p style={{ fontSize: 8, lineHeight: 2.2, color: 'var(--text-secondary)' }}>{desc.text}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sb" style={{ padding: 32 }}>
                    <div className="control-group" style={{ marginBottom: 32 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>Environment</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{data.rt || 'Custom Workspace'}</div>
                    </div>

                    <label className="control-label">Inventory List ({data.items.length})</label>
                    <div className="col" style={{ gap: 10, flex: 1, overflowY: 'auto', marginBottom: 32 }}>
                        {data.items.map(it => (
                            <div key={it.uid} className="flex" style={{ alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--card)', border: '2px solid var(--border)', boxShadow: '2px 2px 0px var(--border)' }}>
                                <span style={{ fontSize: 20 }}>{it.emoji}</span>
                                <div className="flex-1">
                                    <div style={{ fontSize: 8, color: 'var(--text-primary)', textTransform: 'uppercase' }}>{it.label}</div>
                                    <div style={{ fontSize: 7, color: 'var(--accent)' }}>{formatCurrency(it.price)}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="btn-modern fw" style={{ padding: 20 }} onClick={reset}>Start New Project</button>
                    <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 16 }}>Project data and technical exports synchronized.</p>
                </div>
            </div>

            {/* FULL SCREEN MODAL */}
            {fullScreen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(20, 18, 15, 0.95)', display: 'flex', flexDirection: 'column', padding: 40 }} className="anim-fade">
                    <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
                        <div style={{ color: 'var(--gold)', fontSize: 18, letterSpacing: 2 }}>{fullScreen === 'photo' ? '📷 YOUR ROOM REFERENCE' : (view3d ? '🏗️ 3D BLUEPRINT (AUTO CAD VIEW)' : '🎨 FINAL VIRTUAL RENDER')}</div>
                        <button className="btn-outline" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }} onClick={() => setFullScreen(null)}>X CLOSE</button>
                    </div>
                    <div className="flex-1 rel" style={{ border: '4px solid var(--gold)', boxShadow: '0 0 20px rgba(139, 105, 20, 0.5)' }}>
                        {fullScreen === 'photo' && (data.photo ? <img src={data.photo} className="fw fh" style={{ objectFit: 'contain' }} /> : <div className="fw fh bg-card" />)}
                        {fullScreen === 'render' && (
                            view3d ? <Stage4a data={data} isPreviewMode={true} /> : (
                                imgState === 'loaded' ? <img src={`https://pollinations.ai/p/${encodeURIComponent(desc.prompt)}?width=1600&height=1200&nologo=true&seed=42`} className="fw fh" style={{ objectFit: 'contain' }} /> :
                                <img src="images/render-2.png" className="fw fh" style={{ objectFit: 'contain' }} />
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ===== APP ROOT =====
function App() {
    const [stage, setStage] = useState(1);
    const [data, setData] = useState({ photo: null, rt: '', obs: [], sugs: [], items: [], prefs: null, budget: 0 });
    const [levelAnim, setLevelAnim] = useState(null);

    const transitionToStage = (newStage, levelTitle) => {
        setLevelAnim(levelTitle);
        setTimeout(() => {
            setStage(newStage);
        }, 1500); // 1.5s to switch background component
        setTimeout(() => {
            setLevelAnim(null);
        }, 2200); // 2.2s total animation
    };

    const toStage1_5 = (d) => { setData(p => ({ ...p, photo: d.photo, rt: d.rt })); transitionToStage(1.5, "LEVEL 2: STYLE PROFILE"); };
    const toStage2 = (d) => { setData(p => ({ ...p, prefs: d.prefs, budget: d.budget !== undefined ? d.budget : p.budget })); transitionToStage(2, "LEVEL 3: AI ANALYSIS"); };
    const toStage3 = (d) => { setData(p => ({ ...p, obs: d.obs, sugs: d.sugs })); transitionToStage(3, "LEVEL 4: DESIGN SANDBOX"); };
    
    // skip3D ? 4.2 (Level 6) : 4.1 (Level 5)
    const toStage4 = (d) => { setData(p => ({ ...p, items: d.items, layoutImg: d.layoutImg })); transitionToStage(d.skip3D ? 4.2 : 4.1, d.skip3D ? "LEVEL 6: REALISTIC RENDER" : "LEVEL 5: 3D BLUEPRINT"); };

    const toFinal = () => { transitionToStage(4.2, "LEVEL 6: REALISTIC RENDER"); };
    const backTo3 = () => transitionToStage(3, "LEVEL 4: DESIGN SANDBOX");
    const reset = () => { setData({ photo: null, rt: '', obs: [], sugs: [], items: [], prefs: null, budget: 0 }); transitionToStage(1, "LEVEL 1: INITIALIZE"); };

    const handleItemsChange = useCallback((newItems) => {
        setData(p => ({ ...p, items: newItems }));
    }, []);

    const handleExport = () => {
        if (window.exportToPDF) window.exportToPDF(data);
    };

    // Handle body overflow: landing page scrolls, app stages don't
    useEffect(() => {
        if (stage === 1) {
            document.body.classList.remove('no-scroll');
        } else {
            document.body.classList.add('no-scroll');
            window.scrollTo(0, 0);
        }
    }, [stage]);

    let content;
    if (stage === 1) content = <Stage1 onNext={toStage1_5} />;
    else if (stage === 1.5) content = <Stage1_5 data={data} onNext={toStage2} />;
    else if (stage === 2) content = <Stage2 data={data} onNext={toStage3} />;
    else if (stage === 3) content = <Stage3 data={data} nextStage={toStage4} onItemsChange={handleItemsChange} onBudgetChange={b => setData(p => ({...p, budget: b}))} />;
    else if (stage === 4.1) content = <Stage4a data={data} nextStage={toFinal} onBack={backTo3} />;
    else if (stage === 4.2) content = <Stage4b data={data} reset={reset} />;

    // Landing page gets its own full-page layout; other stages use the app shell
    if (stage === 1) {
        return content;
    }

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
            <nav className="top-nav">
                <div className="brand">SOFA, <span>SO GOOD!</span></div>
                <div className="flex" style={{ gap: 24, alignItems: 'center' }}>
                    {[
                        { s: 1, lbl: 'LVL 1' },
                        { s: 1.5, lbl: 'LVL 2' },
                        { s: 2, lbl: 'LVL 3' },
                        { s: 3, lbl: 'LVL 4' },
                        { s: 4.1, lbl: 'LVL 5' },
                        { s: 4.2, lbl: 'LVL 6' }
                    ].map(st => (
                        <div key={st.s} className="flex center" style={{ 
                            padding: '4px 10px',
                            background: Math.floor(stage) >= st.s ? 'var(--accent)' : 'var(--card)',
                            color: Math.floor(stage) >= st.s ? 'var(--surface)' : 'var(--text-secondary)',
                            border: '2px solid',
                            borderColor: Math.floor(stage) >= st.s ? 'var(--dark)' : 'var(--border)',
                            fontSize: 7,
                            fontWeight: 800,
                            letterSpacing: 1,
                            transition: '0.3s step-end'
                        }}>
                            {st.lbl}
                        </div>
                    ))}
                </div>
                {stage >= 3 && <button className="btn-outline" style={{ fontSize: 11, padding: '8px 16px' }} onClick={handleExport}>Download Project PDF</button>}
            </nav>
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                {stage >= 3 && <StickyBudgetBar items={data.items} roomType={data.rt} />}
                {content}
            </div>

            {/* GAMIFIED LEVEL OVERLAY */}
            {levelAnim && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'var(--dark)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    animation: 'flash-level 2.2s ease-in-out forwards'
                }}>
                    <style>{`
                        @keyframes flash-level {
                            0% { opacity: 0; transform: scale(1.1); }
                            10% { opacity: 1; transform: scale(1); }
                            85% { opacity: 1; transform: scale(1); }
                            100% { opacity: 0; transform: scale(0.9); pointer-events: none; }
                        }
                        @keyframes load-bar {
                            0% { width: 0%; }
                            100% { width: 100%; }
                        }
                    `}</style>
                    <div style={{ fontSize: 48, color: 'var(--gold)', textShadow: '6px 6px 0px var(--accent)', marginBottom: 20 }}>MISSION</div>
                    <div style={{ fontSize: 24, color: 'var(--surface)', letterSpacing: 4, border: '4px solid var(--accent)', padding: '16px 32px', background: 'rgba(139,105,20,0.2)', marginBottom: 32 }}>
                        {levelAnim}
                    </div>
                    
                    {/* Retro Loading Bar */}
                    <div style={{ width: 400, height: 24, border: '4px solid var(--accent)', background: 'rgba(0,0,0,0.5)', position: 'relative' }}>
                        <div style={{ height: '100%', background: 'var(--gold)', animation: 'load-bar 1.4s cubic-bezier(0.1, 0.7, 0.3, 1) forwards' }}></div>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
