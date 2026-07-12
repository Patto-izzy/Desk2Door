/**
 * Desk2Door - Admin Dashboard Script
 * Handles: LocalStorage CRUD operations, search/filtering, modal inspection, status updates, and mock database seeding
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements Reference
    const orderTableBody = document.getElementById('adminOrderTableBody');
    const searchInput = document.getElementById('adminSearchInput');
    const filterButtons = document.querySelectorAll('.admin-filter-btn');
    
    // Stats elements
    const statTotalOrders = document.getElementById('statTotalOrders');
    const statPendingQuotes = document.getElementById('statPendingQuotes');
    const statActiveSourcing = document.getElementById('statActiveSourcing');
    const statEstRevenue = document.getElementById('statEstRevenue');
    
    // Actions elements
    const injectMockBtn = document.getElementById('injectMockDataBtn');
    const clearAllBtn = document.getElementById('clearAllOrdersBtn');
    
    // Modal elements
    const modalOverlay = document.getElementById('modalOverlay');
    const detailModal = document.getElementById('adminDetailModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const modalSaveBtn = document.getElementById('modalSaveBtn');
    const modalDeleteBtn = document.getElementById('modalDeleteBtn');
    
    // Modal data fields
    const modalOrderId = document.getElementById('modalOrderId');
    const modalOrderDate = document.getElementById('modalOrderDate');
    const modalParentName = document.getElementById('modalParentName');
    const modalPhone = document.getElementById('modalPhone');
    const modalCategory = document.getElementById('modalCategory');
    const modalSchoolName = document.getElementById('modalSchoolName');
    const modalStudentClass = document.getElementById('modalStudentClass');
    const modalSchoolRow = document.getElementById('modalSchoolRow');
    const modalClassRow = document.getElementById('modalClassRow');
    const modalPayment = document.getElementById('modalPayment');
    const modalFileName = document.getElementById('modalFileName');
    const modalFileSize = document.getElementById('modalFileSize');
    const modalFileRow = document.getElementById('modalFileRow');
    const modalTypedList = document.getElementById('modalTypedList');
    const modalTypedListRow = document.getElementById('modalTypedListRow');
    const modalDeliveryAddress = document.getElementById('modalDeliveryAddress');
    const modalNotes = document.getElementById('modalNotes');
    const modalStatusSelect = document.getElementById('modalStatusSelect');

    // 2. Global Dashboard State
    let ordersList = [];
    let currentFilter = 'all';
    let currentSearchTerm = '';
    let selectedOrderId = null;

    // Security: HTML escape helper to prevent XSS from user-submitted data
    const escapeHTML = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    // 3. Multi-Category Mock Sourcing Data Seeding
    const mockOrders = [
        {
            orderId: "D2D-2026-1402",
            category: "Study",
            parentName: "Mutesi Sandra",
            phone: "+250 788 358 111",
            schoolName: "Green Hills Academy",
            studentClass: "Primary 4",
            tier: "standard",
            inputMethod: "upload",
            fileName: "green_hills_P4_stationery.pdf",
            fileSize: "1.2 MB",
            typedList: "",
            notes: "Excluding pencil cases. Please include primary brand pencils.",
            sector: "Kacyiru",
            address: "KG 566 St, Villa 12, Kacyiru",
            payment: "MoMo",
            status: "Pending",
            date: "Jul 09, 2026, 02:30 PM",
            epoch: Date.now() - 3600000 * 4
        },
        {
            orderId: "D2D-2026-4859",
            category: "Home",
            parentName: "Kagabo Eric",
            phone: "+250 783 222 999",
            schoolName: "",
            studentClass: "",
            tier: "N/A",
            inputMethod: "text",
            fileName: "Typed Text List",
            fileSize: "N/A",
            typedList: "2x non-stick frying pans (medium)\n1x kitchen knife set (6 pieces)\n3x food storage containers\n1x dish rack\n2x bathroom towels (blue)",
            notes: "Prefer local Rwandan brands where possible. Budget: 35,000 RWF.",
            sector: "Nyarutarama",
            address: "Nyarutarama Road, Lane 4, near MTN Center",
            payment: "Bank",
            status: "Quoting",
            date: "Jul 09, 2026, 11:15 AM",
            epoch: Date.now() - 3600000 * 27
        },
        {
            orderId: "D2D-2026-7731",
            category: "Office",
            parentName: "Uwizeye Claudette",
            phone: "+250 785 101 020",
            schoolName: "",
            studentClass: "",
            tier: "N/A",
            inputMethod: "upload",
            fileName: "office_restock_july.xlsx",
            fileSize: "820 KB",
            typedList: "",
            notes: "We need everything delivered before 9AM on Monday.",
            sector: "Kiyovu",
            address: "KN 34 Rd, Kiyovu Business Hub, 3rd Floor",
            payment: "Cash",
            status: "Purchasing",
            date: "Jul 08, 2026, 09:00 AM",
            epoch: Date.now() - 3600000 * 50
        },
        {
            orderId: "D2D-2026-9048",
            category: "List2Door",
            parentName: "Ntwari Christian",
            phone: "+250 788 444 888",
            schoolName: "",
            studentClass: "",
            tier: "N/A",
            inputMethod: "text",
            fileName: "Typed Text List",
            fileSize: "N/A",
            typedList: "1x birthday cake (chocolate, size 8)\n2x balloons packs (assorted colors)\n1x birthday banner (Happy 5th Birthday)\n1x candle set (number 5)\n1x gift wrapping paper roll",
            notes: "It's a surprise party. Please package discretely in a sealed bag.",
            sector: "Kibagabaga",
            address: "KG 230 St, Kibagabaga Hill",
            payment: "MoMo",
            status: "Out for Delivery",
            date: "Jul 07, 2026, 04:45 PM",
            epoch: Date.now() - 3600000 * 68
        },
        {
            orderId: "D2D-2026-3029",
            category: "Study",
            parentName: "Gakwaya Jean-Pierre",
            phone: "+250 782 999 444",
            schoolName: "La Colombiere School",
            studentClass: "Primary 1",
            tier: "standard",
            inputMethod: "upload",
            fileName: "lacolombiere_P1.docx",
            fileSize: "35 KB",
            typedList: "",
            notes: "None. Package in a standard box.",
            sector: "Remera",
            address: "KG 12 Ave, near Remera Stadium",
            payment: "MoMo",
            status: "Completed",
            date: "Jul 06, 2026, 10:30 AM",
            epoch: Date.now() - 3600000 * 95
        }
    ];

    // Category display helper
    const getCategoryLabel = (category) => {
        const map = {
            'Study': 'Study Kits',
            'Home': 'Home Essentials',
            'Office': 'Office Essentials',
            'List2Door': 'List2Door'
        };
        return map[category] || (category || 'General');
    };

    // 4. Read data from LocalStorage
    const fetchOrders = () => {
        try {
            const saved = localStorage.getItem('desk2door_orders');
            if (saved) {
                ordersList = JSON.parse(saved);
            } else {
                ordersList = [];
            }
        } catch (e) {
            console.error("Failed to parse local storage orders.", e);
            ordersList = [];
        }
    };

    const saveOrders = () => {
        localStorage.setItem('desk2door_orders', JSON.stringify(ordersList));
    };

    // 5. Calculate Metrics
    const calculateAnalytics = () => {
        const total = ordersList.length;
        const pending = ordersList.filter(o => o.status === 'Pending' || o.status === 'Quoting').length;
        const active = ordersList.filter(o => o.status === 'Purchasing' || o.status === 'Out for Delivery').length;
        
        // Sourcing value estimation by category
        const revenue = ordersList.reduce((acc, order) => {
            if (order.status === 'Cancelled') return acc;
            
            let value = 28000; // Default estimate
            const cat = order.category || 'Study';
            if (cat === 'Study') {
                if (order.tier === 'basic') value = 15000;
                else if (order.tier === 'premium') value = 45000;
                else if (order.tier === 'custom') value = 30000;
                else value = 28000; // standard
            } else if (cat === 'Home') {
                value = 35000;
            } else if (cat === 'Office') {
                value = 42000;
            } else if (cat === 'List2Door') {
                value = 25000;
            }
            
            return acc + value;
        }, 0);

        // Update elements
        statTotalOrders.textContent = total;
        statPendingQuotes.textContent = pending;
        statActiveSourcing.textContent = active;
        statEstRevenue.textContent = revenue.toLocaleString() + " RWF";
    };

    // 6. Draw Dashboard Order Table Rows
    const renderTable = () => {
        // Clear content
        orderTableBody.innerHTML = '';

        // Apply filters
        const filtered = ordersList.filter(order => {
            const matchesStatus = currentFilter === 'all' || order.status === currentFilter;
            
            const term = currentSearchTerm.toLowerCase();
            const matchesSearch = currentSearchTerm === '' || 
                                  order.orderId.toLowerCase().includes(term) ||
                                  order.parentName.toLowerCase().includes(term) ||
                                  (order.schoolName || '').toLowerCase().includes(term) ||
                                  (order.category || '').toLowerCase().includes(term) ||
                                  order.sector.toLowerCase().includes(term);
            
            return matchesStatus && matchesSearch;
        });

        if (filtered.length === 0) {
            orderTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; color: var(--text-light); padding: var(--space-xl) 0;">
                        No orders match your filter criteria.
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(order => {
            const row = document.createElement('tr');
            
            // Format status badge color class
            let badgeClass = 'status-pending';
            if (order.status === 'Quoting') badgeClass = 'status-quoting';
            if (order.status === 'Purchasing') badgeClass = 'status-purchasing';
            if (order.status === 'Out for Delivery') badgeClass = 'status-out-for-delivery';
            if (order.status === 'Completed') badgeClass = 'status-completed';
            if (order.status === 'Cancelled') badgeClass = 'status-cancelled';

            // Category details cell content
            const cat = order.category || 'Study';
            let detailsHtml = '';
            if (cat === 'Study' && order.schoolName) {
                detailsHtml = `<span style="font-weight: 500;">${escapeHTML(order.schoolName)}</span><div style="font-size: 0.75rem; color: var(--text-light);">${escapeHTML(order.studentClass || '')} — ${escapeHTML((order.tier || 'standard').toUpperCase())}</div>`;
            } else {
                detailsHtml = `<span style="font-weight: 500;">${escapeHTML(getCategoryLabel(cat))}</span>`;
            }

            // List method badge
            const inputMethod = order.inputMethod || 'upload';
            const methodBadge = inputMethod === 'text' ? 'Typed' : 'File';

            row.innerHTML = `
                <td style="font-weight: 700; color: var(--primary-light);">${escapeHTML(order.orderId)}</td>
                <td>${escapeHTML(order.date.split(',')[0])}</td>
                <td style="font-weight: 500;">${escapeHTML(order.parentName)}</td>
                <td>${detailsHtml}</td>
                <td><span style="font-size: 0.8rem; background: var(--accent); padding: 2px 8px; border-radius: 20px;">${methodBadge}</span></td>
                <td>${escapeHTML(order.sector)}</td>
                <td><span class="status-badge ${badgeClass}">${escapeHTML(order.status)}</span></td>
                <td style="text-align: right;">
                    <button class="btn btn-outline inspect-btn" data-id="${escapeHTML(order.orderId)}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Inspect</button>
                </td>
            `;

            orderTableBody.appendChild(row);
        });

        // Bind click events on newly created Inspect Buttons
        const inspectButtons = document.querySelectorAll('.inspect-btn');
        inspectButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openInspectionModal(id);
            });
        });
    };

    // 7. Modal Operations
    const openInspectionModal = (orderId) => {
        const order = ordersList.find(o => o.orderId === orderId);
        if (!order) return;

        selectedOrderId = orderId;

        // Set static contents
        modalOrderId.textContent = order.orderId;
        modalOrderDate.textContent = order.date;
        modalParentName.textContent = order.parentName;
        const safePhone = escapeHTML(order.phone);
        const safePhoneHref = encodeURI(order.phone.replace(/\s+/g, ''));
        modalPhone.innerHTML = `<a href="tel:${safePhoneHref}" style="color: var(--primary-light); font-weight: 600;">${safePhone}</a>`;
        
        // Category display
        const cat = order.category || 'Study';
        modalCategory.textContent = getCategoryLabel(cat);

        // Conditionally show school/class fields for Study kits
        if (cat === 'Study' && order.schoolName) {
            modalSchoolRow.style.display = 'block';
            modalClassRow.style.display = 'block';
            modalSchoolName.textContent = order.schoolName;
            modalStudentClass.textContent = `${order.studentClass || ''} — ${(order.tier || 'standard').toUpperCase()} Kit`;
        } else {
            modalSchoolRow.style.display = 'none';
            modalClassRow.style.display = 'none';
        }
        
        modalPayment.textContent = order.payment === 'MoMo' ? 'MTN Mobile Money' : (order.payment === 'Bank' ? 'Bank Transfer' : 'Cash on Delivery');

        // Show file or typed list based on input method
        const inputMethod = order.inputMethod || 'upload';
        if (inputMethod === 'text' && order.typedList) {
            modalFileRow.style.display = 'none';
            modalTypedListRow.style.display = 'block';
            modalTypedList.textContent = order.typedList;
        } else {
            modalFileRow.style.display = 'block';
            modalTypedListRow.style.display = 'none';
            modalFileName.textContent = order.fileName || 'No file uploaded';
            modalFileSize.textContent = order.fileSize || '';
        }
        
        modalDeliveryAddress.textContent = `${order.sector} — ${order.address}`;
        modalNotes.textContent = order.notes ? `"${order.notes}"` : 'No custom instructions provided.';
        
        // Select status drop down
        modalStatusSelect.value = order.status;

        // Display Modal
        modalOverlay.classList.add('active');
        detailModal.classList.add('active');
    };

    const closeInspectionModal = () => {
        modalOverlay.classList.remove('active');
        detailModal.classList.remove('active');
        selectedOrderId = null;
    };

    // Save status changes
    modalSaveBtn.addEventListener('click', () => {
        if (!selectedOrderId) return;
        
        const orderIndex = ordersList.findIndex(o => o.orderId === selectedOrderId);
        if (orderIndex !== -1) {
            ordersList[orderIndex].status = modalStatusSelect.value;
            saveOrders();
            calculateAnalytics();
            renderTable();
        }
        closeInspectionModal();
    });

    // Delete single order
    modalDeleteBtn.addEventListener('click', () => {
        if (!selectedOrderId) return;
        
        if (confirm(`Are you sure you want to delete sourcing order ${selectedOrderId}?`)) {
            ordersList = ordersList.filter(o => o.orderId !== selectedOrderId);
            saveOrders();
            calculateAnalytics();
            renderTable();
            closeInspectionModal();
        }
    });

    // Modal close listeners
    [modalCloseBtn, modalCancelBtn, modalOverlay].forEach(el => {
        el.addEventListener('click', closeInspectionModal);
    });

    // 8. Search & Filters Actions
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        renderTable();
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTable();
        });
    });

    // 9. Load Sample Orders Seeding
    injectMockBtn.addEventListener('click', () => {
        if (confirm("Would you like to seed 5 sample multi-category Desk2Door orders? This will overwrite the current local list.")) {
            ordersList = [...mockOrders];
            saveOrders();
            calculateAnalytics();
            renderTable();
        }
    });

    // 10. Clear Board
    clearAllBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to wipe all orders from the admin dashboard? This cannot be undone.")) {
            ordersList = [];
            saveOrders();
            calculateAnalytics();
            renderTable();
        }
    });

    // 11. Initialization Run
    fetchOrders();
    // Auto-seed mock data on first-ever load so dashboard looks beautifully populated
    if (ordersList.length === 0) {
        ordersList = [...mockOrders];
        saveOrders();
    }
    calculateAnalytics();
    renderTable();
});
