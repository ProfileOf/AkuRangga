/**
 * Google Sheet Portfolio Sync
 * Fetches, parses and dynamically populates portfolio metrics and projects.
 */

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTp6YtoBKQ8iIFT4utvpfJ1hkDzvIXyoP8EZO127kMyZ-c-8X2WcZYrI3xDDA2lxlmvdrCyvzbj--gB/pub?output=csv&gid=0&cb=' + new Date().getTime();

// High-quality local assets metadata mapping based on known keywords
const PROJECT_MAPPING = {
    "buku": {
        image: "img/Postingan 2.jpg",
        description: "Buku refleksi personal tentang perjalanan pengembangan diri dan pemaknaan langkah kehidupan."
    },
    "product design": {
        image: "img/desains.png",
        description: "Portofolio desain postingan produk digital, UI/UX, dan branding visual kreatif."
    },
    "addaready": {
        image: "img/webporto.png",
        description: "Jasa pembuatan website portofolio & branding digital untuk membantu kalangan profesional."
    },
    "help & tech": {
        image: "img/helptech.png",
        description: "Sosial media berisi konten edukasi teknologi untuk meningkatkan kualitas pengalaman pengguna."
    },
    "lynk": {
        image: "img/lynkid.png",
        description: "Platform digital terintegrasi untuk memudahkan pengguna dalam mengelola dan berbagi produk digital."
    },
    "document": {
        image: "img/docs.jpg",
        description: "Sistem pengorganisasian dokumen, audit data, dan kolaborasi online secara akurat."
    },
    "towel": {
        image: "img/docs.jpg",
        description: "Pengelolaan dokumen secara rapi, terstruktur, dan akurat menggunakan Microsoft Word, Excel, dan Cloud."
    }
};

// Robust CSV Parser supporting quotes and comma containment
function parseCSV(text) {
    let p = '', r = [];
    let q = false;
    let row = [''];
    for (let i = 0; i < text.length; i++) {
        let c = text[i];
        if (c === '"') {
            if (q && text[i+1] === '"') { row[row.length-1] += '"'; i++; } // Escaped quote
            else q = !q;
        } else if (c === ',' && !q) {
            row.push('');
        } else if ((c === '\r' || c === '\n') && !q) {
            if (c === '\r' && text[i+1] === '\n') i++;
            r.push(row);
            row = [''];
        } else {
            row[row.length-1] += c;
        }
    }
    if (row.length > 1 || row[0] !== '') r.push(row);
    return r;
}

// Get appropriate image and description
function getProjectMetadata(name, note, imageLink) {
    let description = note ? note.trim() : "";
    let image = imageLink ? imageLink.trim() : null;

    // Search the note field for image URLs if image wasn't provided in the dedicated column
    if (!image) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = description.match(urlRegex);

        if (urls) {
            for (let url of urls) {
                const isGDrive = url.includes('drive.google.com/file/d/');
                const isImageFile = /\.(jpeg|jpg|gif|png|webp|svg)/i.test(url);
                
                if (isGDrive || isImageFile) {
                    image = url;
                    // Strip the URL and the "Gambar:" prefix from the description text
                    description = description.replace(url, '')
                                             .replace(/gambar\s*:\s*/i, '')
                                             .replace(/,\s*$/g, '') // strip trailing commas if any
                                             .trim();
                    break;
                }
            }
        }
    }

    // Convert Google Drive view links to direct raw image URLs (works for both note-extracted and column-based)
    if (image && image.includes('drive.google.com/file/d/')) {
        const match = image.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            image = `https://lh3.googleusercontent.com/d/${match[1]}`;
        }
    }

    // Default fallbacks to keyword mappings if no custom image was parsed
    const lowerName = name.toLowerCase();
    const key = Object.keys(PROJECT_MAPPING).find(k => lowerName.includes(k));

    if (!image) {
        if (key && PROJECT_MAPPING[key].image) {
            image = PROJECT_MAPPING[key].image;
        } else {
            image = "https://placehold.co/400x300/1e293b/ffffff?text=" + encodeURIComponent(name);
        }
    }

    if (description === "") {
        if (key && PROJECT_MAPPING[key].description) {
            description = PROJECT_MAPPING[key].description;
        } else {
            description = "Proyek kustom dikembangkan dengan standar kualitas tinggi untuk memaksimalkan kepuasan pengguna.";
        }
    }

    return { image, description };
}

// Categorize project
function getProjectCategory(name, link) {
    const lowerName = name.toLowerCase();
    const lowerLink = (link || '').toLowerCase();
    if (lowerName.includes('app') || lowerName.includes('absendri') || lowerName.includes('todo') || lowerName.includes('notebook') || lowerName.includes('automation')) {
        return 'aplikasi';
    }
    if (lowerLink.includes('http') || lowerLink.includes('.app') || lowerLink.includes('.id') || lowerLink.includes('.com') || lowerLink.includes('.org') || lowerLink.includes('vercel') || lowerLink.includes('netlify')) {
        return 'web';
    }
    return 'lainnya';
}

// Initialize Sync
document.addEventListener('DOMContentLoaded', () => {
    fetch(SHEET_CSV_URL)
        .then(response => response.text())
        .then(csvText => {
            const data = parseCSV(csvText);
            if (!data || data.length < 5) return;

            // Dynamic header detection (scan for row containing "No")
            let headerRowIndex = 9;
            for (let i = 0; i < data.length; i++) {
                if (data[i] && data[i].some(cell => cell.trim().toLowerCase() === 'no')) {
                    headerRowIndex = i;
                    break;
                }
            }
            
            const headerRow = data[headerRowIndex];
            const noIndices = [];
            headerRow.forEach((cell, idx) => {
                if (cell.trim().toLowerCase() === 'no') {
                    noIndices.push(idx);
                }
            });

            // Establish table starting indices
            let t1_start = noIndices[0] !== undefined ? noIndices[0] : 1;
            let t2_start = noIndices[1] !== undefined ? noIndices[1] : 7;
            let t4_start = noIndices[3] !== undefined ? noIndices[3] : 17;

            // Scan Table 1 headers
            let t1_nameIdx = t1_start + 1;
            let t1_linkIdx = t1_start + 2;
            let t1_imgIdx = -1;
            let t1_catIdx = -1;
            let t1_noteIdx = -1;
            const t1_end = noIndices[1] !== undefined ? noIndices[1] : headerRow.length;
            for (let col = t1_start + 1; col < t1_end; col++) {
                const header = (headerRow[col] || '').trim().toLowerCase();
                if (header.includes('name') || header.includes('nama')) t1_nameIdx = col;
                else if (header.includes('link')) t1_linkIdx = col;
                else if (header.includes('image') || header.includes('gambar')) t1_imgIdx = col;
                else if (header.includes('category') || header.includes('kategori')) t1_catIdx = col;
                else if (header.includes('note') || header.includes('catatan')) t1_noteIdx = col;
            }

            // Scan Table 2 headers
            let t2_nameIdx = t2_start + 1;
            let t2_linkIdx = t2_start + 2;
            let t2_noteIdx = -1;
            const t2_end = noIndices[2] !== undefined ? noIndices[2] : headerRow.length;
            for (let col = t2_start + 1; col < t2_end; col++) {
                const header = (headerRow[col] || '').trim().toLowerCase();
                if (header.includes('name') || header.includes('nama')) t2_nameIdx = col;
                else if (header.includes('link')) t2_linkIdx = col;
                else if (header.includes('note') || header.includes('catatan')) t2_noteIdx = col;
            }

            // Scan Table 4 headers
            let t4_nameIdx = t4_start + 1;
            let t4_linkIdx = t4_start + 2;
            let t4_noteIdx = -1;
            const t4_end = headerRow.length;
            for (let col = t4_start + 1; col < t4_end; col++) {
                const header = (headerRow[col] || '').trim().toLowerCase();
                if (header.includes('name') || header.includes('nama')) t4_nameIdx = col;
                else if (header.includes('link')) t4_linkIdx = col;
                else if (header.includes('note') || header.includes('catatan')) t4_noteIdx = col;
            }

            // Right-to-left scan to get metrics values (resilient to column shifting)
            function getMetricValue(rowIndex) {
                const row = data[rowIndex];
                if (!row) return '0';
                for (let i = row.length - 1; i >= 0; i--) {
                    const val = row[i].trim();
                    if (val !== '' && !isNaN(val)) {
                        return val;
                    }
                }
                return '0';
            }

            const totalProj = getMetricValue(0);
            const frontProj = getMetricValue(1);
            const clients = getMetricValue(2);
            const upcoming = getMetricValue(3);

            const mTotal = document.getElementById('metric-total-projects');
            const mFront = document.getElementById('metric-frontend-projects');
            const mClients = document.getElementById('metric-clients');
            const mUpcoming = document.getElementById('metric-upcoming-projects');

            if (mTotal) mTotal.textContent = totalProj;
            if (mFront) mFront.textContent = frontProj;
            if (mClients) mClients.textContent = clients;
            if (mUpcoming) mUpcoming.textContent = upcoming;

            // Helper to resolve category dynamically
            function resolveCategory(row, catIdx, name, link) {
                if (catIdx !== -1 && row[catIdx]) {
                    const val = row[catIdx].trim().toLowerCase();
                    if (val === 'all') return 'lainnya';
                    if (val.includes('web') || val.includes('site')) return 'web';
                    if (val.includes('app') || val.includes('mob') || val.includes('apk')) return 'aplikasi';
                }
                return getProjectCategory(name, link);
            }

            // 2. Parse Project Lists
            const allProjectsList = [];
            for (let i = headerRowIndex + 1; i < data.length; i++) {
                const row = data[i];
                if (row && row[t1_nameIdx] && row[t1_nameIdx].trim() !== '') {
                    allProjectsList.push({
                        name: row[t1_nameIdx].trim(),
                        link: t1_linkIdx !== -1 && row[t1_linkIdx] ? row[t1_linkIdx].trim() : '',
                        imageLink: t1_imgIdx !== -1 && row[t1_imgIdx] ? row[t1_imgIdx].trim() : '',
                        note: t1_noteIdx !== -1 && row[t1_noteIdx] ? row[t1_noteIdx].trim() : '',
                        category: resolveCategory(row, t1_catIdx, row[t1_nameIdx], row[t1_linkIdx])
                    });
                }
            }

            console.log('Google Sheets parsed projects:', allProjectsList);
            
            // Cache projects list globally in window object or closure
            window.cachedProjectsList = allProjectsList;

            // Trigger rendering of slider/grid
            renderProjectsComponents();
        })
        .catch(err => console.error('Error fetching sheet data:', err));
});

// Render slider and grid projects dynamically with bilingual auto-translation support
async function renderProjectsComponents() {
    if (!window.cachedProjectsList || window.cachedProjectsList.length === 0) return;
    
    const activeLang = typeof getActiveLanguage === 'function' ? getActiveLanguage() : 'id';

    // 1. Populate Slider in index.html
    const sliderTrack = document.getElementById('projectsSliderTrack');
    if (sliderTrack) {
        sliderTrack.innerHTML = '';
        for (let proj of window.cachedProjectsList) {
            const meta = getProjectMetadata(proj.name, proj.note, proj.imageLink);
            
            let nameTranslated = proj.name;
            let descTranslated = meta.description;
            if (activeLang === 'en' && typeof translateLiveText === 'function') {
                nameTranslated = await translateLiveText(proj.name);
                descTranslated = await translateLiveText(meta.description);
            }

            const slideHTML = `
                <div class="project-slide-card">
                    <div class="project-app-card glass-card">
                        <div class="d-flex flex-row align-items-center gap-3">
                            <div class="project-app-icon">
                                <img onerror="this.onerror=null; this.src='https://placehold.co/100x100';"
                                    src="${meta.image}" alt="${proj.name}">
                            </div>
                            <div class="project-app-content flex-grow-1">
                                <h4 class="project-app-title-slide">${nameTranslated}</h4>
                                <p class="project-app-desc-slide">${descTranslated}</p>
                                <div class="d-flex gap-2 flex-wrap">
                                    ${proj.link && proj.link !== 'personal website' ? 
                                        `<a href="${proj.link}" target="_blank" class="porto-btn-primary btn-sm-app" data-translate="visit_project">Kunjungi Projek</a>` :
                                        `<span class="tag-skill">#Personal</span>`
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            sliderTrack.insertAdjacentHTML('beforeend', slideHTML);
        }
        initSliderLogic();
    }

    // 2. Populate Grid in projects.html
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid) {
        projectsGrid.innerHTML = '';
        for (let [idx, proj] of window.cachedProjectsList.entries()) {
            const meta = getProjectMetadata(proj.name, proj.note, proj.imageLink);
            const category = proj.category;
            const delay = (idx % 3) * 100;
            
            let nameTranslated = proj.name;
            let descTranslated = meta.description;
            if (activeLang === 'en' && typeof translateLiveText === 'function') {
                nameTranslated = await translateLiveText(proj.name);
                descTranslated = await translateLiveText(meta.description);
            }

            const cardHTML = `
                <div class="col-12 col-md-6 col-lg-4 project-grid-item" data-category="${category}" data-aos="fade-up" data-aos-delay="${delay}">
                    <div class="project-card h-100">
                        <div class="project-picture-wrapper w-100" style="height: 200px; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.4);">
                            <img class="project_picture user-generated-img"
                                onerror="this.onerror=null; this.src='https://placehold.co/400x400';"
                                src="${meta.image}" alt="${proj.name}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div class="project-text">
                            <div class="project_name" style="font-size: 1.25rem;">${nameTranslated}</div>
                            <div class="project_desc desc-text" style="font-size: 0.85rem;">
                                <p>${descTranslated}</p>
                            </div>
                        </div>
                        <div class="d-flex gap-2 flex-wrap pb-4 px-3 mt-auto">
                            ${proj.link && proj.link !== 'personal website' ? 
                                `<a target="_blank" href="${proj.link}" class="project_url porto-btn-primary text-capitalize flex-fill text-center btn-sm-app" data-translate="visit_btn">Kunjungi</a>` :
                                `<span class="tag-skill">#Personal</span>`
                            }
                        </div>
                    </div>
                </div>
            `;
            projectsGrid.insertAdjacentHTML('beforeend', cardHTML);
        }

        // Refresh AOS animations
        if (window.AOS) {
            window.AOS.init();
            window.AOS.refresh();
        }
    }
    
    // Ensure translation labels update on the newly rendered components
    if (typeof updateLanguageUI === 'function') {
        updateLanguageUI();
    }
}

// Listen to language switcher event to trigger instantaneous dynamic re-rendering
document.addEventListener('languageChanged', renderProjectsComponents);

// Separate slider logic initialization function
function initSliderLogic() {
    const track = document.getElementById('projectsSliderTrack');
    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('slideNextBtn');
    const prevBtn = document.getElementById('slidePrevBtn');
    const indicatorsContainer = document.getElementById('sliderIndicators');
    
    if (!track || !nextBtn || !prevBtn || !indicatorsContainer) return;
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    
    indicatorsContainer.innerHTML = '';
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('indicator-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(dot);
    });
    
    const dots = Array.from(indicatorsContainer.children);
    
    function updateSlider() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 991 && window.innerWidth > 768;
        
        let cardPercentWidth = 60; // Desktop
        if (isMobile) cardPercentWidth = 100;
        else if (isTablet) cardPercentWidth = 80;
        
        const offsetAdjustment = (100 - cardPercentWidth) / 2;
        const translatePercentage = -(currentIndex * cardPercentWidth) + offsetAdjustment;
        track.style.transform = `translateX(${translatePercentage}%)`;
        
        slides.forEach((slide, index) => {
            slide.classList.remove('active-slide');
            if (dots[index]) dots[index].classList.remove('active');
            
            if (index === currentIndex) {
                slide.classList.add('active-slide');
                if (dots[index]) dots[index].classList.add('active');
            }
        });
    }
    
    function goToSlide(index) {
        currentIndex = index;
        updateSlider();
    }
    
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    });
    
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    });
    
    window.addEventListener('resize', updateSlider);
    updateSlider();
}
