document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const loginForm = document.getElementById("loginForm");
    const loginScreen = document.getElementById("loginScreen");
    const mainApp = document.getElementById("mainApp");
    const usernameInput = document.getElementById("username");
    
    const activityType = document.getElementById("activityType");
    const matchForm = document.getElementById("matchForm");
    const tweetFeed = document.getElementById("tweetFeed");

    const chatModal = document.getElementById("chatModal");
    const closeChat = document.getElementById("closeChat");
    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatMessages = document.getElementById("chatMessages");

    let currentUser = "";

    // Buffer Data (Realistic Campus Posts)
    const initialTweets = [
        { user: "Ishaan_B", activity: "Study Session", time: "19:30", venue: "Library F105", cap: 4, skill: null, details: "Focus: Linear Algebra Midsem Prep", upvotes: 5, isManual: false },
        { user: "Ananya_Runs", activity: "Sports Activity", time: "17:00", venue: "SAC Grounds", cap: 10, skill: "Beginner", details: "Game: 5km Campus Jog - All paces welcome!", upvotes: 12, isManual: false },
        { user: "Kabir_99", activity: "Sports Activity", time: "20:00", venue: "Hostel Quad", cap: 6, skill: "Advanced", details: "Game: 3v3 Basketball Full Court", upvotes: 3, isManual: true },
        { user: "Riya_V", activity: "Cab Sharing", time: "05:15", venue: "Main Gate", cap: 4, skill: null, details: "Heading to: Airport (T1)", upvotes: 8, isManual: false }
    ];

    // 1. Authentication
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const userVal = usernameInput.value.trim();
        if(userVal) {
            currentUser = userVal;
            document.getElementById("welcomeUser").innerText = "Welcome, " + currentUser;
            loginScreen.classList.add("hidden");
            mainApp.classList.remove("hidden");
            loadInitialFeed(); // Populate feed after login
        }
    });

    function loadInitialFeed() {
        tweetFeed.innerHTML = "";
        initialTweets.forEach(t => {
            addTweetToFeed(t.user, t.activity, t.time, t.venue, t.cap, t.skill, t.details, t.isManual, t.upvotes);
        });
    }

    // 2. Dynamic Form Handling
    activityType.addEventListener("change", (e) => {
        const val = e.target.value;
        document.getElementById("studyGroup").style.display = val === "Study Session" ? "block" : "none";
        document.getElementById("sportGroup").style.display = val === "Sports Activity" ? "block" : "none";
        document.getElementById("cabGroup").style.display = val === "Cab Sharing" ? "block" : "none";
    });

    // 3. Post Creation Logic
    matchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const type = activityType.value;
        const time = document.getElementById("timeSelection").value;
        const max = document.getElementById("maxCapacity").value;
        const manualVenue = document.getElementById("customVenue").value.trim();
        
        let details = "";
        let autoVenue = "";
        let skill = null;

        // Context extraction based on activity
        if (type === "Study Session") {
            details = "Focus: " + (document.getElementById("studyDesc").value || "General Study");
            autoVenue = "Library Hall A";
        } else if (type === "Sports Activity") {
            details = "Game: " + (document.getElementById("sportDesc").value || "Casual Play");
            skill = document.getElementById("skillLevel").value;
            autoVenue = "SAC Courts";
        } else if (type === "Cab Sharing") {
            details = "Dest: " + (document.getElementById("cabDest").value || "Campus Gate");
            autoVenue = "Main Gate";
        }

        // Venue override check
        const finalVenue = manualVenue !== "" ? manualVenue : autoVenue;
        const isManual = manualVenue !== "";

        addTweetToFeed(currentUser, type, time, finalVenue, max, skill, details, isManual, 0);
        
        // Reset form to default state
        matchForm.reset();
        document.querySelectorAll('.dynamic-field').forEach(d => d.style.display = "none");
    });

    // 4. Render Post to Feed
    function addTweetToFeed(user, activity, time, venue, maxCap, skill, details, isManual, upvotes = 0) {
        const card = document.createElement("div");
        const isSelfPost = user.toLowerCase() === currentUser.toLowerCase();
        card.className = "tweet-card" + (isSelfPost ? " self-post" : "");
        
        let icon = activity === "Study Session" ? "📖" : (activity === "Sports Activity" ? "⚽" : "🚕");

        let skillHtml = "";
        if(skill) {
            let sClass = (skill === "Advanced") ? "competitive" : "beginner";
            skillHtml = `<span class="badge ${sClass}">${skill}</span>`;
        }

        card.innerHTML = `
            <div class="tweet-header">
                <span class="tweet-user">@${user.toLowerCase()} ${isSelfPost ? "(You)" : ""}</span>
                <div class="cap-area">
                    <span class="cap-meter"><span class="cur">1</span> / ${maxCap}</span>
                    <span class="cap-status">Attendees</span>
                </div>
            </div>
            <div class="tweet-body">
                <h3>${icon} ${activity} ${skillHtml}</h3>
                <div class="card-context">${details}</div>
                <div class="location-row">
                    🕒 <strong>${time}</strong> at <span class="venue-text">${venue}</span>
                    ${isManual ? '<span class="custom-tag" title="User set a specific location">Custom Venue</span>' : ''}
                </div>
            </div>
            <div class="tweet-actions">
                <button class="btn-upvote" onclick="handleUpvote(this)">▲ <span class="upvote-count">${upvotes}</span></button>
                ${isSelfPost 
                    ? `<button class="btn-primary-mini btn-join" disabled>Host</button>`
                    : `<button class="btn-primary-mini btn-join" onclick="joinSession(this, '${user}')">Join Session</button>`
                }
            </div>
        `;
        tweetFeed.prepend(card);
    }

    // 5. Upvote Logic
    window.handleUpvote = (btn) => {
        const counter = btn.querySelector('.upvote-count');
        let val = parseInt(counter.innerText);
        
        if (!btn.classList.contains('active')) {
            counter.innerText = val + 1;
            btn.classList.add('active');
        } else {
            counter.innerText = val - 1;
            btn.classList.remove('active');
        }
    };

    // 6. Join Session & Capacity Logic
    window.joinSession = (btn, author) => {
        if(author.toLowerCase() === currentUser.toLowerCase()) return; // Failsafe
        
        const card = btn.closest('.tweet-card');
        const curSpan = card.querySelector('.cur');
        const maxVal = card.querySelector('.cap-meter').innerText.split('/')[1].trim();
        
        let count = parseInt(curSpan.innerText);
        if(count < parseInt(maxVal)) {
            count++;
            curSpan.innerText = count;
            
            if(count === parseInt(maxVal)) {
                btn.innerText = "Full";
                btn.style.background = "#95a5a6";
                btn.disabled = true;
            }

            // Trigger Chat
            document.getElementById("chatWithUser").innerText = "Connection: " + author;
            document.getElementById("chatModal").classList.remove("hidden");
            chatMessages.innerHTML = `<div class="system-msg">System: You joined @${author.toLowerCase()}'s session! Say hello.</div>`;
        }
    };

    // 7. Chat Simulator
    sendBtn.onclick = () => {
        const text = chatInput.value.trim();
        if(text !== "") {
            const msg = document.createElement("div");
            msg.className = "user-msg";
            msg.innerText = text;
            chatMessages.appendChild(msg);
            chatInput.value = "";
            chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
        }
    };
    
    // Send on Enter key
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendBtn.click();
    });

    closeChat.onclick = () => chatModal.classList.add("hidden");
});
document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const loginForm = document.getElementById("loginForm");
    const loginScreen = document.getElementById("loginScreen");
    const mainApp = document.getElementById("mainApp");
    const usernameInput = document.getElementById("username");
    
    const activityType = document.getElementById("activityType");
    const matchForm = document.getElementById("matchForm");
    const tweetFeed = document.getElementById("tweetFeed");

    // Chat Elements
    const chatModal = document.getElementById("chatModal");
    const closeChat = document.getElementById("closeChat");
    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatMessages = document.getElementById("chatMessages");

    // Payment Elements
    const paymentModal = document.getElementById("paymentModal");
    const closePayment = document.getElementById("closePayment");
    const confirmPayBtn = document.getElementById("confirmPayBtn");
    const payVendorName = document.getElementById("payVendorName");
    const payAmountText = document.getElementById("payAmountText");

    let currentUser = "";
    let feedPostCount = 0; // Tracks posts to inject ads

    // Buffer Data
    const initialTweets = [
        { user: "Ishaan_B", activity: "Study Session", time: "19:30", venue: "Library F105", cap: 4, skill: null, details: "Focus: Linear Algebra Midsem Prep", upvotes: 5, isManual: false },
        { user: "Ananya_Runs", activity: "Sports Activity", time: "17:00", venue: "SAC Grounds", cap: 10, skill: "Beginner", details: "Game: 5km Campus Jog - All paces welcome!", upvotes: 12, isManual: false },
        { user: "Kabir_99", activity: "Sports Activity", time: "20:00", venue: "Hostel Quad", cap: 6, skill: "Advanced", details: "Game: 3v3 Basketball Full Court", upvotes: 3, isManual: true },
        { user: "Riya_V", activity: "Cab Sharing", time: "05:15", venue: "Main Gate", cap: 4, skill: null, details: "Heading to: Airport (T1)", upvotes: 8, isManual: false }
    ];

    // Ad Pool (Fake Campus Vendors)
    const adPool = [
        { vendor: "ANC 1 Juice Shop", desc: "Beat the heat! Fresh Mango Shake now available.", price: "₹60" },
        { vendor: "SFC", desc: "Late night cravings? Try our new Peri Peri Maggi.", price: "₹45" },
        { vendor: "Hotspot", desc: "Special offer! Buy 1 Get 1 Free on all medium pizzas today.", price: "₹250" },
        { vendor: "Laundromat App", desc: "Get your laundry done without leaving the hostel. Download now.", price: "₹100" }
    ];

    // 1. Authentication
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const userVal = usernameInput.value.trim();
        if(userVal) {
            currentUser = userVal;
            document.getElementById("welcomeUser").innerText = "Welcome, " + currentUser;
            loginScreen.classList.add("hidden");
            mainApp.classList.remove("hidden");
            loadInitialFeed(); 
        }
    });

    function loadInitialFeed() {
        tweetFeed.innerHTML = "";
        initialTweets.forEach(t => {
            addTweetToFeed(t.user, t.activity, t.time, t.venue, t.cap, t.skill, t.details, t.isManual, t.upvotes);
        });
    }

    // 2. Dynamic Form Handling
    activityType.addEventListener("change", (e) => {
        const val = e.target.value;
        document.getElementById("studyGroup").style.display = val === "Study Session" ? "block" : "none";
        document.getElementById("sportGroup").style.display = val === "Sports Activity" ? "block" : "none";
        document.getElementById("cabGroup").style.display = val === "Cab Sharing" ? "block" : "none";
    });

    // 3. Post Creation
    matchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const type = activityType.value;
        const time = document.getElementById("timeSelection").value;
        const max = document.getElementById("maxCapacity").value;
        const manualVenue = document.getElementById("customVenue").value.trim();
        
        let details = "";
        let autoVenue = "";
        let skill = null;

        if (type === "Study Session") {
            details = "Focus: " + (document.getElementById("studyDesc").value || "General Study");
            autoVenue = "Library Hall A";
        } else if (type === "Sports Activity") {
            details = "Game: " + (document.getElementById("sportDesc").value || "Casual Play");
            skill = document.getElementById("skillLevel").value;
            autoVenue = "SAC Courts";
        } else if (type === "Cab Sharing") {
            details = "Dest: " + (document.getElementById("cabDest").value || "Campus Gate");
            autoVenue = "Main Gate";
        }

        const finalVenue = manualVenue !== "" ? manualVenue : autoVenue;
        const isManual = manualVenue !== "";

        addTweetToFeed(currentUser, type, time, finalVenue, max, skill, details, isManual, 0);
        
        matchForm.reset();
        document.querySelectorAll('.dynamic-field').forEach(d => d.style.display = "none");
    });

    // 4. Feed Rendering (With Ad Injection Logic)
    function addTweetToFeed(user, activity, time, venue, maxCap, skill, details, isManual, upvotes = 0) {
        const card = document.createElement("div");
        const isSelfPost = user.toLowerCase() === currentUser.toLowerCase();
        card.className = "tweet-card" + (isSelfPost ? " self-post" : "");
        
        let icon = activity === "Study Session" ? "📖" : (activity === "Sports Activity" ? "⚽" : "🚕");

        let skillHtml = "";
        if(skill) {
            let sClass = (skill === "Advanced") ? "competitive" : "beginner";
            skillHtml = `<span class="badge ${sClass}">${skill}</span>`;
        }

        card.innerHTML = `
            <div class="tweet-header">
                <span class="tweet-user">@${user.toLowerCase()} ${isSelfPost ? "(You)" : ""}</span>
                <div class="cap-area">
                    <span class="cap-meter"><span class="cur">1</span> / ${maxCap}</span>
                    <span class="cap-status">Attendees</span>
                </div>
            </div>
            <div class="tweet-body">
                <h3>${icon} ${activity} ${skillHtml}</h3>
                <div class="card-context">${details}</div>
                <div class="location-row">
                    🕒 <strong>${time}</strong> at <span class="venue-text">${venue}</span>
                    ${isManual ? '<span class="custom-tag">Custom Venue</span>' : ''}
                </div>
            </div>
            <div class="tweet-actions">
                <button class="btn-upvote" onclick="handleUpvote(this)">▲ <span class="upvote-count">${upvotes}</span></button>
                ${isSelfPost 
                    ? `<button class="btn-primary-mini btn-join" disabled>Host</button>`
                    : `<button class="btn-primary-mini btn-join" onclick="joinSession(this, '${user}')">Join Session</button>`
                }
            </div>
        `;
        
        // Add to DOM
        tweetFeed.prepend(card);
        feedPostCount++;

        // Inject Ad 1 out of 5 times (every 4 regular posts)
        if (feedPostCount % 4 === 0) {
            injectAdvertisement();
        }
    }

    // --- NEW: ADVERTISEMENT SYSTEM ---
    function injectAdvertisement() {
        // Pick a random ad from the pool
        const ad = adPool[Math.floor(Math.random() * adPool.length)];
        
        const adCard = document.createElement("div");
        adCard.className = "tweet-card ad-card";
        
        adCard.innerHTML = `
            <div class="tweet-header">
                <span class="tweet-user">🛒 ${ad.vendor}</span>
                <span class="sponsored-badge">Sponsored</span>
            </div>
            <div class="tweet-body">
                <p style="color: #333; font-weight: 500; font-size: 0.95rem;">${ad.desc}</p>
                <span class="ad-price">${ad.price}</span>
            </div>
            <div class="tweet-actions" style="margin-top: 10px;">
                <button class="btn-order" onclick="openPayment('${ad.vendor}', '${ad.price}')">💳 Order Now</button>
            </div>
        `;
        tweetFeed.prepend(adCard);
    }

    // Payment Logic
    window.openPayment = (vendor, price) => {
        payVendorName.innerText = vendor;
        payAmountText.innerText = price;
        paymentModal.classList.remove("hidden");
    };

    closePayment.onclick = () => paymentModal.classList.add("hidden");

    confirmPayBtn.onclick = () => {
        confirmPayBtn.innerText = "Processing...";
        setTimeout(() => {
            alert("Payment successful! Order placed with " + payVendorName.innerText);
            paymentModal.classList.add("hidden");
            confirmPayBtn.innerText = "Pay Now";
        }, 1500); // 1.5 second fake delay
    };

    // 5. Upvote & Join Logic
    window.handleUpvote = (btn) => {
        const counter = btn.querySelector('.upvote-count');
        let val = parseInt(counter.innerText);
        if (!btn.classList.contains('active')) {
            counter.innerText = val + 1;
            btn.classList.add('active');
        } else {
            counter.innerText = val - 1;
            btn.classList.remove('active');
        }
    };

    window.joinSession = (btn, author) => {
        if(author.toLowerCase() === currentUser.toLowerCase()) return; 
        
        const card = btn.closest('.tweet-card');
        const curSpan = card.querySelector('.cur');
        const maxVal = card.querySelector('.cap-meter').innerText.split('/')[1].trim();
        
        let count = parseInt(curSpan.innerText);
        if(count < parseInt(maxVal)) {
            count++;
            curSpan.innerText = count;
            
            if(count === parseInt(maxVal)) {
                btn.innerText = "Full";
                btn.style.background = "#95a5a6";
                btn.disabled = true;
            }

            document.getElementById("chatWithUser").innerText = "Connection: " + author;
            document.getElementById("chatModal").classList.remove("hidden");
            chatMessages.innerHTML = `<div class="system-msg">System: You joined @${author.toLowerCase()}'s session! Say hello.</div>`;
        }
    };

    // 6. Chat Simulator
    sendBtn.onclick = () => {
        const text = chatInput.value.trim();
        if(text !== "") {
            const msg = document.createElement("div");
            msg.className = "user-msg";
            msg.innerText = text;
            chatMessages.appendChild(msg);
            chatInput.value = "";
            chatMessages.scrollTop = chatMessages.scrollHeight; 
        }
    };
    
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendBtn.click();
    });

    closeChat.onclick = () => chatModal.classList.add("hidden");
});