// Blog editor functionality
import { ApiService } from './api.js';
import { Utils } from './utils.js';
import { EditorAI } from './editor-ai.js';
import { EditorExport } from './export-utils.js';
import { EditorPublishing } from './publishing.js';
import { EditorChat } from './chat-module.js';
import { EditorImages } from './image-module.js';

export class BlogEditor {
    constructor(uiManager, databaseService) {
        this.ui = uiManager;
        this.db = databaseService;
        this.api = new ApiService();
        this.conversationHistory = [];
        this.lastGeneratedContent = '';
        this.lastGenerationType = '';
        this.ai = new EditorAI(this.ui, this.db, this.api, this);
        this.exporter = new EditorExport(this.ui, this);
        this.publisher = new EditorPublishing(this.ui, this.db, this);
        this.chatter = new EditorChat(this.ui, this.api, this);
        this.images = new EditorImages(this.ui, this);
        this.bindEvents();
    }

    bindEvents() {
        // Editor events
        this.ui.editor.addEventListener('input', () => this.ui.updateStats());
        this.ui.titleInput.addEventListener('input', () => this.ui.updateStats());

        // Toolbar events
        document.querySelectorAll('.toolbar-btn[data-command]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                document.execCommand(command, false, null);
                this.ui.editor.focus();
            });
        });

        // AI button events
        document.getElementById('generateIdeasBtn').addEventListener('click', () => this.generateIdeas());
        document.getElementById('generateTitleBtn').addEventListener('click', () => this.generateTitles());
        document.getElementById('improveTextBtn').addEventListener('click', () => this.improveSelectedText());
        document.getElementById('generateImageBtn').addEventListener('click', () => this.generateImage());
        document.getElementById('generateFullBlogBtn').addEventListener('click', () => this.generateFullBlog());
        document.getElementById('expandTopicBtn').addEventListener('click', () => this.expandTopic());

        // Chat events
        document.getElementById('sendChatBtn').addEventListener('click', () => this.sendChatMessage());
        this.ui.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });

        // Generated content events
        document.getElementById('insertGeneratedBtn').addEventListener('click', () => this.insertGeneratedContent());
        document.getElementById('regenerateBtn').addEventListener('click', () => this.regenerateContent());
        document.getElementById('dismissBtn').addEventListener('click', () => this.dismissGeneratedContent());

        // Save and publish events
        document.getElementById('saveBtn').addEventListener('click', () => this.saveDraft());
        document.getElementById('downloadHtmlBtn').addEventListener('click', () => this.downloadAsHtml());
        document.getElementById('downloadPdfBtn').addEventListener('click', () => this.downloadAsPdf());
        document.getElementById('publishBtn').addEventListener('click', () => this.publishPost());

        // Image insertion
        document.getElementById('insertImageBtn').addEventListener('click', () => this.insertImage());
    }

    async generateIdeas() { return this.ai.generateIdeas(); }
    async generateTitles() { return this.ai.generateTitles(); }
    async improveSelectedText() { return this.ai.improveSelectedText(); }
    async expandTopic() { return this.ai.expandTopic(); }
    async generateImage() { return this.ai.generateImage(); }
    async generateFullBlog() { return this.ai.generateFullBlog(); }

    async sendChatMessage() { return this.chatter.sendChatMessage(); }

    showGeneratedContent(content, type) {
        this.lastGeneratedContent = content;
        this.lastGenerationType = type;
        this.ui.showGeneratedContent(content, type);
    }

    insertGeneratedContent() {
        if (this.lastGenerationType === 'titles') {
            this.ui.titleInput.value = this.lastGeneratedContent.split('\n')[0].replace(/^\d+\.\s*/, '');
        } else {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(this.lastGeneratedContent));
            } else {
                this.ui.editor.innerHTML += '<br>' + this.lastGeneratedContent.replace(/\n/g, '<br>');
            }
        }
        
        this.dismissGeneratedContent();
        this.ui.updateStats();
    }

    async regenerateContent() {
        switch (this.lastGenerationType) {
            case 'ideas':
                await this.generateIdeas();
                break;
            case 'titles':
                await this.generateTitles();
                break;
            case 'improvement':
                await this.improveSelectedText();
                break;
            case 'expansion':
                await this.expandTopic();
                break;
        }
    }

    dismissGeneratedContent() {
        this.ui.dismissGeneratedContent();
        this.lastGeneratedContent = '';
        this.lastGenerationType = '';
    }

    insertImage() { return this.images.insertImage(); }

    saveDraft() { return this.publisher.saveDraft(); }
    async publishPost() { return this.publisher.publishPost(); }

    downloadAsHtml() { return this.exporter.downloadAsHtml(); }
    async downloadAsPdf() { return this.exporter.downloadAsPdf(); }

    showSuccessMessage(btnId, message) {
        const btn = document.getElementById(btnId);
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-check"></i> ${message}`;
        btn.style.background = '#10b981';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }

    handleError(error, fallbackMessage) {
        console.error('Error:', error);
        if (error?.message?.includes('timed out')) {
            this.ui.showError('Request timed out. Please try again.');
        } else {
            this.ui.showError(fallbackMessage + '. Please try again.');
        }
    }
}