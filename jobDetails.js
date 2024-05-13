// Get the current URL of the page
const currentUrl = window.location.href;

// Create a new URL object with the current URL
const url = new URL(currentUrl);

// Use URLSearchParams to access query parameters
const params = new URLSearchParams(url.search);

// Get the value of the 'jobId' parameter
const jobId = params.get('jobId');

// jobId now contains the value of the 'jobId' parameter from the URL
console.log('Job ID:', jobId);

   // Function to format the date as "day MonthName Year"
function formatDate(dateString) {
    // Months in Turkish
    const turkishMonths = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    // Parse the date string
    const date = new Date(dateString);

    // Extract day, month, and year components
    const day = date.getDate();
    const month = date.getMonth(); // January is 0, so we need to adjust
    const year = date.getFullYear();

    // Format the date as "day MonthName Year"
    const formattedDate = day + " " + turkishMonths[month] + " " + year;
    return formattedDate;
}

// Function to fetch a new authentication token
function fetchAuthToken(callback) {
    // Create a request variable and assign a new XMLHttpRequest object to it.
    let request = new XMLHttpRequest();

    // Define the URL of the authentication endpoint
    let authUrl = 'aHR0cHM6Ly9hdHMtZXh0ZXJuYWwtYXBpLmthcml5ZXIubmV0L2F1dGgvdG9rZW4=';

    // Define the payload for the request (userCode and password)
    let payload = {
        "userCode": "hr-1174",
        "password": "9G*4f3fEqf*!"
    };

    // Use the POST request to fetch a new token
    request.open('POST', authUrl, true);

    // Set the content type header
    request.setRequestHeader('Content-Type', 'application/json');

    // When the request loads, execute the provided callback function
    request.onload = function () {
        // Check if the request is successful (status code 200)
        if (request.status >= 200 && request.status < 400) {
            // Parse the JSON response
            let data = JSON.parse(request.responseText);

            // Extract the token from the response
            let newToken = data.access_token;

            // Execute the callback function with the new token
            callback(newToken);
        } else {
            console.error('Failed to fetch authentication token');
        }
    };

    // Convert payload to JSON and send the request
    request.send(JSON.stringify(payload));
}

// Function to navigate back when the "back" link is clicked
function navigateBack() {
    window.history.back();
}

// Event listener to handle page load
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId');

    if (!jobId) {
        console.error("Job ID not found in URL parameter");
        return;
    }

    const loadingText = document.getElementById('loadingText');
    loadingText.style.display = 'block';

    const sampleStyleContainer = document.getElementById('samplestyle');
    sampleStyleContainer.style.display = 'none';

    fetchAuthToken(function(newToken) {
        const request = new XMLHttpRequest();
        const apiUrl = `https://ats-external-api.kariyer.net/hrlink-service/api/job/getjobdetail/${jobId}`;

        request.open('GET', apiUrl, true);
        request.setRequestHeader('Authorization', `Bearer ${newToken}`);

        request.onload = function () {
            const data = JSON.parse(this.response);

            if (request.status >= 200 && request.status < 400) {
                sampleStyleContainer.querySelector('h1').textContent = data.job.positionName;
                const citiesString = data.job.cities.join(', ');
                sampleStyleContainer.querySelector('h4:nth-of-type(1)').textContent = citiesString;
                sampleStyleContainer.querySelector('h4:nth-of-type(2)').textContent = data.job.departmentName;
                sampleStyleContainer.querySelector('p').innerHTML = data.job.qualification;

                const formattedPostingDate = formatDate(data.job.postingDate);
                sampleStyleContainer.querySelector('h6:nth-of-type(1)').textContent = "Yayınlanma Tarihi: " + formattedPostingDate;
                const formattedClosingDate = formatDate(data.job.closingDate);
                sampleStyleContainer.querySelector('h6:nth-of-type(2)').textContent = "Kapanış Tarihi: " + formattedClosingDate;

                const applyButton = document.getElementById('ButtonApply');
                applyButton.href = data.job.detailUrl;
                applyButton.target = '_blank';
                
                const imageElement = document.getElementById('Image');
                if (imageElement) {
                    imageElement.src = data.job.imageLink;
                } else {
                    console.error('Image element not found');
                }

                loadingText.style.display = 'none';
                sampleStyleContainer.style.display = 'block';
            } else {
                console.error('Error fetching data. Status code:', request.status);
            }
        };

        request.onerror = function () {
            console.error('Network error occurred');
        };

        request.send();
    });

    const backButton = document.getElementById('back');
    if (backButton) {
        backButton.addEventListener('click', navigateBack);
    } else {
        console.error('Back button not found');
    }
});
