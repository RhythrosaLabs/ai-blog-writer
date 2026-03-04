export class EditorExport {
    constructor(ui, parent) {
        this.ui = ui;
        this.parent = parent;
    }

    downloadAsHtml() {
        const { title, content } = this.ui.getEditorContent();
        const safeTitle = title || 'blog-post';
        const htmlDoc = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${safeTitle}</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial,'Noto Sans';line-height:1.6;margin:2rem;color:#111827}h1{font-size:2rem;margin-bottom:1rem}h2{border-bottom:2px solid #4f46e5;padding-bottom:.3rem}img{max-width:100%;border-radius:12px;margin:1rem 0;box-shadow:0 4px 20px rgba(0,0,0,.1)}</style></head><body><article><h1>${title || 'Untitled'}</h1>${content}</article></body></html>`;
        const blob = new Blob([htmlDoc], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeTitle.replace(/\s+/g, '-').toLowerCase()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async downloadAsPdf() {
        const { title, content } = this.ui.getEditorContent();
        const container = document.createElement('div');
        container.style.padding = '24px';
        container.style.background = '#ffffff';
        container.style.color = '#111827';
        container.style.width = '794px';
        container.innerHTML = `<h1 style="font-size:28px;margin-bottom:16px">${title || 'Untitled'}</h1>${content}`;
        document.body.appendChild(container);
        try {
            const canvas = await html2canvas(container, { scale: 2, useCORS: true });
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = pageWidth - 40;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let remainingHeight = imgHeight, sourceY = 0, first = true;
            const pageCanvas = document.createElement('canvas'), ctx = pageCanvas.getContext('2d');
            while (remainingHeight > 0) {
                const sliceHeight = Math.min((pdf.internal.pageSize.getHeight() - 40), remainingHeight);
                pageCanvas.width = canvas.width;
                pageCanvas.height = (sliceHeight * canvas.width) / imgWidth;
                ctx.drawImage(canvas, 0, sourceY * (canvas.width / imgWidth), canvas.width, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height);
                const sliceData = pageCanvas.toDataURL('image/png');
                if (!first) pdf.addPage();
                pdf.addImage(sliceData, 'PNG', 20, 20, imgWidth, sliceHeight);
                remainingHeight -= sliceHeight; sourceY += sliceHeight; first = false;
            }
            pdf.save(`${(title || 'blog-post').replace(/\s+/g, '-').toLowerCase()}.pdf`);
        } catch (err) {
            console.error('PDF export failed:', err);
            this.ui.showError('Failed to generate PDF. Please try again.');
        } finally {
            container.remove();
        }
    }
}

