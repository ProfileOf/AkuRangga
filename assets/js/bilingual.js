/**
 * bilingual.js - Language Switcher and Dynamic Translation Utility
 */

const LANG_KEY = 'preferred_language';
const TRANSLATION_CACHE_KEY = 'translation_api_cache';

const DICTIONARY = {
    // Navbar
    'nav_about': { id: 'Tentang Saya', en: 'About Me' },
    'nav_experience': { id: 'Pengalaman', en: 'Experience' },
    'nav_projects': { id: 'Projek', en: 'Projects' },
    'nav_certificates': { id: 'Sertifikat', en: 'Certificates' },
    'nav_skills': { id: 'Skills', en: 'Skills' },
    'nav_services': { id: 'Layanan', en: 'Services' },
    'nav_social': { id: 'Sosial Media', en: 'Social Media' },

    // Profil Section
    'status_work': { id: 'Open to Work', en: 'Open to Work' },
    'profile_role': { id: 'Teknik Informatika', en: 'Informatics Engineering' },
    'profile_about': { 
        id: 'Memadukan rasa ingin tahu dengan semangat Growth & Impact oriented. Bayangkan Anda memiliki rekan atau Kontributor yang mampu membuat tampilan website yang mengagumkan, aplikasi mobile produktif, kemampuan public speaking dan berbahasa asing, serta document/data controling, dengan semangat kontribusi yang tinggi. Tanpa melebih-lebihkan, silahkan kunjungi portofolio saya.', 
        en: 'Blending curiosity with a Growth & Impact oriented spirit. Imagine having a colleague or contributor capable of creating stunning website interfaces, productive mobile apps, fluent public speaking & foreign languages, as well as document/data control, all with a high spirit of contribution. Without exaggerating, please check out my portfolio.' 
    },
    'profile_btn': { id: 'Lihat Portofolio', en: 'View Portfolio' },

    // Metrics Card Labels
    'metric_total': { id: 'Total Projects', en: 'Total Projects' },
    'metric_frontend': { id: 'Front-end Projects', en: 'Front-end Projects' },
    'metric_clients': { id: 'Total Clients', en: 'Total Clients' },
    'metric_upcoming': { id: 'Upcoming Projects', en: 'Upcoming Projects' },

    // Section Titles
    'section_projects_title': { id: 'Proyek yang Saya Kembangkan', en: 'Projects I\'ve Developed' },
    'view_more_btn': { id: 'Lihat Selengkapnya', en: 'View More' },
    
    // Page Projects Title
    'projects_page_title': { id: 'Daftar Proyek & Karya', en: 'Project List & Works' },
    'projects_page_subtitle': { id: 'Daftar lengkap proyek yang telah disinkronkan secara live dari Google Sheets.', en: 'Complete list of projects synced live from Google Sheets.' },
    
    // Project Grid Categories Filter Buttons
    'filter_all': { id: 'Semua', en: 'All' },
    'filter_web': { id: 'Website', en: 'Website' },
    'filter_app': { id: 'Aplikasi', en: 'Application' },
    'visit_project': { id: 'Kunjungi Projek', en: 'Visit Project' },
    'visit_btn': { id: 'Kunjungi', en: 'Visit' },

    // Certificates Section
    'cert_title': { id: 'Sertifikat & Penghargaan', en: 'Certificates & Awards' },
    'cert_subtitle': { 
        id: 'Sertifikat ini merepresentasikan dedikasi saya dalam pengembangan diri, profesionalisme, serta komitmen untuk terus maju dan berinovasi.', 
        en: 'These certificates represent my dedication to self-development, professionalism, and a commitment to continue growing and innovating.' 
    },
    'cert_counter_label': { id: 'Sertifikat', en: 'Certificates' },
    'cert_view_details': { id: 'Lihat Detail Sertifikat', en: 'View Certificate Details' },
    'cert_gallery_title': { id: 'Gallery Sertifikat', en: 'Certificate Gallery' },
    'cert_gallery_count': { id: '8 Sertifikat', en: '8 Certificates' },

    // Experiences Section
    'exp_title': { id: 'Pengalaman', en: 'Experience' },
    'exp_edu_header': { id: 'Pendidikan', en: 'Education' },
    'exp_edu_degree1': { id: 'D4 - Teknik Informatika', en: 'Bachelor\'s - Informatics Engineering' },
    'exp_edu_school1': { id: 'Politeknik Negeri Malang', en: 'State Polytechnic of Malang' },
    'exp_edu_location1': { id: 'Malang', en: 'Malang' },
    'exp_edu_current': { id: 'Sekarang', en: 'Present' },
    'exp_edu_desc1': { 
        id: 'Aktif dalam kegiatan internal maupun eksternal kampus melalui organisasi, kepanitiaan, serta peran sebagai Master of Ceremony. Berfokus pada pengembangan portofolio dan personal branding melalui pembuatan website profil, manajemen proyek, dan pengelolaan timeline.', 
        en: 'Active in both internal and external campus activities through organizations, committees, and as a Master of Ceremonies. Focused on portfolio development and personal branding via profile website building, project management, and timeline coordination.' 
    },
    'exp_edu_degree2': { id: 'SMA - MIPA', en: 'High School - Natural Sciences' },
    'exp_edu_school2': { id: 'MAN 2 Banyuwangi', en: 'MAN 2 Banyuwangi' },
    'exp_edu_location2': { id: 'Banyuwangi', en: 'Banyuwangi' },
    'exp_edu_desc2': { 
        id: 'Menjadi bagian dari anggota OSIM yang telah berhasil melaksanakan 12 Program selama 1 tahun disamping menjalani masa pendidikan selama 3 tahun.', 
        en: 'Part of the OSIM student council that successfully executed 12 programs over 1 year alongside completing 3 years of high school education.' 
    },
    'exp_org_header': { id: 'Organisasi', en: 'Organization' },
    'exp_org_role1': { id: 'Kepala Bidang Kebudayaan', en: 'Head of Cultural Division' },
    'exp_org_role2': { id: 'Staff KOMINFO', en: 'Staff of Communication & Information' },
    'exp_org_role3': { id: 'Mentor of Story Telling', en: 'Storytelling Mentor' },
    'exp_org_role4': { id: 'Staff Pendidikan dan Kebudayaan', en: 'Staff of Education & Culture' },
    'exp_card_title1': { id: 'Pengembangan Website Portofolio', en: 'Portfolio Website Development' },
    'exp_card_desc1': { 
        id: 'Membangun & mengembangkan bisnis kecil digital jasa pembuatan website portofolio & branding digital untuk kalangan profesional.', 
        en: 'Building & developing a digital small business offering portfolio website creation & digital branding services for professionals.' 
    },
    'exp_card_btn_biz': { id: 'Kunjungi Bisnis', en: 'Visit Business' },
    'exp_card_btn_gallery': { id: 'Galeri', en: 'Gallery' },
    'exp_card_title2': { id: 'Public Speaking & MC', en: 'Public Speaking & MC' },
    'exp_card_desc2': { 
        id: 'Regular MC & moderator selama 3 tahun lebih di berbagai acara, menciptakan suasana dinamis dan interaksi yang hidup.', 
        en: 'Regular MC & moderator for over 3 years in various events, creating a dynamic atmosphere and lively interactions.' 
    },
    'exp_card_btn_docs': { id: 'Dokumentasi', en: 'Documentation' },
    'exp_card_btn_creations': { id: 'Ruang Kreasi', en: 'Creation Room' },

    // Services & Maintenance Section
    'srv_title': { id: 'Layanan', en: 'Services' },
    'srv_more': { id: 'Selengkapnya', en: 'More Details' },
    'srv_design': { id: 'Design', en: 'Design' },
    'srv_web_app': { id: 'Website & Aplikasi', en: 'Website & Application' },
    'srv_custom': { id: 'Anda butuh apa?', en: 'What do you need?' },
    'maint_title': { id: 'Dalam Perbaikan dan Perkembangan', en: 'Under Maintenance & Development' },
    'maint_subtitle': { id: 'Mohon tunggu sebentar...', en: 'Please wait a moment...' }
};

// Get current active language ('id' or 'en')
function getActiveLanguage() {
    return localStorage.getItem(LANG_KEY) || 'id';
}

// Toggle language state and refresh page UI
function toggleLanguage() {
    const nextLang = getActiveLanguage() === 'id' ? 'en' : 'id';
    localStorage.setItem(LANG_KEY, nextLang);
    updateLanguageUI();
    
    // Dispatch a custom event to notify sheet-sync.js that language has changed
    const event = new CustomEvent('languageChanged', { detail: { language: nextLang } });
    document.dispatchEvent(event);
}

// Update static text elements marked with data-translate
function updateLanguageUI() {
    const lang = getActiveLanguage();
    
    // 1. Update text content of static elements
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (DICTIONARY[key]) {
            el.textContent = DICTIONARY[key][lang];
        }
    });

    // 2. Update language switcher button state (flag and text)
    const btn = document.getElementById('langSwitcherBtn');
    if (btn) {
        btn.innerHTML = lang === 'id' 
            ? '<span class="flag-icon">🇬🇧</span> <span class="lang-label">EN</span>' 
            : '<span class="flag-icon">🇮🇩</span> <span class="lang-label">ID</span>';
    }

    // 3. Update the html lang attribute
    document.documentElement.lang = lang;
}

// Translate dynamic texts (like project descriptions) using MyMemory API with local caching
async function translateLiveText(text) {
    const lang = getActiveLanguage();
    if (lang === 'id' || !text || text.trim() === '') {
        return text; // No translation needed for Indonesian
    }

    // Initialize cache
    let cache = {};
    try {
        cache = JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY)) || {};
    } catch(e) {
        cache = {};
    }

    // Check cache
    const cacheKey = text.trim();
    if (cache[cacheKey]) {
        return cache[cacheKey];
    }

    // Fetch from MyMemory translation API
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`);
        const json = await response.json();
        if (json && json.responseData && json.responseData.translatedText) {
            const translated = json.responseData.translatedText;
            
            // Save to cache
            cache[cacheKey] = translated;
            localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
            
            return translated;
        }
    } catch (err) {
        console.warn('Translation API error, falling back to original text:', err);
    }

    return text;
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    updateLanguageUI();
    
    // Add event listener to switcher button
    const btn = document.getElementById('langSwitcherBtn');
    if (btn) {
        btn.addEventListener('click', toggleLanguage);
    }
});
