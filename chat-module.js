export class EditorChat {
    constructor(ui, api, parent) {
        this.ui = ui;
        this.api = api;
        this.parent = parent;
    }

    async sendChatMessage() {
        const message = this.ui.chatInput.value.trim();
        if (!message) return;
        this.ui.addChatMessage(message, 'user');
        this.ui.chatInput.value = '';
        const newMessage = { role: "user", content: message };
        this.parent.conversationHistory.push(newMessage);
        this.parent.conversationHistory = this.parent.conversationHistory.slice(-10);
        this.ui.showLoading();
        try {
            const completion = await this.api.chatWithAI(this.parent.conversationHistory);
            this.ui.addChatMessage(completion.content, 'ai');
            this.parent.conversationHistory.push(completion);
        } catch (error) {
            this.parent.handleError(error, 'Chat error');
            this.ui.addChatMessage('Sorry, I encountered an error. Please try again.', 'ai');
        } finally {
            this.ui.hideLoading();
        }
    }
}

