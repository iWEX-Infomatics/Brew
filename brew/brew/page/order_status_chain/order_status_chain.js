frappe.pages['order_status_chain'].on_page_load = function (wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Sales Order Status Report',
        single_column: true
    });

    $(frappe.render_template("order_status_chain", {})).appendTo(page.body);

    // Add pagination variables
    let currentPage = 1;
    let pageSize = 20;
    let totalPages = 1;
    let isFiltered = false;
    let currentFilters = {};

    // Fetch counts for dashboard cards
    frappe.call({
        method: "brew.brew.page.order_status_chain.order_status_chain.get_sales_order_status_counts",
        callback: function (r) {
            if (r.message) {
                const data = r.message;
                $('#total_orders').text(data.total);
                $('#in_progress_orders').text(data.in_progress);
                $('#completed_orders').text(data.completed);
                $('#overdue_orders').text(data.overdue);
            }
        }
    });

    // Initialize filters
    loadFilterOptions();

    // Load first page of sales orders on page load
    loadPaginatedSalesOrders(1);

    // Add pagination controls to the page (add this after your existing HTML)
    const paginationHTML = `
        <div id="pagination-controls" style="margin: 20px 0; text-align: center;">
            <button id="prev-page" class="btn btn-default btn-sm" disabled>Previous</button>
            <span id="page-info" style="margin: 0 15px; font-weight: bold;">Page 1 of 1</span>
            <button id="next-page" class="btn btn-default btn-sm" disabled>Next</button>
            <div style="margin-top: 10px; font-size: 12px; color: #666;">
                Showing <span id="showing-count">0</span> results
            </div>
        </div>
    `;
    
    // Add pagination controls after search result div
    $('#search-result').after(paginationHTML);

    // Pagination event listeners
    $('#prev-page').on('click', function() {
        if (currentPage > 1) {
            currentPage--;
            if (isFiltered) {
                loadFilteredSalesOrders(currentPage);
            } else {
                loadPaginatedSalesOrders(currentPage);
            }
        }
    });

    $('#next-page').on('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            if (isFiltered) {
                loadFilteredSalesOrders(currentPage);
            } else {
                loadPaginatedSalesOrders(currentPage);
            }
        }
    });

    // Filter event listeners
    $('#apply-filters').on('click', function() {
        currentPage = 1; // Reset to first page when applying filters
        applyFilters();
    });

    $('#clear-filters').on('click', function() {
        clearFilters();
    });

    // Search button
    $(document).on('click', '#search-button', async function () {
        const salesOrderID = $('#sales-order-search').val().trim();
        const resultDiv = $('#search-result');
        resultDiv.empty();

        if (!salesOrderID) {
            resultDiv.html("<p>Please enter a Sales Order ID.</p>");
            return;
        }

        // Hide pagination when searching specific order
        $('#pagination-controls').hide();
        resultDiv.html("<p>Loading status tree...</p>");

        try {
            const res = await frappe.call({
                method: "brew.brew.page.order_status_chain.order_status_chain.get_sales_order_status_tree", 
                args: { sales_order_id: salesOrderID }
            });

            const data = res.message;

            if (!data) {
                resultDiv.html(`<p>No results found for ${salesOrderID}</p>`);
                return;
            }

            const html = generateCollapsibleTreeHTML(data);
            resultDiv.html(html);
        } catch (err) {
            console.error(err);
            resultDiv.html("<p>Error fetching data. Please try again.</p>");
        }
    });

    // Clear button
    $(document).on('click', '#clear-button', function () {
        $('#sales-order-search').val('');
        $('#search-result').empty();
        $('#pagination-controls').show();
        // Reload first page when cleared
        currentPage = 1;
        isFiltered = false;
        loadPaginatedSalesOrders(1);
    });

    // Function to load paginated sales orders
    function loadPaginatedSalesOrders(page = 1) {
        const resultDiv = $('#search-result');
        
        // Show loading state
        resultDiv.html(`
            <div style='text-align: center; padding: 40px; color: #666;'>
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p style="margin-top: 15px;">Loading sales orders...</p>
            </div>
        `);

        frappe.call({
            method: "brew.brew.page.order_status_chain.order_status_chain.get_paginated_sales_orders_with_children_count",
            args: { 
                page: page,
                page_size: pageSize
            },
            callback: function(r) {
                if (r.message && r.message.sales_orders) {
                    const data = r.message;
                    currentPage = data.current_page;
                    totalPages = data.total_pages;
                    
                    let html = '<div class="all-sales-orders">';
                    
                    data.sales_orders.forEach((so) => {
                        html += generateSalesOrderSummaryHTML(so);
                    });
                    
                    html += '</div>';
                    resultDiv.html(html);
                    
                    // Update pagination controls
                    updatePaginationControls(data);
                    
                    frappe.show_alert({
                        message: `Loaded page ${currentPage} of ${totalPages}`,
                        indicator: 'green'
                    }, 2);
                    
                } else {
                    resultDiv.html("<p>No sales orders found.</p>");
                    updatePaginationControls({
                        current_page: 1,
                        total_pages: 1,
                        total_count: 0,
                        sales_orders: []
                    });
                }
            },
            error: function(err) {
                console.error("Pagination error:", err);
                resultDiv.html("<p>Error loading sales orders. Please try again.</p>");
                
                frappe.show_alert({
                    message: 'Error loading sales orders. Please try again.',
                    indicator: 'red'
                }, 5);
            }
        });
    }

    // Function to update pagination controls
    function updatePaginationControls(data) {
        const prevBtn = $('#prev-page');
        const nextBtn = $('#next-page');
        const pageInfo = $('#page-info');
        const showingCount = $('#showing-count');
        
        // Update buttons
        prevBtn.prop('disabled', currentPage <= 1);
        nextBtn.prop('disabled', currentPage >= totalPages);
        
        // Update page info
        pageInfo.text(`Page ${currentPage} of ${totalPages}`);
        
        // Update showing count
        const startCount = ((currentPage - 1) * pageSize) + 1;
        const endCount = Math.min(currentPage * pageSize, data.total_count);
        showingCount.text(`${startCount}-${endCount} of ${data.total_count}`);
        
        // Show pagination controls
        $('#pagination-controls').show();
    }

    // Load filter dropdown options
    function loadFilterOptions() {
        // Load Companies
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Company",
                fields: ["name"],
                limit_page_length: 1000
            },
            callback: function(r) {
                if (r.message && Array.isArray(r.message)) {
                    const companySelect = $('#filter-company');
                    companySelect.empty().append('<option value="">Company</option>');
                    r.message.forEach(company => {
                        if (company.name) {
                            companySelect.append(`<option value="${company.name}">${company.name}</option>`);
                        }
                    });
                }
            },
            error: function(err) {
                console.error("Error loading companies:", err);
            }
        });

        // Load unique customers from Sales Order
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Sales Order",
                fields: ["customer"],
                filters: {
                    "customer": ["!=", ""]
                },
                limit_page_length: 1000
            },
            callback: function(r) {
                if (r.message && Array.isArray(r.message)) {
                    const customerSelect = $('#filter-customer');
                    customerSelect.empty().append('<option value="">Customer</option>');
                    
                    const uniqueCustomers = [...new Set(
                        r.message
                            .map(item => item.customer)
                            .filter(customer => customer && customer.trim() !== '')
                    )].sort();
                    
                    uniqueCustomers.forEach(customer => {
                        customerSelect.append(`<option value="${customer}">${customer}</option>`);
                    });
                }
            },
            error: function(err) {
                console.error("Error loading customers:", err);
            }
        });
        
        // Load unique sales order types
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Sales Order",
                fields: ["custom_sales_order_type"],
                filters: {
                    "custom_sales_order_type": ["!=", ""]
                },
                limit_page_length: 1000
            },
            callback: function(r) {
                if (r.message && Array.isArray(r.message)) {
                    const typeSelect = $('#filter-sales-order-type');
                    typeSelect.empty().append('<option value="">Order Type</option>');
                    
                    const uniqueTypes = [...new Set(
                        r.message
                            .map(item => item.custom_sales_order_type)
                            .filter(type => type && type.trim() !== '')
                    )].sort();
                    
                    uniqueTypes.forEach(type => {
                        typeSelect.append(`<option value="${type}">${type}</option>`);
                    });
                }
            },
            error: function(err) {
                console.error("Error loading order types:", err);
            }
        });
        
        // Load unique departments
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Sales Order",
                fields: ["custom_department"],
                filters: {
                    "custom_department": ["!=", ""]
                },
                limit_page_length: 1000
            },
            callback: function(r) {
                if (r.message && Array.isArray(r.message)) {
                    const deptSelect = $('#filter-department');
                    deptSelect.empty().append('<option value="">Departments</option>');
                    
                    const uniqueDepts = [...new Set(
                        r.message
                            .map(item => item.custom_department)
                            .filter(dept => dept && dept.trim() !== '')
                    )].sort();
                    
                    uniqueDepts.forEach(dept => {
                        deptSelect.append(`<option value="${dept}">${dept}</option>`);
                    });
                }
            },
            error: function(err) {
                console.error("Error loading departments:", err);
            }
        });
    }

    // Get filter values function
    function getFilterValues() {
        const filters = {};
        
        // Get all filter values
        const company = $('#filter-company').val();
        const orderType = $('#filter-sales-order-type').val();
        const customer = $('#filter-customer').val();
        const department = $('#filter-department').val();
        const status = $('#filter-status').val();
        const fromDate = $('#filter-date-from').val();
        const toDate = $('#filter-date-to').val();
        
        // Only add non-empty values to filters object
        if (company && company.trim() !== '' && company !== 'Company' && company !== null) {
            filters.company = company.trim();
        }
        
        if (orderType && orderType.trim() !== '' && orderType !== 'Order Type' && orderType !== null) {
            filters.custom_sales_order_type = orderType.trim();
        }
        
        if (customer && customer.trim() !== '' && customer !== 'Customer' && customer !== null) {
            filters.customer = customer.trim();
        }
        
        if (department && department.trim() !== '' && department !== 'Departments' && department !== null) {
            filters.custom_department = department.trim();
        }
        
        if (status && status.trim() !== '' && status !== 'All Statuses' && status !== null) {
            filters.status = status.trim();
        }

        // Handle date filtering
        if (fromDate && fromDate.trim() !== '') {
            if (toDate && toDate.trim() !== '') {
                // Date range - send as array
                filters.transaction_date = [fromDate.trim(), toDate.trim()];
            } else {
                // Single date - from date only
                filters.transaction_date = fromDate.trim();
            }
        } else if (toDate && toDate.trim() !== '') {
            // Only to date provided - treat as single date
            filters.transaction_date = toDate.trim();
        }

        console.log("Frontend filters being sent:", filters);
        return filters;
    }

    // Function to load filtered sales orders with pagination
    function loadFilteredSalesOrders(page = 1) {
        const resultDiv = $('#search-result');
        
        // Show loading state
        const applyBtn = $('#apply-filters');
        applyBtn.addClass('filter-loading').prop('disabled', true);
        applyBtn.text('Applying...');
        
        resultDiv.html(`
            <div style='text-align: center; padding: 40px; color: #666;'>
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p style="margin-top: 15px;">Applying filters...</p>
            </div>
        `);
        
        // Debug: Log filters being sent
        console.log("Filters being sent:", currentFilters);
        
        // Call backend with filters and pagination
        frappe.call({
            method: "brew.brew.page.order_status_chain.order_status_chain.get_filtered_sales_orders_paginated",
            args: { 
                filters: currentFilters,
                page: page,
                page_size: pageSize
            },
            callback: function(r) {
                // Remove loading state
                applyBtn.removeClass('filter-loading').prop('disabled', false);
                applyBtn.text('Apply Filters');
                
                console.log("Backend response:", r.message);
                
                if (r.message && r.message.sales_orders && r.message.sales_orders.length > 0) {
                    const data = r.message;
                    currentPage = data.current_page;
                    totalPages = data.total_pages;
                    
                    let html = '<div class="all-sales-orders">';
                    
                    // Show applied filters summary
                    const appliedFiltersArray = [];
                    
                    if (Object.keys(currentFilters).length > 0) {
                        Object.keys(currentFilters).forEach(key => {
                            let displayKey = key.replace('custom_', '').replace('_', ' ');
                            displayKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);
                            
                            let displayValue = currentFilters[key];
                            if (Array.isArray(displayValue)) {
                                displayValue = displayValue.join(' to ');
                            }
                            
                            appliedFiltersArray.push(`${displayKey}: ${displayValue}`);
                        });
                    }
                    
                    const appliedFilters = appliedFiltersArray.length > 0 ? 
                        appliedFiltersArray.join(', ') : 
                        'Default filters applied';
                    
                    html += `
                        <div style="margin-bottom: 20px; padding: 15px; background-color: #e8f4fd; border-radius: 8px; border-left: 4px solid #007bff;">
                            <h5 style="margin: 0 0 10px 0; color: #0056b3;">
                                <i class="fa fa-filter"></i> Filtered Results
                            </h5>
                            <p style="margin: 0 0 8px 0;"><strong>Found:</strong> ${data.total_count} sales order(s)</p>
                            <p style="margin: 0; font-size: 14px; color: #666;"><strong>Applied Filters:</strong> ${appliedFilters}</p>
                        </div>
                    `;
                    
                    data.sales_orders.forEach((so) => {
                        html += generateSalesOrderSummaryHTML(so);
                    });
                    html += '</div>';
                    resultDiv.html(html);
                    
                    // Update pagination controls
                    updatePaginationControls(data);
                    
                    updateFilteredCounts(data.sales_orders);
                    
                    frappe.show_alert({
                        message: `Found ${data.total_count} matching sales orders - Page ${currentPage} of ${totalPages}`,
                        indicator: 'green'
                    }, 3);
                    
                } else {
                    const appliedFiltersArray = [];
                    
                    if (Object.keys(currentFilters).length > 0) {
                        Object.keys(currentFilters).forEach(key => {
                            let displayKey = key.replace('custom_', '').replace('_', ' ');
                            displayKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);
                            
                            let displayValue = currentFilters[key];
                            if (Array.isArray(displayValue)) {
                                displayValue = displayValue.join(' to ');
                            }
                            
                            appliedFiltersArray.push(`${displayKey}: ${displayValue}`);
                        });
                    }
                    
                    resultDiv.html(`
                        <div style="text-align: center; padding: 40px;margin: auto;display: flex;justify-content: center;">
                            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 30px; margin: 20px 0;">
                                <i class="fa fa-search" style="font-size: 48px; color: #856404; margin-bottom: 20px;"></i>
                                <h4 style="color: #856404; margin-bottom: 15px;">No Results Found</h4>
                                <p style="color: #856404; margin-bottom: 20px;">No sales orders match your current filter criteria:</p>
                            </div>
                        </div>
                    `);
                    
                    // Hide pagination when no results
                    $('#pagination-controls').hide();
                    
                    updateCountsFromFilters(currentFilters);
                    
                    frappe.show_alert({
                        message: 'No sales orders match your filter criteria',
                        indicator: 'orange'
                    }, 5);
                }
            },
            error: function(err) {
                applyBtn.removeClass('filter-loading').prop('disabled', false);
                applyBtn.text('Apply Filters');
                
                console.error("Filter error:", err);
                
                resultDiv.html(`
                    <div style="text-align: center; padding: 40px;">
                        <div style="background-color: #f8d7da; border: 1px solid #f1b2b2; border-radius: 8px; padding: 30px;">
                            <i class="fa fa-exclamation-triangle" style="font-size: 48px; color: #dc3545; margin-bottom: 20px;"></i>
                            <h4 style="color: #dc3545; margin-bottom: 15px;">Error Applying Filters</h4>
                            <p style="color: #721c24; margin-bottom: 20px;">There was an error processing your filter request.</p>
                            <p style="background: white; padding: 10px; border-radius: 4px; color: #333; font-size: 12px;">
                                Error: ${err.message || 'Unknown error occurred'}
                            </p>
                            <div style="margin-top: 20px;">
                                <button onclick="applyFilters()" class="btn btn-primary btn-sm" style="margin-right: 10px;">
                                    <i class="fa fa-retry"></i> Try Again
                                </button>
                                <button onclick="clearFilters()" class="btn btn-secondary btn-sm">
                                    <i class="fa fa-refresh"></i> Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                `);
                
                frappe.show_alert({
                    message: 'Error applying filters. Please try again.',
                    indicator: 'red'
                }, 5);
            }
        });
    }

    // Apply filters function
    function applyFilters() {
        const filters = getFilterValues();
        currentFilters = filters;
        currentPage = 1; // Reset to first page when applying filters
        isFiltered = true;
        
        loadFilteredSalesOrders(1);
    }

    function updateCountsFromFilters(filters) {
        frappe.call({
            method: "brew.brew.page.order_status_chain.order_status_chain.get_filtered_sales_order_counts",
            args: { filters: filters },
            callback: function(r) {
                if (r.message) {
                    const data = r.message;
                    $('#total_orders').text(data.total || 0);
                    $('#in_progress_orders').text(data.in_progress || 0);
                    $('#completed_orders').text(data.completed || 0);
                    $('#overdue_orders').text(data.overdue || 0);
                }
            },
            error: function(err) {
                console.error("Error updating filtered counts:", err);
            }
        });
    }

    function clearFilters() {
        $('#filter-company').val('');
        $('#filter-sales-order-type').val('');
        $('#filter-customer').val('');
        $('#filter-department').val('');
        $('#filter-date-from').val('');
        $('#filter-date-to').val('');
        $('#filter-status').val('');
        $('#sales-order-search').val('');
        
        const resultDiv = $('#search-result');
        resultDiv.html('<div style="text-align: center; padding: 20px;">Clearing filters...</div>');
        
        // Reset pagination variables
        currentPage = 1;
        isFiltered = false;
        currentFilters = {};
        
        setTimeout(() => {
            loadPaginatedSalesOrders(1);
            loadOriginalCounts();
        }, 100); 
    }

    // Load original counts
    function loadOriginalCounts() {
        frappe.call({
            method: "brew.brew.page.order_status_chain.order_status_chain.get_sales_order_status_counts",
            callback: function (r) {
                if (r.message) {
                    const data = r.message;
                    $('#total_orders').text(data.total || 0);
                    $('#in_progress_orders').text(data.in_progress || 0);
                    $('#completed_orders').text(data.completed || 0);
                    $('#overdue_orders').text(data.overdue || 0);
                }
            },
            error: function(err) {
                console.error("Error loading original counts:", err);
            }
        });
    }

    function updateFilteredCounts(salesOrders) {
        const total = salesOrders ? salesOrders.length : 0;
        
        const inProgress = salesOrders ? salesOrders.filter(so => 
            so.status && ['To Deliver', 'To Deliver and Bill', 'To Bill'].includes(so.status)
        ).length : 0;
        
        const completed = salesOrders ? salesOrders.filter(so => 
            so.status === 'Completed'
        ).length : 0;
        
        // Calculate overdue
        const today = new Date();
        const overdue = salesOrders ? salesOrders.filter(so => {
            if (so.delivery_date && so.status && !['Completed', 'Cancelled'].includes(so.status)) {
                const deliveryDate = new Date(so.delivery_date);
                return deliveryDate < today;
            }
            return false;
        }).length : 0;
        
        $('#total_orders').text(total);
        $('#in_progress_orders').text(inProgress);
        $('#completed_orders').text(completed);
        $('#overdue_orders').text(overdue);
    }

    // Helper function to create clickable document link
    function createDocumentLink(doctype, docname, displayText) {
        // Frappe routing format for documents
        const route = `/app/${doctype.toLowerCase().replace(/ /g, '-')}/${docname}`;
        return `<a href="${route}" target="_blank" class="document-link" title="Open ${doctype}: ${docname}">
            ${displayText || docname}
        </a>`;
    }

    // Helper function to get doctype from node title
    function getDocTypeFromTitle(title) {
        if (title.includes("Sales Order")) {
            return "Sales Order";
        } else if (title.includes("Purchase Order")) {
            return "Purchase Order";
        } else if (title.includes("Stone Request")) {
            return "Stone Request";
        } else if (title.includes("Stone Receipt")) {
            return "Stone Receipt";
        } else if (title.includes("Stone Transaction")) {
            return "Stone Transaction";
        } else if (title.includes("Purchase Invoice")) {
            return "Purchase Invoice";
        }
        return null;
    }

    // Generate summary HTML for each sales order with clickable links and child status
    function generateSalesOrderSummaryHTML(salesOrder) {
        const uniqueId = `so-${salesOrder.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        // Status badge styling
        let badgeClass = "status-badge ";
        const status = salesOrder.status.toLowerCase();
        if (status.includes('draft')) badgeClass += "badge-draft";
        else if (status.includes('pending')) badgeClass += "badge-pending";
        else if (status.includes('inquiry')) badgeClass += "badge-inquiry";
        else if (status.includes('completed')) badgeClass += "badge-success";
        else if (status.includes('progress')) badgeClass += "badge-info";
        else badgeClass += "badge-secondary";

        // Get thumbnail image
        const thumbnailImage = salesOrder.custom_product_image;

        // Create clickable link for sales order
        const salesOrderLink = createDocumentLink("Sales Order", salesOrder.name, salesOrder.name);

        // Child document status - show directly without needing to click
        let childDocumentStatus = '';
        if (salesOrder.has_child_documents === true) {
            childDocumentStatus = '<div style="font-size: 11px; color: #28a745; font-weight: 600; margin-top: 2px;    margin-right: 22px;"> Documents Created</div>';
        } else if (salesOrder.has_child_documents === false) {
            childDocumentStatus = '<div style="font-size: 11px; color: #dc3545; font-weight: 600; margin-top: 2px;    margin-right: 22px;"> No Documents Created</div>';
        } else {
            childDocumentStatus = '<div style="font-size: 11px; color: #6c757d; font-weight: 600; margin-top: 2px;    margin-right: 22px;"> Status Unknown</div>';
        }

        return `
        <div style="margin-top: 8px;">
            <div class="node-header clickable" style="border-left: 4px solid #007bff;" 
                 onclick="expandSalesOrder('${salesOrder.name}', '${uniqueId}')">
                <div class="node-title">
                    <span id="arrow-${uniqueId}" class="arrow-dropdown">▶</span>
                    <div class="thumbnail-container">
                        ${thumbnailImage ? 
                            `<img src="${thumbnailImage}" alt="Product" class="thumbnail-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNOCAxMkMxMC4yMDkxIDEyIDEyIDEwLjIwOTEgMTIgOEMxMiA1Ljc5MDg2IDEwLjIwOTEgNCA4NDRDNS43OTA4NiA0IDQgNS43OTA4NiA0IDhDNCA5LjMyNjA4IDQuNTI3ODQgMTAuNTk3OSA5LjQ2NDQ3IDExLjUzNTVMNSAxMkg4WiIgZmlsbD0iI0RFRTJFNiIvPgo8cGF0aCBkPSJNNCAyNEwyOCAyNFYxNkwyMCAxNkwxNiAyMEw4IDE2TDQgMjBWMjRaIiBmaWxsPSIjREVFMkU2Ii8+CjxwYXRoIGQ9Ik04IDhIMTJWMTJIOFY4WiIgZmlsbD0iI0RFRTJFNiIvPgo8L3N2Zz4K';">
                            <div class="thumbnail-popup">
                                <img src="${thumbnailImage}" alt="Product Large">
                            </div>` 
                            : 
                            `<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNOCAxMkMxMC4yMDkxIDEyIDEyIDEwLjIwOTEgMTIgOEMxMiA1Ljc5MDg2IDEwLjIwOTEgNCA4NDRDNS43OTA4NiA0IDQgNS43OTA4NiA0IDhDNCA5LjMyNjA4IDQuNTI3ODQgMTAuNTk3OSA5LjQ2NDQ3IDExLjUzNTVMNSAxMkg4WiIgZmlsbD0iI0RFRTJFNiIvPgo8cGF0aCBkPSJNNCAyNEwyOCAyNFYxNkwyMCAxNkwxNiAyMEw4IDE2TDQgMjBWMjRaIiBmaWxsPSIjREVFMkU2Ii8+CjxwYXRoIGQ9Ik04IDhIMTJWMTJIOFY4WiIgZmlsbD0iI0RFRTJFNiIvPgo8L3N2Zz4K" alt="No Image" class="thumbnail-image">
                            <div class="thumbnail-popup">
                                <div class="no-image-message">No Image Available</div>
                            </div>`
                        }
                    </div>
                    <span class="node-text">Sales Order <span style="color: #555;">(${salesOrderLink})</span></span>
                    
                </div>
                <div class="node-status">
                    <span class="${badgeClass}">${salesOrder.status}</span>
                    ${salesOrder.time_ago ? 
                        `<div style="font-size: 11px; color: #0a0a0aff; margin-top: 2px;font-weight: 800;margin-right: 8px;">
                            ${salesOrder.time_ago}
                        </div>` 
                        : ''
                    }
                    ${childDocumentStatus}
                </div>
            </div>
            <div id="tree-${uniqueId}" class="node-children" style="display: none; margin-left: 0px;">
                <!-- Full tree will be loaded here when expanded -->
            </div>
        </div>`;
    }

    // Function to expand individual sales order and load full tree
    window.expandSalesOrder = async function(salesOrderId, uniqueId) {
        const treeDiv = $(`#tree-${uniqueId}`);
        const arrowElement = $(`#arrow-${uniqueId}`);
        
        if (treeDiv.is(':visible')) {
            treeDiv.hide();
            arrowElement.text('▶');
            return;
        }

        // Check if tree is already loaded
        if (treeDiv.children().length === 0) {
            treeDiv.html("<p style='margin: 15px; color: #666;'>Loading full status tree...</p>");
            
            try {
                const res = await frappe.call({
                    method: "brew.brew.page.order_status_chain.order_status_chain.get_sales_order_status_tree",
                    args: { sales_order_id: salesOrderId }
                });

                const data = res.message;

                if (!data) {
                    treeDiv.html(`<p style='margin: 15px; color: #999;'>No detailed data found for ${salesOrderId}</p>`);
                    return;
                }

                // Generate the full tree but without the main sales order (since it's already shown)
                let html = '';
                if (data.children && data.children.length > 0) {
                    data.children.forEach((child) => {
                        html += renderAllChildren(child, 1);
                    });
                    
                    // Also add details if available
                    if (data.details) {
                        html = renderDocumentDetails(data, 0) + html;
                    }
                } else {
                    html = '<p style="margin: 15px; color: #999;">No child documents found.</p>';
                }
                
                treeDiv.html(html);
            } catch (err) {
                console.error(err);
                treeDiv.html("<p style='margin: 15px; color: #dc3545;'>Error loading tree. Please try again.</p>");
            }
        }
        
        treeDiv.show();
        arrowElement.text('▼');
    }

    // Helper function to render details based on document type
    function renderDocumentDetails(node, level = 0) {
        if (!node.details) return '';
        
        const details = node.details;
        const marginLeft = level * 30; // Same margin as the bar
        
        // Sales Order details
        if (node.title.includes("Sales Order")) {
            return `
            <div style="background-color: #f8f9fa; padding: 15px; margin: 10px 0; margin-left: ${marginLeft}px; border-radius: 8px;">
                <div class="row">
                    <div class="col-md-3">
                        <p style="margin: 5px 0;"><strong>Sales Order ID:</strong> ${details.id || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Customer:</strong> ${details.customer || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Contact Person:</strong> ${details.contact_person || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Department:</strong> ${details.custom_department || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Order Type:</strong> ${details.custom_sales_order_type || 'N/A'}</p>
                    </div>
                    <div class="col-md-3">
                        <p style="margin: 5px 0;"><strong>Company:</strong> ${details.company || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Main Stone:</strong> ${details.custom_main_stone || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Transaction Date:</strong> ${details.transaction_date || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Delivery Date:</strong> ${details.delivery_date || 'N/A'}</p>
                    </div>
                </div>
            </div>`;
        }
        
        // Purchase Order details
        else if (node.title.includes("Purchase Order")) {
            return `
            <div style="background-color: #f8f9fa; padding: 15px; margin: 10px 0; margin-left: ${marginLeft}px; border-radius: 8px;">
                <div class="row">
                    <div class="col-md-3">
                        <p style="margin: 5px 0;"><strong>Purchase Order ID:</strong> ${details.id || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Transaction Date:</strong> ${details.transaction_date || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Schedule Date:</strong> ${details.schedule_date || 'N/A'}</p>
                    </div>
                    <div class="col-md-3">
                        <p style="margin: 5px 0;"><strong>Supplier:</strong> ${details.supplier || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Order Confirmation No:</strong> ${details.order_confirmation_no || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Order Confirmation Date:</strong> ${details.order_confirmation_date || 'N/A'}</p>
                    </div>
                </div>
            </div>`;
        }
        
        // Stone Request details
        else if (node.title.includes("Stone Request")) {
            return `
            <div style="background-color: #fff5f5; padding: 15px; margin: 10px 0; margin-left: ${marginLeft}px; border-radius: 8px;">
                <div class="row">
                    <div class="col-md-4">
                        <p style="margin: 5px 0;"><strong>Stone Request ID:</strong> ${details.id || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Requested By:</strong> ${details.requested_by || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Arranging Company:</strong> ${details.arranging_company || 'N/A'}</p>
                    </div>
                    <div class="col-md-4">
                        <p style="margin: 5px 0;"><strong>Request Date:</strong> ${details.request_date || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Required Date:</strong> ${details.required_date || 'N/A'}</p>
                    </div>
                </div>
            </div>`;
        }
        
        // Stone Receipt details
        else if (node.title.includes("Stone Receipt")) {
            return `
            <div style="background-color: #f0fff4; padding: 15px; margin: 10px 0; margin-left: ${marginLeft}px; border-radius: 8px;">
                <div class="row">
                    <div class="col-md-4">
                        <p style="margin: 5px 0;"><strong>Stone Receipt ID:</strong> ${details.id || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Supplier:</strong> ${details.supplier || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Receipt Date:</strong> ${details.receipt_date || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Posting Date:</strong> ${details.posting_date || 'N/A'}</p>
                    </div>
                </div>
            </div>`;
        }
        
        // Stone Transaction details
        else if (node.title.includes("Stone Transaction")) {
            return `
            <div style="background-color: #fff8e1; padding: 15px; margin: 10px 0; margin-left: ${marginLeft}px; border-radius: 8px;">
                <div class="row">
                    <div class="col-md-4">
                        <p style="margin: 5px 0;"><strong>Stone Transaction ID:</strong> ${details.id || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Transaction Date:</strong> ${details.transaction_date || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Posting Date:</strong> ${details.posting_date || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Total Qty:</strong> ${details.total_qty || '0'}</p>
                    </div>
                </div>
            </div>`;
        }
        
        // Purchase Invoice details
        else if (node.title.includes("Purchase Invoice")) {
            return `
            <div style="background-color: #fdf2f8; padding: 15px; margin: 10px 0; margin-left: ${marginLeft}px; border-radius: 8px;">
                <div class="row">
                    <div class="col-md-4">
                        <p style="margin: 5px 0;"><strong>Purchase Invoice ID:</strong> ${details.id || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Supplier:</strong> ${details.supplier || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Posting Date:</strong> ${details.posting_date || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Bill Date:</strong> ${details.bill_date || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>Total:</strong> ${details.total || '0'}</p>
                    </div>
                </div>
            </div>`;
        }
        
        return '';
    }

    // Generate Collapsible Tree HTML with clickable document links
    function generateCollapsibleTreeHTML(data) {
        const renderNode = (node, level = 0, isMainSalesOrder = false) => {
            const hasChildren = node.children && node.children.length > 0;
            const hasDetails = node.details && Object.keys(node.details).length > 0;
            const uniqueId = `main-tree-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const detailsId = `details-${uniqueId}`;
            
            // Different colors for different node types
            let color = "#999";
            if (node.title.includes("Sales Order")) color = "#007bff";
            else if (node.title.includes("Purchase Order")) color = "#28a745";
            else if (node.title.includes("Stone Request")) color = "#fd7e14";
            else if (node.title.includes("Stone Receipt")) color = "#20c997";
            else if (node.title.includes("Stone Transaction")) color = "#ffc107";
            else if (node.title.includes("Purchase Invoice")) color = "#dc3545";

            // Status badge styling
            let badgeClass = "status-badge ";
            const status = node.status.toLowerCase();
            if (status.includes('draft')) badgeClass += "badge-draft";
            else if (status.includes('pending')) badgeClass += "badge-pending";
            else if (status.includes('inquiry')) badgeClass += "badge-inquiry";
            else if (status.includes('completed')) badgeClass += "badge-success";
            else if (status.includes('progress')) badgeClass += "badge-info";
            else badgeClass += "badge-secondary";

            // Get thumbnail image and time ago
            const thumbnailImage = node.details && node.details.custom_product_image ? node.details.custom_product_image : null;
            const timeAgo = node.details && node.details.time_ago ? node.details.time_ago : null;

            // Create clickable link for document
            const doctype = getDocTypeFromTitle(node.title);
            const documentLink = doctype ? createDocumentLink(doctype, node.name, node.name) : node.name;

            let html = '';

            // FIRST: Add the main node header/bar (clickable if has children OR details)
            const isClickable = (isMainSalesOrder && hasChildren) || hasDetails;
            html += `
            <div style="margin-left: ${level * 30}px; margin-top: 8px;">
                <div class="node-header ${isClickable ? 'clickable' : ''}" style="border-left: 4px solid ${color};" 
                     ${isClickable ? `onclick="toggleNode('${uniqueId}', '${detailsId}', ${hasChildren})"` : ''}>
                    <div class="node-title">
                        ${isClickable ? `<span id="arrow-${uniqueId}" class="arrow-dropdown">▶</span>` : ''}
                        <div class="thumbnail-container">
                            ${thumbnailImage ? 
                                `<img src="${thumbnailImage}" alt="Product" class="thumbnail-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNOCAxMkMxMC4yMDkxIDEyIDEyIDEwLjIwOTEgMTIgOEMxMiA1Ljc5MDg2IDEwLjIwOTEgNCA4NDRDNS43OTA4NiA0IDQgNS43OTA4NiA0IDhDNCA5LjMyNjA4IDQuNTI3ODQgMTAuNTk3OSA1LjQ2NDQ3IDExLjUzNTVMNSAxMkg4WiIgZmlsbD0iI0RFRTJFNiIvPgo8cGF0aCBkPSJNNCAyNEwyOCAyNFYxNkwyMCAxNkwxNiAyMEw4IDE2TDQgMjBWMjRaIiBmaWxsPSIjREVFMkU2Ii8+CjxwYXRoIGQ9Ik04IDhIMTJWMTJIOFY4WiIgZmlsbD0iI0RFRTJFNiIvPgo8L3N2Zz4K';">
                                <div class="thumbnail-popup">
                                    <img src="${thumbnailImage}" alt="Product Large">
                                </div>` 
                                : 
                                `<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNOCAxMkMxMC4yMDkxIDEyIDEyIDEwLjIwOTEgMTIgOEMxMiA1Ljc5MDg2IDEwLjIwOTEgNCA4NDRDNS43OTA4NiA0IDQgNS43OTA4NiA0IDhDNCA5LjMyNjA4IDQuNTI3ODQgMTAuNTk3OSA1LjQ2NDQ3IDExLjUzNTVMNSAxMkg4WiIgZmlsbD0iI0RFRTJFNiIvPgo8cGF0aCBkPSJNNCAyNEwyOCAyNFYxNkwyMCAxNkwxNiAyMEw4IDE2TDQgMjBWMjRaIiBmaWxsPSIjREVFMkU2Ii8+CjxwYXRoIGQ9Ik04IDhIMTJWMTJIOFY4WiIgZmlsbD0iI0RFRTJFNiIvPgo8L3N2Zz4K" alt="No Image" class="thumbnail-image">
                                <div class="thumbnail-popup">
                                    <div class="no-image-message">No Image Available</div>
                                </div>`
                            }
                        </div>
                        <span class="node-text">${node.title} <span style="color: #555;">(${documentLink})</span></span>
                    </div>
                    <div class="node-status">
                        <span class="${badgeClass}">${node.status}</span>
                        ${timeAgo ? 
                            `<div style="font-size: 11px; color: #0a0a0aff; margin-top: 2px;font-weight: 800;">
                                ${timeAgo}
                            </div>` 
                            : ''
                        }
                    </div>
                </div>
            `;

            // SECOND: Add details section (hidden by default) AFTER the bar
            if (hasDetails) {
                html += `<div id="${detailsId}" class="node-details" style="display: none;">`;
                html += renderDocumentDetails(node, level);
                html += `</div>`;
            }

            // THIRD: Collapsible children section (hidden by default)
            if (isMainSalesOrder && hasChildren) {
                html += `<div id="${uniqueId}" class="node-children" style="display: none;">`;
                node.children.forEach((child) => {
                    html += renderAllChildren(child, 1);
                });
                html += `</div>`;
            }

            html += `</div>`;
            return html;
        };

        return renderNode(data, 0, true);
    }

    // Render all children with clickable document links
    const renderAllChildren = (node, level) => {
        const hasDetails = node.details && Object.keys(node.details).length > 0;
        const uniqueId = `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const detailsId = `details-${uniqueId}`;
        
        // Different colors for different node types
        let color = "#999";
        if (node.title.includes("Sales Order")) color = "#007bff";
        else if (node.title.includes("Purchase Order")) color = "#28a745";
        else if (node.title.includes("Stone Request")) color = "#fd7e14";
        else if (node.title.includes("Stone Receipt")) color = "#20c997";
        else if (node.title.includes("Stone Transaction")) color = "#ffc107";
        else if (node.title.includes("Purchase Invoice")) color = "#dc3545";

        // Status badge styling
        let badgeClass = "status-badge ";
        const status = node.status.toLowerCase();
        if (status.includes('draft')) badgeClass += "badge-draft";
        else if (status.includes('pending')) badgeClass += "badge-pending";
        else if (status.includes('inquiry')) badgeClass += "badge-inquiry";
        else if (status.includes('completed')) badgeClass += "badge-success";
        else if (status.includes('progress')) badgeClass += "badge-info";
        else badgeClass += "badge-secondary";

        // Get thumbnail image and time ago
        const thumbnailImage = node.details && node.details.custom_product_image ? node.details.custom_product_image : null;
        const timeAgo = node.details && node.details.time_ago ? node.details.time_ago : null;

        // Create clickable link for document
        const doctype = getDocTypeFromTitle(node.title);
        const documentLink = doctype ? createDocumentLink(doctype, node.name, node.name) : node.name;

        let html = '';

        // FIRST: Add the main node header/bar (clickable if has details)
        html += `
        <div style="margin-left: ${level * 30}px; margin-top: 8px;">
            <div class="node-header ${hasDetails ? 'clickable' : ''}" style="border-left: 4px solid ${color};" 
                 ${hasDetails ? `onclick="toggleNodeDetails('${detailsId}', '${uniqueId}')"` : ''}>
                <div class="node-title">
                    ${hasDetails ? `<span id="arrow-${uniqueId}" class="arrow-dropdown">▶</span>` : ''}
                    <div class="thumbnail-container">
                        ${thumbnailImage ? 
                            `<img src="${thumbnailImage}" alt="Product" class="thumbnail-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNOCAxMkMxMC4yMDkxIDEyIDEyIDEwLjIwOTEgMTIgOEMxMiA1Ljc5MDg2IDEwLjIwOTEgNCA4NDRDNS43OTA4NiA0IDQgNS43OTA4NiA0IDhDNCA5LjMyNjA4IDQuNTI3ODQgMTAuNTk3OSA1LjQ2NDQ3IDExLjUzNTVMNSAxMkg4WiIgZmlsbD0iI0RFRTJFNiIvPgo8cGF0aCBkPSJNNCAyNEwyOCAyNFYxNkwyMCAxNkwxNiAyMEw4IDE2TDQgMjBWMjRaIiBmaWxsPSIjREVFMkU2Ii8+CjxwYXRoIGQ9Ik04IDhIMTJWMTJIOFY4WiIgZmlsbD0iI0RFRTJFNiIvPgo8L3N2Zz4K';">
                            <div class="thumbnail-popup">
                                <img src="${thumbnailImage}" alt="Product Large">
                            </div>` 
                            : 
                            `<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNOCAxMkMxMC4yMDkxIDEyIDEyIDEwLjIwOTEgMTIgOEMxMiA1Ljc5MDg2IDEwLjIwOTEgNCA4NDRDNS43OTA4NiA0IDQgNS43OTA4NiA0IDhDNCA5LjMyNjA4IDQuNTI3ODQgMTAuNTk3OSA1LjQ2NDQ3IDExLjUzNTVMNSAxMkg4WiIgZmlsbD0iI0RFRTJFNiIvPgo8cGF0aCBkPSJNNCAyNEwyOCAyNFYxNkwyMCAxNkwxNiAyMEw4IDE2TDQgMjBWMjRaIiBmaWxsPSIjREVFMkU2Ii8+CjxwYXRoIGQ9Ik04IDhIMTJWMTJIOFY4WiIgZmlsbD0iI0RFRTJFNiIvPgo8L3N2Zz4K" alt="No Image" class="thumbnail-image">
                            <div class="thumbnail-popup">
                                <div class="no-image-message">No Image Available</div>
                            </div>`
                        }
                    </div>
                    <span class="node-text">${node.title} <span style="color: #555;">(${documentLink})</span></span>
                </div>
                <div class="node-status">
                    <span class="${badgeClass}">${node.status}</span>
                    ${timeAgo ? 
                        `<div style="font-size: 11px; color: #0a0a0aff; margin-top: 2px;font-weight: 800;">
                            ${timeAgo}
                        </div>` 
                        : ''
                    }
                </div>
            </div>
        </div>
        `;

        // SECOND: Add details section (hidden by default) AFTER the bar
        if (hasDetails) {
            html += `<div id="${detailsId}" class="node-details" style="display: none;">`;
            html += renderDocumentDetails(node, level);
            html += `</div>`;
        }

        // THIRD: Render all children recursively
        if (node.children && node.children.length > 0) {
            node.children.forEach((child) => {
                html += renderAllChildren(child, level + 1);
            });
        }

        return html;
    };

    // Toggle function for expanding/collapsing main tree and details
    window.toggleNode = function(childrenId, detailsId, hasChildren) {
        const childrenDiv = $('#' + childrenId);
        const detailsDiv = $('#' + detailsId);
        const arrowElement = $('#arrow-' + childrenId);
        
        let isExpanded = false;
        
        // Toggle children if they exist
        if (hasChildren) {
            if (childrenDiv.is(':visible')) {
                childrenDiv.hide();
            } else {
                childrenDiv.show();
                isExpanded = true;
            }
        }
        
        // Toggle details if they exist
        if (detailsDiv.length > 0) {
            if (detailsDiv.is(':visible')) {
                detailsDiv.hide();
                if (!isExpanded) isExpanded = false;
            } else {
                detailsDiv.show();
                isExpanded = true;
            }
        }
        
        // Update arrow
        if (isExpanded || childrenDiv.is(':visible') || detailsDiv.is(':visible')) {
            arrowElement.text('▼');
        } else {
            arrowElement.text('▶');
        }
    }

    // Toggle function for child nodes (details only)
    window.toggleNodeDetails = function(detailsId, nodeId) {
        const detailsDiv = $('#' + detailsId);
        const arrow = $('#arrow-' + nodeId);
        
        if (detailsDiv.is(':visible')) {
            detailsDiv.hide();
            arrow.text('▶');
        } else {
            detailsDiv.show();
            arrow.text('▼');
        }
    }
};