// API handling for AI services
export class ApiService {
    constructor() {
        this.requestTimeout = 30000; // 30 second timeout
    }

    async makeApiCallWithTimeout(apiCall, timeoutMs = this.requestTimeout) {
        return Promise.race([
            apiCall,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
            )
        ]);
    }

    async generateIdeas() {
        return this.makeApiCallWithTimeout(
            websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a creative blog writing assistant. Generate 5 engaging blog post ideas with brief descriptions. Format as a numbered list."
                    },
                    {
                        role: "user",
                        content: "Generate 5 creative and engaging blog post ideas."
                    }
                ]
            })
        );
    }

    async generateTitles(topic, currentTitle, editorContent) {
        return this.makeApiCallWithTimeout(
            websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a creative copywriter. Generate 5 catchy, SEO-friendly blog post titles. Make them engaging and click-worthy."
                    },
                    {
                        role: "user",
                        content: `Generate titles for a blog post about: ${topic || currentTitle || 'general topic'}. Content preview: ${editorContent.substring(0, 200)}...`
                    }
                ]
            })
        );
    }

    async improveText(selectedText, tone) {
        return this.makeApiCallWithTimeout(
            websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a professional editor. Improve the following text to be more ${tone}, engaging, and well-written. Keep the core meaning but enhance clarity, flow, and impact.`
                    },
                    {
                        role: "user",
                        content: selectedText
                    }
                ]
            })
        );
    }

    async expandTopic(topic, tone) {
        return this.makeApiCallWithTimeout(
            websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a skilled blog writer. Write a comprehensive, engaging blog post section about the given topic. Use a ${tone} tone and include relevant details, examples, and insights. Make it informative and well-structured.`
                    },
                    {
                        role: "user",
                        content: `Write a detailed blog post section about: ${topic}`
                    }
                ]
            })
        );
    }

    async generateFullBlog(topic, tone) {
        const titleCompletion = await this.makeApiCallWithTimeout(
            websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Generate a compelling, SEO-friendly blog post title. Return only the title, no extra text."
                    },
                    {
                        role: "user",
                        content: `Create a catchy title for a blog post about: ${topic}`
                    }
                ]
            })
        );

        const blogCompletion = await this.makeApiCallWithTimeout(
            websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a professional blog writer. Create a comprehensive, well-structured blog post with the following requirements:
                        - Use a ${tone} tone
                        - Include an engaging introduction
                        - 3-4 main sections with descriptive headings
                        - Use HTML formatting: <h2> for main headings, <h3> for subheadings, <p> for paragraphs, <ul>/<li> for lists
                        - Include exactly 3 [IMAGE_PLACEHOLDER] markers in strategic locations (after introduction, between main sections)
                        - Add a compelling conclusion
                        - Make it informative, engaging, and at least 800 words
                        - Use proper HTML structure throughout`
                    },
                    {
                        role: "user",
                        content: `Write a complete blog post about: ${topic}`
                    }
                ]
            })
        );

        return {
            title: titleCompletion.content.trim(),
            content: blogCompletion.content
        };
    }

    async generateImage(prompt, aspectRatio = "16:9") {
        return this.makeApiCallWithTimeout(
            websim.imageGen({
                prompt: `${prompt}, ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO WORDS, NO CHARACTERS, NO FONTS, purely visual illustration only`,
                aspect_ratio: aspectRatio
            }),
            45000 // Longer timeout for image generation
        );
    }

    async chatWithAI(conversationHistory) {
        return this.makeApiCallWithTimeout(
            websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful blog writing assistant. Provide advice, suggestions, and help with writing, editing, and improving blog posts. Be concise but helpful."
                    },
                    ...conversationHistory
                ]
            })
        );
    }
}