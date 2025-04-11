document.addEventListener("DOMContentLoaded", async () => {
    if (!firebase.apps.length) {
        console.error("Firebase is not initialized. Check firebase-config.js.");
        return;
    }

    const db = firebase.firestore();
    const tableBody = document.getElementById("reportTableBody");

    // ✅ Single Clean fetchReports()
    async function fetchReports() {
        tableBody.innerHTML = "";

        try {
            const querySnapshot = await db.collection("reports").orderBy("timestamp", "desc").get();

            querySnapshot.forEach((doc) => {
                const report = doc.data();
                console.log("Fetched report:", report);
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${report.block || "N/A"}</td>
                    <td>${report.floor || "N/A"}</td>
                    <td>${report.area || "N/A"}</td>
                    <td>${report.additionalDetails || "None"}</td>
                    <td>${report.status || "Pending"}</td>
                    <td>
                        ${report.imageUrl ? `<img src="${report.imageUrl}" width="100" class="mb-2"><br>` : ''}
                        ${report.latitude && report.longitude 
                            ? `<small>Lat: ${report.latitude}<br>Lon: ${report.longitude}</small><br>` 
                            : ''}
                        <button class="btn btn-success btn-sm mt-2" onclick="updateStatus('${doc.id}', 'Cleaned')">Mark Cleaned</button>
                        <button class="btn btn-danger btn-sm mt-1" onclick="deleteReport('${doc.id}')">Delete</button>
                    </td>
                `;

                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    }

    // ✅ Update Status
    window.updateStatus = async (reportId, newStatus) => {
        await db.collection("reports").doc(reportId).update({ status: newStatus });
        alert("Status updated!");
        fetchReports();
    };

    // ✅ Delete Report
    window.deleteReport = async (reportId) => {
        if (confirm("Are you sure you want to delete this report?")) {
            await db.collection("reports").doc(reportId).delete();
            alert("Report deleted!");
            fetchReports();
        }
    };

    // ✅ Load on Page
    fetchReports();
});
