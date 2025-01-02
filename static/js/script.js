document.addEventListener('DOMContentLoaded', function() {
    const tl = gsap.timeline();
    tl.from (".navbar", {
        y: -200,
        duration: .7,
        opacity: 0,
        
    });
});

document.addEventListener('DOMContentLoaded', function() { 
  const tl = gsap.timeline();

    tl.from(".logo", {
        x: 0,
        duration: 1,
        opacity: 0,
        delay: .7
    });

});


document.addEventListener('DOMContentLoaded', function() {
    const tl = gsap.timeline();
    tl.from ("li", {
        y: -400,
        duration: 1,
        opacity: 0
    });


});



document.addEventListener('DOMContentLoaded', function() {
  const tl = gsap.timeline();
  tl.from ("#title", {
      x: -2000,
      duration: .9,
      opacity: 0
  });


});



document.addEventListener('DOMContentLoaded', function() {
  const tl = gsap.timeline();
  tl.from ("#description", {
      x: 0,
      duration: 0.9,
      delay: 1,
      opacity: 0
  });


});



document.addEventListener('DOMContentLoaded', function() {
  const tl = gsap.timeline();
  tl.from (".con-file", {
      x: 0,
      duration: 1,
      opacity: 0
  });


});

document.addEventListener('DOMContentLoaded', function() {
    const tl = gsap.timeline();
    tl.from (".head-con", {
        y: -200,
        duration: .7,
        opacity: 0,
        
    });
});








// document.getElementById('uploadForm').addEventListener('submit', async function (e) {
//     e.preventDefault();

//     const fileInput = document.getElementById('fileInput');
//     if (!fileInput.files.length) {
//         alert("Please select a file.");
//         return;
//     }

//     const formData = new FormData();
//     formData.append('file', fileInput.files[0]);

//     const response = await fetch('/convert', {
//         method: 'POST',
//         body: formData,
//     });

//     const data = await response.json();
//     if (response.ok) {
//         document.getElementById('result').style.display = 'block';
//         document.getElementById('downloadLink').href = `/download/${data.fileId}`;
//     } else {
//         alert(data.error);
//     }
// });


// document.getElementById('uploadForm').addEventListener('submit', function (e) {
//     e.preventDefault();

//     const fileInput = document.getElementById('fileInput');
//     const formData = new FormData();
//     formData.append('file', fileInput.files[0]);

//     fetch('/upload', {
//         method: 'POST',
//         body: formData,
//     })
//         .then(response => response.blob())
//         .then(blob => {
//             const url = window.URL.createObjectURL(blob);
//             const downloadLink = document.getElementById('downloadLink');
//             downloadLink.href = url;
//             document.getElementById('result').style.display = 'block';
//         })
//         .catch(error => {
//             console.error('Error during file upload:', error);
//         });
// });




 // Trigger the file input when the "UPLOAD" button is clicked
//  document.getElementById('uploadBtn').addEventListener('click', function() {
//     document.getElementById('fileInput').click();
//   });

//   // Display the file name when a file is selected
//   document.getElementById('fileInput').addEventListener('change', function() {
//     const file = this.files[0];
//     if (file) {
//       document.getElementById('fileName').style.display = 'block';

//       const tl = gsap.timeline();
//       tl.from ("#fileName", {
//           x: -700,
//           duration: .4,
//           opacity: 0
//       });


//       document.getElementById('fileDisplay').textContent = file.name;
//     }
//   });

//   // Form submission handler with progress functionality
//   document.getElementById('uploadForm').addEventListener('submit', function (e) {
//     e.preventDefault();

//     const fileInput = document.getElementById('fileInput');
//     const formData = new FormData();
//     formData.append('file', fileInput.files[0]);

//     // Show progress bar
//     document.getElementById('progressContainer').style.display = 'block';

//     // Custom fetch request using XMLHttpRequest to track progress
//     const xhr = new XMLHttpRequest();
//     xhr.open('POST', '/upload', true);

//     // Update progress bar
//     xhr.upload.addEventListener('progress', function (event) {
//       if (event.lengthComputable) {
//         const percentComplete = (event.loaded / event.total) * 100;
//         document.getElementById('progressBar').value = percentComplete;
//         document.getElementById('progressText').textContent = Math.round(percentComplete) + '%';
//       }
//     });

//     xhr.onload = function () {
//       if (xhr.status === 200) {
//         // Use Fetch API to handle the blob response after the file is uploaded
//         fetch('/upload', {
//             method: 'POST',
//             body: formData,
//         })
//         .then(response => response.blob())
//         .then(blob => {
//             const url = window.URL.createObjectURL(blob);
//             const downloadLink = document.getElementById('downloadLink');
//             downloadLink.href = url;
//             document.getElementById('result').style.display = 'block';
//         })
//         .catch(error => {
//             console.error('Error during file upload:', error);
//         });
//       } else {
//         alert('File upload failed.');
//       }
//     };

//     xhr.send(formData);
//   });