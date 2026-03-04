// UI management and DOM manipulation
import { Utils } from './utils.js';

export class UIManager {
    constructor() {
        this.initializeElements();
    }

    initializeElements() {
        this.editor = document.getElementById('editor');
        this.titleInput = document.getElementById('titleInput');
        this.wordCount = document.getElementById('wordCount');
        this.charCount = document.getElementById('charCount');
        this.topicInput = document.getElementById('topicInput');
        this.toneSelect = document.getElementById('toneSelect');
        this.chatContainer = document.getElementById('chatContainer');
        this.chatInput = document.getElementById('chatInput');
        this.generatedContent = document.getElementById('generatedContent');
        this.generatedText = document.getElementById('generatedText');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.writeView = document.getElementById('writeView');
        this.libraryView = document.getElementById('libraryView');
        this.blogReader = document.getElementById('blogReader');
        this.blogGrid = document.getElementById('blogGrid');
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
    }

    updateStats() {
        return Utils.updateStats(this.editor, this.titleInput, this.wordCount, this.charCount);
    }

    showLoading() {
        Utils.showLoading(this.loadingOverlay);
    }

    hideLoading() {
        Utils.hideLoading(this.loadingOverlay);
    }

    showError(message) {
        Utils.showError(message);
    }

    addChatMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message`;
        
        const icon = document.createElement('i');
        icon.className = type === 'ai' ? 'fas fa-robot' : 'fas fa-user';
        
        const span = document.createElement('span');
        span.textContent = content;
        
        messageDiv.appendChild(icon);
        messageDiv.appendChild(span);
        
        this.chatContainer.appendChild(messageDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    showGeneratedContent(content, type) {
        this.generatedText.innerHTML = content.replace(/\n/g, '<br>');
        this.generatedContent.style.display = 'block';
        return { content, type };
    }

    dismissGeneratedContent() {
        this.generatedContent.style.display = 'none';
    }

    showWriteView() {
        this.writeView.style.display = 'grid';
        this.libraryView.style.display = 'none';
        this.blogReader.style.display = 'none';
        
        document.getElementById('writeTab').classList.add('active');
        document.getElementById('libraryTab').classList.remove('active');
    }

    showLibraryView() {
        this.writeView.style.display = 'none';
        this.libraryView.style.display = 'block';
        this.blogReader.style.display = 'none';
        
        document.getElementById('writeTab').classList.remove('active');
        document.getElementById('libraryTab').classList.add('active');
    }

    showBlogReader() {
        this.libraryView.style.display = 'none';
        this.blogReader.style.display = 'block';
    }

    async insertImage(file) {
        try {
            // Upload to blob storage instead of using base64 data URLs
            const url = await window.websim.upload(file);
            const img = document.createElement('img');
            img.src = url;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            img.style.margin = '1rem 0';
            
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(img);
            } else {
                this.editor.appendChild(img);
            }
            
            this.updateStats();
        } catch (err) {
            console.error('Image upload failed:', err);
            this.showError('Failed to upload image. Please try again.');
        }
    }

    insertGeneratedImage(imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '8px';
        img.style.margin = '1rem 0';
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
        } else {
            this.editor.appendChild(img);
        }
        
        this.updateStats();
    }

    clearEditor() {
        this.titleInput.value = '';
        this.editor.innerHTML = '';
        this.updateStats();
    }

    getEditorContent() {
        return {
            title: this.titleInput.value,
            content: this.editor.innerHTML,
            textContent: this.editor.textContent || ''
        };
    }

    setEditorContent(title, content) {
        this.titleInput.value = title;
        this.editor.innerHTML = content;
        this.updateStats();
    }
}