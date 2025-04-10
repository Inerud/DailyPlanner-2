document.addEventListener("DOMContentLoaded", () => {
    var tableContainer = document.getElementById("main");

    function generateHabitTable(month, habitCount) {

        //tableContainer.className = 'habittable';
        tableContainer.innerText = '';
    
        const table = document.createElement('table');
        table.className = 'tg';
    
        const colgroup = document.createElement('colgroup');
        const daysInMonth = new Date(2025, month, 0).getDate(); // Number of days in month
        const totalCols = daysInMonth + 3; // "Habits" + days + "goal" + "achieved"
    
        for (let i = 0; i < totalCols; i++) {
            colgroup.appendChild(document.createElement('col'));
        }
        table.appendChild(colgroup);
    
        const thead = document.createElement('thead');
        const daysRow = document.createElement('tr');
        daysRow.className = 'days';
    
        // First column: Habits
        const habitsHeader = document.createElement('th');
        habitsHeader.className = 'heading';
        habitsHeader.setAttribute('rowspan', '2');
        habitsHeader.innerText = 'Habits';
        daysRow.appendChild(habitsHeader);
    
        // Weekday labels
        const weekdayShort = ['s', 'm', 't', 'w', 't', 'f', 's'];
        const startDate = new Date(2025, month - 1, 1); // Adjust for 0-indexed month
        for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(2025, month - 1, i).getDay(); // 0 (Sun) to 6 (Sat)
            const th = document.createElement('th');
            th.className = 'tg-0lax';
            th.textContent = weekdayShort[day];
            daysRow.appendChild(th);
        }
    
        // Final two columns
        ['goal', 'achieved'].forEach(text => {
            const th = document.createElement('th');
            th.className = 'heading';
            th.setAttribute('rowspan', '2');
            th.textContent = text;
            daysRow.appendChild(th);
        });
    
        // Dates row
        const datesRow = document.createElement('tr');
        datesRow.className = 'dates';
        for (let i = 1; i <= daysInMonth; i++) {
            const th = document.createElement('th');
            th.className = 'tg-0lax';
            th.textContent = i;
            datesRow.appendChild(th);
        }
    
        thead.appendChild(daysRow);
        thead.appendChild(datesRow);
        table.appendChild(thead);
    
        // Body
        const tbody = document.createElement('tbody');
        for (let i = 1; i <= habitCount; i++) {
            const row = document.createElement('tr');
            row.className = 'habit';
    
            const habitNameCell = document.createElement('td');
            habitNameCell.className = 'tg-0lax';
            habitNameCell.textContent = `habit ${i}`;
            row.appendChild(habitNameCell);
    
            for (let j = 1; j <= daysInMonth; j++) {
                const td = document.createElement('td');
                td.className = 'tg-0lax';
                row.appendChild(td);
            }
    
            // Add goal and achieved columns
            for (let k = 0; k < 2; k++) {
                const td = document.createElement('td');
                td.className = 'tg-0lax';
                row.appendChild(td);
            }
    
            tbody.appendChild(row);
        }
    
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        return tableContainer;
    }
    

    generateHabitTable(3, 3);
});