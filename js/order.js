/**
 * Desk2Door - Order Form Sourcing Script
 * Handles: Drag-and-drop file upload, URL tier presets, validation, LocalStorage database, and WhatsApp alerts
 */

document.addEventListener('DOMContentLoaded', () => {
    const orderForm = document.getElementById('desk2doorOrderForm');
    const orderFormContainer = document.getElementById('orderFormContainer');
    const orderSuccessContainer = document.getElementById('orderSuccessContainer');
    
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('schoolListFile');
    const uploadText = document.getElementById('uploadText');
    const fileError = document.getElementById('fileError');
    const textError = document.getElementById('textError');
    const typedListInput = document.getElementById('typedList');
    
    const kitTierSelect = document.getElementById('kitTier');
    
    // Category Selectors
    const categoryCards = document.querySelectorAll('.order-category-card');
    const schoolFieldsContainer = document.getElementById('schoolFieldsContainer');
    const kitTierGroup = document.getElementById('kitTierGroup');
    
    const tabUploadBtn = document.getElementById('tabUploadBtn');
    const tabTextBtn = document.getElementById('tabTextBtn');
    const tabUploadContent = document.getElementById('tabUploadContent');
    const tabTextContent = document.getElementById('tabTextContent');
    
    let uploadedFileDetails = null;
    let selectedCategory = 'Study'; // Study, Home, Office, List2Door
    let activeInputMethod = 'upload'; // upload, text

    // 1. Parse URL Parameter to Auto-Select Sourcing Category or Sourcing Tier
    const getQueryParam = (name) => {
        const results = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.href);
        return results ? decodeURIComponent(results[1]) : null;
    };
    
    const selectedCategoryParam = getQueryParam('category');
    if (selectedCategoryParam) {
        // Map parameter values to radio inputs: e.g. ?category=home -> Home
        const mappedVal = selectedCategoryParam.charAt(0).toUpperCase() + selectedCategoryParam.slice(1);
        const matchRadio = document.querySelector(`input[name="orderCategory"][value="${mappedVal}"]`);
        if (matchRadio) {
            matchRadio.parentElement.click();
        }
    }

    const selectedTier = getQueryParam('tier');
    if (selectedTier && selectedCategory === 'Study') {
        const optionValues = Array.from(kitTierSelect.options).map(opt => opt.value);
        if (optionValues.includes(selectedTier)) {
            kitTierSelect.value = selectedTier;
        }
    }

    // 2. Category Card Selector Toggle
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const radioInput = card.querySelector('input[type="radio"]');
            if (radioInput) {
                radioInput.checked = true;
                selectedCategory = radioInput.value;
                
                // Show school fields and kit tiers only for Study Kits
                if (selectedCategory === 'Study') {
                    schoolFieldsContainer.style.display = 'flex';
                    kitTierGroup.style.display = 'block';
                } else {
                    schoolFieldsContainer.style.display = 'none';
                    kitTierGroup.style.display = 'none';
                    // Clear validation errors on hidden school fields
                    const schoolName = document.getElementById('schoolName');
                    const studentClass = document.getElementById('studentClass');
                    [schoolName, studentClass].forEach(el => {
                        if (el) {
                            el.style.borderColor = 'var(--border-color)';
                            const errSpan = el.parentElement.querySelector('.error-msg');
                            if (errSpan) errSpan.style.display = 'none';
                        }
                    });
                }
            }
        });
    });

    // 3. List Input Tab Switcher
    if (tabUploadBtn && tabTextBtn) {
        tabUploadBtn.addEventListener('click', () => {
            tabUploadBtn.classList.add('active');
            tabTextBtn.classList.remove('active');
            tabUploadContent.classList.add('active');
            tabTextContent.classList.remove('active');
            activeInputMethod = 'upload';
            fileError.style.display = 'none';
            textError.style.display = 'none';
        });

        tabTextBtn.addEventListener('click', () => {
            tabTextBtn.classList.add('active');
            tabUploadBtn.classList.remove('active');
            tabTextContent.classList.add('active');
            tabUploadContent.classList.remove('active');
            activeInputMethod = 'text';
            fileError.style.display = 'none';
            textError.style.display = 'none';
        });
    }

    // 4. Drag & Drop File Upload Interactions
    const highlightDropzone = () => dropzone.classList.add('dragover');
    const unhighlightDropzone = () => dropzone.classList.remove('dragover');
    
    if (dropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                highlightDropzone();
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                unhighlightDropzone();
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                fileInput.files = files;
                handleFileSelection(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (fileInput.files.length > 0) {
                handleFileSelection(fileInput.files[0]);
            }
        });
    }

    const handleFileSelection = (file) => {
        // Validate file type (image or document or spreadsheets)
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|doc|docx|xls|xlsx)$/i)) {
            fileError.textContent = "Invalid file type. Please upload an image, PDF, Word, or Excel document.";
            fileError.style.display = "block";
            fileInput.value = '';
            uploadedFileDetails = null;
            dropzone.classList.remove('has-file');
            uploadText.innerHTML = `Drag and drop your file here, or <span>browse folders</span><small>Supports PDF, Excel, Word, or images (Max 10MB)</small>`;
            return;
        }

        // Validate size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            fileError.textContent = "File is too large. Maximum size allowed is 10MB.";
            fileError.style.display = "block";
            fileInput.value = '';
            uploadedFileDetails = null;
            dropzone.classList.remove('has-file');
            return;
        }

        fileError.style.display = "none";
        dropzone.classList.add('has-file');
        
        // Format readable file size
        const fileSizeKB = (file.size / 1024).toFixed(1);
        const fileDisplaySize = fileSizeKB > 1000 ? (fileSizeKB / 1024).toFixed(1) + ' MB' : fileSizeKB + ' KB';
        
        uploadedFileDetails = {
            name: file.name,
            size: fileDisplaySize,
            type: file.type
        };
        
        uploadText.innerHTML = `<strong>Selected: ${file.name}</strong> (${fileDisplaySize})<br><span>Click or drag to change file</span>`;
    };

    // 5. Payment Method Card Selection Toggle
    const paymentCards = document.querySelectorAll('.payment-card');
    paymentCards.forEach(card => {
        card.addEventListener('click', () => {
            paymentCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const radioInput = card.querySelector('input[type="radio"]');
            if (radioInput) radioInput.checked = true;
        });
    });

    // 6. Form Validation & Sourcing Submissions
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        
        // Fields to validate
        const parentName = document.getElementById('parentName');
        const phoneNumber = document.getElementById('phoneNumber');
        const schoolName = document.getElementById('schoolName');
        const studentClass = document.getElementById('studentClass');
        const deliverySector = document.getElementById('deliverySector');
        const deliveryAddress = document.getElementById('deliveryAddress');
        
        // Simple helper to toggle errors
        const validateField = (element, condition) => {
            const errorSpan = element.parentElement.querySelector('.error-msg') || 
                              element.parentElement.parentElement.querySelector('.error-msg');
            if (condition) {
                element.style.borderColor = 'var(--border-color)';
                if (errorSpan) errorSpan.style.display = 'none';
            } else {
                element.style.borderColor = '#EF4444';
                if (errorSpan) errorSpan.style.display = 'block';
                isValid = false;
            }
        };

        validateField(parentName, parentName.value.trim().length >= 2);
        validateField(phoneNumber, phoneNumber.value.trim().length >= 8);
        
        // Conditional validation for Study Kits
        if (selectedCategory === 'Study') {
            validateField(schoolName, schoolName.value.trim().length >= 2);
            validateField(studentClass, studentClass.value.trim().length >= 1);
        }
        
        validateField(deliverySector, deliverySector.value !== "");
        validateField(deliveryAddress, deliveryAddress.value.trim().length >= 5);
        
        // Validate Sourcing List Input Method
        if (activeInputMethod === 'upload') {
            if (!uploadedFileDetails) {
                fileError.textContent = "Please upload a list file or photo of your shopping list.";
                fileError.style.display = "block";
                isValid = false;
            } else {
                fileError.style.display = "none";
            }
            textError.style.display = "none";
        } else {
            if (typedListInput.value.trim().length < 5) {
                textError.style.display = "block";
                isValid = false;
            } else {
                textError.style.display = "none";
            }
            fileError.style.display = "none";
        }

        if (!isValid) {
            // Scroll to the first error
            const firstError = document.querySelector('.error-msg[style*="display: block"]');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // 7. Generate and store order records
        const orderNumber = 'D2D-2026-' + Math.floor(1000 + Math.random() * 9000);
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        const newOrder = {
            orderId: orderNumber,
            category: selectedCategory,
            parentName: parentName.value.trim(),
            phone: phoneNumber.value.trim(),
            schoolName: selectedCategory === 'Study' ? schoolName.value.trim() : '',
            studentClass: selectedCategory === 'Study' ? studentClass.value.trim() : '',
            tier: selectedCategory === 'Study' ? kitTierSelect.value : 'N/A',
            inputMethod: activeInputMethod,
            fileName: activeInputMethod === 'upload' ? uploadedFileDetails.name : 'Typed Text List',
            fileSize: activeInputMethod === 'upload' ? uploadedFileDetails.size : 'N/A',
            typedList: activeInputMethod === 'text' ? typedListInput.value.trim() : '',
            notes: document.getElementById('notes').value.trim(),
            sector: deliverySector.value,
            address: deliveryAddress.value.trim(),
            payment: paymentMethod,
            status: 'Pending', // Pending, Quoting, Purchasing, Out for Delivery, Completed
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            epoch: Date.now()
        };

        // Save order to LocalStorage list
        let currentOrders = [];
        try {
            const saved = localStorage.getItem('desk2door_orders');
            if (saved) currentOrders = JSON.parse(saved);
        } catch (e) {
            console.error("Error reading saved orders, resetting.", e);
        }
        
        currentOrders.unshift(newOrder); // Prepend new order
        localStorage.setItem('desk2door_orders', JSON.stringify(currentOrders));

        // 8. Transition to Success screen
        document.getElementById('successOrderId').textContent = orderNumber;
        
        // Prepare pre-filled WhatsApp alert text
        const waFounderNumber = '250795124101';
        
        let contextualDetails = '';
        if (selectedCategory === 'Study') {
            contextualDetails = `School: ${newOrder.schoolName} (${newOrder.studentClass})
Study Sourcing Tier: ${newOrder.tier.toUpperCase()} Kit`;
        } else {
            contextualDetails = `Category: ${selectedCategory.toUpperCase()} Sourcing`;
        }

        let listDetailString = '';
        if (activeInputMethod === 'upload') {
            listDetailString = `File Attached: ${newOrder.fileName}`;
        } else {
            // Get first few items to display in WhatsApp message snippet
            const snippet = newOrder.typedList.split('\n').slice(0, 3).join(', ');
            listDetailString = `Typed Items snippet: ${snippet}...`;
        }

        const rawMessage = `Hello Desk2Door! I just submitted an order request. 
Order ID: ${orderNumber}
Customer Name: ${newOrder.parentName}
${contextualDetails}
${listDetailString}

Please review and send me an itemized quote. Thank you!`;

        const waUrl = `https://wa.me/${waFounderNumber}?text=${encodeURIComponent(rawMessage)}`;
        document.getElementById('whatsappAlertBtn').setAttribute('href', waUrl);
        
        // 9. Send Email Notification
        if (window.sendEmailNotification) {
            const emailData = {
                "Order Reference": orderNumber,
                "Customer Name": newOrder.parentName,
                "WhatsApp Number": newOrder.phone,
                "Sourcing Category": newOrder.category,
                "Delivery Sector": newOrder.sector,
                "Delivery Address": newOrder.address,
                "Payment Method": newOrder.payment,
                "Notes/Instructions": newOrder.notes || "None",
            };
            
            if (newOrder.category === 'Study') {
                emailData["School Name"] = newOrder.schoolName;
                emailData["Student Class"] = newOrder.studentClass;
                emailData["Sourcing Tier"] = newOrder.tier.toUpperCase();
            }
            
            if (newOrder.inputMethod === 'upload') {
                emailData["Shopping List Document"] = `${newOrder.fileName} (${newOrder.fileSize})`;
            } else {
                emailData["Typed Shopping List"] = newOrder.typedList;
            }
            
            window.sendEmailNotification(emailData, `New Desk2Door Order: ${orderNumber}`);
        }

        // Slide out form, slide in success details
        orderFormContainer.style.display = 'none';
        orderSuccessContainer.style.display = 'block';
        
        // Scroll to top of section
        document.getElementById('orderSuccessContainer').scrollIntoView({ behavior: 'smooth' });
    });
});
