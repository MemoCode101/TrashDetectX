// dashboard.js

const db = firebase.firestore();
const reportTableBody = document.getElementById('reportTableBody');

function fetchReports(filterClass = '') {
    const flaskServerUrl = 'http://127.0.0.1:5000';
    let pendingCount = 0, resolvedCount = 0;
    db.collection("trash_reports").orderBy("block").get()
        .then((querySnapshot) => {
            reportTableBody.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const detectionsList = Array.isArray(data.detections) && data.detections.length > 0 ? data.detections.join(', ') : 'None';

                // Filter by class if specified
                if (filterClass && !data.detections.includes(filterClass)) return;

                if (data.status === 'Pending') pendingCount++;
                else if (data.status === 'Resolved') resolvedCount++;

                let detectedImage = (data.detected_image || '').replace(/\\/g, '/');
                const detectedImagePath = detectedImage ? `${flaskServerUrl}/${detectedImage}` : '';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${data.block || ''}</td>
                    <td>${data.floor || ''}</td>
                    <td>${data.area || ''}</td>
                    <td>${data.details || ''}</td>
                    <td>${data.status || 'Pending'}</td>
                    <td>
                        ${data.latitude || data.longitude ? 
                            (data.latitude && data.longitude ? 
                                `<a href="https://www.google.com/maps?q=${data.latitude},${data.longitude}" target="_blank">View Location</a><br>Lat: ${data.latitude || 'N/A'}, Lon: ${data.longitude || 'N/A'}` 
                                : `Lat: ${data.latitude || 'N/A'}, Lon: ${data.longitude || 'N/A'}`)
                            : 'No location'}
                        <br>
                        ${detectedImagePath ? `<a href="#" onclick="showImageModal('${detectedImagePath}')">View Image</a>` : 'No image'}
                    </td>
                    <td>${detectionsList}</td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="updateStatus('${doc.id}', 'Resolved')">Resolve</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteReport('${doc.id}')">Delete</button>
                    </td>
                `;
                reportTableBody.appendChild(row);
            });

            document.getElementById('statusSummary').innerHTML = `
                <p>Pending: ${pendingCount} | Resolved: ${resolvedCount}</p>
            `;
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

function showImageModal(imagePath) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'imageModal';
    modal.tabIndex = '-1';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Trash Image</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <img src="${imagePath}" class="img-fluid" alt="Detected Trash">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    new bootstrap.Modal(modal).show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
}





// Fetch reports on load
fetchReports();