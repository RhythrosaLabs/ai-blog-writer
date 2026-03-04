// Utility functions for the blog writer application
export class Utils {
    static updateStats(editor, titleInput, wordCount, charCount) {
        const text = editor.textContent || '';
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        
        wordCount.textContent = `${words} words`;
        charCount.textContent = `${chars} characters`;
        
        return { words, chars };
    }

    static showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 1001;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    static showLoading(loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }

    static hideLoading(loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }

    static extractFirstImage(content) {
        const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
        return imgMatch ? imgMatch[1] : '';
    }

    static generateExcerpt(content, maxLength = 200) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        return textContent.substring(0, maxLength) + (textContent.length > maxLength ? '...' : '');
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    static calculateReadTime(wordCount) {
        return Math.ceil(wordCount / 200); // Assuming 200 WPM reading speed
    }

    static getCurrentUrl() {
        return window.baseUrl || (window.location.origin + window.location.pathname);
    }
}