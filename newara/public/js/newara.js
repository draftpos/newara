$(document).on('app_ready', function() {
    
    // --- 1. LIST VIEW LOGIC ---
    if (frappe.views.ListView) {
        const original_list_refresh = frappe.views.ListView.prototype.refresh;
        frappe.views.ListView.prototype.refresh = function() {
            original_list_refresh.apply(this, arguments);
            const view = this;
            setTimeout(() => { style_list_view(view); }, 500);
        };
    }

    // --- 2. REPORT VIEW LOGIC ---
    const observer = new MutationObserver(function(mutations) {
        const $datatable = $('.dt-scrollable');
        
        if ($datatable.length > 0) {
            if (!$datatable.data('style-listener-attached')) {
                style_report_view();

                const table_observer = new MutationObserver(() => {
                    style_report_view();
                });
                table_observer.observe($datatable[0], { childList: true });
                
                $datatable.data('style-listener-attached', true);
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});

function style_list_view(view) {
    const current_doctype = view.doctype;
    $('body').find('.list-row-col a').each(function() {
        const $link = $(this);
        const doc_name = $link.attr('data-name');
        const filter_str = $link.attr('data-filter');
        const row_name = $link.closest('.list-row-container').attr('data-name');
        const link_text = $link.text().replace(/\s+/g, ' ').trim();

        // (Light Blue)
        if ((doc_name && link_text === doc_name) || (filter_str && filter_str.startsWith('name,=')) || (row_name && link_text === row_name)) {
            set_style($link, '#00b2ff', false); 
            return;
        }
        // Currency (Green)
        if (filter_str) {
            const fieldname = filter_str.split(',')[0];
            const docfield = frappe.meta.get_docfield(current_doctype, fieldname);
            if (docfield && docfield.fieldtype === 'Currency') {
                set_style($link, '#28a745', false);
                $link.closest('.list-row-col')[0].style.setProperty('text-align', 'right', 'important');
                return;
            }
        }
        // Other (Dark Blue)
        set_style($link, '#0056b3', false);
    });
}

function style_report_view() {
    let id_index = -1;
    let currency_indices = [];

    $('.dt-row-filter .dt-cell--filter input').each(function() {
        const $input = $(this);
        const col_idx = parseInt($input.attr('data-col-index'));
        const label = $input.attr('data-name'); 

        if (!label) return;

        if (label === 'ID' || label === 'Name') {
            id_index = col_idx;
        }
        else if (['Grand Total', 'Amount', 'Currency', 'Total', 'Outstanding'].some(kw => label.includes(kw))) {
             currency_indices.push(col_idx);
        }
    });

    $('.dt-scrollable .dt-cell').each(function() {
        const $cell = $(this);
        const col_idx = parseInt($cell.attr('data-col-index'));
        
        // Skip the checkbox column (usually index 0)
        if (col_idx === 0) return; 

        const $link = $cell.find('a');
        const $text = $cell.find('.dt-cell__content');
        const target = $link.length > 0 ? $link[0] : $text[0];

        if (!target) return;

        // CURRENCY (Green)
        if (currency_indices.includes(col_idx)) {
            target.style.setProperty('color', '#28a745', 'important');
            target.style.setProperty('text-align', 'right', 'important');
            return;
        }

        // ID (Light Blue)
        if (col_idx === id_index) {
            target.style.setProperty('color', '#00b2ff', 'important');
            return;
        }

        // Other (Dark Blue)
        target.style.setProperty('color', '#0056b3', 'important');
    });
}

function set_style(element, color, bold) {
    if (element instanceof jQuery) element = element[0];
    if (!element) return;
    element.style.setProperty('color', color, 'important');
    if (bold) element.style.setProperty('font-weight', 'bold', 'important');
}