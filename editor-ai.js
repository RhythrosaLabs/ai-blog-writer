export class EditorAI {
    constructor(ui, db, api, parent) {
        this.ui = ui;
        this.db = db;
        this.api = api;
        this.parent = parent; 
    }

    async generateIdeas() {
        this.ui.showLoading();
        try {
            const completion = await this.api.generateIdeas();
            this.parent.showGeneratedContent(completion.content, 'ideas');
        } catch (error) {
            this.parent.handleError(error, 'Failed to generate ideas');
        } finally {
            this.ui.hideLoading();
        }
    }

    async generateTitles() {
        const { title, content, textContent } = this.ui.getEditorContent();
        const topic = this.ui.topicInput.value;
        this.ui.showLoading();
        try {
            const completion = await this.api.generateTitles(topic, title, textContent);
            this.parent.showGeneratedContent(completion.content, 'titles');
        } catch (error) {
            this.parent.handleError(error, 'Failed to generate titles');
        } finally {
            this.ui.hideLoading();
        }
    }

    async improveSelectedText() {
        const selectedText = window.getSelection().toString();
        if (!selectedText) { alert('Please select some text to improve.'); return; }
        const tone = this.ui.toneSelect.value;
        this.ui.showLoading();
        try {
            const completion = await this.api.improveText(selectedText, tone);
            this.parent.showGeneratedContent(completion.content, 'improvement');
        } catch (error) {
            this.parent.handleError(error, 'Failed to improve text');
        } finally {
            this.ui.hideLoading();
        }
    }

    async expandTopic() {
        const topic = this.ui.topicInput.value;
        if (!topic) { alert('Please enter a topic to expand.'); return; }
        const tone = this.ui.toneSelect.value;
        this.ui.showLoading();
        try {
            const completion = await this.api.expandTopic(topic, tone);
            this.parent.showGeneratedContent(completion.content, 'expansion');
        } catch (error) {
            this.parent.handleError(error, 'Failed to expand topic');
        } finally {
            this.ui.hideLoading();
        }
    }

    async generateImage() {
        const topic = this.ui.topicInput.value || this.ui.titleInput.value;
        if (!topic) { alert('Please enter a topic or title to generate an image for.'); return; }
        this.ui.showLoading();
        try {
            const result = await this.api.generateImage(`Professional blog post image about ${topic}, clean and modern style, suitable for web use`);
            this.ui.insertGeneratedImage(result.url);
        } catch (error) {
            this.parent.handleError(error, 'Failed to generate image');
        } finally {
            this.ui.hideLoading();
        }
    }

    async generateFullBlog() {
        const topic = this.ui.topicInput.value;
        if (!topic) { alert('Please enter a topic to generate a full blog post.'); return; }
        const tone = this.ui.toneSelect.value;
        this.ui.showLoading();
        try {
            const { title, content } = await this.api.generateFullBlog(topic, tone);
            this.ui.titleInput.value = title;
            let blogContent = content;
            const prompts = [
                `Hero image for blog post about ${topic}, professional, engaging, high-quality`,
                `Illustration showing key concepts related to ${topic}, informative, modern design`,
                `Visual representation of ${topic} benefits or results, clean professional style`
            ];
            for (let i = 0; i < 3; i++) {
                try {
                    const imageResult = await this.api.generateImage(prompts[i]);
                    const imgTag = `<img src="${imageResult.url}" alt="Blog illustration ${i + 1}" style="width:100%;max-width:600px;height:auto;border-radius:12px;margin:1.5rem 0;box-shadow:0 4px 20px rgba(0,0,0,0.1);">`;
                    if (blogContent.includes('[IMAGE_PLACEHOLDER]')) {
                        blogContent = blogContent.replace('[IMAGE_PLACEHOLDER]', imgTag);
                    } else {
                        const firstP = blogContent.indexOf('</p>');
                        const midPoint = Math.floor(blogContent.length / 2);
                        const nearestP = blogContent.indexOf('</p>', midPoint);
                        const lastH2 = blogContent.lastIndexOf('<h2');
                        if (i === 0 && firstP !== -1) {
                            blogContent = blogContent.slice(0, firstP + 4) + imgTag + blogContent.slice(firstP + 4);
                        } else if (i === 1 && nearestP !== -1) {
                            blogContent = blogContent.slice(0, nearestP + 4) + imgTag + blogContent.slice(nearestP + 4);
                        } else if (i === 2) {
                            blogContent = lastH2 !== -1 ? (blogContent.slice(0, lastH2) + imgTag + blogContent.slice(lastH2)) : (blogContent + imgTag);
                        }
                    }
                } catch (err) {
                    console.error(`Error generating image ${i + 1}:`, err);
                }
            }
            blogContent = blogContent.replace(/\[IMAGE_PLACEHOLDER\]/g, '');
            this.ui.editor.innerHTML = blogContent;
            this.ui.updateStats();
        } catch (error) {
            this.parent.handleError(error, 'Failed to generate full blog');
        } finally {
            this.ui.hideLoading();
        }
    }
}