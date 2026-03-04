import { Utils } from './utils.js';

export class EditorPublishing {
    constructor(ui, db, parent) {
        this.ui = ui;
        this.db = db;
        this.parent = parent;
    }

    saveDraft() {
        const { title, content } = this.ui.getEditorContent();
        const blogData = { title, content, timestamp: new Date().toISOString() };
        localStorage.setItem('blogDraft', JSON.stringify(blogData));
        this.parent.showSuccessMessage('saveBtn', 'Saved!');
    }

    async publishPost() {
        const { title, content, textContent } = this.ui.getEditorContent();
        if (!title || !content.trim()) { alert('Please add a title and content before publishing.'); return; }
        const excerpt = Utils.generateExcerpt(content);
        const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
        const btn = document.getElementById('publishBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
        btn.disabled = true;
        try {
            await this.db.publishBlog(title, content, excerpt, wordCount);
            btn.innerHTML = '<i class="fas fa-check"></i> Published to Library!';
            btn.style.background = '#10b981';
            setTimeout(() => {
                this.ui.clearEditor();
                btn.innerHTML = originalText; btn.style.background = ''; btn.disabled = false;
            }, 3000);
        } catch (error) {
            this.parent.handleError(error, 'Failed to publish blog');
            btn.innerHTML = '<i class="fas fa-times"></i> Failed to Publish'; btn.style.background = '#ef4444';
            setTimeout(() => { btn.innerHTML = originalText; btn.style.background = ''; btn.disabled = false; }, 3000);
        }
    }
}

