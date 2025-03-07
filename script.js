// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add animation on scroll for feature cards
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s ease-out';
    observer.observe(card);
});

// Observe all event cards
document.querySelectorAll('.event-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s ease-out';
    observer.observe(card);
});

// Add hover effect to social links
document.querySelectorAll('.social-links a').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.2)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// API Configuration
const API_URL = 'http://localhost:3000/api';
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// State management
let map;
let markers = [];
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Add state for pagination and filtering
let currentPage = 1;
let currentFilter = '';

// Initialize the map
function initMap() {
    const reno = { lat: 39.5296, lng: -119.8138 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: reno,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    // Add filter controls
    addFilterControls();
    
    // Load existing activities
    fetchActivities();

    // Check if user is already logged in
    if (authToken) {
        loginBtn.style.display = 'none';
        addActivityBtn.style.display = 'block';
    }
}

// Login functionality
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close-modal');
const loginForm = document.getElementById('loginForm');
const addActivityBtn = document.getElementById('addActivityBtn');
const activityForm = document.getElementById('activityForm');

loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            
            loginModal.style.display = 'none';
            loginBtn.style.display = 'none';
            addActivityBtn.style.display = 'block';
            showNotification('Successfully logged in!');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Activity management
addActivityBtn.addEventListener('click', () => {
    activityForm.style.display = activityForm.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('newActivityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        type: document.getElementById('activityType').value,
        location: document.getElementById('location').value,
        address: document.getElementById('address').value,
        players: document.getElementById('players').value,
        description: document.getElementById('description').value
    };

    try {
        // Geocode the address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: formData.address + ' Reno, NV' }, async (results, status) => {
            if (status === 'OK') {
                const position = results[0].geometry.location;
                formData.coordinates = {
                    lat: position.lat(),
                    lng: position.lng()
                };

                // Send to backend
                const response = await fetch(`${API_URL}/activities`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const activity = await response.json();
                    addMarker(position, activity);
                    activityForm.style.display = 'none';
                    document.getElementById('newActivityForm').reset();
                    showNotification('Activity added successfully!');
                } else {
                    throw new Error('Failed to add activity');
                }
            } else {
                showNotification('Could not find address. Please try again.', 'error');
            }
        });
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Add filter controls to the map
function addFilterControls() {
    const filterDiv = document.createElement('div');
    filterDiv.className = 'map-controls';
    filterDiv.innerHTML = `
        <select id="activityFilter" class="map-control">
            <option value="">All Activities</option>
            <option value="casual">Casual Games</option>
            <option value="tournament">Tournaments</option>
            <option value="lesson">Lessons</option>
        </select>
        <div class="pagination-controls">
            <button id="prevPage" class="map-control">&lt; Previous</button>
            <span id="pageInfo" class="map-control">Page 1</span>
            <button id="nextPage" class="map-control">Next &gt;</button>
        </div>
    `;
    
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(filterDiv);
    
    // Add event listeners
    document.getElementById('activityFilter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        currentPage = 1;
        fetchActivities();
    });
    
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchActivities();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        fetchActivities();
    });
}

// Update fetchActivities function
async function fetchActivities() {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: 10
        });
        
        if (currentFilter) {
            queryParams.append('type', currentFilter);
        }
        
        const response = await fetch(`${API_URL}/activities?${queryParams}`);
        const data = await response.json();
        
        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));
        markers = [];

        // Add new markers
        data.activities.forEach(activity => {
            if (activity.coordinates) {
                const position = {
                    lat: activity.coordinates.lat,
                    lng: activity.coordinates.lng
                };
                addMarker(position, activity);
            }
        });
        
        // Update pagination info
        document.getElementById('pageInfo').textContent = `Page ${data.currentPage} of ${data.totalPages}`;
        document.getElementById('prevPage').disabled = data.currentPage <= 1;
        document.getElementById('nextPage').disabled = data.currentPage >= data.totalPages;
    } catch (error) {
        showNotification('Failed to fetch activities', 'error');
    }
}

function addMarker(position, activity) {
    const markerColors = {
        casual: 'blue',
        tournament: 'red',
        lesson: 'green'
    };

    const marker = new google.maps.Marker({
        position,
        map,
        title: activity.location,
        icon: {
            url: `https://maps.google.com/mapfiles/ms/icons/${markerColors[activity.type] || 'red'}-dot.png`
        }
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px;">
                <h3>${activity.location}</h3>
                <p><strong>Type:</strong> ${activity.type}</p>
                <p><strong>Players:</strong> ${activity.players}</p>
                <p>${activity.description}</p>
                ${activity.createdBy ? `<p><small>Posted by: ${activity.createdBy.name}</small></p>` : ''}
            </div>
        `
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });

    markers.push(marker);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '5px';
    notification.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    notification.style.color = 'white';
    notification.style.zIndex = '1000';

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Load Google Maps API
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
script.async = true;
document.head.appendChild(script);

// Add styles for map controls
const styles = document.createElement('style');
styles.textContent = `
    .map-controls {
        margin: 10px;
        padding: 10px;
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    
    .map-control {
        margin: 5px;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    }
    
    .map-control:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .pagination-controls {
        display: inline-block;
        margin-left: 10px;
    }
`;
document.head.appendChild(styles); 