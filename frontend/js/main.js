// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

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
const showToast = (message, type = 'info') => showAlert(message, type);

const showLoading = (element) => {
    element.innerHTML = '<div class="loading"><div class="spinner"></div> Carregando...</div>';
};

const hideLoading = () => {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => el.remove());
};

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


const httpClient = {
    async _parseResponse(response) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.toLowerCase().includes('application/json')) {
            return await response.json();
        }
        return await response.text();
    },

    async _handleResponse(response) {
        const parsed = await this._parseResponse(response);
        if (!response.ok) {
            let message = `HTTP Error: ${response.status}`;
            if (parsed) {
                if (typeof parsed === 'string') {
                    message = parsed;
                } else if (parsed.erro || parsed.error || parsed.message) {
                    message = parsed.erro || parsed.error || parsed.message;
                }
            }
            throw new Error(message);
        }
        return parsed;
    },

    async _request(url, method, data = null) {
        const headers = {
            'Content-Type': 'application/json',
        };

        const token = localStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method: method,
            headers: headers,
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${url}`, config);
            return await this._handleResponse(response);

        } catch (error) {
            console.error(`${method} Error:`, error);
            throw error;
        }
    },

    async get(url) {
        return this._request(url, 'GET');
    },

    async post(url, data) {
        return this._request(url, 'POST', data);
    },

    async put(url, data) {
        return this._request(url, 'PUT', data);
    },

    async delete(url) {
        return this._request(url, 'DELETE');
    }
};


document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if ((currentPage === 'index.html' || currentPage === '') && (href === 'index.html' || href === './')) {
            link.classList.add('active');
        } else if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
});

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
window.showToast = showToast;