// Database operations for blog posts and votes
import { WebsimSocket } from '@websim/websim-socket';

export class DatabaseService {
    constructor() {
        this.room = new WebsimSocket({
            schema: {
                blog_post: {
                    id: "uuid",
                    title: "text",
                    content: "text", 
                    excerpt: "text",
                    word_count: "integer",
                    author_username: "text",
                    author_id: "text"
                },
                blog_vote: {
                    id: "uuid",
                    blog_id: "uuid",
                    vote_type: "text"
                }
            }
        });
        this.currentUser = null;
        this.initializeUser();
    }

    async initializeUser() {
        try {
            this.currentUser = await window.websim.getCurrentUser();
        } catch (error) {
            console.error('Error getting current user:', error);
        }
    }

    async publishBlog(title, content, excerpt, wordCount) {
        if (!this.currentUser) {
            throw new Error('User not initialized');
        }

        return this.room.collection('blog_post').upsert({
            title: title,
            content: content,
            excerpt: excerpt,
            word_count: wordCount,
            author_username: this.currentUser.username,
            author_id: this.currentUser.id
        });
    }

    subscribeToBlogs(callback) {
        return this.room.collection('blog_post').subscribe(callback);
    }

    async getVoteCounts(blogId) {
        const upvotes = await this.room.collection('blog_vote').filter({ blog_id: blogId, vote_type: 'upvote' }).getList();
        const downvotes = await this.room.collection('blog_vote').filter({ blog_id: blogId, vote_type: 'downvote' }).getList();
        return {
            upvotes: upvotes.length,
            downvotes: downvotes.length,
            score: upvotes.length - downvotes.length
        };
    }

    async voteBlog(blogId, voteType) {
        if (!this.currentUser) {
            throw new Error('User not initialized');
        }

        const voteId = `${this.currentUser.id}-${blogId}`;
        const existingVote = await this.room.collection('blog_vote').filter({ id: voteId }).getList();
        
        if (existingVote.length > 0) {
            if (existingVote[0].vote_type === voteType) {
                // Same vote type - remove vote
                await this.room.collection('blog_vote').delete(voteId);
            } else {
                // Different vote type - update vote
                await this.room.collection('blog_vote').upsert({
                    id: voteId,
                    blog_id: blogId,
                    vote_type: voteType
                });
            }
        } else {
            // New vote
            await this.room.collection('blog_vote').upsert({
                id: voteId,
                blog_id: blogId,
                vote_type: voteType
            });
        }
    }
}