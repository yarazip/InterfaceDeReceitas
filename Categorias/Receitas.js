// Theme Manager Module
const ThemeManager = (() => {
  const STORAGE_KEY = 'theme';
  
  const getSystemPreference = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  const applySavedTheme = () => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY) || getSystemPreference();
      document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    } catch (error) {
      console.error('Error applying theme:', error);
      // Fallback to system preference if localStorage fails
      document.body.classList.toggle('dark-mode', getSystemPreference() === 'dark');
    }
  };
  
  const updateThemeIcon = () => {
    try {
      const isDarkMode = document.body.classList.contains('dark-mode');
      const moonIcon = document.querySelector('.fa-moon');
      const sunIcon = document.querySelector('.fa-sun');
      
      if (moonIcon && sunIcon) {
        moonIcon.style.opacity = isDarkMode ? '0' : '1';
        sunIcon.style.opacity = isDarkMode ? '1' : '0';
      }
    } catch (error) {
      console.error('Error updating theme icons:', error);
    }
  };
  
  const toggleTheme = () => {
    try {
      document.body.classList.toggle('dark-mode');
      const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, theme);
      updateThemeIcon();
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };
  
  const init = () => {
    applySavedTheme();
    updateThemeIcon();
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
  };
  
  return { init };
})();

// Carousel Module
const Carousel = (() => {
  const DEFAULT_CONFIG = {
    slideInterval: 5000,
    swipeThreshold: 50,
    pauseOnHover: true
  };
  
  const createCarousel = (carouselElement, config = {}) => {
    if (!carouselElement) return null;
    
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    let currentIndex = 0;
    let autoSlideInterval;
    
    const inner = carouselElement.querySelector('.carousel-inner');
    const items = carouselElement.querySelectorAll('.carousel-item');
    const prevBtn = carouselElement.querySelector('.carousel-control.prev');
    const nextBtn = carouselElement.querySelector('.carousel-control.next');
    const indicators = carouselElement.querySelectorAll('.indicator');
    
    if (!inner || items.length === 0) return null;
    
    const totalItems = items.length;
    
    const updateCarousel = () => {
      inner.style.transform = `translateX(-${currentIndex * 100}%)`;
      
      indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
      });
    };
    
    const goToSlide = (index) => {
      currentIndex = (index + totalItems) % totalItems;
      updateCarousel();
      resetAutoSlide();
    };
    
    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);
    
    const startAutoSlide = () => {
      if (mergedConfig.slideInterval > 0) {
        autoSlideInterval = setInterval(nextSlide, mergedConfig.slideInterval);
      }
    };
    
    const resetAutoSlide = () => {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    };
    
    // Event listeners
    const setupEventListeners = () => {
      if (nextBtn) nextBtn.addEventListener('click', nextSlide);
      if (prevBtn) prevBtn.addEventListener('click', prevSlide);
      
      indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToSlide(index));
      });
      
      // Touch events
      let touchStartX = 0;
      
      const handleTouchStart = (e) => {
        touchStartX = e.changedTouches[0].screenX;
      };
      
      const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (diff > mergedConfig.swipeThreshold) {
          nextSlide();
        } else if (diff < -mergedConfig.swipeThreshold) {
          prevSlide();
        }
      };
      
      carouselElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      carouselElement.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      // Keyboard navigation
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      // Auto slide and hover control
      if (mergedConfig.pauseOnHover) {
        carouselElement.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        carouselElement.addEventListener('mouseleave', startAutoSlide);
      }
    };
    
    // Public API for this carousel instance
    return {
      init: () => {
        setupEventListeners();
        startAutoSlide();
        updateCarousel();
      },
      next: nextSlide,
      prev: prevSlide,
      goTo: goToSlide,
      destroy: () => {
        clearInterval(autoSlideInterval);
        // Would also remove event listeners in a real implementation
      }
    };
  };
  
  return { create: createCarousel };
})();

// Utils Module
const Utils = (() => {
  const showError = (message, options = {}) => {
    const { timeout = 5000, type = 'error' } = options;
    
    // In a real app, you might want to use a proper notification system
    console[type === 'error' ? 'error' : 'log'](message);
    alert(message); // Temporary - replace with better UI
  };
  
  const handleLoginForm = async (formElement) => {
    if (!formElement) return;
    
    formElement.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email')?.value.trim();
      const password = document.getElementById('password')?.value.trim();
      
      if (!email || !password) {
        showError('Por favor, preencha todos os campos');
        return;
      }
      
      try {
        const { token, nome } = await AuthService.login(email, password);
        localStorage.setItem('token', token);
        localStorage.setItem('userName', nome);
        
        showError('Login realizado com sucesso!', { type: 'success' });
        window.location.href = '/auth/dashboard';
      } catch (error) {
        showError(error.message || 'Erro durante o login');
        console.error('Login error:', error);
      }
    });
  };
  
  const setupFilterButtons = (container) => {
    if (!container) return;
    
    const filterBtns = container.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Implement actual filtering logic here
        const filterValue = this.dataset.filter;
        console.log('Filtering by:', filterValue);
      });
    });
  };
  
  return {
    showError,
    handleLoginForm,
    setupFilterButtons
  };
})();

// Main Initialization
document.addEventListener('DOMContentLoaded', function() {
  // Gerenciador de Tema
  const themeToggle = document.getElementById('theme-toggle');
  const STORAGE_KEY = 'theme';
  
  // Verifica o tema do sistema
  const getSystemTheme = () => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  // Aplica o tema
  const applyTheme = (theme) => {
      document.body.classList.toggle('dark-mode', theme === 'dark');
      localStorage.setItem(STORAGE_KEY, theme);
      updateThemeIcons(theme === 'dark');
  };
  
  // Atualiza os ícones
  const updateThemeIcons = (isDark) => {
      const moonIcon = document.querySelector('.fa-moon');
      const sunIcon = document.querySelector('.fa-sun');
      
      if (moonIcon && sunIcon) {
          moonIcon.style.opacity = isDark ? '0' : '1';
          sunIcon.style.opacity = isDark ? '1' : '0';
      }
  };
  
  // Alterna o tema
  const toggleTheme = () => {
      const isDark = document.body.classList.contains('dark-mode');
      applyTheme(isDark ? 'light' : 'dark');
  };
  
  // Inicializa o tema
  const initTheme = () => {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      const systemTheme = getSystemTheme();
      const theme = savedTheme || systemTheme;
      
      applyTheme(theme);
      
      // Observa mudanças no tema do sistema
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
          if (!localStorage.getItem(STORAGE_KEY)) {
              applyTheme(e.matches ? 'dark' : 'light');
          }
      });
  };
  
  // Inicializa
  initTheme();
  
  // Configura o botão de alternância
  if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Filtros de receitas
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
          filterBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          
          // Implemente a filtragem real aqui
          const filterValue = this.textContent.trim();
          console.log('Filtrando por:', filterValue);
      });
  });
});
  // Verifica o tema preferido do sistema
  const getSystemTheme = () => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  // Aplica o tema
  const applyTheme = (theme) => {
      document.body.classList.toggle('dark-mode', theme === 'dark');
      localStorage.setItem(STORAGE_KEY, theme);
      updateThemeIcons(theme === 'dark');
  };
  
  // Atualiza os ícones do tema
  const updateThemeIcons = (isDark) => {
      const moonIcon = document.querySelector('.fa-moon');
      const sunIcon = document.querySelector('.fa-sun');
      
      if (moonIcon && sunIcon) {
          moonIcon.style.opacity = isDark ? '0' : '1';
          sunIcon.style.opacity = isDark ? '1' : '0';
      }
  };
  
  // Inicializa o tema
  const initTheme = () => {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      const systemTheme = getSystemTheme();
      const theme = savedTheme || systemTheme;
      
      applyTheme(theme);
  };
  
  // Alterna o tema
  const toggleTheme = () => {
      const isDark = document.body.classList.contains('dark-mode');
      applyTheme(isDark ? 'light' : 'dark');
  };
  
  // Configura os event listeners
  if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Observa mudanças no tema do sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
      }
  });
  
  // Inicializa
  initTheme();
