// Function to register the user
async function registerUser(event) {
    event.preventDefault();

    const form = document.getElementById('signupForm');
    const formData = new FormData(form);

    const usersID = formData.get('usersID');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const password = formData.get('password');
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch('https://audio-learn-cec9542ab0f5.herokuapp.com/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usersID, firstName, lastName, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Registration successful!");
            form.reset();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Error during registration:", error);
        alert("Something went wrong. Please try again later.");
    }
}

// Function to log in the user
async function loginUser(event) {
    event.preventDefault();

    const form = document.getElementById('loginForm');
    const formData = new FormData(form);
    const usersID = formData.get('usersID');
    const password = formData.get('password');

    try {
        const response = await fetch('https://audio-learn-cec9542ab0f5.herokuapp.com/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usersID, password }),
        });

        const result = await response.json();

        if (response.ok) {
            const user = {
                usersID: result.data.usersID,
                firstname: result.data.firstName,
                lastname: result.data.lastName,
            };
            localStorage.setItem('user', JSON.stringify(user));

            alert("Login successful!");
            window.location.href = "/LandingPage";
        } else {
            alert(`Login failed: ${result.message}`);
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("Something went wrong. Please try again later.");
    }
}

// Function to change the user's password
async function changePassword(event) {
    event.preventDefault();

    const userID = document.getElementById("userID").value;
    const newPassword = document.getElementById("Npassword").value;

    try {
        const response = await fetch(`https://audio-learn-cec9542ab0f5.herokuapp.com/api/users/${userID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: newPassword }),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Password updated successfully!");
            window.location.href = "/";
        } else {
            alert(`Failed to update password: ${result.message}`);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again later.");
    }
}

// Set user details from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (user) {
        const { firstname, lastname, usersID } = user;


        const usernameProfile = document.querySelector("#user-id");
        const nameProfile = document.querySelector("#user-name");

        if (usernameProfile) { 
            usernameProfile.textContent = usersID;
        }
        if (nameProfile) {
            nameProfile.textContent = `${firstname} ${lastname}`;
        }


        const usernameDisplay = document.querySelector("#userDropdown p ");
        if (usernameDisplay) {
            usernameDisplay.textContent = `${firstname} ${lastname}`;
        }

        const userIDDisplay = document.querySelector("#userDropdown p span");
        if (userIDDisplay) {
            userIDDisplay.textContent = usersID;
        }
    } else {
        console.warn("User not logged in.");
    }
});

// Logout function
document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "/";
});




// Profile picture upload function
document.getElementById('save-picture').addEventListener('click', async function () {
    const fileInput = document.getElementById('upload-picture');
    const file = fileInput.files[0];
    const usersID = document.getElementById('user-id').textContent.trim(); // Get User ID dynamically

    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('usersID', usersID);

    try {
        const response = await fetch('http://localhost:5000/api/users/upload-profile-picture', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            // Update the profile picture preview
            document.getElementById('profile-icon').src = result.data.profilePicture;
            alert('Profile picture uploaded successfully!');
        } else {
            alert(`Failed to upload profile picture: ${result.message}`);
        }
    } catch (error) {
        console.error('Error uploading the picture:', error);
        alert('Failed to upload profile picture. Please try again.');
    }
});

// document.addEventListener('DOMContentLoaded', () => {
//     const bookmark = JSON.parse(localStorage.getItem('bookmarkedParagraph'));

//     if (bookmark) {
//         const bookmarkContainer = document.createElement('div');
//         bookmarkContainer.innerHTML = `
//             <h3>Saved Bookmark:</h3>
//             <p>${bookmark.content}</p>
//             <a href="${bookmark.url}#${bookmark.id}" style="color: blue; cursor: pointer;">Go to Bookmark</a>
//         `;
//         document.querySelector('.profile-info').appendChild(bookmarkContainer);
//     } else {
//         const noBookmarkMessage = document.createElement('p');
//         noBookmarkMessage.textContent = "No bookmarks saved.";
//         document.querySelector('.profile-info').appendChild(noBookmarkMessage);
//     }
// });
