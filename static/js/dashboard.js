// dashboard.js

const db = firebase.firestore();
const reportTableBody = document.getElementById('reportTableBody');

function fetchReports() {
    const flaskServerUrl = 'http://127.0.0.1:5000'; // Flask server URL
    db.collection("trash_reports").orderBy("block").get()
        .then((querySnapshot) => {
            reportTableBody.innerHTML = ''; // Clear existing rows
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const row = document.createElement('tr');

                // Normalize the detected_image path (replace backslashes and ensure correct format)
                let detectedImage = (data.detected_image || '').replace(/\\/g, '/');
                const detectedImagePath = detectedImage ? `${flaskServerUrl}/${detectedImage}` : '';
                console.log("Image path being used:", detectedImagePath); // Debug log

                row.innerHTML = `
                    <td>${data.block || ''}</td>
                    <td>${data.floor || ''}</td>
                    <td>${data.area || ''}</td>
                    <td>${data.details || ''}</td>
                    <td>${data.status || 'Pending'}</td>
                    <td>
                        ${data.latitude && data.longitude ? 
                            `<a href="https://www.google.com/maps?q=${data.latitude},${data.longitude}" target="_blank">View Location</a>` 
                            : 'No location'}
                        <br>
                        ${detectedImagePath ? `<img src="${detectedImagePath}" alt="Detected Trash" style="max-width: 200px; max-height: 200px;" onerror="this.style.display='none';console.log('Image load failed for ${detectedImagePath}');">` : 'No image'}
                    </td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="updateStatus('${doc.id}', 'Resolved')">Resolve</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteReport('${doc.id}')">Delete</button>
                    </td>
                `;
                reportTableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Error fetching reports:", error);
        });
}
function updateStatus(id, newStatus) {
    db.collection("trash_reports").doc(id).update({ status: newStatus })
        .then(() => fetchReports())
        .catch((error) => console.error("Error updating status:", error));
}

function deleteReport(id) {
    db.collection("trash_reports").doc(id).delete()
        .then(() => fetchReports())
        .catch((error) => console.error("Error deleting report:", error));
}

// Fetch all reports on load
fetchReports();