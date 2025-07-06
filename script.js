document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM
    const textInput = document.getElementById('text-input');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const qrcodeContainer = document.getElementById('qrcode');
    const messageDiv = document.getElementById('message');
    
    // متغیرها
    let currentQRCodeData = '';
    let qrCodeImageUrl = '';
    
    // تولید QR Code
    function generateQRCode() {
        const text = textInput.value.trim();
        
        if (!text) {
            showMessage('لطفاً متن یا لینک مورد نظر را وارد کنید', 'error');
            return;
        }
        
        if (text === currentQRCodeData && qrCodeImageUrl) {
            showMessage('QR Code قبلاً برای این متن تولید شده است', 'success');
            return;
        }
        
        // پاکسازی محتوای قبلی
        qrcodeContainer.innerHTML = '';
        
        try {
            // استفاده از API جدید QRCode.js
            QRCode.toDataURL(text, {
                width: 256,
                height: 256,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                },
                errorCorrectionLevel: 'H'
            }, function(err, url) {
                if (err) {
                    showMessage('خطا در تولید QR Code: ' + err.message, 'error');
                    console.error('QR Code Error:', err);
                    return;
                }
                
                // نمایش QR Code
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'QR Code';
                qrcodeContainer.appendChild(img);
                
                currentQRCodeData = text;
                qrCodeImageUrl = url;
                showMessage('QR Code با موفقیت تولید شد', 'success');
                qrcodeContainer.classList.add('pulse');
                
                setTimeout(() => {
                    qrcodeContainer.classList.remove('pulse');
                }, 500);
            });
        } catch (error) {
            showMessage('خطا در تولید QR Code: ' + error.message, 'error');
            console.error('QR Code Generation Error:', error);
        }
    }
    
    // کپی QR Code به حافظه
    async function copyQRCodeToClipboard() {
        if (!qrCodeImageUrl) {
            showMessage('لطفاً ابتدا QR Code را تولید کنید', 'error');
            return;
        }
        
        try {
            // دریافت تصویر به صورت Blob
            const response = await fetch(qrCodeImageUrl);
            const blob = await response.blob();
            
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            
            showMessage('QR Code با موفقیت در حافظه کپی شد', 'success');
        } catch (err) {
            console.error('Copy Error:', err);
            showMessage('خطا در کپی کردن: ' + err.message, 'error');
            
            // روش جایگزین برای مرورگرهای قدیمی
            try {
                const img = qrcodeContainer.querySelector('img');
                if (img) {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob(async function(blob) {
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]);
                    });
                }
            } catch (fallbackErr) {
                console.error('Fallback Copy Error:', fallbackErr);
                showMessage('مرورگر شما از این قابلیت پشتیبانی نمی‌کند', 'error');
            }
        }
    }
    
    // دانلود QR Code
    function downloadQRCode() {
        if (!qrCodeImageUrl) {
            showMessage('لطفاً ابتدا QR Code را تولید کنید', 'error');
            return;
        }
        
        try {
            const link = document.createElement('a');
            link.download = 'qrcode_' + Date.now() + '.png';
            link.href = qrCodeImageUrl;
            link.click();
            showMessage('QR Code با موفقیت دانلود شد', 'success');
        } catch (error) {
            console.error('Download Error:', error);
            showMessage('خطا در دانلود QR Code', 'error');
        }
    }
    
    // نمایش پیام
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = 'message ' + type;
        
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
