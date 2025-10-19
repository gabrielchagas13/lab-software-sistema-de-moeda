// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Utility functions
const formatCPF = (cpf) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatCNPJ = (cnpj) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
};

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};

// Alert functions
const showAlert = (message, type = 'info') => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container') || document.body;
    if (container.firstChild) {
        container.insertBefore(alertDiv, container.firstChild);
    } else {
        container.appendChild(alertDiv);
    }
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
};

const showSuccess = (message) => showAlert(message, 'success');
const showError = (message) => showAlert(message, 'error');
const showWarning = (message) => showAlert(message, 'warning');

// Toast notifications (alias for showAlert)
const showToast = (message, type = 'info') => showAlert(message, type);

// Loading functions
const showLoading = (element) => {
    element.innerHTML = '<div class="loading"><div class="spinner"></div> Carregando...</div>';
};

const hideLoading = () => {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => el.remove());
};

// Form validation
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validateCPF = (cpf) => {
    const re = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return re.test(cpf);
};

const validateCNPJ = (cnpj) => {
    const re = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    return re.test(cnpj);
};

// HTTP client
const httpClient = {
    async _parseResponse(response) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.toLowerCase().includes('application/json')) {
            return await response.json();
        }
        // Fallback to text for validation/errors that return plain text
        return await response.text();
    },

    async _handleResponse(response) {
        const parsed = await this._parseResponse(response);
        if (!response.ok) {
            // parsed can be string or object
            let message = `HTTP Error: ${response.status}`;
            if (parsed) {
                if (typeof parsed === 'string') {
                    // server returned plain text (e.g. validation message)
                    message = parsed;
                } else if (parsed.erro || parsed.error || parsed.message) {
                    message = parsed.erro || parsed.error || parsed.message;
                }
            }
            throw new Error(message);
        }
        return parsed;
    },

    async get(url) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`);
            return await this._handleResponse(response);
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    },

    async post(url, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            return await this._handleResponse(response);
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    },

    async put(url, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            return await this._handleResponse(response);
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    },

    async delete(url) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'DELETE',
            });

            return await this._handleResponse(response);
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    }
};

// Navigation highlight
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if ((currentPage === 'index.html' || currentPage === '') && href === 'index.html') {
            link.classList.add('active');
        } else if (href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
});

// Mask inputs
const maskCPF = (input) => {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = value;
};

const maskCNPJ = (input) => {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1/$2');
    value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    input.value = value;
};

// Export for use in other files
window.appUtils = {
    formatCPF,
    formatCNPJ,
    formatDate,
    formatCurrency,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showToast,
    showLoading,
    hideLoading,
    validateEmail,
    validateCPF,
    validateCNPJ,
    httpClient,
    maskCPF,
    maskCNPJ
};

// Global functions for backward compatibility
window.showToast = showToast;