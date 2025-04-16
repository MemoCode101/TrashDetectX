document.addEventListener("DOMContentLoaded", () => {
    const blockSelect = document.getElementById("blockSelect");
    const floorSelect = document.getElementById("floorSelect");
    const areaSelect = document.getElementById("areaSelect");
    const fileInput = document.getElementById("trashPhoto");

    const floorOptions = {
        "M Block": ["1st Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor"],
        "E Block": ["1st Floor", "2nd Floor", "3rd Floor"]
    };

    function getAreas(block, floor) {
        if (!block || !floor) return [];
        const areas = [];
        for (let i = 1; i <= 6; i++) {
            areas.push(`${block.charAt(0)}${floor[0]}0${i}`);
        }
        areas.push("Toilet Area");
        return areas;
    }

    blockSelect.addEventListener("change", () => {
        const selectedBlock = blockSelect.value;
        floorSelect.innerHTML = '<option value="" disabled selected>Select a Floor</option>';
        floorSelect.disabled = false;
        areaSelect.innerHTML = '<option value="" disabled selected>Select an Area</option>';
        areaSelect.disabled = true;

        floorOptions[selectedBlock].forEach(floor => {
            const option = document.createElement("option");
            option.value = floor;
            option.textContent = floor;
            floorSelect.appendChild(option);
        });
    });

    floorSelect.addEventListener("change", () => {
        const selectedBlock = blockSelect.value;
        const selectedFloor = floorSelect.value;

        areaSelect.innerHTML = '<option value="" disabled selected>Select an Area</option>';
        areaSelect.disabled = false;

        getAreas(selectedBlock, selectedFloor).forEach(area => {
            const option = document.createElement("option");
            option.value = area;
            option.textContent = area;
            areaSelect.appendChild(option);
        });
    });

    document.getElementById("reportForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Form submitted"); // Debug log to check for duplicate submissions

        const block = blockSelect.value;
        const floor = floorSelect.value;
        const area = areaSelect.value;
        const additionalDetails = document.getElementById("additionalDetails").value.trim();
        const file = fileInput.files[0];

        let latitude = null;
        let longitude = null;
        let filename = '';
        let detectedImagePath = ''; // Ensure variable is defined
        let detections = [];

        try {
            if (file) {
                try {
                    const gpsData = await extractGPS(file);
                    if (gpsData) {
                        latitude = gpsData.latitude;
                        longitude = gpsData.longitude;
                    }
                } catch (gpsError) {
                    console.warn("No GPS data found:", gpsError);
                }

                const formData = new FormData();
                formData.append("file", file);

                const uploadResponse = await fetch("/upload", {
                    method: "POST",
                    body: formData,
                });

                const uploadData = await uploadResponse.json();
                console.log("Upload response:", uploadData); // Debug log
                if (!uploadData.success) throw new Error(uploadData.error);

                filename = uploadData.filename;
                detectedImagePath = uploadData.detected_image_path || ''; // Correct assignment
                detections = uploadData.detections || [];
            }

            const reportResponse = await fetch("/submit-report", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    block,
                    floor,
                    area,
                    details: additionalDetails,
                    gps: { latitude, longitude },
                    filename: filename,
                    detected_image_path: detectedImagePath, // Use the correct key
                    detections: detections // Ensure detections are sent
                })
            });
            console.log("Submitting data:", {
                block,
                floor,
                area,
                details: additionalDetails,
                gps: { latitude, longitude },
                filename,
                detected_image_path: detectedImagePath, // Use the correct key
                detections
            }); // Debug log

            const reportData = await reportResponse.json();
            alert("Report submitted successfully!");
            console.log("Server response:", reportData);

            // Reset form after successful submission
            document.getElementById("reportForm").reset();
            blockSelect.selectedIndex = 0;
            floorSelect.innerHTML = '<option value="" disabled selected>Select a Floor</option>';
            floorSelect.disabled = true;
            areaSelect.innerHTML = '<option value="" disabled selected>Select an Area</option>';
            areaSelect.disabled = true;
        } catch (error) {
            console.error("Error submitting report:", error);
            alert("Error submitting report: " + error.message);
        }
    });
});

function extractGPS(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                try {
                    EXIF.getData(img, function () {
                        const lat = EXIF.getTag(this, "GPSLatitude");
                        const lon = EXIF.getTag(this, "GPSLongitude");
                        const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
                        const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";
                        if (lat && lon) {
                            const latitude = (lat[0] + lat[1] / 60 + lat[2] / 3600) * (latRef === "N" ? 1 : -1);
                            const longitude = (lon[0] + lon[1] / 60 + lon[2] / 3600) * (lonRef === "E" ? 1 : -1);
                            resolve({ latitude, longitude });
                        } else {
                            reject("No GPS data found.");
                        }
                    });
                } catch (error) {
                    reject("Error extracting GPS data.");
                }
            };
            img.onerror = () => reject("Image load error");
        };
        reader.onerror = () => reject("FileReader error");
        reader.readAsDataURL(file);
    });
}