
function fetchUserData(userId) {
  fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then(data => console.log(data));
}