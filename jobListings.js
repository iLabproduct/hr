(function () {
    const authTokenUrl = 'aHR0cHM6Ly9hdHMtZXh0ZXJuYWwtYXBpLmthcml5ZXIubmV0L2F1dGgvdG9rZW4=';
    const jobFilterParametersUrl = 'aHR0cHM6Ly9hdHMtZXh0ZXJuYWwtYXBpLmthcml5ZXIubmV0L2hybGluay1zZXJ2aWNlL2FwaS9qb2Ivam9iZmlsdGVycGFyYW1ldGVycw==';
    const jobSearchUrl = 'aHR0cHM6Ly9hdHMtZXh0ZXJuYWwtYXBpLmthcml5ZXIubmV0L2hybGluay1zZXJ2aWNlL2FwaS9qb2Ivc2VhcmNo';
    const profileId = 1898;
    
 function formatDate(dateString) {
    const turkishMonths = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const formattedDate = day + ' ' + turkishMonths[month] + ' ' + year;
    return formattedDate;
  }
    function fetchAuthToken() {
        let request = new XMLHttpRequest();

        let payload = {
            userCode: 'hr-1174',
            password: '9G*4f3fEqf*!'
        };

        request.open('POST', authTokenUrl, true);
        request.setRequestHeader('Content-Type', 'application/json');

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                let data = JSON.parse(request.responseText);
                let newToken = data.access_token;

                localStorage.setItem('authToken', newToken);

                fetchJobFilterParameters(newToken);
            } else {
                console.error('Failed to fetch authentication token');
            }
        };

        request.send(JSON.stringify(payload));
    }

    function fetchJobFilterParameters(token) {
        let request = new XMLHttpRequest();

        request.open('GET', jobFilterParametersUrl, true);
        request.setRequestHeader('Authorization', 'Bearer ' + token);

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                let data = JSON.parse(request.responseText);
                console.log('Job Filter Parameters:', data.jobFilterParameters);

                const cities = data.jobFilterParameters.cities;
                const departments = data.jobFilterParameters.departmentNames;
                const positions = data.jobFilterParameters.positionNames;

                const cityField = document.getElementById('cityField');
                const departmentField = document.getElementById('departmentField');
                const positionField = document.getElementById('positionField');

                cityField.innerHTML = '<option>Select a city</option>';
                departmentField.innerHTML = '<option>Select a department</option>';
                positionField.innerHTML = '<option>Select a position</option>';
                cities.forEach((city) => {
                    const option = document.createElement('option');
                    option.textContent = city;
                    cityField.appendChild(option);
                });
                departments.forEach((department) => {
                    const option = document.createElement('option');
                    option.textContent = department;
                    departmentField.appendChild(option);
                });
                positions.forEach((position) => {
                    const option = document.createElement('option');
                    option.textContent = position;
                    positionField.appendChild(option);
                });

                fetchAndDisplayPostings(token, {});
            } else {
                console.error('Failed to fetch job filter parameters');
            }
        };

        request.send();
    }

    function fetchAndDisplayPostings(token, jobData) {
        let request = new XMLHttpRequest();
        let apiUrl = 'aHR0cHM6Ly9hdHMtZXh0ZXJuYWwtYXBpLmthcml5ZXIubmV0L2hybGluay1zZXJ2aWNlL2FwaS9qb2Ivc2VhcmNo';
        let payload = {
            profileIds: [profileId],
            cities: jobData.selectedCity ? [jobData.selectedCity] : [],
            departmentNames: jobData.selectedDepartment ? [jobData.selectedDepartment] : [],
            positionNames: jobData.selectedPosition ? [jobData.selectedPosition] : []
        };

        request.open('POST', apiUrl, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('Authorization', 'Bearer ' + token);

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                let data = JSON.parse(request.responseText);

                console.log(data);

                let totalPostingsCount = data.jobs.length;

                const loadingIndicator = document.getElementById('loading-indicator');
                loadingIndicator.textContent = `Toplam İş İlanı: ${totalPostingsCount}`;

                const cardContainer = document.getElementById('Cards-Container');
                const sampleStyle = document.getElementById('samplestyle');

                cardContainer.innerHTML = '';

                if (totalPostingsCount === 0) {
                    const noResultsDiv = document.getElementById('noResults');
                    noResultsDiv.style.display = 'block';

                    const resetLink = document.getElementById('resetLink');
                    resetLink.addEventListener('click', handleResetFilters);
                } else {
                    const noResultsDiv = document.getElementById('noResults');
                    noResultsDiv.style.display = 'none';

                    data.jobs.forEach((job) => {
                        fetchJobDetails(job.jobId, sampleStyle, cardContainer);
                    });
                }
            } else {
                if (request.status === 401) {
                    fetchAuthToken();
                } else {
                    console.error('Failed to fetch job postings');
                }
            }
        };

        request.send(JSON.stringify(payload));
    }

    function fetchJobDetails(jobId, sampleStyle, cardContainer) {
        let request = new XMLHttpRequest();
        let apiUrl = `aHR0cHM6Ly9hdHMtZXh0ZXJuYWwtYXBpLmthcml5ZXIubmV0L2hybGluay1zZXJ2aWNlL2FwaS9qb2IvZ2V0am9iZGV0YWlsLw==${jobId}`;
        request.open('GET', apiUrl, true);
        request.setRequestHeader('Content-Type', 'application/json');

        let token = localStorage.getItem('authToken');
        request.setRequestHeader('Authorization', 'Bearer ' + token);

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                let data = JSON.parse(request.responseText);
                const card = sampleStyle.cloneNode(true);
                card.removeAttribute('id');
                card.style.display = 'block';

                const title = card.querySelector('h3');
                title.textContent = data.job.title;

                const citiesString = data.job.cities.join(', ');

                card.querySelector('h4:nth-of-type(1)').textContent = citiesString;

                card.querySelector('h4:nth-of-type(2)').textContent = data.job.departmentName;

                const formattedClosingDate = formatDate(data.job.closingDate);
                card.querySelector('h6:nth-of-type(1)').textContent = 'İlan Kapanış Tarihi: ' + formattedClosingDate;

                const qualification = data.job.qualification.replace(/(<([^>]+)>|&nbsp;)/gi, ' ');
                card.querySelector('p').textContent = qualification.length > 240 ? qualification.slice(0, 240) + '...' : qualification;

                cardContainer.appendChild(card);

                card.addEventListener('click', function () {
                    document.location.href = '/ilandetay?jobId=' + jobId;
                });
            } else {
                console.error('Failed to fetch job details for job ID: ' + jobId);
            }
        };

        request.send();
    }

    const cityField = document.getElementById('cityField');
    const departmentField = document.getElementById('departmentField');
    const positionField = document.getElementById('positionField');
    const resetFiltersButton = document.getElementById('resetFilters');
    cityField.addEventListener('change', handleFilterChange);
    departmentField.addEventListener('change', handleFilterChange);
    positionField.addEventListener('change', handleFilterChange);
    resetFiltersButton.addEventListener('click', handleResetFilters);

    function handleFilterChange() {
        const selectedCity = cityField.value !== 'Select a city' ? cityField.value : null;
        const selectedDepartment = departmentField.value !== 'Select a department' ? departmentField.value : null;
        const selectedPosition = positionField.value !== 'Select a position' ? positionField.value : null;
        const token = localStorage.getItem('authToken');
        fetchAndDisplayPostings(token, {
            selectedCity,
            selectedDepartment,
            selectedPosition
        });
    }

    function handleResetFilters() {
        cityField.value = 'Select a city';
        departmentField.value = 'Select a department';
        positionField.value = 'Select a position';
        const token = localStorage.getItem('authToken');
        fetchAndDisplayPostings(token, {});
    }

    fetchAuthToken();
})();
