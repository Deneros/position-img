let pdfDoc = null;
let pageNum = 1;
const scale = 1.5;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let documentWidth = 0;  // Añade estas dos líneas para
let documentHeight = 0; // guardar las dimensiones del documento.

// Carga el documento PDF.
pdfjsLib.getDocument('/doc/prueba.pdf').promise.then((doc) => {
    pdfDoc = doc;
    renderPage(pageNum);
});

// Renderiza una página del PDF en el canvas.
function renderPage(num) {
    pdfDoc.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        documentWidth = viewport.width;  // Actualiza las dimensiones
        documentHeight = viewport.height; // del documento aquí.
        const renderCtx = { canvasContext: ctx, viewport };
        page.render(renderCtx).promise.then(() => {
            document.getElementById('pdf-container').appendChild(canvas);
        });
    });
}

let signature = document.getElementById('signature');
let isDown = false;
let offsetX, offsetY;

signature.addEventListener('mousedown', (e) => {
    isDown = true;
    offsetX = signature.offsetLeft - e.clientX;
    offsetY = signature.offsetTop - e.clientY;
}, true);

document.addEventListener('mouseup', () => {
    isDown = false;
}, true);

document.addEventListener('mousemove', (e) => {
    e.preventDefault();
    if (isDown) {
        let newLeft = e.clientX + offsetX;
        let newTop = e.clientY + offsetY;

        // Asegúrate de que la firma no se salga del documento.
        if (newLeft < 0 || newLeft + signature.offsetWidth > documentWidth) {
            return;
        }
        if (newTop < 0 || newTop + signature.offsetHeight > documentHeight) {
            return;
        }

        // Actualiza la posición de la firma.
        signature.style.left = newLeft + 'px';
        signature.style.top = newTop + 'px';
    }
}, true);

document.getElementById('save-position-button').addEventListener('click', () => {
    console.log('Posición de la firma:', signature.offsetLeft, signature.offsetTop);
    document.getElementById('add-img-button').style.display = 'block';
});

document.getElementById('add-signature-button').addEventListener('click', () => {
    document.getElementById('save-position-button').style.display = 'block';
    document.getElementById('signature').style.display = 'block';
});


document.getElementById('add-img-button').addEventListener('click', () => {

    // Carga la imagen de la firma y la dibuja en el canvas.
    let img = new Image();
    img.src = '/img/grafofirma.png'; // Asegúrate de que esta sea la ruta a la imagen de la firma
    img.onload = function () {
        const imgWidth = 100; // Ancho de la imagen
        const imgHeight = 50; // Altura de la imagen
        ctx.drawImage(img, signature.offsetLeft, signature.offsetTop, imgWidth, imgHeight);

        console.log(signature.offsetLeft, signature.offsetTop);
        // Convierte el contenido del canvas (ahora incluyendo la firma) en un PDF.
        let doc = new jsPDF();
        let dataUrl = canvas.toDataURL();
        doc.addImage(dataUrl, 'PNG', 0, 0);
        doc.save('documento_firmado.pdf');
    }
});