

function updateDateTime() {
    const dateTimeElement = document.getElementById('date-time');
    const now = new Date();
    const formattedDateTime = now.toLocaleString('en-US', {});
    dateTimeElement.textContent = formattedDateTime;
}

setInterval(updateDateTime, 1000);


updateDateTime();


function validateForm(event) {
  
    const petType = document.querySelector('input[name="petType"]:checked');
    const breed = document.getElementById('breed').value;
    const age = document.getElementById('age').value;
    const gender = document.querySelector('input[name="gender"]:checked');
    const getalong = document.querySelectorAll('input[name="getalong"]:checked');

 
    let isValid = true;

    if (!petType) {
        isValid = false;
        alert("Please select a pet type");
    }
    else if (breed === '') {
        isValid = false;
        alert("Please enter a breed or select 'Doesn\'t Matter'.");
    }
    else if (age === '') {
        isValid = false;
        alert("Please select a preferred age.");
    }
    else if (!gender) {
        isValid = false;
        alert("Please select a gender.");
    }
    else if (getalong.length === 0) {
        isValid = false;
        alert("Please select at least one 'Needs to get along with' option.");
    }

    
    if (!isValid) {
        event.preventDefault();
    } else {
        document.getElementById('findform').submit(); 
    }
}

//have a pet to give away validation
function validateForm2(event){
    const petTypeDog=document.getElementById('radioga1').checked;
    const petTypeCat=document.getElementById('radioga2').checked; 
    const breed=document.getElementById('breedga').value.trim();
    const breedMixed=document.getElementById('radioga3').checked;
    const age=document.getElementById('agega').value;
    const genderMale=document.getElementById('radioga4').checked;
    const genderFemale=document.getElementById('radioga5').checked;
    const getAlong=document.querySelectorAll('input[name="getalong2"]:checked');
    const paragraph=document.getElementById('uniquepara').value;
    const firstName=document.getElementById('fnamega').value.trim();
    const lastName=document.getElementById('lnamega').value.trim();
    const email=document.getElementById('emailga').value.trim();

    let isValid = true;
    

    if (!petTypeDog && !petTypeCat) {
        isValid = false;
        alert("Please select a pet type");
    }
    else if (breed === ''&& !breedMixed) {
        isValid = false;
        alert("Please enter a breed or select 'Mixed'.");
    }
    else if (age === '') {
        isValid = false;
        alert("Please select an age range.");
    }
    else if (!genderMale && !genderFemale) {
        isValid = false;
        alert("Please select a gender.");
    }
    else if (getAlong.length === 0) {
        isValid = false;
        alert("Please select at least one 'Gets along with' option.");
    }
    else if(paragraph===''){
        isValid = false;
        alert("Please enter what makes your pet unique.");
    }
    else if(firstName===''){
        isValid = false;
        alert("Please enter your first name.");
    }
    else if(lastName===''){
        isValid = false;
        alert("Please enter your lastName.");
    }
    else if(email===''||!/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(email)){
        isValid = false;
        alert("Please enter a valid email address.");
    }

   
    if (!isValid) {
        event.preventDefault();
    } else {
        document.getElementById('giveAwayForm').submit(); 
    }


}
