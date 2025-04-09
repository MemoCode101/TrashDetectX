document.addEventListener("DOMContentLoaded", async () => {
    // ✅ Ensure Firebase is initialized
    if (!firebase.apps.length) {
        console.error("Firebase is not initialized. Check firebase-config.js.");
        return;
    }

    const auth = firebase.auth();
    const db = firebase.firestore();
    const tableBody = document.getElementById("reportTableBody");

    // 📌 Fetch Reports from Firestore
    async function fetchReports() {
        tableBody.innerHTML = ""; // Clear previous data

        try {
            const querySnapshot = await db.collection("reports").orderBy("timestamp", "desc").get();

            querySnapshot.forEach((doc) => {
                const report = doc.data();
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${report.block}</td>
                    <td>${report.floor}</td>
                    <td>${report.area}</td>
                    <td>${report.additionalDetails || "None"}</td>
                    <td>${report.status}</td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="updateStatus('${doc.id}', 'Cleaned')">Mark Cleaned</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteReport('${doc.id}')">Delete</button>
                    </td>
                `;

                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    }

    // 📌 Fetch Reports and Show on Dashboard
    async function fetchReports() {
        const tableBody = document.getElementById("reportTableBody");
        tableBody.innerHTML = ""; // Clear table

        const querySnapshot = await db.collection("reports").orderBy("timestamp", "desc").get();

        querySnapshot.forEach((doc) => {
            const report = doc.data();
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><img src="${report.imageUrl}" width="100"></td>
                <td>Lat: ${report.latitude}, Lon: ${report.longitude}</td>
                <td>
                <button class="btn btn-danger btn-sm" onclick="deleteReport('${doc.id}')">Delete</button>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }

    // 📌 Update Report Status
    window.updateStatus = async (reportId, newStatus) => {
        await db.collection("reports").doc(reportId).update({ status: newStatus });
        alert("Status updated!");
        fetchReports(); // Refresh the table
    };

    // 📌 Delete Report
    window.deleteReport = async (reportId) => {
        if (confirm("Are you sure you want to delete this report?")) {
            await db.collection("reports").doc(reportId).delete();
            alert("Report deleted!");
            fetchReports(); // Refresh the table
        }
    };

    // 📌 Fetch Reports When Page Loads
    fetchReports();
});