window.addEventListener("online", () => {
    const statusText = "Online 🟢"
    const status = document.getElementById("status");
    status.style.color = 'green'
    status.textContent = statusText;
})

window.addEventListener("offline", () => {
    const statusText = "Offline 🔘"
    const status = document.getElementById("status");
    status.style.color = 'grey'
    status.textContent = statusText;
})

document.addEventListener('DOMContentLoaded', function(){
    //check for the original starting status
     if( navigator.onLine == true ){
        const statusText = "Online 🟢"
        const status = document.getElementById("status");
        status.style.color = 'green'
        status.textContent = statusText;
     }else{
        const statusText = "Offline 🔘"
        const status = document.getElementById("status");
        status.style.color = 'grey'
        status.textContent = statusText;
     }
 });