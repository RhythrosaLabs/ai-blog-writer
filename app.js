// Main application coordinator
import { UIManager } from './ui.js';
import { DatabaseService } from './database.js';
import { BlogEditor } from './blog-editor.js';
import { BlogLibrary } from './blog-library.js';

class AIBlogWriter {
    constructor() {
        this.ui = new UIManager();
        this.db = new DatabaseService();
        this.editor = new BlogEditor(this.ui, this.db);
        this.library = new BlogLibrary(this.ui, this.db);
        
        // Make library globally accessible for onclick handlers
        window.blogLibrary = this.library;
        
        this.bindNavigationEvents();
        this.loadSavedDraft();
        this.checkForSharedBlog();
    }

    bindNavigationEvents() {
        document.getElementById('writeTab').addEventListener('click', () => this.showWriteView());
        
    }

    showWriteView() {
        this.ui.showWriteView();
    }

    loadSavedDraft() {
        const savedDraft = localStorage.getItem('blogDraft');
        if (savedDraft) {
            const blogData = JSON.parse(savedDraft);
            this.ui.setEditorContent(blogData.title || '', blogData.content || '');
        }
    }

    checkForSharedBlog() {
        const urlParams = new URLSearchParams(window.location.search);
        const blogId = urlParams.get('blog');
        if (blogId) {
            setTimeout(() => {
                this.library.showLibraryView();
                setTimeout(() => {
                    this.library.openBlog(blogId);
                }, 1000);
            }, 500);
        }
    }

}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIBlogWriter();
});