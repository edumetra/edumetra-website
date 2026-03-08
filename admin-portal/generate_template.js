const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Determine the output path in the Next.js public directory
const outputFilePath = path.join(__dirname, 'public', 'sample_colleges_template.xlsx');

// Ensure the public directory exists (it should, but safety first)
if (!fs.existsSync(path.join(__dirname, 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'public'));
}

// Define the columns expected by our bulk upload format
const templateData = [
    {
        "College Name": "Example Institute of Technology",
        "City": "Bangalore",
        "State": "Karnataka",
        "Type": "Private",
        "Established Year": 2005,
        "Total Intake Capacity": 1200,
        "Minority Status": "Non-Minority",
        "Seat Reservations": "15% Management Quota",
        "Website URL": "https://www.example-institute.edu",
        "Description": "A premier institute for engineering and management.",
    },
    {
        "College Name": "National Medical College",
        "City": "New Delhi",
        "State": "Delhi",
        "Type": "Public",
        "Established Year": 1950,
        "Total Intake Capacity": 800,
        "Minority Status": "Minority",
        "Seat Reservations": "50% State Quota, 15% AIQ",
        "Website URL": "https://www.nationalmedical.edu",
        "Description": "One of the oldest medical colleges in the country.",
    }
];

// Create a new workbook and add the worksheet
const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(templateData);

// Set column widths for better readability when the admin opens the file
ws['!cols'] = [
    { wch: 35 }, // College Name
    { wch: 20 }, // City
    { wch: 20 }, // State
    { wch: 15 }, // Type
    { wch: 18 }, // Established Year
    { wch: 22 }, // Total Intake Capacity
    { wch: 20 }, // Minority Status
    { wch: 30 }, // Seat Reservations
    { wch: 35 }, // Website URL
    { wch: 60 }, // Description
];

// Append the worksheet to the workbook
xlsx.utils.book_append_sheet(wb, ws, "Colleges");

// Write the file to disk
xlsx.writeFile(wb, outputFilePath);

console.log(`Successfully generated template at: ${outputFilePath}`);
