const form = document.querySelector('form');
const errorMessage = document.querySelector('#error-message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.querySelector('#name').value;
  const photo = document.querySelector('#photo').files[0];

  const formData = new FormData();
  formData.append('name', name);
  formData.append('photo', photo);

  try {
    const response = await fetch(`http://localhost:3000/attendance`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('An error occurred while recording attendance.');
    }

    // Show the success message popup
    const popup = document.querySelector('#popup');
    const popupMessage = document.querySelector('#popup-message');
    popupMessage.textContent = 'Attendance recorded successfully!';
    popup.style.display = 'block';

    // Reset the form
    form.reset();
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});

// Add an event listener to close the popup when the close button is clicked
const closePopupBtn = document.querySelector('.close');
const popup = document.querySelector('#popup');
closePopupBtn.addEventListener('click', () => {
  popup.style.display = 'none';
  location.reload(); // Refresh the page
});
