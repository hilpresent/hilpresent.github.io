function openmenu() {
    document.getElementById("sidemenu").classList.add("show");
    document.querySelector(".fas.fa-times").style.display = "block";
    document.querySelector(".fas.fa-bars").style.display = "none";
}

function closemenu() {
    document.getElementById("sidemenu").classList.remove("show");
    document.querySelector(".fas.fa-times").style.display = "none";
    document.querySelector(".fas.fa-bars").style.display = "block";
}


// Tab navigation functions
var tablinks = document.getElementsByClassName("tab-links");
var tabcontents = document.getElementsByClassName("tab-contents");

function opentab(tabname) {
    for (var tablink of tablinks) {
        tablink.classList.remove("active-link");
    }
    for (var tabcontent of tabcontents) {
        tabcontent.classList.remove("active-tab");
    }
    event.currentTarget.classList.add("active-link");
    document.getElementById(tabname).classList.add("active-tab");
}

// Form submission handling
const scriptURL = 'https://script.google.com/macros/s/AKfycbznfbGvCd6q6XUPrTNfZmGVG0uUPkYRxPRanIpBvauUpRLlzH-KXAww1fxCV-4p_z8rLQ/exec';
const form = document.forms['submit-to-google-sheet'];
const msg = document.getElementById("msg");

form.addEventListener('submit', e => {
    e.preventDefault();
    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(response => {
            msg.innerHTML = "Message sent successfully";
            setTimeout(function() {
                msg.innerHTML = "";
            }, 5000);
            form.reset();
        })
        .catch(error => console.error('Error!', error.message));
});

// See more and collapse buttons functionality
document.addEventListener('DOMContentLoaded', (event) => {
    const seeMoreBtn = document.getElementById('see-more-btn');
    const collapseBtn = document.getElementById('collapse-btn');
    const workList = document.querySelector('.work-list');
    const works = workList.querySelectorAll('.work');

    seeMoreBtn.addEventListener('click', function() {
        workList.style.maxHeight = 'none'; // Remove max-height restriction to show all items
        this.style.display = 'none'; // Hide "See more" button
        collapseBtn.style.display = 'block'; // Show "Collapse" button
    });

    collapseBtn.addEventListener('click', function() {
        workList.style.maxHeight = getMaxHeight(); // Reset max-height to show only one row
        this.style.display = 'none'; // Hide "Collapse" button
        seeMoreBtn.style.display = 'block'; // Show "See more" button
    });

    // A function to calculate the max height of a single row of works
    function getMaxHeight() {
        const rowHeight = works[0].getBoundingClientRect().height;
        const rowGap = parseInt(window.getComputedStyle(workList).gridRowGap);
        return `${rowHeight + rowGap}px`; // Height of one work item plus the gap
    }

    // Set the initial max height for the .work-list
    workList.style.maxHeight = getMaxHeight();

    // Recalculate the max height on window resize
    window.addEventListener('resize', () => {
        if (seeMoreBtn.style.display === 'block') { // Only if "See more" is visible
            workList.style.maxHeight = getMaxHeight();
        }
    });
});

