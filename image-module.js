export class EditorImages {
    constructor(ui, parent) {
        this.ui = ui;
        this.parent = parent;
    }

    insertImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.ui.insertImage(file);
            }
        };
        input.click();
    }
}

