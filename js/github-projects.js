/* 
===================================================
GITHUB PROJECTS LOADER
===================================================
Purpose: Fetch and display GitHub repositories dynamically
Performance: Caches API responses, handles rate limits
*/

// ===================================================
// 1. CONFIGURATION
// ===================================================
const GITHUB_CONFIG = {
    username: 'jesus-justin',
    apiUrl: 'https://api.github.com/users/jesus-justin/repos',
    maxProjects: 6, // Number of projects to display
    sortBy: 'updated', // 'updated', 'created', 'pushed', 'stars'
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
};

// ===================================================
// 2. CACHE MANAGEMENT
// ===================================================
// Purpose: Reduce API calls and handle rate limiting
const cache = {
    get(key) {
        const item = localStorage.getItem(key);
        if (!item) return null;
        
        const { data, timestamp } = JSON.parse(item);
        const isExpired = Date.now() - timestamp > GITHUB_CONFIG.cacheTime;
        
        if (isExpired) {
            localStorage.removeItem(key);
            return null;
        }
        
        return data;
    },
    
    set(key, data) {
        const item = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(item));
    }
};

// ===================================================
// 3. FETCH GITHUB REPOSITORIES
// ===================================================
// Purpose: Get repositories from GitHub API with error handling
async function fetchGitHubRepos() {
    const cacheKey = `github_repos_${GITHUB_CONFIG.username}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        console.log('📦 Using cached GitHub data');
        return cachedData;
    }
    
    try {
        console.log('🔄 Fetching GitHub repositories...');
        
        const response = await fetch(
            `${GITHUB_CONFIG.apiUrl}?sort=${GITHUB_CONFIG.sortBy}&per_page=100`,
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const repos = await response.json();
        
        // Filter out forks if desired (optional)
        const filteredRepos = repos.filter(repo => !repo.fork);
        
        // Cache the results
        cache.set(cacheKey, filteredRepos);
        
        console.log(`✅ Fetched ${filteredRepos.length} repositories`);
        return filteredRepos;
        
    } catch (error) {
        console.error('❌ Error fetching GitHub repos:', error);
        throw error;
    }
}

// ===================================================
// 4. FORMAT DATE
// ===================================================
// Purpose: Convert ISO date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Created today';
    if (diffDays === 1) return 'Created yesterday';
    if (diffDays < 7) return `Created ${diffDays} days ago`;
    if (diffDays < 30) return `Created ${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `Created ${Math.floor(diffDays / 30)} months ago`;
    return `Created ${Math.floor(diffDays / 365)} years ago`;
}

// ===================================================
// 5. GET LANGUAGE COLOR
// ===================================================
// Purpose: Return appropriate CSS class for language color
function getLanguageClass(language) {
    if (!language) return 'default';
    
    const languageMap = {
        'JavaScript': 'javascript',
        'PHP': 'php',
        'Python': 'python',
        'Java': 'java',
        'HTML': 'html',
        'CSS': 'css',
        'TypeScript': 'typescript',
    };
    
    return languageMap[language] || 'default';
}

// ===================================================
// 6. CREATE PROJECT CARD
// ===================================================
// Purpose: Generate HTML for a single project card
function createProjectCard(repo, index) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('data-tilt', ''); // Enable 3D tilt effect
    
    // Gradient backgrounds for placeholder images (5 different gradients)
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    ];
    const gradientStyle = gradients[index % gradients.length];
    
    // Language indicator
    const languageHTML = repo.language ? `
        <div class="project-language">
            <span class="language-dot ${getLanguageClass(repo.language)}"></span>
            <span>${repo.language}</span>
        </div>
    ` : '';
    
    // Stats
    const statsHTML = `
        <div class="project-stats">
            ${repo.stargazers_count > 0 ? `
                <div class="stat-item" title="Stars">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>${repo.stargazers_count}</span>
                </div>
            ` : ''}
            ${repo.forks_count > 0 ? `
                <div class="stat-item" title="Forks">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="18" r="3"/>
                        <circle cx="6" cy="6" r="3"/>
                        <circle cx="18" cy="6" r="3"/>
                        <path d="M18 9v2c0 1-1 2-2 2H8c-1 0-2-1-2-2V9"/>
                        <path d="M12 12v3"/>
                    </svg>
                    <span>${repo.forks_count}</span>
                </div>
            ` : ''}
        </div>
    `;
    
    card.innerHTML = `
        <div class="project-image-container" style="background: ${gradientStyle};">
            <div class="project-placeholder">
                <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span class="placeholder-text">Project Preview</span>
            </div>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-overlay">
                <span class="view-project-text">View on GitHub</span>
                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
            </a>
        </div>
        
        <div class="project-content">
            <div class="project-header">
                <div class="project-info">
                    <h3 class="project-name">
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
                            ${repo.name}
                        </a>
                        ${!repo.private ? '<span class="project-visibility">Public</span>' : ''}
                    </h3>
                </div>
            </div>
            
            <p class="project-description ${!repo.description ? 'no-description' : ''}">
                ${repo.description || 'No description provided'}
            </p>
            
            <div class="project-meta">
                ${languageHTML}
                ${statsHTML}
                <span class="project-updated">${formatDate(repo.created_at)}</span>
            </div>
        </div>
    `;
    
    return card;
}

// ===================================================
// 7. RENDER PROJECTS
// ===================================================
// Purpose: Display projects in the grid
function renderProjects(repos) {
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (!projectsGrid) {
        console.error('Projects grid element not found');
        return;
    }
    
    // Clear loading spinner
    projectsGrid.innerHTML = '';
    
    // Limit to configured maximum
    const displayRepos = repos.slice(0, GITHUB_CONFIG.maxProjects);
    
    if (displayRepos.length === 0) {
        projectsGrid.innerHTML = `
            <div class="projects-error">
                <h3>No projects found</h3>
                <p>No public repositories available at the moment.</p>
            </div>
        `;
        return;
    }
    
    // Create and append project cards
    displayRepos.forEach((repo, index) => {
        const card = createProjectCard(repo, index);
        projectsGrid.appendChild(card);
        
        // Add to animated elements for scroll detection
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animationObserver.observe(card);
    });
    
    // Re-initialize tilt effect for new cards
    initializeTiltEffect();
    
    console.log(`✨ Rendered ${displayRepos.length} projects`);
}

// ===================================================
// 8. INITIALIZE TILT EFFECT
// ===================================================
// Purpose: Add 3D tilt effect to newly created cards
function initializeTiltEffect() {
    const tiltElements = document.querySelectorAll('.project-card[data-tilt]');
    
    tiltElements.forEach(element => {
        // Remove existing listeners to avoid duplicates
        element.replaceWith(element.cloneNode(true));
    });
    
    // Re-query after clone
    document.querySelectorAll('.project-card[data-tilt]').forEach(element => {
        element.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// ===================================================
// 9. ERROR HANDLING
// ===================================================
// Purpose: Display error message to user
function showError(message) {
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = `
        <div class="projects-error">
            <h3>Unable to Load Projects</h3>
            <p>${message}</p>
            <p style="margin-top: 1rem;">
                <a href="https://github.com/${GITHUB_CONFIG.username}?tab=repositories" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style="color: var(--color-primary-light); text-decoration: underline;">
                    View projects directly on GitHub
                </a>
            </p>
        </div>
    `;
}

// ===================================================
// 10. INITIALIZE
// ===================================================
// Purpose: Load and display GitHub projects on page load
async function initializeGitHubProjects() {
    try {
        const repos = await fetchGitHubRepos();
        renderProjects(repos);
    } catch (error) {
        console.error('Failed to load GitHub projects:', error);
        showError('Please check your internet connection and try again.');
    }
}

// ===================================================
// 11. START ON DOM READY
// ===================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGitHubProjects);
} else {
    initializeGitHubProjects();
}

// ===================================================
// 12. MANUAL REFRESH FUNCTION
// ===================================================
// Purpose: Allow manual refresh of projects (optional)
window.refreshGitHubProjects = async function() {
    const cacheKey = `github_repos_${GITHUB_CONFIG.username}`;
    localStorage.removeItem(cacheKey);
    
    const projectsGrid = document.getElementById('projectsGrid');
    projectsGrid.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Refreshing projects...</p>
        </div>
    `;
    
    await initializeGitHubProjects();
};

// ===================================================
// INITIALIZATION LOG
// ===================================================
console.log('🐙 GitHub Projects module loaded');
console.log(`   Username: ${GITHUB_CONFIG.username}`);
console.log(`   Max projects: ${GITHUB_CONFIG.maxProjects}`);
