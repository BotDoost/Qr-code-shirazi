document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM
    const textInput = document.getElementById('text-input');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const qrcodeContainer = document.getElementById('qrcode');
    const messageDiv = document.getElementById('message');
    
    // متغیرها
    let qrCodeInstance = null;
    let currentQRCodeData = '';
    
    // تولید QR Code
    function generateQRCode() {
        const text = textInput.value.trim();
        
        if (!text) {
            showMessage('لطفاً متن یا لینک مورد نظر را وارد کنید', 'error');
            return;
        }
        
        // اگر متن تغییر نکرده، دوباره تولید نکن
        if (text === currentQRCodeData && qrCodeInstance) {
            showMessage('QR Code قبلاً برای این متن تولید شده است', 'success');
            return;
        }
        
        // پاکسازی QR Code قبلی
        qrcodeContainer.innerHTML = '';
        
        // تولید QR Code جدید
        try {
            qrCodeInstance = new QRCode(qrcodeContainer, {
                text: text,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            
            currentQRCodeData = text;
            showMessage('QR Code با موفقیت تولید شد', 'success');
            qrcodeContainer.classList.add('pulse');
            
            setTimeout(() => {
                qrcodeContainer.classList.remove('pulse');
            }, 500);
            
        } catch (error) {
            showMessage('خطا در تولید QR Code: ' + error.message, 'error');
            console.error('Error generating QR Code:', error);
        }
    }
    
    // کپی QR Code به حافظه
    async function copyQRCodeToClipboard() {
        if (!qrCodeInstance) {
            showMessage('لطفاً ابتدا QR Code را تولید کنید', 'error');
            return;
        }
        
        const canvas = qrcodeContainer.querySelector('canvas');
        
        if (!canvas) {
            showMessage('خطا در پیدا کردن QR Code تولید شده', 'error');
            return;
        }
        
        try {
            // روش جدید برای کپی تصویر
            canvas.toBlob(async function(blob) {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    showMessage('QR Code با موفقیت در حافظه کپی شد', 'success');
                } catch (err) {
                    console.error('Failed to copy:', err);
                    showMessage('خطا در کپی کردن: ' + err.message, 'error');
                }
            });
        } catch (error) {
            // روش جایگزین برای مرورگرهای قدیمی
            try {
                canvas.toBlob(function(blob) {
                    const item = new ClipboardItem({ "image/png": blob });
                    navigator.clipboard.write([item])
                        .then(() => {
                            showMessage('QR Code با موفقیت در حافظه کپی شد', 'success');
                        })
                        .catch(err => {
                            console.error('Failed to copy:', err);
                            showMessage('خطا در کپی کردن: ' + err.message, 'error');
                        });
                });
            } catch (err) {
                console.error('Copy failed:', err);
                showMessage('مرورگر شما از این قابلیت پشتیبانی نمی‌کند', 'error');
            }
        }
    }
    
    // دانلود QR Code
    function downloadQRCode() {
        if (!qrCodeInstance) {
            showMessage('لطفاً ابتدا QR Code را تولید کنید', 'error');
            return;
        }
        
        const canvas = qrcodeContainer.querySelector('canvas');
        
        if (!canvas) {
            showMessage('خطا در پیدا کردن QR Code تولید شده', 'error');
            return;
        }
        
        try {
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            showMessage('QR Code با موفقیت دانلود شد', 'success');
        } catch (error) {
            console.error('Download failed:', error);
            showMessage('خطا در دانلود QR Code', 'error');
        }
    }
    
    // نمایش پیام
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = 'message ' + type;
        
        // پاک کردن پیام بعد از 5 ثانیه
        setTimeout(() => {
            if (messageDiv.textContent === text) {
                messageDiv.className = 'message';
                messageDiv.textContent = '';
            }
        }, 5000);
    }
    
    // رویدادهای کلیک
    generateBtn.addEventListener('click', generateQRCode);
    copyBtn.addEventListener('click', copyQRCodeToClipboard);
    downloadBtn.addEventListener('click', downloadQRCode);
    
    // تولید QR Code اولیه هنگام بارگیری صفحه
    generateQRCode();
});
