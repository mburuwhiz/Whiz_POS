// public/js/auth.js

// Store the original fetch function
const originalFetch = window.fetch;

// Create a wrapper for the fetch function
window.fetch = async (url, options) => {
    // Get the auth token from localStorage
    const token = localStorage.getItem('token');

    // Create new headers or clone existing ones
    const headers = options && options.headers ? new Headers(options.headers) : new Headers();

    // Add the Authorization header if the token exists
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    // Create the new options object for the fetch call
    const newOptions = { ...options, headers };

    // Call the original fetch function with the modified options
    const response = await originalFetch(url, newOptions);

    // Check if the response status is 401 (Unauthorized)
    if (response.status === 401) {
        // Clear the token from localStorage
        localStorage.removeItem('token');

        // Redirect to the login page
        window.location.href = '/login';

        // Prevent further processing of the response
        // Return a new promise that will not resolve, to stop the then() chain
        return new Promise(() => {});
    }

    // If the response is not 401, return it as is
    return response;
};
