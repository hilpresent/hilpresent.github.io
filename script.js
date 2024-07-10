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

window.onload = function() {
    gsap.from(".header-text h1", {duration: 1, opacity: 0, y: -50, ease: "power2.out"});
    gsap.from(".header-text p", {duration: 1, opacity: 0, y: 50, ease: "power2.out", delay: 0.5});
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

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];
    const numberOfParticles = 125;
    const mouseRadius = 100; // Adjust this value to increase/decrease the radius around the mouse

    const mouse = {
        x: null,
        y: null
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 5 + 1;
            this.speedX = (Math.random() * 1 - 0.5) / 2; // increase denominator to slow speed
            this.speedY = (Math.random() * 1 - 0.5) / 2; // increase denominator to slow speed
            this.opacity = 0; // start with 0 opacity
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Check for collision with mouse and adjust position if needed
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouseRadius + this.size) {
                const angle = Math.atan2(dy, dx);
                this.x -= Math.cos(angle);
                this.y -= Math.sin(angle);
            }

            if (this.size > 0.2) this.size -= 0.02;
            if (this.opacity < 1) this.opacity += 0.02; // Gradually increase opacity

            if (this.size <= 0.2) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 5 + 1;
                this.speedX = (Math.random() * 1 - 0.5) / 4; // increase denominator to slow speed
                this.speedY = (Math.random() * 1 - 0.5) / 4; // increase denominator to slow speed
                this.opacity = 0; // Reset opacity for new particle
            }
        }
        draw() {
            ctx.fillStyle = `rgba(242, 92, 84, ${this.opacity})`; // Use opacity in fill style
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    function init() {
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function handleParticles() {
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
            for (let j = i; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(112, 93, 105, ${particlesArray[i].opacity * 0.1})`; // Use opacity in stroke style
                    ctx.lineWidth = 1;
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        handleParticles();
        requestAnimationFrame(animate);
    }

    init();
    animate();
});
