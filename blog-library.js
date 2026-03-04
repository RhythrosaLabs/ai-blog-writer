// Blog library and reading functionality
import { Utils } from './utils.js';

export class BlogLibrary {
    constructor(uiManager, databaseService) {
        this.ui = uiManager;
        this.db = databaseService;
        this.allBlogs = [];
        this.currentBlog = null;
        this.bindEvents();
    }

    bindEvents() {
        // Navigation events
        document.getElementById('libraryTab').addEventListener('click', () => this.showLibraryView());
        document.getElementById('backToLibraryBtn').addEventListener('click', () => this.showLibraryView());

        // Library events
        this.ui.searchInput.addEventListener('input', () => this.filterBlogs());
        this.ui.sortSelect.addEventListener('change', () => this.sortBlogs());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareCurrentBlog());
    }

    showLibraryView() {
        this.ui.showLibraryView();
        this.loadLibrary();
    }

    loadLibrary() {
        try {
            this.db.subscribeToBlogs((blogs) => {
                // Ensure newest first by explicit sort on created_at
                this.allBlogs = [...blogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                this.displayBlogs(this.allBlogs);
            });
        } catch (error) {
            console.error('Error loading library:', error);
            this.ui.showError('Failed to load library. Please refresh the page.');
        }
    }

    async displayBlogs(blogs) {
        if (blogs.length === 0) {
            this.ui.blogGrid.innerHTML = `
                <div class="empty-library" style="grid-column: 1 / -1;">
                    <i class="fas fa-book-open"></i>
                    <h3>No blogs yet</h3>
                    <p>Be the first to publish a blog to the library!</p>
                </div>
            `;
            return;
        }

        const blogCards = await Promise.all(blogs.map(blog => this.createBlogCard(blog)));
        this.ui.blogGrid.innerHTML = blogCards.join('');
        
        // Add click events to blog cards
        document.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.vote-btn')) return;
                const blogId = card.dataset.blogId;
                this.openBlog(blogId);
            });
        });
        
        // Add vote button events
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const blogId = btn.dataset.blogId;
                const voteType = btn.dataset.voteType;
                this.voteBlog(blogId, voteType);
            });
        });
    }

    async createBlogCard(blog) {
        const voteCounts = await this.db.getVoteCounts(blog.id);
        const publishDate = Utils.formatDate(blog.created_at);
        const hasImage = blog.content.includes('<img');
        const avatarUrl = blog.author_username ? `https://images.websim.com/avatar/${blog.author_username}` : '';

        return `
            <div class="blog-card" data-blog-id="${blog.id}">
                <div class="blog-card-image">
                    ${hasImage ? 
                        `<img src="${Utils.extractFirstImage(blog.content)}" alt="Blog image">` : 
                        '<i class="fas fa-feather-alt"></i>'
                    }
                </div>
                <div class="blog-card-content">
                    <h3 class="blog-card-title">${blog.title}</h3>
                    <p class="blog-card-excerpt">${blog.excerpt}</p>
                    <div class="blog-card-meta">
                        <div class="blog-card-date">
                            <i class="fas fa-calendar"></i>
                            <span>${publishDate}</span>
                        </div>
                        <div class="blog-card-author" title="${blog.author_username || ''}">
                            ${avatarUrl ? `<img src="${avatarUrl}" alt="${blog.author_username}" style="width:20px;height:20px;border-radius:50%;object-fit:cover">` : '<i class="fas fa-user"></i>'}
                            <span>${blog.author_username || 'Unknown'}</span>
                        </div>
                        <div class="blog-card-votes">
                            <button class="vote-btn upvote-btn" data-blog-id="${blog.id}" data-vote-type="upvote" title="Upvote">
                                <i class="fas fa-arrow-up"></i>
                            </button>
                            <span class="vote-score ${voteCounts.score > 0 ? 'positive' : voteCounts.score < 0 ? 'negative' : ''}">${voteCounts.score}</span>
                            <button class="vote-btn downvote-btn" data-blog-id="${blog.id}" data-vote-type="downvote" title="Downvote">
                                <i class="fas fa-arrow-down"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    openBlog(blogId) {
        const blog = this.allBlogs.find(b => b.id === blogId);
        if (!blog) return;
        
        this.currentBlog = blog;
        this.showBlogReader(blog);
    }

    async showBlogReader(blog) {
        this.ui.showBlogReader();
        
        const publishDate = Utils.formatDate(blog.created_at);
        const readTime = Utils.calculateReadTime(blog.word_count);
        const voteCounts = await this.db.getVoteCounts(blog.id);
        const avatarUrl = blog.author_username ? `https://images.websim.com/avatar/${blog.author_username}` : '';
        
        document.getElementById('blogArticle').innerHTML = `
            <h1>${blog.title}</h1>
            <div class="blog-article-meta">
                <span><i class="fas fa-calendar"></i> ${publishDate}</span>
                <span><i class="fas fa-clock"></i> ${readTime} min read</span>
                <span><i class="fas fa-file-word"></i> ${blog.word_count} words</span>
                <span style="display:flex;align-items:center;gap:6px">
                    ${avatarUrl ? `<img src="${avatarUrl}" alt="${blog.author_username}" style="width:22px;height:22px;border-radius:50%;object-fit:cover">` : '<i class="fas fa-user"></i>'}
                    ${blog.author_username || 'Unknown'}
                </span>
                <div class="blog-votes">
                    <button class="vote-btn upvote-btn" onclick="window.blogLibrary.voteBlog('${blog.id}', 'upvote')" title="Upvote">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <span class="vote-score ${voteCounts.score > 0 ? 'positive' : voteCounts.score < 0 ? 'negative' : ''}">${voteCounts.score}</span>
                    <button class="vote-btn downvote-btn" onclick="window.blogLibrary.voteBlog('${blog.id}', 'downvote')" title="Downvote">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
            </div>
            <div class="share-buttons">
                <span class="share-label">Share this blog:</span>
                <button class="share-btn email-btn" onclick="window.blogLibrary.shareViaEmail('${blog.id}')" title="Share via Email">
                    <i class="fas fa-envelope"></i>
                </button>
                <button class="share-btn twitter-btn" onclick="window.blogLibrary.shareViaTwitter('${blog.id}')" title="Share on Twitter">
                    <i class="fab fa-twitter"></i>
                </button>
                <button class="share-btn facebook-btn" onclick="window.blogLibrary.shareViaFacebook('${blog.id}')" title="Share on Facebook">
                    <i class="fab fa-facebook"></i>
                </button>
                <button class="share-btn linkedin-btn" onclick="window.blogLibrary.shareViaLinkedIn('${blog.id}')" title="Share on LinkedIn">
                    <i class="fab fa-linkedin"></i>
                </button>
                <button class="share-btn copy-btn" onclick="window.blogLibrary.copyBlogLink('${blog.id}', event)" title="Copy Link">
                    <i class="fas fa-link"></i>
                </button>
            </div>
            <div class="blog-content">${blog.content}</div>
        `;
    }

    async voteBlog(blogId, voteType) {
        try {
            await this.db.voteBlog(blogId, voteType);
            
            // Refresh the current view
            if (this.currentBlog && this.currentBlog.id === blogId) {
                this.showBlogReader(this.currentBlog);
            }
            
            // Refresh library view if visible
            if (this.ui.libraryView.style.display !== 'none') {
                this.displayBlogs(this.allBlogs);
            }
            
        } catch (error) {
            console.error('Error voting on blog:', error);
            this.ui.showError('Failed to vote. Please try again.');
        }
    }

    filterBlogs() {
        const searchTerm = this.ui.searchInput.value.toLowerCase();
        const filteredBlogs = this.allBlogs.filter(blog => 
            blog.title.toLowerCase().includes(searchTerm) ||
            blog.excerpt.toLowerCase().includes(searchTerm)
        );
        this.displayBlogs(filteredBlogs);
    }

    sortBlogs() {
        const sortBy = this.ui.sortSelect.value;
        const blogs = [...this.allBlogs];
        
        switch (sortBy) {
            case 'newest':
                blogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                blogs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'title':
                blogs.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        
        this.displayBlogs(blogs);
    }

    shareCurrentBlog() {
        if (!this.currentBlog) return;
        
        const url = `${Utils.getCurrentUrl()}?blog=${this.currentBlog.id}`;
        
        if (navigator.share) {
            navigator.share({
                title: this.currentBlog.title,
                text: this.currentBlog.excerpt,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url).then(() => {
                const btn = document.getElementById('shareBtn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            }).catch(() => {
                prompt('Copy this link:', url);
            });
        }
    }

    shareViaEmail(blogId) {
        const blog = this.allBlogs.find(b => b.id === blogId);
        if (!blog) return;
        
        const url = `${Utils.getCurrentUrl()}?blog=${blogId}`;
        const subject = encodeURIComponent(`Check out this blog: ${blog.title}`);
        const body = encodeURIComponent(`I thought you might enjoy this blog post:\n\n${blog.title}\n\n${blog.excerpt}\n\nRead more: ${url}`);
        
        window.open(`mailto:?subject=${subject}&body=${body}`);
    }

    shareViaTwitter(blogId) {
        const blog = this.allBlogs.find(b => b.id === blogId);
        if (!blog) return;
        
        const url = `${Utils.getCurrentUrl()}?blog=${blogId}`;
        const text = encodeURIComponent(`Check out this blog: ${blog.title} ${url}`);
        
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    }

    shareViaFacebook(blogId) {
        const url = `${Utils.getCurrentUrl()}?blog=${blogId}`;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }

    shareViaLinkedIn(blogId) {
        const blog = this.allBlogs.find(b => b.id === blogId);
        if (!blog) return;
        
        const url = `${Utils.getCurrentUrl()}?blog=${blogId}`;
        const title = encodeURIComponent(blog.title);
        const summary = encodeURIComponent(blog.excerpt);
        
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${title}&summary=${summary}`, '_blank');
    }

    copyBlogLink(blogId, e) {
        const url = `${Utils.getCurrentUrl()}?blog=${blogId}`;
        
        navigator.clipboard.writeText(url).then(() => {
            const btn = e?.currentTarget || e?.target || document.querySelector('.copy-btn');
            if (!btn) return;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.style.background = '#10b981';
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
        }).catch(() => {
            prompt('Copy this link:', url);
        });
    }
}